import api from '../../../common/lib/api';

export function useContribute() {
  async function submitPost(payload: {
    kind: 'human' | 'ai'; name: string; handle: string; avatar: string;
    body?: string; imageUrl?: string; topic: string; tells: string[];
  }) {
    const { data } = await api.post('/contribute', payload);
    return data.data;
  }

  async function getPendingPosts() {
    const { data } = await api.get('/contribute/pending');
    return data.data as {
      id: number; kind: string; handle: string; body?: string;
      topic: string; isApproved: boolean; createdAt: string;
    }[];
  }

  async function deletePost(id: number) {
    await api.delete(`/contribute/${id}`);
  }

  return { submitPost, getPendingPosts, deletePost };
}
