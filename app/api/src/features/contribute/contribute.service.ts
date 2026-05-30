import prisma from '../../common/lib/prisma';

export async function submitPost(authorId: number, data: any) {
  return prisma.post.create({
    data: { ...data, authorId, source: 'USER', tells: JSON.stringify(data.tells), isApproved: true },
  });
}

export async function getPendingPosts() {
  return prisma.post.findMany({ where: { isApproved: false } });
}

export async function approvePost(id: number) {
  return prisma.post.update({ where: { id }, data: { isApproved: true } });
}

export async function deletePost(id: number, userId: number) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || post.authorId !== userId) return null;
  return prisma.post.delete({ where: { id } });
}
