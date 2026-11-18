import { prisma } from '../config/prisma.js';

export class EventService {
  // 1. Recupera tutti gli eventi approvati (per la pagina Community)
  static async getAllApproved() {
    return await prisma.event.findMany({
      where: { isApproved: true },
      orderBy: { eventDate: 'asc' },
      include: { creator: { select: { username: true } } }
    });
  }

  // 2. Crea un nuovo evento (di default va in moderazione)
  static async create(data: any, userId: string) {
    return await prisma.event.create({
      data: {
        ...data,
        createdBy: userId,
        isApproved: false 
      }
    });
  }

  // 3. Recupera gli eventi in attesa di approvazione (per la Dashboard Admin)
  static async getPending() {
    return await prisma.event.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: 'asc' },
      include: { creator: { select: { username: true } } }
    });
  }

  // 4. Approva un evento (lo rende visibile nella Community)
  static async approve(id: string) {
    return await prisma.event.update({
      where: { id },
      data: { isApproved: true }
    });
  }
}