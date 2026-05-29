import api from '../../../common/lib/api';

export function useContribute() {
  async function submitPost(payload: {
    kind: 'human' | 'ai'; name: string; handle: string; avatar: string;
    body?: string; imageUrl?: string; topic: string; tells: string[];
  }) {
    const { data } = await api.post('/contribute', payload);
    return data.data;
  }

  return { submitPost };
}
