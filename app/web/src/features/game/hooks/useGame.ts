import api from '../../../common/lib/api';

export function useGame() {
  async function getPosts() {
    const { data } = await api.get('/game/posts');
    return data.data;
  }

  async function saveGame(payload: {
    score: number; accuracy: number; verdict: string; streak: number;
    purgedBots: number; savedHumans: number; killedHumans: number; escapedBots: number;
  }) {
    const { data } = await api.post('/game/sessions', payload);
    return data.data;
  }

  return { getPosts, saveGame };
}
