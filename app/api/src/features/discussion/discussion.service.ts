import prisma from '../../common/lib/prisma';

export async function getThreads() {
  return prisma.thread.findMany({
    include: { author: { select: { id: true, username: true } }, _count: { select: { comments: true, votes: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createThread(authorId: number, data: { flair: string; title: string; body?: string }) {
  return prisma.thread.create({ data: { authorId, ...data } });
}

export async function getThread(id: number) {
  return prisma.thread.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true } },
      comments: { include: { author: { select: { id: true, username: true } }, votes: true } },
      votes: true,
    },
  });
}

export async function createComment(authorId: number, threadId: number, data: { body: string; parentId?: number }) {
  return prisma.comment.create({ data: { authorId, threadId, ...data } });
}

export async function vote(userId: number, data: { threadId?: number; commentId?: number; value: 1 | -1 }) {
  const where = data.threadId ? { userId_threadId: { userId, threadId: data.threadId } }
                              : { userId_commentId: { userId, commentId: data.commentId! } };
  return prisma.vote.upsert({ where, update: { value: data.value }, create: { userId, ...data } });
}
