// ============================================================
// API Service - Mock implementation for MariaDB backend
// Replace API_BASE_URL with your actual API endpoint
// ============================================================

const API_BASE_URL = 'http://163.5.107.42:3001/api';

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
  billing_cycle: 'monthly' | 'quarterly' | 'biannual' | 'yearly';
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
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.user && result.token) {
        storeSession(result.user, result.token);
        return {
          success: true,
          message: 'Compte créé avec succès',
          user: result.user,
          token: result.token,
        };
      }

      return {
        success: false,
        message: result.message || 'Erreur lors de l\'inscription'
      };
    } catch {
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    // Validation
    if (!data.email || !data.password) {
      return { success: false, message: 'Email et mot de passe requis' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success && result.user && result.token) {
        storeSession(result.user, result.token);
        return {
          success: true,
          message: 'Connexion réussie',
          user: result.user,
          token: result.token,
        };
      }
      
      return { 
        success: false, 
        message: result.message || 'Identifiants incorrects' 
      };
    } catch {
      return { 
        success: false, 
        message: 'Identifiants incorrects' 
      };
    }
  },

  async logout(): Promise<{ success: boolean }> {
    const session = getStoredSession();
    try {
      if (session?.token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`,
          },
        });
      }
    } catch {
      // Ignore errors on logout
    }
    clearSession();
    return { success: true };
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const session = getStoredSession();
    if (!session?.token) {
      return { success: false };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${session.token}` },
      });
      const result = await response.json();

      if (result.success && result.user) {
        storeSession(result.user, session.token);
        return {
          success: true,
          user: result.user,
          token: session.token,
        };
      }

      clearSession();
      return { success: false };
    } catch {
      // If server is unreachable, use cached session
      return {
        success: true,
        user: session.user,
        token: session.token,
      };
    }
  },

  // Profile Management
  async updateProfile(data: UpdateProfileData): Promise<AuthResponse> {
    const session = getStoredSession();
    if (!session?.token) {
      return { success: false, message: 'Non authentifié' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.user) {
        storeSession(result.user, session.token);
        return {
          success: true,
          message: 'Profil mis à jour avec succès',
          user: result.user,
        };
      }

      return {
        success: false,
        message: result.message || 'Erreur lors de la mise à jour'
      };
    } catch {
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  },

  async changePassword(data: ChangePasswordData): Promise<AuthResponse> {
    const session = getStoredSession();
    if (!session?.token) {
      return { success: false, message: 'Non authentifié' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return {
        success: result.success,
        message: result.message || (result.success ? 'Mot de passe modifié avec succès' : 'Erreur')
      };
    } catch {
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  },

  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      return {
        success: result.success,
        message: result.message || 'Si un compte existe avec cette adresse, vous recevrez un email.',
      };
    } catch {
      return {
        success: true,
        message: 'Si un compte existe avec cette adresse, vous recevrez un email.',
      };
    }
  },

  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();
      return {
        success: result.success,
        message: result.message || (result.success ? 'Email verifie avec succes !' : 'Token invalide ou expire'),
      };
    } catch {
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      };
    }
  },

  async resendVerificationEmail(): Promise<AuthResponse> {
    const session = getStoredSession();
    if (!session?.token) {
      return { success: false, message: 'Non authentifie' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
      });

      const result = await response.json();
      return {
        success: result.success,
        message: result.message || (result.success ? 'Email de verification envoye' : 'Erreur'),
      };
    } catch {
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      };
    }
  },

  // Services
  async getServices(): Promise<{ success: boolean; services: Service[] }> {
    const session = getStoredSession();
    if (!session?.token) {
      return { success: false, services: [] };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        headers: { 'Authorization': `Bearer ${session.token}` },
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          services: result.services.map((s: Record<string, unknown>) => ({
            id: s.id,
            uuid: s.uuid,
            hostname: s.hostname,
            label: s.label,
            status: s.status,
            product_name: s.product?.name,
            category_name: s.product?.category,
            location_name: s.location?.name,
            primary_ip: s.primary_ip,
            billing_cycle: s.billing?.cycle,
            billing_amount: s.billing?.amount,
            next_due_date: s.billing?.next_due_date,
            current_specs: s.specs || {},
          })),
        };
      }

      return { success: false, services: [] };
    } catch {
      return { success: false, services: [] };
    }
  },

  // Security logs
  async getSecurityLogs(): Promise<{ success: boolean; logs: Array<{
    event_type: string;
    ip_address: string;
    created_at: string;
    details?: Record<string, unknown>;
  }> }> {
    const session = getStoredSession();
    if (!session?.token) {
      return { success: false, logs: [] };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/security-logs`, {
        headers: { 'Authorization': `Bearer ${session.token}` },
      });

      const result = await response.json();
      return {
        success: result.success,
        logs: result.logs || [],
      };
    } catch {
      return { success: false, logs: [] };
    }
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

  // Payments
  async getStripeConfig(): Promise<{ publishableKey: string | null }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/config`);
      const result = await response.json();
      return { publishableKey: result.publishableKey || null };
    } catch {
      return { publishableKey: null };
    }
  },

  async createPaymentIntent(data: {
    amount: number;
    billing_cycle?: string;
    items?: Array<{ product_slug: string; quantity: number }>;
  }): Promise<{
    success: boolean;
    clientSecret?: string;
    paymentIntentId?: string;
    orderUuid?: string;
    message?: string;
  }> {
    const session = getStoredSession();
    if (!session?.token) {
      return { success: false, message: 'Non authentifié' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return {
        success: result.success,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
        orderUuid: result.orderUuid,
        message: result.message,
      };
    } catch {
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  },

  async getPaymentStatus(paymentIntentId: string): Promise<{
    success: boolean;
    status: string;
    amount?: number;
    currency?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/status/${paymentIntentId}`);
      const result = await response.json();
      return {
        success: result.success,
        status: result.status || 'error',
        amount: result.amount,
        currency: result.currency,
      };
    } catch {
      return { success: false, status: 'error' };
    }
  },

  async confirmPayment(data: {
    paymentIntentId: string;
    orderUuid: string;
  }): Promise<{
    success: boolean;
    message?: string;
    serviceUuid?: string;
  }> {
    const session = getStoredSession();
    if (!session?.token) {
      return { success: false, message: 'Non authentifié' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return {
        success: result.success,
        message: result.message,
        serviceUuid: result.serviceUuid,
      };
    } catch {
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  },

  // Invoices
  async getInvoices(limit = 20, offset = 0): Promise<{
    success: boolean;
    invoices: Invoice[];
    total: number;
    message?: string;
  }> {
    const session = getStoredSession();
    if (!session?.token) {
      return { success: false, invoices: [], total: 0, message: 'Non authentifié' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/payments/invoices?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
        },
      });

      const result = await response.json();
      return {
        success: result.success,
        invoices: result.invoices || [],
        total: result.total || 0,
        message: result.message,
      };
    } catch {
      return { success: false, invoices: [], total: 0, message: 'Erreur de connexion au serveur' };
    }
  },

  async getInvoice(uuid: string): Promise<{
    success: boolean;
    invoice?: Invoice;
    message?: string;
  }> {
    const session = getStoredSession();
    if (!session?.token) {
      return { success: false, message: 'Non authentifié' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/payments/invoices/${uuid}`, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
        },
      });

      const result = await response.json();
      return {
        success: result.success,
        invoice: result.invoice,
        message: result.message,
      };
    } catch {
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  },
};

// Invoice type
export interface Invoice {
  uuid: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  billing_cycle: string;
  paid_at: string | null;
  due_date: string;
  description: string;
  created_at: string;
  pdf_url?: string | null;
  customer?: {
    first_name: string;
    last_name: string;
    email: string;
    company_name?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    postal_code?: string;
    country_code?: string;
  };
}

export default api;
