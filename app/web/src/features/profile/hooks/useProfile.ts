import api from '../../../common/lib/api';

export function useProfile() {
  async function getProfile(id: number) {
    const { data } = await api.get(`/profile/${id}`);
    return data.data;
  }

  async function getLeaderboard() {
    const { data } = await api.get('/profile/leaderboard');
    return data.data;
  }

  return { getProfile, getLeaderboard };
}
