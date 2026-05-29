import prisma from '../../common/lib/prisma';

export async function getProfile(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, username: true, isVerified: true, createdAt: true,
      games: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });
}

export async function getLeaderboard() {
  const users = await prisma.user.findMany({
    select: {
      id: true, username: true, isVerified: true,
      games: { select: { score: true, accuracy: true, streak: true } },
    },
  });

  return users
    .map((u) => {
      const best = u.games.reduce((acc, g) => Math.max(acc, g.score), 0);
      const avgAcc = u.games.length ? Math.round(u.games.reduce((a, g) => a + g.accuracy, 0) / u.games.length) : 0;
      const bestStreak = u.games.reduce((a, g) => Math.max(a, g.streak), 0);
      return { id: u.id, username: u.username, isVerified: u.isVerified, score: best, accuracy: avgAcc, streak: bestStreak };
    })
    .sort((a, b) => b.score - a.score);
}
