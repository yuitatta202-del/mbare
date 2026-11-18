
import Stripe from 'stripe';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';

// ==========================================
// CONFIGURAZIONE STRIPE
// ==========================================

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY non configurata.');
}

const stripe = new Stripe(stripeKey);

// Prezzi in centesimi di euro
export const COIN_PACKAGES = {
  caffe: {
    id: 'caffe',
    label: 'Caffè',
    coins: 50,
    price: 150,
    bonus: 0,
    popular: false
  },
  pizza: {
    id: 'pizza',
    label: 'Pizza',
    coins: 200,
    price: 500,
    bonus: 20,
    popular: true
  },
  serata: {
    id: 'serata',
    label: 'Serata',
    coins: 500,
    price: 1000,
    bonus: 100,
    popular: false
  },
  ricco: {
    id: 'ricco',
    label: 'Mbare Boss',
    coins: 1000,
    price: 1500,
    bonus: 300,
    popular: false
  }
} as const;

type PurchaseFailureStatus = 'failed' | 'expired';

export class PaymentService {

  /**
   * Valida un identificativo UUID.
   */
  private static validateUserId(userId: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(userId)) {
      throw AppError.badRequest('ID utente non valido.');
    }
  }

  /**
   * GET /api/payments/packages
   *
   * Restituisce i pacchetti acquistabili.
   */
  static getPackages() {
    return Object.values(COIN_PACKAGES).map(pkg => ({
      ...pkg,
      totalCoins: pkg.coins + pkg.bonus,
      priceEur: pkg.price / 100,
      currency: 'EUR'
    }));
  }

  /**
   * POST /api/payments/checkout
   *
   * Crea una sessione Stripe.
   * I coin NON vengono ancora accreditati.
   */
  static async createCheckoutSession(
    userId: string,
    packageId: string
  ): Promise<string> {

    this.validateUserId(userId);

    const pkg =
      COIN_PACKAGES[packageId as keyof typeof COIN_PACKAGES];

    if (!pkg) {
      throw AppError.badRequest(
        'Il pacchetto selezionato non esiste.'
      );
    }

    const totalCoins = pkg.coins + pkg.bonus;

    const frontendUrl = (
      process.env.FRONTEND_URL || 'http://localhost:5173'
    ).replace(/\/+$/, '');

    // 1. Registrazione acquisto in attesa
    const purchase = await prisma.coinPurchase.create({
      data: {
        userId,
        packageId: pkg.id,
        coins: totalCoins,
        amountCents: pkg.price,
        currency: 'eur',
        status: 'pending'
      }
    });

    let session: Stripe.Checkout.Session;

    // 2. Creazione della sessione Stripe
    try {
      session = await stripe.checkout.sessions.create(
        {
          mode: 'payment',

          client_reference_id: purchase.id,

          line_items: [
            {
              price_data: {
                currency: 'eur',
                product_data: {
                  name:
                    `${pkg.label} Pack - ${totalCoins} Mbare Coin`,
                  description: pkg.bonus > 0
                    ? `${pkg.coins} Coin + ${pkg.bonus} bonus`
                    : `${pkg.coins} Coin`
                },
                unit_amount: pkg.price
              },
              quantity: 1
            }
          ],

          success_url:
            `${frontendUrl}/shop` +
            `?success=true` +
            `&session_id={CHECKOUT_SESSION_ID}`,

          cancel_url:
            `${frontendUrl}/shop?canceled=true`,

          metadata: {
            purchaseId: purchase.id,
            userId,
            packageId: pkg.id
          }
        },
        {
          idempotencyKey: `mbare_checkout_${purchase.id}`
        }
      );

    } catch (error) {

      // Se Stripe fallisce, registra il tentativo.
      await prisma.coinPurchase.updateMany({
        where: {
          id: purchase.id,
          status: 'pending'
        },
        data: {
          status: 'failed'
        }
      }).catch(() => undefined);

      throw error;
    }

    if (!session.url) {
      throw new Error(
        'Stripe non ha restituito un URL di checkout.'
      );
    }

    // 3. Salva il riferimento alla sessione
    await prisma.coinPurchase.update({
      where: { id: purchase.id },
      data: {
        stripeSessionId: session.id
      }
    });

    return session.url;
  }

  /**
   * WEBHOOK STRIPE
   *
   * Verifica la firma digitale e gestisce
   * gli eventi ricevuti da Stripe.
   */
  static async handleWebhook(
    rawBody: Buffer | string,
    signature: string
  ): Promise<void> {

    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error(
        'STRIPE_WEBHOOK_SECRET non configurata.'
      );
    }

    if (!signature) {
      throw AppError.badRequest(
        'Firma Stripe mancante.'
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );

    } catch {
      throw AppError.badRequest(
        'Firma Stripe non valida.'
      );
    }

    switch (event.type) {

      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {

        const session =
          event.data.object as Stripe.Checkout.Session;

        if (session.payment_status === 'paid') {
          await this.fulfillPurchase(session);
        }

        break;
      }

      case 'checkout.session.async_payment_failed': {

        const session =
          event.data.object as Stripe.Checkout.Session;

        await this.markUnpaidPurchase(
          session,
          'failed'
        );

        break;
      }

      case 'checkout.session.expired': {

        const session =
          event.data.object as Stripe.Checkout.Session;

        await this.markUnpaidPurchase(
          session,
          'expired'
        );

        break;
      }

      default:
        // Evento non gestito da questo servizio.
        break;
    }
  }

  /**
   * Accreditamento dei coin dopo il pagamento.
   *
   * L'operazione è atomica e idempotente:
   * lo stesso acquisto non può essere
   * accreditato due volte.
   */
  private static async fulfillPurchase(
    session: Stripe.Checkout.Session
  ): Promise<void> {

    const purchaseId =
      session.client_reference_id ||
      session.metadata?.purchaseId;

    // Ignora Checkout non appartenenti a MBARE.
    if (!purchaseId) return;

    if (
      session.mode !== 'payment' ||
      session.payment_status !== 'paid'
    ) {
      return;
    }

    await prisma.$transaction(async tx => {

      // 1. Recupera il tentativo di acquisto.
      const purchase = await tx.coinPurchase.findUnique({
        where: { id: purchaseId }
      });

      if (!purchase) {
        throw new Error(
          `Acquisto Stripe non trovato: ${purchaseId}`
        );
      }

      // 2. Verifica che la sessione sia corretta.
      if (
        purchase.stripeSessionId &&
        purchase.stripeSessionId !== session.id
      ) {
        throw new Error(
          'Sessione Stripe differente da quella registrata.'
        );
      }

      if (
        session.client_reference_id !== purchase.id ||
        session.metadata?.purchaseId !== purchase.id ||
        session.metadata?.userId !== purchase.userId ||
        session.metadata?.packageId !== purchase.packageId
      ) {
        throw new Error(
          'I riferimenti del pagamento non corrispondono.'
        );
      }

      if (
        session.amount_total !== purchase.amountCents ||
        session.currency?.toLowerCase() !==
          purchase.currency.toLowerCase()
      ) {
        throw new Error(
          'Importo o valuta del pagamento non corrispondenti.'
        );
      }

      // 3. Evita accrediti duplicati.
      if (purchase.status === 'paid') {
        return;
      }

      // 4. Segna l'acquisto come pagato.
      // updateMany con condizione impedisce che due
      // webhook concorrenti accreditino lo stesso ordine.
      const updated = await tx.coinPurchase.updateMany({
        where: {
          id: purchase.id,
          status: { not: 'paid' }
        },
        data: {
          status: 'paid',
          stripeSessionId: session.id,
          paidAt: new Date()
        }
      });

      if (updated.count !== 1) {
        return;
      }

      // 5. Aumenta il saldo del wallet.
      // SQL parametrizzato sulle tabelle già esistenti.
      await tx.$executeRaw`
        INSERT INTO public.wallets (
          user_id,
          balance,
          total_earned,
          updated_at
        )
        VALUES (
          ${purchase.userId}::uuid,
          ${purchase.coins},
          ${purchase.coins},
          NOW()
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
          balance =
            public.wallets.balance + EXCLUDED.balance,
          total_earned =
            public.wallets.total_earned + EXCLUDED.total_earned,
          updated_at = NOW()
      `;

      // 6. Registra il movimento nel ledger.
      await tx.$executeRaw`
        INSERT INTO public.token_transactions (
          id,
          user_id,
          amount,
          reason,
          reference_id,
          created_at
        )
        VALUES (
          gen_random_uuid(),
          ${purchase.userId}::uuid,
          ${purchase.coins},
          'COIN_PURCHASE',
          ${session.id},
          NOW()
        )
      `;

      // Tutte le modifiche vengono confermate insieme.
    });
  }

  /**
   * Registra un Checkout fallito o scaduto.
   * Non modifica gli acquisti già pagati.
   */
  private static async markUnpaidPurchase(
    session: Stripe.Checkout.Session,
    status: PurchaseFailureStatus
  ): Promise<void> {

    const purchaseId =
      session.client_reference_id ||
      session.metadata?.purchaseId;

    if (!purchaseId) return;

    await prisma.coinPurchase.updateMany({
      where: {
        id: purchaseId,
        status: 'pending',
        OR: [
          { stripeSessionId: null },
          { stripeSessionId: session.id }
        ]
      },
      data: {
        status,
        stripeSessionId: session.id
      }
    });
  }

  /**
   * GET /api/payments/history
   *
   * Storico acquisti dell'utente autenticato.
   */
  static async getPurchaseHistory(
    userId: string,
    limit: number = 50
  ) {

    this.validateUserId(userId);

    const safeLimit = Number.isFinite(limit)
      ? Math.min(100, Math.max(1, Math.floor(limit)))
      : 50;

    const purchases = await prisma.coinPurchase.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      },
      take: safeLimit,
      select: {
        id: true,
        packageId: true,
        coins: true,
        amountCents: true,
        currency: true,
        status: true,
        stripeSessionId: true,
        createdAt: true,
        paidAt: true
      }
    });

    return purchases.map(purchase => ({
      ...purchase,
      amountEur: purchase.amountCents / 100
    }));
  }
}
