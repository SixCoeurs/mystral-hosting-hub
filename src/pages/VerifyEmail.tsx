import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { api } from '@/services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('Verification en cours...');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('no-token');
        setMessage('Aucun token de verification fourni.');
        return;
      }

      try {
        const result = await api.verifyEmail(token);

        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Email verifie avec succes !');
        } else {
          setStatus('error');
          setMessage(result.message || 'Token invalide ou expire.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Erreur lors de la verification. Veuillez reessayer.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="p-8 rounded-xl bg-card border border-border">
              {status === 'loading' && (
                <>
                  <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
                  <h1 className="text-2xl font-bold mb-2">Verification en cours</h1>
                  <p className="text-muted-foreground">{message}</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h1 className="text-2xl font-bold mb-2 text-green-500">Email verifie !</h1>
                  <p className="text-muted-foreground mb-6">{message}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vous pouvez maintenant profiter de toutes les fonctionnalites.
                  </p>
                  <Button onClick={() => navigate('/dashboard')} variant="glow">
                    Acceder au tableau de bord
                  </Button>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
                  <h1 className="text-2xl font-bold mb-2 text-destructive">Verification echouee</h1>
                  <p className="text-muted-foreground mb-6">{message}</p>
                  <div className="space-y-3">
                    <Button onClick={() => navigate('/account')} variant="glow" className="w-full">
                      Renvoyer l'email de verification
                    </Button>
                    <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                      Se connecter
                    </Button>
                  </div>
                </>
              )}

              {status === 'no-token' && (
                <>
                  <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h1 className="text-2xl font-bold mb-2">Verification d'email</h1>
                  <p className="text-muted-foreground mb-6">{message}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Utilisez le lien envoye dans votre email pour verifier votre adresse.
                  </p>
                  <div className="space-y-3">
                    <Button onClick={() => navigate('/login')} variant="glow" className="w-full">
                      Se connecter
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
