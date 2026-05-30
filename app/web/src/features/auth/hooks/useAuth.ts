import api from '../../../common/lib/api';
import { useAuthStore } from '../../../common/store/authStore';

export function useAuth() {
  const { user, setUser } = useAuthStore();

  async function authorize(username: string, password: string) {
    const { data } = await api.post('/auth/authorize', { username, password });
    setUser(data.data);
  }

  async function refreshUser() {
    const { data } = await api.get('/auth/me');
    setUser(data.data);
  }

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
  }

  return { user, authorize, refreshUser, logout };
}
