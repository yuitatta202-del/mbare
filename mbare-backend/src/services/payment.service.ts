// src/services/payment.service.ts
import Stripe from 'stripe';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { TokenService } from './token.service.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Pacchetti disponibili (prezzi in centesimi per Stripe)
export const COIN_PACKAGES = {
  caffe:   { id: 'caffe',   label: 'Caffè',      coins: 50,    price: 150,   bonus: 0,   popular: false },
  pizza:   { id: 'pizza',   label: 'Pizza',      coins: 200,   price: 500,   bonus: 20,  popular: true },
  serata:  { id: 'serata',  label: 'Serata',     coins: 500,   price: 1000,  bonus: 100, popular: false },
  ricco:   { id: 'ricco',   label: 'Mbare Boss', coins: 1000,  price: 1500,  bonus: 300, popular: false },
};

export class PaymentService {
  static getPackages() {
    return Object.values(COIN_PACKAGES);
  }

  static async createCheckoutSession(userId: string, packageId: string) {
    const pkg = COIN_PACKAGES[packageId as keyof typeof COIN_PACKAGES];
    if (!pkg) throw AppError.badRequest('Pacchetto non valido.');
    
    const totalCoins = pkg.coins + pkg.bonus;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${pkg.label} Pack — ${totalCoins} Mbare Coin`,
            description: pkg.bonus > 0 
              ? `${pkg.coins} Coin + ${pkg.bonus} bonus` 
              : `${pkg.coins} Coin`,
          },
          unit_amount: pkg.price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${frontendUrl}/shop?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/shop?canceled=true`,
      metadata: {
        userId,
        coins: totalCoins.toString(),
        packageId,
      },
    });

    await prisma.coinPurchase.create({
      data: {
        userId,
        coins: totalCoins,
        amountEur: pkg.price / 100,
        stripeSessionId: session.id,
        status: 'pending',
      }
    });

    return session.url;
  }
  
  // ... (il resto dei metodi handleWebhook e getPurchaseHistory rimane uguale)
}