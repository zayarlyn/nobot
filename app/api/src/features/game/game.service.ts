import prisma from '../../common/lib/prisma';

export async function getPosts() {
  return prisma.post.findMany({ where: { isApproved: true } });
}

export async function saveGame(userId: number, data: {
  score: number; accuracy: number; verdict: string; streak: number;
  purgedBots: number; savedHumans: number; killedHumans: number; escapedBots: number;
}) {
  const game = await prisma.game.create({ data: { userId, ...data } });
  if (data.verdict === 'ACCESS GRANTED') {
    await prisma.user.update({ where: { id: userId }, data: { isVerified: true } });
  }
  return game;
}
