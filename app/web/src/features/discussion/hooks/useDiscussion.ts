import api from '../../../common/lib/api';

export function useDiscussion() {
  async function getThreads() {
    const { data } = await api.get('/discussion/threads');
    return data.data;
  }

  async function getThread(id: number) {
    const { data } = await api.get(`/discussion/threads/${id}`);
    return data.data;
  }

  async function createThread(payload: { flair: string; title: string; body?: string }) {
    const { data } = await api.post('/discussion/threads', payload);
    return data.data;
  }

  async function createComment(threadId: number, payload: { body: string; parentId?: number }) {
    const { data } = await api.post(`/discussion/threads/${threadId}/comments`, payload);
    return data.data;
  }

  async function vote(payload: { threadId?: number; commentId?: number; value: 1 | -1 }) {
    const { data } = await api.post('/discussion/votes', payload);
    return data.data;
  }

  return { getThreads, getThread, createThread, createComment, vote };
}
