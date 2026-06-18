import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../store/useAuthStore';

describe('useAuthStore tests', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('should initially have null token and user details', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should log in a user and cache credentials', () => {
    const state = useAuthStore.getState();
    const mockUser = { id: 1, name: 'Sonia Laurent', email: 'sonia@luxeaura.com', role: 'user' };
    state.login('mock_jwt_token', mockUser);

    const updated = useAuthStore.getState();
    expect(updated.token).toBe('mock_jwt_token');
    expect(updated.user).toEqual(mockUser);
    expect(updated.isAuthenticated).toBe(true);
  });

  it('should update user fields successfully', () => {
    const state = useAuthStore.getState();
    const mockUser = { id: 1, name: 'Sonia Laurent', email: 'sonia@luxeaura.com', role: 'user' };
    state.login('mock_jwt_token', mockUser);
    state.updateUser({ name: 'Sonia L. Bonaparte' });

    const updated = useAuthStore.getState();
    expect(updated.user?.name).toBe('Sonia L. Bonaparte');
    expect(updated.user?.email).toBe('sonia@luxeaura.com');
  });

  it('should clear cached credentials on logout', () => {
    useAuthStore.getState().login('token', { id: 1, name: 'Sonia', email: 'sonia@luxeaura.com', role: 'user' });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();
    const updated = useAuthStore.getState();
    expect(updated.token).toBeNull();
    expect(updated.user).toBeNull();
    expect(updated.isAuthenticated).toBe(false);
  });
});
