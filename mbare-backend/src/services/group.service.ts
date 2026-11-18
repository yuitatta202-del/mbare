import { prisma } from '../config/prisma.js';

export class GroupService {
  static async getAll() {
    return await prisma.studyGroup.findMany({
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { username: true } } }
    });
  }

  static async create(data: any, userId: string) {
    return await prisma.studyGroup.create({
      data: {
        ...data,
        createdBy: userId,
      }
    });
  }

  static async join(groupId: string, userId: string) {
    return await prisma.groupMember.create({
      data: {
        groupId,
        userId,
      }
    });
  }
}