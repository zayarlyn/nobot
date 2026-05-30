import api from '../../../common/lib/api';

export function useGame() {
  async function getPosts() {
    const { data } = await api.get('/game/posts');
    return data.data;
  }

  async function decide(postId: number, action: 'spare' | 'purge' | 'flag'): Promise<{
    correct: boolean | null;
    kind: 'human' | 'ai';
    tells: string[];
  }> {
    const { data } = await api.post('/game/decisions', { postId, action });
    return data.data;
  }

  async function saveGame(payload: {
    score: number; accuracy: number; verdict: string; streak: number;
    purgedBots: number; savedHumans: number; killedHumans: number; escapedBots: number;
  }) {
    const { data } = await api.post('/game/sessions', payload);
    return data.data;
  }

  return { getPosts, decide, saveGame };
}
