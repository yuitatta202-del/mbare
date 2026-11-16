/**
 * Classe per la gestione degli errori personalizzati.
 * Estende Error nativo di JavaScript.
 * Con un tocco di dialetto siciliano per non essere troppo seri.
 */
export class AppError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode: number = 400, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Mantiene la corretta catena di prototipi
    Object.setPrototypeOf(this, AppError.prototype);

    // Cattura lo stack trace (solo in sviluppo)
    if (process.env.NODE_ENV !== 'production') {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Restituisce una risposta JSON standardizzata per l'errore.
   */
  toJSON() {
    return {
      error: this.message,
      code: this.code,
      ...(this.details && { details: this.details }),
    };
  }

  // ==========================================
  // METODI STATICI PER ERRORI COMUNI
  // ==========================================

  static badRequest(message?: string, details?: any) {
    return new AppError(
      message || 'Minchia, ma chi stai cumminannu? I dati non vanu boni!', 
      400, 
      'BAD_REQUEST', 
      details
    );
  }

  static unauthorized(message?: string) {
    return new AppError(
      message || 'Ehi, ma unni vai? Prima ti devi accàttari (accedere)!', 
      401, 
      'UNAUTHORIZED'
    );
  }

  static forbidden(message?: string) {
    return new AppError(
      message || 'Nun ci pensari propriu! \'Stu postu è riservatu, unn\'hai i permessi.', 
      403, 
      'FORBIDDEN'
    );
  }

  static notFound(message?: string) {
    return new AppError(
      message || 'Minchia! \'Sta cosa nun esisti. Forse l\'hannu manciata?', 
      404, 
      'NOT_FOUND'
    );
  }

  static conflict(message?: string, details?: any) {
    return new AppError(
      message || 'C\'è un conflitto! Quarchidunu ha già misu \'sta cosa. Riprova.', 
      409, 
      'CONFLICT', 
      details
    );
  }

  static internal(message?: string) {
    return new AppError(
      message || 'Ahi ahi, quarchi cosa si rumpiu \'nto server. Mica è culpa toia!', 
      500, 
      'INTERNAL_ERROR'
    );
  }

  static tooManyRequests(message?: string) {
    return new AppError(
      message || 'Frena, frena! Stai mannannu troppi messaggi. Riposa un minutinu.', 
      429, 
      'TOO_MANY_REQUESTS'
    );
  }
}