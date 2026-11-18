
import type {
  Request,
  Response,
  NextFunction
} from 'express';

import { GroupService } from '../services/group.service.js';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

export class GroupController {

  /**
   * Categorie supportate dal database MBARE.
   */
  private static readonly VALID_CATEGORIES = [
    'STUDIO',
    'HOBBY',
    'SPORT',
    'ALTRO'
  ] as const;

  /**
   * Controlla che un ID sia un UUID valido.
   */
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  private static requireUUID(
    value: unknown,
    field: string = 'ID'
  ): string {

    if (
      typeof value !== 'string' ||
      !GroupController.UUID_REGEX.test(value)
    ) {
      throw AppError.badRequest(
        `${field} non valido.`
      );
    }

    return value;
  }

  /**
   * Verifica che l'utente sia autenticato.
   */
  private static requireUserId(
    req: AuthRequest
  ): string {

    const userId = req.user?.sub;

    if (!userId) {
      throw AppError.badRequest(
        'Devi effettuare il login per continuare.'
      );
    }

    return GroupController.requireUUID(
      userId,
      'ID utente'
    );
  }

  /**
   * GET /api/groups
   *
   * Recupera tutti i gruppi disponibili.
   */
  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {

      const groups = await GroupService.getAll();

      return res.status(200).json(groups);

    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/groups
   *
   * Crea un nuovo gruppo di studio,
   * hobby o sport.
   */
  static async create(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {

      const userId =
        GroupController.requireUserId(req);

      const {
        name,
        description,
        category,
        city,
        maxMembers
      } = req.body ?? {};

      // =====================================
      // VALIDAZIONE NOME
      // =====================================

      if (
        typeof name !== 'string' ||
        name.trim().length < 3 ||
        name.trim().length > 100
      ) {
        throw AppError.badRequest(
          'Il nome del gruppo deve contenere tra 3 e 100 caratteri.'
        );
      }

      // =====================================
      // VALIDAZIONE DESCRIZIONE
      // =====================================

      if (
        description !== undefined &&
        description !== null &&
        (
          typeof description !== 'string' ||
          description.length > 2000
        )
      ) {
        throw AppError.badRequest(
          'La descrizione non può superare 2000 caratteri.'
        );
      }

      // =====================================
      // VALIDAZIONE CATEGORIA
      // =====================================

      if (
        typeof category !== 'string' ||
        !GroupController.VALID_CATEGORIES.some(
          item => item === category
        )
      ) {
        throw AppError.badRequest(
          'Categoria non valida. Scegli tra STUDIO, HOBBY, SPORT o ALTRO.'
        );
      }

      // =====================================
      // VALIDAZIONE CITTÀ
      // =====================================

      if (
        typeof city !== 'string' ||
        city.trim().length < 2 ||
        city.trim().length > 100
      ) {
        throw AppError.badRequest(
          'La città deve contenere tra 2 e 100 caratteri.'
        );
      }

      // =====================================
      // VALIDAZIONE MAX MEMBRI
      // =====================================

      const finalMaxMembers =
        maxMembers === undefined ||
        maxMembers === null
          ? 10
          : maxMembers;

      if (
        typeof finalMaxMembers !== 'number' ||
        !Number.isInteger(finalMaxMembers) ||
        finalMaxMembers < 2 ||
        finalMaxMembers > 100
      ) {
        throw AppError.badRequest(
          'Il gruppo deve consentire da 2 a 100 membri.'
        );
      }

      // =====================================
      // DATI PULITI
      // =====================================

      const groupData = {
        name: name.trim(),
        description:
          typeof description === 'string'
            ? description.trim()
            : null,
        category,
        city: city.trim(),
        maxMembers: finalMaxMembers
      };

      // Il proprietario viene ricavato dal token.
      // Non accettiamo createdBy dal frontend.

      const group = await GroupService.create(
        groupData,
        userId
      );

      return res.status(201).json({
        message: 'Gruppo creato!',
        data: group
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/groups/:id/join
   *
   * Permette all'utente autenticato
   * di unirsi a un gruppo.
   */
  static async join(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {

      // FIX TS2345:
      // Convalida e restringe il tipo a string.

      const groupId = GroupController.requireUUID(
        req.params.id,
        'ID gruppo'
      );

      const userId =
        GroupController.requireUserId(req);

      await GroupService.join(
        groupId,
        userId
      );

      return res.status(200).json({
        message: 'Ti sei unito al gruppo!'
      });

    } catch (error) {
      next(error);
    }
  }
}
