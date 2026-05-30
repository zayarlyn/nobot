import prisma from '../../common/lib/prisma';

export async function getPosts() {
  return prisma.post.findMany({
    where: { isApproved: true },
    select: {
      id: true, name: true, handle: true, avatar: true,
      body: true, imageUrl: true, topic: true, tells: true, source: true,
      // kind intentionally omitted — evaluated server-side per decision
    },
  });
}

export async function evaluateDecision(postId: number, action: 'spare' | 'purge' | 'flag') {
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { kind: true, tells: true } });
  if (!post) return null;
  const { kind, tells } = post;
  const correct = action === 'flag' ? null
    : (action === 'purge' && kind === 'ai') || (action === 'spare' && kind === 'human');
  return {
    correct,
    kind,
    tells: (() => { try { return JSON.parse(tells); } catch { return []; } })(),
  };
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
