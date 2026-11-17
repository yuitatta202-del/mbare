import { prisma } from '../config/prisma.js';
import { NewsService } from './news.service.js'; 
import { TokenService } from './token.service.js'; 

export class AdminService {
  // ==========================================
  // GESTIONE UTENTI
  // ==========================================
  static async getAllUsers() {
    return await prisma.profile.findMany({ orderBy: { createdAt: 'desc' } });
  }

  static async updateUserRole(userId: string, role: string) {
    return await prisma.profile.update({ where: { id: userId }, data: { role } });
  }

  static async toggleUserActive(userId: string, isActive: boolean) {
    return await prisma.profile.update({ where: { id: userId }, data: { isActive } });
  }

  // ==========================================
  // STATISTICHE
  // ==========================================
  static async getStats() {
    const [
      totalUsers,
      totalStudents,
      totalAdmins,
      totalSpiffera,
      pendingSpiffera,
      totalEvents,
      pendingEvents,
      totalGroups,
      openReports
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({ where: { role: 'STUDENT' } }),
      prisma.profile.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      prisma.spiffera.count(), 
      prisma.spiffera.count({ where: { status: 'pending' } }), 
      prisma.event.count(),
      prisma.event.count({ where: { isApproved: false } }),
      prisma.studyGroup.count(),
      prisma.report.count({ where: { status: 'open' } }),
    ]);

    return {
      users: { total: totalUsers, students: totalStudents, admins: totalAdmins },
      spiffera: { total: totalSpiffera, pending: pendingSpiffera }, 
      events: { total: totalEvents, pending: pendingEvents },
      groups: { total: totalGroups },
      reports: { open: openReports }
    };
  }

  // ==========================================
  // NEWS
  // ==========================================
  static async getAllNews() {
    return await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        author: { select: { username: true } },
        category: { select: { name: true } } 
      }
    });
  }

  static async createNews(data: any, authorId: string) {
    return await NewsService.createNews(data, authorId);
  }

  static async updateNews(id: bigint, data: any) {
    return await NewsService.updateNews(id, data);
  }

  static async deleteNews(id: bigint) {
    return await NewsService.deleteNews(id);
  }

  // ==========================================
  // GESTIONE SPIFFERA
  // ==========================================
  static async getPendingConfessions() {
    return await prisma.spiffera.findMany({ 
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async approveConfession(id: string, moderatorId: string) {
    return await prisma.spiffera.update({ 
      where: { id },
      data: { status: 'approved', approvedAt: new Date(), moderatedBy: moderatorId }
    });
  }

  static async rejectConfession(id: string, moderatorId: string) {
    return await prisma.spiffera.update({ 
      where: { id },
      data: { status: 'rejected', moderatedBy: moderatorId }
    });
  }

  // ==========================================
  // EVENTI
  // ==========================================
  static async getAllEvents() {
    return await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { username: true } } }
    });
  }

  static async approveEvent(id: string) {
    return await prisma.event.update({
      where: { id },
      data: { isApproved: true }
    });
  }

  static async deleteEvent(id: string) {
    return await prisma.event.delete({ where: { id } });
  }

  // ==========================================
  // GRUPPI
  // ==========================================
  static async getAllGroups() {
    return await prisma.studyGroup.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { username: true } },
        _count: { select: { members: true } }
      }
    });
  }

  static async deleteGroup(id: string) {
    return await prisma.studyGroup.delete({ where: { id } });
  }

  // ==========================================
  // SEGNALAZIONI
  // ==========================================
  static async getAllReports() {
    return await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: { reporter: { select: { username: true } } }
    });
  }

  static async resolveReport(id: string, resolvedBy: string) {
    return await prisma.report.update({
      where: { id },
      data: { status: 'resolved', resolvedAt: new Date(), resolvedBy }
    });
  }

  static async dismissReport(id: string, resolvedBy: string) {
    return await prisma.report.update({
      where: { id },
      data: { status: 'dismissed', resolvedAt: new Date(), resolvedBy }
    });
  }

  // ==========================================
  // GESTIONE ANNUNCI (BACHECA)
  // ==========================================
  static async getAllBoardPosts() {
    return await prisma.boardPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        author: { select: { username: true, role: true } } 
      },
    });
  }

  static async deleteAnyBoardPost(id: string) {
    return await prisma.boardPost.delete({
      where: { id },
    });
  }

  // ==========================================
  // 9. ANALYTICS (DASHBOARD 360)
  // ==========================================
  static async getAnalytics() {
    const [
      totalUsers,
      totalPosts,
      totalSpiffera,
      totalViews,
      totalTokensEarned,
      topPosts,
      spifferaByCategory,
      recentUsers,
      recentTransactions
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.post.count(),
      prisma.spiffera.count(),
      prisma.post.aggregate({ _sum: { viewCount: true } }),
      prisma.tokenTransaction.aggregate({ _sum: { amount: true }, where: { amount: { gt: 0 } } }),
      
      prisma.post.findMany({
        take: 5,
        orderBy: { viewCount: 'desc' },
        select: { title: true, viewCount: true, slug: true }
      }),
      
      prisma.spiffera.groupBy({
        by: ['category'],
        _count: { _all: true }
      }),

      prisma.profile.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        },
        select: { createdAt: true }
      }),

      prisma.tokenTransaction.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7))
          },
          amount: { gt: 0 }
        },
        select: { createdAt: true, amount: true }
      })
    ]);

    const userGrowth = this.formatChartData(recentUsers, 'createdAt');
    const tokenGrowth = this.formatChartData(recentTransactions, 'createdAt', 'amount');

    return {
      kpi: {
        totalUsers,
        totalPosts,
        totalSpiffera,
        totalViews: totalViews._sum.viewCount || 0,
        totalTokensEarned: totalTokensEarned._sum.amount || 0,
      },
      charts: {
        topPosts,
        spifferaByCategory,
        userGrowth,
        tokenGrowth
      }
    };
  }

  private static formatChartData(data: any[], dateField: string, valueField?: string) {
    const grouped = data.reduce((acc: any, curr: any) => {
      const date = new Date(curr[dateField]).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
      if (!acc[date]) acc[date] = { date, count: 0, amount: 0 };
      
      acc[date].count += 1;
      if (valueField) acc[date].amount += curr[valueField];
      
      return acc;
    }, {});

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    });

    return last7Days.map(date => grouped[date] || { date, count: 0, amount: 0 });
  }

  // ==========================================
  // 10. GESTIONE MBARE COIN
  // ==========================================
  static async getCoinDashboard() {
    const [wallets, totalTokens, totalEarned, recentTransactions] = await Promise.all([
      prisma.wallet.findMany({
        orderBy: { balance: 'desc' },
        take: 50,
        include: { user: { select: { username: true, email: true, role: true } } }
      }),
      prisma.wallet.aggregate({ _sum: { balance: true } }),
      prisma.wallet.aggregate({ _sum: { totalEarned: true } }),
      prisma.tokenTransaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: { select: { username: true, email: true } } }
      })
    ]);

    return {
      wallets,
      stats: {
        circulating: totalTokens._sum.balance || 0,
        totalEarned: totalEarned._sum.totalEarned || 0,
      },
      recentTransactions
    };
  }

  static async adjustTokens(userId: string, amount: number, reason: string) {
    if (amount === 0) throw new Error("L'importo non può essere zero");
    
    if (amount > 0) {
      return await TokenService.addTokens(userId, amount, reason || 'Rettifica Admin');
    } else {
      return await TokenService.spendTokens(userId, Math.abs(amount), reason || 'Rettifica Admin');
    }
  }

  static async broadcastNotification(title: string, message: string) {
    const users = await prisma.profile.findMany({ 
      where: { isActive: true },
      select: { id: true } 
    });

    if (users.length === 0) throw new Error("Nessun utente trovato");

    // FIX: Prisma si aspetta "user_id" e non "userId" per la creazione massiva
    const notifications = users.map(u => ({
      user_id: u.id, 
      title,
      message,
      type: 'INFO'
    }));

    return await prisma.notifications.createMany({
      data: notifications
    });
  }
}