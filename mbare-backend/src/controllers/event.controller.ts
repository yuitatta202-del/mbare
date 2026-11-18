
import type {
  Request,
  Response,
  NextFunction
} from 'express';

import { EventService } from '../services/event.service.js';
import { prisma } from '../config/prisma.js';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

export class EventController {

  // ==========================================
  // CONFIGURAZIONE E VALIDAZIONE
  // ==========================================

  private static readonly VALID_CATEGORIES = [
    'SERATA',
    'APERITIVO',
    'SPORT',
    'CULTURA',
    'VIAGGIO',
    'ALTRO'
  ] as const;

  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  private static requireUUID(value: unknown): string {
    if (
      typeof value !== 'string' ||
      !EventController.UUID_REGEX.test(value)
    ) {
      throw AppError.badRequest(
        'ID evento non valido.'
      );
    }

    return value;
  }

  private static requireUserId(req: AuthRequest): string {
    const userId = req.user?.sub;

    if (!userId) {
      throw AppError.badRequest(
        'Devi effettuare il login.'
      );
    }

    return EventController.requireUUID(userId);
  }

  /**
   * Verifica i privilegi amministrativi
   * interrogando il database.
   */
  private static async requireAdmin(
    req: AuthRequest
  ): Promise<string> {

    const userId = EventController.requireUserId(req);

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        role: true,
        isActive: true
      }
    });

    if (
      !profile ||
      !profile.isActive ||
      !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)
    ) {
      throw new AppError(
        'Non hai i permessi per questa operazione.',
        403
      );
    }

    return userId;
  }

  /**
   * GET /api/events
   *
   * Recupera soltanto eventi approvati.
   * Endpoint pubblico.
   */
  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const events = await EventService.getAllApproved();

      return res.status(200).json(events);

    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/events
   *
   * Crea un evento in attesa di approvazione.
   * Richiede autenticazione.
   */
  static async create(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId =
        EventController.requireUserId(req);

      const {
        title,
        description,
        category,
        location,
        city,
        eventDate,
        imageUrl
      } = req.body ?? {};

      // --------------------------------------
      // Validazione titolo
      // --------------------------------------

      if (
        typeof title !== 'string' ||
        title.trim().length < 5 ||
        title.trim().length > 150
      ) {
        throw AppError.badRequest(
          'Il titolo deve contenere tra 5 e 150 caratteri.'
        );
      }

      // --------------------------------------
      // Validazione descrizione
      // --------------------------------------

      if (
        description !== undefined &&
        description !== null &&
        (
          typeof description !== 'string' ||
          description.length > 5000
        )
      ) {
        throw AppError.badRequest(
          'La descrizione non può superare 5000 caratteri.'
        );
      }

      // --------------------------------------
      // Validazione categoria
      // --------------------------------------

      if (
        typeof category !== 'string' ||
        !EventController.VALID_CATEGORIES.some(
          value => value === category
        )
      ) {
        throw AppError.badRequest(
          'Categoria evento non valida.'
        );
      }

      // --------------------------------------
      // Validazione luogo
      // --------------------------------------

      if (
        typeof location !== 'string' ||
        location.trim().length < 2 ||
        location.trim().length > 255
      ) {
        throw AppError.badRequest(
          'Il luogo deve contenere tra 2 e 255 caratteri.'
        );
      }

      // --------------------------------------
      // Validazione città
      // --------------------------------------

      if (
        typeof city !== 'string' ||
        city.trim().length < 2 ||
        city.trim().length > 100
      ) {
        throw AppError.badRequest(
          'La città deve contenere tra 2 e 100 caratteri.'
        );
      }

      // --------------------------------------
      // Validazione data evento
      // --------------------------------------

      if (
        typeof eventDate !== 'string' ||
        !Number.isFinite(Date.parse(eventDate))
      ) {
        throw AppError.badRequest(
          'Inserisci una data valida per l’evento.'
        );
      }

      const parsedDate = new Date(eventDate);

      if (parsedDate.getTime() <= Date.now()) {
        throw AppError.badRequest(
          'Non puoi creare un evento con una data passata.'
        );
      }

      // --------------------------------------
      // Validazione immagine opzionale
      // --------------------------------------

      if (
        imageUrl !== undefined &&
        imageUrl !== null &&
        (
          typeof imageUrl !== 'string' ||
          imageUrl.length > 2048
        )
      ) {
        throw AppError.badRequest(
          'URL immagine non valido.'
        );
      }

      if (
        typeof imageUrl === 'string' &&
        imageUrl.trim()
      ) {
        try {
          const url = new URL(imageUrl);

          if (
            url.protocol !== 'https:' &&
            url.protocol !== 'http:'
          ) {
            throw new Error('Invalid protocol');
          }
        } catch {
          throw AppError.badRequest(
            'L’immagine deve avere un URL HTTP o HTTPS valido.'
          );
        }
      }

      // Costruiamo soltanto i campi autorizzati.
      // Il frontend non può impostare isApproved
      // o createdBy.

      const eventData = {
        title: title.trim(),
        description:
          typeof description === 'string'
            ? description.trim()
            : null,
        category,
        location: location.trim(),
        city: city.trim(),
        eventDate: parsedDate.toISOString(),
        imageUrl:
          typeof imageUrl === 'string' && imageUrl.trim()
            ? imageUrl.trim()
            : null
      };

      const event = await EventService.create(
        eventData,
        userId
      );

      return res.status(201).json({
        message:
          'Evento creato! In attesa di approvazione.',
        data: event
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/super-admin/events/pending
   *
   * Recupera gli eventi da approvare.
   * Accesso ADMIN / SUPER_ADMIN.
   */
  static async getPending(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {

      await EventController.requireAdmin(req);

      const events = await EventService.getPending();

      return res.status(200).json(events);

    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/super-admin/events/:id/approve
   *
   * Approva un evento.
   * Accesso ADMIN / SUPER_ADMIN.
   */
  static async approve(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {

      await EventController.requireAdmin(req);

      // FIX TS2345
      const eventId =
        EventController.requireUUID(req.params.id);

      const updated = await EventService.approve(
        eventId
      );

      return res.status(200).json({
        message: 'Evento approvato!',
        data: updated
      });

    } catch (error) {
      next(error);
    }
  }
}
