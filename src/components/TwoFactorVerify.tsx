import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TwoFactorVerifyProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<{ success: boolean; message?: string }>;
  isLoading?: boolean;
}

export function TwoFactorVerify({ isOpen, onClose, onVerify, isLoading = false }: TwoFactorVerifyProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (code.length === 6 && !isVerifying) {
      handleSubmit();
    }
  }, [code]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (code.length < 6) {
      setError('Veuillez entrer un code à 6 chiffres');
      return;
    }

    setError('');
    setIsVerifying(true);

    try {
      const result = await onVerify(code);
      if (!result.success) {
        setError(result.message || 'Code invalide');
        setCode('');
        inputRef.current?.focus();
      }
    } catch {
      setError('Une erreur est survenue');
      setCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    if (error) setError('');
  };

  // Handle recovery code input (format: XXXX-XXXX)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Vérification 2FA
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sécurité renforcée
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-sm text-muted-foreground">
                Entrez le code à 6 chiffres de votre application d'authentification
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totp-code" className="sr-only">
                Code d'authentification
              </Label>
              <Input
                ref={inputRef}
                id="totp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={handleCodeChange}
                onKeyDown={handleKeyDown}
                className={`text-center text-3xl tracking-[0.5em] font-mono h-14 bg-secondary/50 border-2 ${
                  error ? 'border-destructive' : 'border-border focus:border-primary'
                }`}
                disabled={isVerifying || isLoading}
                autoComplete="one-time-code"
              />
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-destructive text-sm"
              >
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-11"
              disabled={code.length < 6 || isVerifying || isLoading}
            >
              {isVerifying || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                'Vérifier'
              )}
            </Button>

            {/* Recovery code hint */}
            <p className="text-xs text-center text-muted-foreground">
              Vous pouvez aussi utiliser un code de récupération
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
