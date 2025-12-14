import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { api } from '@/services/api';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Vérification du paiement...');

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentIntent = searchParams.get('payment_intent');
      const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
      const redirectStatus = searchParams.get('redirect_status');

      // Si on a un redirect_status de Stripe
      if (redirectStatus) {
        if (redirectStatus === 'succeeded') {
          setStatus('success');
          setMessage('Paiement réussi ! Votre commande a été confirmée.');

          // Confirmer le paiement côté backend si on a le paymentIntent
          if (paymentIntent) {
            try {
              await api.confirmPayment({
                paymentIntentId: paymentIntent,
                orderUuid: '', // On n'a pas l'orderUuid ici, le backend devra le retrouver
              });
            } catch (e) {
              console.error('Error confirming payment:', e);
            }
          }

          // Rediriger vers le dashboard après 3 secondes
          setTimeout(() => {
            navigate('/dashboard?payment=success');
          }, 3000);
        } else if (redirectStatus === 'failed') {
          setStatus('error');
          setMessage('Le paiement a échoué. Veuillez réessayer.');
        } else if (redirectStatus === 'pending') {
          setStatus('loading');
          setMessage('Votre paiement est en cours de traitement...');
          // Vérifier à nouveau dans quelques secondes
          setTimeout(() => {
            window.location.reload();
          }, 5000);
        } else {
          setStatus('error');
          setMessage(`Statut du paiement: ${redirectStatus}`);
        }
      } else {
        // Pas de paramètres Stripe, rediriger vers le dashboard
        navigate('/dashboard');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

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
                  <h1 className="text-2xl font-bold mb-2">Traitement en cours</h1>
                  <p className="text-muted-foreground">{message}</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h1 className="text-2xl font-bold mb-2 text-green-500">Paiement réussi !</h1>
                  <p className="text-muted-foreground mb-6">{message}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Redirection automatique vers votre tableau de bord...
                  </p>
                  <Button onClick={() => navigate('/dashboard')} variant="glow">
                    Accéder au tableau de bord
                  </Button>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
                  <h1 className="text-2xl font-bold mb-2 text-destructive">Paiement échoué</h1>
                  <p className="text-muted-foreground mb-6">{message}</p>
                  <div className="space-y-3">
                    <Button onClick={() => navigate(-1)} variant="glow" className="w-full">
                      Réessayer le paiement
                    </Button>
                    <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                      Retour au tableau de bord
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
