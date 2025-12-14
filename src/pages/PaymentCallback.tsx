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
      const paymentIntentId = searchParams.get('payment_intent');

      // Si on a un payment_intent, vérifier son vrai statut via l'API
      if (paymentIntentId) {
        const result = await api.getPaymentStatus(paymentIntentId);

        if (result.success) {
          if (result.status === 'succeeded') {
            setStatus('success');
            setMessage('Paiement réussi ! Votre commande a été confirmée.');

            // Confirmer le paiement côté backend
            try {
              await api.confirmPayment({
                paymentIntentId: paymentIntentId,
                orderUuid: '',
              });
            } catch (e) {
              console.error('Error confirming payment:', e);
            }

            // Rediriger vers le dashboard après 3 secondes
            setTimeout(() => {
              navigate('/dashboard?payment=success');
            }, 3000);
          } else if (result.status === 'requires_payment_method') {
            setStatus('error');
            setMessage('Le paiement a été refusé. Veuillez réessayer avec une autre méthode de paiement.');
          } else if (result.status === 'processing') {
            setStatus('loading');
            setMessage('Votre paiement est en cours de traitement...');
            // Vérifier à nouveau dans quelques secondes
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          } else if (result.status === 'requires_action') {
            setStatus('loading');
            setMessage('Action requise pour finaliser le paiement...');
          } else if (result.status === 'canceled') {
            setStatus('error');
            setMessage('Le paiement a été annulé.');
          } else {
            setStatus('error');
            setMessage(`Statut du paiement: ${result.status}`);
          }
        } else {
          setStatus('error');
          setMessage('Impossible de vérifier le statut du paiement.');
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
                    <Button onClick={() => navigate('/checkout')} variant="glow" className="w-full">
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
