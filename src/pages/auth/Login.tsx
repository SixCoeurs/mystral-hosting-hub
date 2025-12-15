import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    if (requires2FA && !totpCode) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer votre code d\'authentification',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({
        email,
        password,
        totp_code: requires2FA ? totpCode : undefined,
      });

      if (result.success) {
        if (result.requires_2fa) {
          setRequires2FA(true);
          toast({
            title: 'Authentification à deux facteurs',
            description: 'Entrez le code de votre application d\'authentification',
          });
        } else {
          toast({
            title: 'Connexion réussie',
            description: 'Bienvenue sur votre espace client',
          });
          navigate(redirectUrl);
        }
      } else {
        toast({
          title: 'Erreur de connexion',
          description: result.message || 'Email ou mot de passe incorrect',
          variant: 'destructive',
        });
        // Reset 2FA code on error
        if (requires2FA) {
          setTotpCode('');
        }
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setRequires2FA(false);
    setTotpCode('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="relative bg-card border border-border rounded-2xl p-8 shadow-card">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 rounded-2xl blur-xl opacity-50" />
            
            <div className="relative">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                  Connexion
                </h1>
                <p className="text-muted-foreground">
                  Accédez à votre espace client Mystral
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {!requires2FA ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="vous@exemple.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-secondary/50 border-border focus:border-primary"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Link
                          to="/forgot-password"
                          className="text-sm text-primary hover:text-accent transition-colors"
                        >
                          Mot de passe oublié ?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 bg-secondary/50 border-border focus:border-primary"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Entrez le code à 6 chiffres de votre application d'authentification
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totp">Code d'authentification</Label>
                      <Input
                        id="totp"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="000000"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                        className="text-center text-2xl tracking-widest bg-secondary/50 border-border focus:border-primary"
                        disabled={isLoading}
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Vous pouvez aussi utiliser un code de récupération
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Retour
                    </button>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full btn-glow h-12 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {requires2FA ? 'Vérification...' : 'Connexion en cours...'}
                    </>
                  ) : requires2FA ? (
                    'Vérifier'
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground">
                    Pas encore de compte ?
                  </span>
                </div>
              </div>

              {/* Register link */}
              <Link to={`/register${redirectUrl !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}>
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-primary/50 hover:bg-primary/10 hover:border-primary"
                >
                  Créer un compte
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
