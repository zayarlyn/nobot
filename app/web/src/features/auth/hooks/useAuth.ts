import api from '../../../common/lib/api';
import { useAuthStore } from '../../../common/store/authStore';

export function useAuth() {
  const { user, setUser } = useAuthStore();

  async function register(username: string, password: string) {
    const { data } = await api.post('/auth/register', { username, password });
    setUser(data.data);
  }

  async function login(username: string, password: string) {
    const { data } = await api.post('/auth/login', { username, password });
    setUser(data.data);
  }

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
  }

  return { user, register, login, logout };
}
