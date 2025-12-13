// ============================================================
// API Service - Mock implementation for MariaDB backend
// Replace API_BASE_URL with your actual API endpoint
// ============================================================

const API_BASE_URL = 'http://localhost:3001/api'; // Change this to your API URL

// Types based on your MariaDB schema
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
  user?: User;
  token?: string;
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
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  billing_amount: number;
  next_due_date: string;
  current_specs: Record<string, unknown>;
}

// Session storage for mock auth
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

// Mock user for development
const mockUser: User = {
  uuid: 'mock-uuid-12345',
  email: 'demo@mystral.fr',
  email_verified: true,
  first_name: 'Jean',
  last_name: 'Dupont',
  phone: '+33 6 12 34 56 78',
  company_name: 'Mystral SARL',
  address_line1: '123 Rue de la Paix',
  city: 'Paris',
  postal_code: '75001',
  country_code: 'FR',
  role: 'client',
  status: 'active',
  totp_enabled: false,
  created_at: '2024-01-15T10:30:00Z',
  last_login_at: new Date().toISOString(),
};

// ============================================================
// API Functions - Replace mock implementations with real API calls
// ============================================================

export const api = {
  // Authentication
  async register(data: RegisterData): Promise<AuthResponse> {
    // TODO: Replace with real API call
    // const response = await fetch(`${API_BASE_URL}/auth/register`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    // return response.json();

    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    const newUser: User = {
      ...mockUser,
      uuid: `user-${Date.now()}`,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      company_name: data.company_name,
      email_verified: false,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    
    const token = `mock-token-${Date.now()}`;
    storeSession(newUser, token);
    
    return {
      success: true,
      message: 'Compte créé avec succès. Veuillez vérifier votre email.',
      user: newUser,
      token,
    };
  },

  async login(data: LoginData): Promise<AuthResponse> {
    // TODO: Replace with real API call
    // const response = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    // return response.json();

    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate validation
    if (!data.email || !data.password) {
      return { success: false, message: 'Email et mot de passe requis' };
    }
    
    // Test credentials: test / test
    if (data.email !== 'test' && data.password !== 'test') {
      // For demo: also accept any valid email/password combo
    }
    const user: User = {
      ...mockUser,
      email: data.email,
      last_login_at: new Date().toISOString(),
    };
    
    const token = `mock-token-${Date.now()}`;
    storeSession(user, token);
    
    return {
      success: true,
      message: 'Connexion réussie',
      user,
      token,
    };
  },

  async logout(): Promise<{ success: boolean }> {
    // TODO: Replace with real API call
    // const session = getStoredSession();
    // await fetch(`${API_BASE_URL}/auth/logout`, {
    //   method: 'POST',
    //   headers: { 
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${session?.token}`,
    //   },
    // });

    clearSession();
    return { success: true };
  },

  async getCurrentUser(): Promise<AuthResponse> {
    // TODO: Replace with real API call
    // const session = getStoredSession();
    // if (!session?.token) return { success: false };
    // const response = await fetch(`${API_BASE_URL}/auth/me`, {
    //   headers: { 'Authorization': `Bearer ${session.token}` },
    // });
    // return response.json();

    const session = getStoredSession();
    if (!session) {
      return { success: false };
    }
    
    return {
      success: true,
      user: session.user,
      token: session.token,
    };
  },

  // Profile Management
  async updateProfile(data: UpdateProfileData): Promise<AuthResponse> {
    // TODO: Replace with real API call
    // const session = getStoredSession();
    // const response = await fetch(`${API_BASE_URL}/user/profile`, {
    //   method: 'PUT',
    //   headers: { 
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${session?.token}`,
    //   },
    //   body: JSON.stringify(data),
    // });
    // return response.json();

    await new Promise(resolve => setTimeout(resolve, 600));
    
    const session = getStoredSession();
    if (!session) {
      return { success: false, message: 'Non authentifié' };
    }
    
    const updatedUser: User = {
      ...session.user,
      ...data,
    };
    
    storeSession(updatedUser, session.token);
    
    return {
      success: true,
      message: 'Profil mis à jour avec succès',
      user: updatedUser,
    };
  },

  async changePassword(data: ChangePasswordData): Promise<AuthResponse> {
    // TODO: Replace with real API call
    // const session = getStoredSession();
    // const response = await fetch(`${API_BASE_URL}/user/password`, {
    //   method: 'PUT',
    //   headers: { 
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${session?.token}`,
    //   },
    //   body: JSON.stringify(data),
    // });
    // return response.json();

    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (data.new_password.length < 8) {
      return { success: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
    }
    
    return {
      success: true,
      message: 'Mot de passe modifié avec succès',
    };
  },

  async requestPasswordReset(email: string): Promise<AuthResponse> {
    // TODO: Replace with real API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      message: 'Si un compte existe avec cette adresse, vous recevrez un email de réinitialisation.',
    };
  },

  // Services
  async getServices(): Promise<{ success: boolean; services: Service[] }> {
    // TODO: Replace with real API call
    // const session = getStoredSession();
    // const response = await fetch(`${API_BASE_URL}/services`, {
    //   headers: { 'Authorization': `Bearer ${session?.token}` },
    // });
    // return response.json();

    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return empty array for new users
    return {
      success: true,
      services: [],
    };
  },

  // Security logs
  async getSecurityLogs(): Promise<{ success: boolean; logs: Array<{
    event_type: string;
    ip_address: string;
    created_at: string;
    details?: Record<string, unknown>;
  }> }> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      logs: [
        {
          event_type: 'login_success',
          ip_address: '192.168.1.1',
          created_at: new Date().toISOString(),
        },
      ],
    };
  },

  // 2FA
  async enable2FA(): Promise<{ success: boolean; secret?: string; qr_code?: string }> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      success: true,
      secret: 'MOCK2FASECRET123',
      qr_code: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Mystral:demo@mystral.fr?secret=MOCK2FASECRET123&issuer=Mystral',
    };
  },

  async verify2FA(code: string): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (code.length !== 6) {
      return { success: false, message: 'Code invalide' };
    }
    
    const session = getStoredSession();
    if (session) {
      const updatedUser = { ...session.user, totp_enabled: true };
      storeSession(updatedUser, session.token);
    }
    
    return { success: true, message: '2FA activé avec succès' };
  },

  async disable2FA(code: string): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const session = getStoredSession();
    if (session) {
      const updatedUser = { ...session.user, totp_enabled: false };
      storeSession(updatedUser, session.token);
    }
    
    return { success: true, message: '2FA désactivé' };
  },
};

export default api;
