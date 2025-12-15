import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Shield,
  Key,
  Bell,
  CreditCard,
  LogOut,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import api, { Invoice } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TwoFactorSetup } from '@/components/TwoFactorSetup';

export default function Account() {
  const { user, isAuthenticated, isLoading: authLoading, updateProfile, changePassword, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Profile form state
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    company_name: user?.company_name || '',
    address_line1: user?.address_line1 || '',
    address_line2: user?.address_line2 || '',
    city: user?.city || '',
    postal_code: user?.postal_code || '',
    country_code: user?.country_code || 'FR',
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Invoices state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesTotal, setInvoicesTotal] = useState(0);

  // 2FA state
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAMode, setTwoFAMode] = useState<'enable' | 'disable'>('enable');
  const [recoveryCodesRemaining, setRecoveryCodesRemaining] = useState<number | null>(null);

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!isAuthenticated) return;
      setInvoicesLoading(true);
      try {
        const result = await api.getInvoices();
        if (result.success) {
          setInvoices(result.invoices);
          setInvoicesTotal(result.total);
        }
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
      } finally {
        setInvoicesLoading(false);
      }
    };
    fetchInvoices();
  }, [isAuthenticated]);

  // Fetch 2FA status
  useEffect(() => {
    const fetch2FAStatus = async () => {
      if (!isAuthenticated || !user?.totp_enabled) return;
      try {
        const result = await api.get2FAStatus();
        if (result.success) {
          setRecoveryCodesRemaining(result.recovery_codes_remaining ?? null);
        }
      } catch (error) {
        console.error('Failed to fetch 2FA status:', error);
      }
    };
    fetch2FAStatus();
  }, [isAuthenticated, user?.totp_enabled]);

  const handle2FAClick = () => {
    setTwoFAMode(user?.totp_enabled ? 'disable' : 'enable');
    setShow2FAModal(true);
  };

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);

    try {
      const result = await updateProfile(profileData);
      
      if (result.success) {
        toast({
          title: 'Profil mis à jour',
          description: 'Vos informations ont été enregistrées',
        });
      } else {
        toast({
          title: 'Erreur',
          description: result.message || 'Une erreur est survenue',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 8 caractères',
        variant: 'destructive',
      });
      return;
    }

    setIsPasswordLoading(true);

    try {
      const result = await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      
      if (result.success) {
        toast({
          title: 'Mot de passe modifié',
          description: 'Votre mot de passe a été changé avec succès',
        });
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        toast({
          title: 'Erreur',
          description: result.message || 'Une erreur est survenue',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-display font-bold text-foreground">
              Mon Compte
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos informations personnelles et paramètres de sécurité
            </p>
          </motion.div>

          {/* Account Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-xl font-bold text-primary-foreground">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {user?.email_verified ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-500">Email vérifié</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <span className="text-sm text-orange-500">Email non vérifié</span>
                    </>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user?.status === 'active' 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-orange-500/10 text-orange-500'
                }`}>
                  {user?.status === 'active' ? 'Actif' : user?.status}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="bg-secondary/50 p-1">
                <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Shield className="h-4 w-4 mr-2" />
                  Sécurité
                </TabsTrigger>
                <TabsTrigger value="billing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Facturation
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-6">
                    Informations personnelles
                  </h3>
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Name fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Prénom</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="first_name"
                            name="first_name"
                            value={profileData.first_name}
                            onChange={handleProfileChange}
                            className="pl-10 bg-secondary/50"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Nom</Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={profileData.last_name}
                          onChange={handleProfileChange}
                          className="bg-secondary/50"
                        />
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="email"
                            value={user?.email || ''}
                            disabled
                            className="pl-10 bg-secondary/30 text-muted-foreground"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className="pl-10 bg-secondary/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Company */}
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Entreprise</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="company_name"
                          name="company_name"
                          value={profileData.company_name}
                          onChange={handleProfileChange}
                          className="pl-10 bg-secondary/50"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="border-t border-border pt-6">
                      <h4 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Adresse de facturation
                      </h4>
                      <div className="space-y-4">
                        <Input
                          name="address_line1"
                          placeholder="Adresse ligne 1"
                          value={profileData.address_line1}
                          onChange={handleProfileChange}
                          className="bg-secondary/50"
                        />
                        <Input
                          name="address_line2"
                          placeholder="Adresse ligne 2 (optionnel)"
                          value={profileData.address_line2}
                          onChange={handleProfileChange}
                          className="bg-secondary/50"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <Input
                            name="city"
                            placeholder="Ville"
                            value={profileData.city}
                            onChange={handleProfileChange}
                            className="bg-secondary/50"
                          />
                          <Input
                            name="postal_code"
                            placeholder="Code postal"
                            value={profileData.postal_code}
                            onChange={handleProfileChange}
                            className="bg-secondary/50"
                          />
                          <Input
                            name="country_code"
                            placeholder="Pays"
                            value={profileData.country_code}
                            onChange={handleProfileChange}
                            className="bg-secondary/50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" className="btn-glow" disabled={isProfileLoading}>
                        {isProfileLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Changer le mot de passe
                    </h3>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="current_password">Mot de passe actuel</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="current_password"
                            name="current_password"
                            type={showPasswords ? 'text' : 'password'}
                            value={passwordData.current_password}
                            onChange={handlePasswordChange}
                            className="pl-10 pr-10 bg-secondary/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new_password">Nouveau mot de passe</Label>
                        <Input
                          id="new_password"
                          name="new_password"
                          type={showPasswords ? 'text' : 'password'}
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          className="bg-secondary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
                        <Input
                          id="confirm_password"
                          name="confirm_password"
                          type={showPasswords ? 'text' : 'password'}
                          value={passwordData.confirm_password}
                          onChange={handlePasswordChange}
                          className="bg-secondary/50"
                        />
                      </div>
                      <Button type="submit" disabled={isPasswordLoading}>
                        {isPasswordLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Modification...
                          </>
                        ) : (
                          'Modifier le mot de passe'
                        )}
                      </Button>
                    </form>
                  </div>

                  {/* 2FA */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Authentification à deux facteurs (2FA)
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          {user?.totp_enabled
                            ? 'La 2FA est activée sur votre compte'
                            : 'Ajoutez une couche de sécurité supplémentaire'}
                        </p>
                        {user?.totp_enabled && recoveryCodesRemaining !== null && (
                          <p className={`text-sm mt-2 ${recoveryCodesRemaining <= 2 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                            {recoveryCodesRemaining} code{recoveryCodesRemaining > 1 ? 's' : ''} de récupération restant{recoveryCodesRemaining > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <Button
                        variant={user?.totp_enabled ? 'outline' : 'default'}
                        onClick={handle2FAClick}
                      >
                        {user?.totp_enabled ? 'Désactiver' : 'Activer'}
                      </Button>
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Sessions actives
                    </h3>
                    <div className="text-muted-foreground text-sm">
                      La gestion des sessions sera disponible prochainement.
                    </div>
                  </div>

                  {/* Logout */}
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-destructive">
                          Déconnexion
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          Se déconnecter de votre compte sur cet appareil
                        </p>
                      </div>
                      <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Se déconnecter
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing">
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Mes factures
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {invoicesTotal} facture{invoicesTotal > 1 ? 's' : ''}
                    </span>
                  </div>

                  {invoicesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aucune facture pour le moment</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vos factures apparaîtront ici après votre premier paiement
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoices.map((invoice) => (
                        <div
                          key={invoice.uuid}
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {invoice.invoice_number}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {invoice.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="font-semibold text-foreground">
                                {invoice.total.toFixed(2)}€
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              invoice.status === 'paid'
                                ? 'bg-green-500/10 text-green-500'
                                : invoice.status === 'pending'
                                ? 'bg-orange-500/10 text-orange-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : invoice.status === 'refunded' ? 'Remboursée' : 'Annulée'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (invoice.pdf_url) {
                                  window.open(invoice.pdf_url, '_blank');
                                } else {
                                  toast({
                                    title: 'PDF non disponible',
                                    description: 'Le PDF de cette facture n\'est pas encore disponible.',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                              title={invoice.pdf_url ? 'Télécharger le PDF' : 'PDF non disponible'}
                            >
                              <Download className={`h-4 w-4 ${!invoice.pdf_url ? 'opacity-50' : ''}`} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Préférences de notification
                  </h3>
                  <p className="text-muted-foreground">
                    Les paramètres de notification seront disponibles prochainement.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* 2FA Setup Modal */}
      <TwoFactorSetup
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        mode={twoFAMode}
      />
    </div>
  );
}
