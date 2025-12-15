import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  X,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'enable' | 'disable';
}

export function TwoFactorSetup({ isOpen, onClose, mode }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'recovery' | 'disable'>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (isOpen && mode === 'enable') {
      setStep('setup');
      setupTwoFactor();
    } else if (isOpen && mode === 'disable') {
      setStep('disable');
    }
  }, [isOpen, mode]);

  const setupTwoFactor = async () => {
    setIsLoading(true);
    try {
      const result = await api.setup2FA();
      if (result.success && result.secret && result.qr_code) {
        setSecret(result.secret);
        setQrCode(result.qr_code);
      } else {
        toast({
          title: 'Erreur',
          description: result.message || 'Impossible de configurer la 2FA',
          variant: 'destructive',
        });
        onClose();
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Erreur de connexion au serveur',
        variant: 'destructive',
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un code à 6 chiffres',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.enable2FA(verifyCode);
      if (result.success) {
        setRecoveryCodes(result.recovery_codes || []);
        setStep('recovery');
        await refreshUser();
        toast({
          title: 'Succès',
          description: '2FA activée avec succès',
        });
      } else {
        toast({
          title: 'Erreur',
          description: result.message || 'Code invalide',
          variant: 'destructive',
        });
        setVerifyCode('');
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Erreur de connexion au serveur',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un code à 6 chiffres',
        variant: 'destructive',
      });
      return;
    }

    if (!password) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer votre mot de passe',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.disable2FA(verifyCode, password);
      if (result.success) {
        await refreshUser();
        toast({
          title: 'Succès',
          description: '2FA désactivée',
        });
        handleClose();
      } else {
        toast({
          title: 'Erreur',
          description: result.message || 'Code ou mot de passe invalide',
          variant: 'destructive',
        });
        setVerifyCode('');
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Erreur de connexion au serveur',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | 'codes') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
    toast({
      title: 'Copié',
      description: type === 'secret' ? 'Clé secrète copiée' : 'Codes de récupération copiés',
    });
  };

  const handleClose = () => {
    setStep('setup');
    setSecret('');
    setQrCode('');
    setVerifyCode('');
    setRecoveryCodes([]);
    setPassword('');
    setCopiedSecret(false);
    setCopiedCodes(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {mode === 'enable' ? 'Activer la 2FA' : 'Désactiver la 2FA'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content based on step */}
          {step === 'setup' && (
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Configuration en cours...</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)
                  </p>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-lg">
                      <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                    </div>
                  </div>

                  {/* Secret Key */}
                  <div className="space-y-2">
                    <Label className="text-sm">Ou entrez cette clé manuellement :</Label>
                    <div className="flex gap-2">
                      <code className="flex-1 p-3 bg-secondary/50 rounded-lg text-sm font-mono break-all">
                        {secret}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(secret, 'secret')}
                        className="shrink-0"
                      >
                        {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button onClick={() => setStep('verify')} className="w-full">
                    Continuer
                  </Button>
                </>
              )}
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Entrez le code à 6 chiffres affiché dans votre application d'authentification
              </p>

              <div className="space-y-2">
                <Label htmlFor="verify-code">Code de vérification</Label>
                <Input
                  id="verify-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('setup')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={isLoading || verifyCode.length !== 6}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    'Activer'
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'recovery' && (
            <div className="space-y-6">
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-500">
                      Sauvegardez ces codes !
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ces codes vous permettront de vous connecter si vous perdez accès à votre application d'authentification. Gardez-les en lieu sûr.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recovery Codes Grid */}
              <div className="grid grid-cols-2 gap-2">
                {recoveryCodes.map((code, index) => (
                  <code
                    key={index}
                    className="p-2 bg-secondary/50 rounded text-center text-sm font-mono"
                  >
                    {code}
                  </code>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => copyToClipboard(recoveryCodes.join('\n'), 'codes')}
                className="w-full"
              >
                {copiedCodes ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copier tous les codes
                  </>
                )}
              </Button>

              <Button onClick={handleClose} className="w-full">
                Terminer
              </Button>
            </div>
          )}

          {step === 'disable' && (
            <div className="space-y-6">
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Désactiver la 2FA réduit la sécurité de votre compte. Assurez-vous de comprendre les risques.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="disable-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="disable-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disable-code">Code 2FA</Label>
                  <Input
                    id="disable-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisable}
                  disabled={isLoading || verifyCode.length !== 6 || !password}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Désactivation...
                    </>
                  ) : (
                    'Désactiver'
                  )}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
