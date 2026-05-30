import prisma from '../../common/lib/prisma';

export async function getThreads() {
  const threads = await prisma.thread.findMany({
    include: {
      author: { select: { id: true, username: true } },
      votes: { select: { value: true } },
      comments: {
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, username: true } } },
      },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return threads.map((thread) => ({
    id: thread.id,
    flair: thread.flair,
    title: thread.title,
    body: thread.body,
    createdAt: thread.createdAt,
    author: thread.author,
    voteTotal: thread.votes.reduce((sum, v) => sum + v.value, 0),
    commentCount: thread._count.comments,
    lastActivityAt: thread.comments[0]?.createdAt ?? thread.createdAt,
    previewComments: thread.comments
      .filter((c) => c.parentId === null)
      .slice(0, 5)
      .reverse(),
  }));
}

export async function createThread(authorId: number, data: { flair: string; title: string; body?: string }) {
  return prisma.thread.create({
    data: { authorId, ...data },
    include: { author: { select: { id: true, username: true } } },
  });
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
  return prisma.comment.create({
    data: { authorId, threadId, ...data },
    include: { author: { select: { id: true, username: true } } },
  });
}

export async function vote(userId: number, data: { threadId?: number; commentId?: number; value: 1 | -1 }) {
  const where = data.threadId ? { userId_threadId: { userId, threadId: data.threadId } }
                              : { userId_commentId: { userId, commentId: data.commentId! } };
  return prisma.vote.upsert({ where, update: { value: data.value }, create: { userId, ...data } });
}
