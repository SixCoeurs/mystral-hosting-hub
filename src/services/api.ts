// ============================================================
// API Service - Connection to MariaDB backend
// ============================================================

const API_BASE_URL = 'http://localhost:3001/api';

// Types based on MariaDB schema
export interface User {
  id?: number;
  uuid: string;
  email: string;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country_code: string;
  role: 'client' | 'reseller' | 'support' | 'admin';
  status: 'pending' | 'active' | 'suspended' | 'banned';
  totp_enabled: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: User;
  token?: string;
  requires_2fa?: boolean;
  data?: {
    user?: User;
    token?: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
  totp_code?: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country_code?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface Service {
  id: number;
  uuid: string;
  hostname?: string;
  label?: string;
  status: 'pending' | 'provisioning' | 'active' | 'suspended' | 'terminated' | 'cancelled';
  product_name?: string;
  category_name?: string;
  location_name?: string;
  primary_ip?: string;
  ipv6?: string;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  billing_amount: number;
  next_due_date: string;
  current_specs: Record<string, unknown>;
  product_specs?: Record<string, unknown>;
}

export interface Product {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  description?: string;
  specs: Record<string, unknown>;
  price_monthly: number;
  price_quarterly?: number;
  price_yearly?: number;
  setup_fee: number;
  category_slug: string;
  category_name: string;
}

export interface Location {
  id: number;
  code: string;
  name: string;
  country_code: string;
  provider?: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
}

// Session storage
const SESSION_KEY = 'mystral_session';

// Helper to get stored session
const getStoredSession = (): { user: User; token: string } | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

// Helper to store session
const storeSession = (user: User, token: string) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
};

// Helper to clear session
const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const session = getStoredSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }
  return headers;
};

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Une erreur est survenue');
  }

  return data;
}

// ============================================================
// API Functions
// ============================================================

export const api = {
  // =====================
  // Authentication
  // =====================

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success && response.data?.user && response.data?.token) {
        storeSession(response.data.user, response.data.token);
        return {
          success: true,
          message: 'Compte créé avec succès',
          user: response.data.user,
          token: response.data.token,
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de l\'inscription',
      };
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Check if 2FA is required
      if (response.requires_2fa) {
        return {
          success: true,
          requires_2fa: true,
          message: 'Code 2FA requis',
        };
      }

      if (response.success && response.data?.user && response.data?.token) {
        storeSession(response.data.user, response.data.token);
        return {
          success: true,
          message: 'Connexion réussie',
          user: response.data.user,
          token: response.data.token,
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Email ou mot de passe incorrect',
      };
    }
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      const session = getStoredSession();
      if (session?.token) {
        await apiRequest('/auth/logout', { method: 'POST' });
      }
    } catch {
      // Ignore errors on logout
    } finally {
      clearSession();
    }
    return { success: true };
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const session = getStoredSession();
    if (!session?.token) {
      return { success: false };
    }

    try {
      const response = await apiRequest<AuthResponse>('/auth/me');

      if (response.success && response.data?.user) {
        // Update stored user data
        storeSession(response.data.user, session.token);
        return {
          success: true,
          user: response.data.user,
          token: session.token,
        };
      }

      // Token invalid, clear session
      clearSession();
      return { success: false };
    } catch {
      // Token expired or invalid
      clearSession();
      return { success: false };
    }
  },

  // =====================
  // Profile Management
  // =====================

  async updateProfile(data: UpdateProfileData): Promise<AuthResponse> {
    try {
      const response = await apiRequest<{ success: boolean; data: User }>('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (response.success && response.data) {
        const session = getStoredSession();
        if (session) {
          storeSession(response.data, session.token);
        }
        return {
          success: true,
          message: 'Profil mis à jour avec succès',
          user: response.data,
        };
      }

      return { success: false, message: 'Erreur lors de la mise à jour' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil',
      };
    }
  },

  async changePassword(data: ChangePasswordData): Promise<AuthResponse> {
    try {
      const response = await apiRequest<{ success: boolean; message: string; data?: { token: string } }>(
        '/auth/password',
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );

      if (response.success && response.data?.token) {
        // Update token in session
        const session = getStoredSession();
        if (session) {
          storeSession(session.user, response.data.token);
        }
      }

      return {
        success: response.success,
        message: response.message || 'Mot de passe modifié avec succès',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe',
      };
    }
  },

  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const response = await apiRequest<{ success: boolean; message: string }>(
        '/auth/password-reset',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      );

      return {
        success: true,
        message: response.message || 'Si un compte existe avec cette adresse, vous recevrez un email de réinitialisation.',
      };
    } catch {
      // Always return success for security (don't reveal if email exists)
      return {
        success: true,
        message: 'Si un compte existe avec cette adresse, vous recevrez un email de réinitialisation.',
      };
    }
  },

  // =====================
  // Services
  // =====================

  async getServices(): Promise<{ success: boolean; services: Service[]; data?: Service[] }> {
    try {
      const response = await apiRequest<{ success: boolean; data: Service[] }>('/services');

      return {
        success: true,
        services: response.data || [],
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching services:', error);
      return {
        success: false,
        services: [],
      };
    }
  },

  async getService(uuid: string): Promise<{ success: boolean; service?: Service; data?: Service }> {
    try {
      const response = await apiRequest<{ success: boolean; data: Service }>(`/services/${uuid}`);

      return {
        success: true,
        service: response.data,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        service: undefined,
      };
    }
  },

  async updateServiceLabel(uuid: string, label: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/services/${uuid}/label`,
        {
          method: 'PUT',
          body: JSON.stringify({ label }),
        }
      );
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
      };
    }
  },

  async serviceAction(uuid: string, action: 'start' | 'stop' | 'reboot' | 'reinstall'): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/services/${uuid}/action`,
        {
          method: 'POST',
          body: JSON.stringify({ action }),
        }
      );
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de l\'action',
      };
    }
  },

  // =====================
  // Catalog
  // =====================

  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    try {
      const response = await apiRequest<{ success: boolean; data: Category[] }>('/services/categories');
      return response;
    } catch {
      return { success: false, data: [] };
    }
  },

  async getProducts(category?: string): Promise<{ success: boolean; data: Product[] }> {
    try {
      const endpoint = category ? `/services/products?category=${category}` : '/services/products';
      const response = await apiRequest<{ success: boolean; data: Product[] }>(endpoint);
      return response;
    } catch {
      return { success: false, data: [] };
    }
  },

  async getProduct(slug: string): Promise<{ success: boolean; data?: Product }> {
    try {
      const response = await apiRequest<{ success: boolean; data: Product }>(`/services/products/${slug}`);
      return response;
    } catch {
      return { success: false };
    }
  },

  async getLocations(): Promise<{ success: boolean; data: Location[] }> {
    try {
      const response = await apiRequest<{ success: boolean; data: Location[] }>('/services/locations');
      return response;
    } catch {
      return { success: false, data: [] };
    }
  },

  // =====================
  // Security logs
  // =====================

  async getSecurityLogs(): Promise<{ success: boolean; logs: Array<{
    event_type: string;
    ip_address: string;
    created_at: string;
    user_agent?: string;
    details?: Record<string, unknown>;
  }> }> {
    try {
      const response = await apiRequest<{ success: boolean; data: Array<{
        event_type: string;
        ip_address: string;
        created_at: string;
        user_agent?: string;
        details?: Record<string, unknown>;
      }> }>('/auth/security-logs');

      return {
        success: true,
        logs: response.data || [],
      };
    } catch {
      return {
        success: false,
        logs: [],
      };
    }
  },

  // =====================
  // 2FA
  // =====================

  async enable2FA(): Promise<{ success: boolean; secret?: string; qr_code?: string }> {
    try {
      const response = await apiRequest<{ success: boolean; data: { secret: string; qr_code: string } }>(
        '/user/2fa/enable',
        { method: 'POST' }
      );

      return {
        success: true,
        secret: response.data?.secret,
        qr_code: response.data?.qr_code,
      };
    } catch {
      return { success: false };
    }
  },

  async verify2FA(code: string): Promise<AuthResponse> {
    try {
      const response = await apiRequest<{ success: boolean; message: string }>(
        '/user/2fa/verify',
        {
          method: 'POST',
          body: JSON.stringify({ code }),
        }
      );

      if (response.success) {
        // Update local user to reflect 2FA enabled
        const session = getStoredSession();
        if (session) {
          const updatedUser = { ...session.user, totp_enabled: true };
          storeSession(updatedUser, session.token);
        }
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Code invalide',
      };
    }
  },

  async disable2FA(code: string): Promise<AuthResponse> {
    try {
      const response = await apiRequest<{ success: boolean; message: string }>(
        '/user/2fa/disable',
        {
          method: 'POST',
          body: JSON.stringify({ code }),
        }
      );

      if (response.success) {
        const session = getStoredSession();
        if (session) {
          const updatedUser = { ...session.user, totp_enabled: false };
          storeSession(updatedUser, session.token);
        }
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la désactivation',
      };
    }
  },

  // =====================
  // Credits
  // =====================

  async getCredits(): Promise<{ success: boolean; balance: number }> {
    try {
      const response = await apiRequest<{ success: boolean; data: { balance: number } }>('/user/credits');
      return {
        success: true,
        balance: response.data?.balance || 0,
      };
    } catch {
      return { success: false, balance: 0 };
    }
  },

  // =====================
  // Notifications
  // =====================

  async getNotifications(unreadOnly = false): Promise<{ success: boolean; data: Array<{
    id: number;
    type: string;
    title: string;
    message: string;
    action_url?: string;
    is_read: boolean;
    created_at: string;
  }> }> {
    try {
      const endpoint = unreadOnly ? '/user/notifications?unread_only=true' : '/user/notifications';
      const response = await apiRequest<{ success: boolean; data: Array<{
        id: number;
        type: string;
        title: string;
        message: string;
        action_url?: string;
        is_read: boolean;
        created_at: string;
      }> }>(endpoint);
      return response;
    } catch {
      return { success: false, data: [] };
    }
  },

  async markNotificationRead(id: number): Promise<{ success: boolean }> {
    try {
      return await apiRequest(`/user/notifications/${id}/read`, { method: 'PUT' });
    } catch {
      return { success: false };
    }
  },
};

export default api;
