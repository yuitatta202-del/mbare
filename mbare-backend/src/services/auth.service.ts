import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';

// Regex per validare l'username (solo lettere, numeri, underscore, max 20 caratteri)
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
// Regex per la matricola (da 6 a 10 cifre numeriche)
const MATRICOLA_REGEX = /^\d{6,10}$/;

export class AuthService {
  /**
   * Crea un nuovo profilo utente in modo sicuro.
   */
  static async createProfile(userId: string, username: string, email: string, matricola?: string, isStudent?: boolean) {
    // 1. VALIDAZIONE INPUT
    if (!userId || typeof userId !== 'string') {
      throw new AppError('ID utente non valido', 400);
    }
    
    if (!email || typeof email !== 'string') {
      throw new AppError('Email non valida', 400);
    }

    if (!username || !USERNAME_REGEX.test(username)) {
      throw new AppError('Username non valido. Usa solo lettere, numeri e underscore (3-20 caratteri).', 400);
    }

    if (isStudent) {
      if (!matricola || !MATRICOLA_REGEX.test(matricola)) {
        throw new AppError('Matricola non valida. Deve essere numerica (6-10 cifre).', 400);
      }
    }

    // 2. VERIFICA ESISTENZA PROFILO
    const existingProfile = await prisma.profile.findUnique({ 
      where: { id: userId } 
    });
    
    if (existingProfile) {
      throw new AppError('Profilo già esistente per questo utente.', 400);
    }

    // 3. VERIFICA UNICITÀ USERNAME
    const usernameTaken = await prisma.profile.findUnique({ 
      where: { username } 
    });
    
    if (usernameTaken) {
      throw new AppError('Questo username è già in uso. Provane un altro.', 400);
    }

    // 4. VERIFICA UNICITÀ MATRICOLA
    if (isStudent && matricola) {
      const matricolaTaken = await prisma.profile.findUnique({
        where: { matricola }
      });
      if (matricolaTaken) {
        throw new AppError('Questa matricola è già registrata.', 400);
      }
    }

    // 5. DEFINIZIONE RUOLO
    const role = isStudent ? 'STUDENT' : 'USER';

    // 6. CREAZIONE PROFILO
    try {
      return await prisma.profile.create({
        data: {
          id: userId,
          username,
          email,
          role,
          matricola: isStudent ? matricola : null,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new AppError('Username, email o matricola già in uso. Riprova.', 409);
      }
      console.error('Errore creazione profilo:', error);
      throw new AppError('Errore durante la creazione del profilo.', 500);
    }
  }

  /**
   * Recupera il profilo di un utente.
   */
  static async getProfile(userId: string) {
    if (!userId || typeof userId !== 'string') {
      throw new AppError('ID utente non valido', 400);
    }

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        matricola: true,
        isActive: true,
        createdAt: true,
        // Campi dello Student Hub
        university: true,
        dipartimento: true,
        corsoDiStudi: true,
        annoCorso: true,
        bio: true,
        interessi: true,
        sport: true,
        lavoro: true,
        palio: true,
        palioRuolo: true,
      }
    });

    if (!profile) {
      throw new AppError('Profilo non trovato.', 404);
    }

    if (!profile.isActive) {
      throw new AppError('Account disattivato. Contatta il supporto.', 403);
    }

    return profile;
  }

  /**
   * Aggiorna il profilo di un utente.
   */
  static async updateProfile(userId: string, data: any) {
    if (!userId || typeof userId !== 'string') {
      throw new AppError('ID utente non valido', 400);
    }

    // Rimuovi i campi che non devono essere modificabili dall'utente
    const { role, isActive, email, id, matricola, ...allowedData } = data;

    try {
      return await prisma.profile.update({
        where: { id: userId },
        data: {
          username: allowedData.username,
          dipartimento: allowedData.dipartimento,
          corsoDiStudi: allowedData.corso_di_studi,
          annoCorso: allowedData.anno_corso,
          bio: allowedData.bio,
          interessi: allowedData.interessi,
          sport: allowedData.sport,
          lavoro: allowedData.lavoro,
          palio: allowedData.palio,
          palioRuolo: allowedData.palio_ruolo,
        },
      });
    } catch (error: any) {
      console.error('Errore aggiornamento profilo:', error);
      if (error.code === 'P2002') {
        throw new AppError('Username già in uso.', 409);
      }
      throw new AppError('Errore durante l\'aggiornamento del profilo.', 500);
    }
  }
}