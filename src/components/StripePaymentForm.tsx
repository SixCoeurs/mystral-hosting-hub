import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';

// Stripe publishable key - loaded from backend
let stripePromise: ReturnType<typeof loadStripe> | null = null;

const getStripe = async () => {
  if (!stripePromise) {
    const config = await api.getStripeConfig();
    if (config.publishableKey) {
      stripePromise = loadStripe(config.publishableKey);
    }
  }
  return stripePromise;
};

interface PaymentFormProps {
  onSuccess: (paymentIntentId: string, orderUuid: string) => void;
  onError: (error: string) => void;
}

function PaymentForm({ onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/callback`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'Une erreur est survenue');
      onError(error.message || 'Erreur de paiement');
      setIsProcessing(false);
    } else if (paymentIntent) {
      if (paymentIntent.status === 'succeeded') {
        setMessage('Paiement réussi !');
        onSuccess(paymentIntent.id, paymentIntent.metadata?.order_uuid || '');
      } else if (paymentIntent.status === 'requires_payment_method') {
        setMessage('Le paiement a été refusé. Veuillez réessayer avec une autre carte.');
        onError('Paiement refusé');
        setIsProcessing(false);
      } else if (paymentIntent.status === 'requires_action') {
        // 3D Secure ou autre action requise - Stripe gère automatiquement
        setIsProcessing(false);
      } else {
        setMessage(`Statut du paiement: ${paymentIntent.status}`);
        setIsProcessing(false);
      }
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          message.includes('réussi')
            ? 'bg-green-500/10 text-green-500'
            : 'bg-destructive/10 text-destructive'
        }`}>
          {message.includes('réussi') ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message}
        </div>
      )}

      <Button
        type="submit"
        variant="glow"
        className="w-full"
        size="lg"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Payer maintenant
          </>
        )}
      </Button>
    </form>
  );
}

interface StripePaymentFormProps {
  amount: number; // Amount in euros
  billingCycle?: string;
  onSuccess?: (paymentIntentId: string, orderUuid: string) => void;
  onError?: (error: string) => void;
}

export function StripePaymentForm({
  amount,
  billingCycle = 'monthly',
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderUuid, setOrderUuid] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stripeInstance, setStripeInstance] = useState<Awaited<ReturnType<typeof loadStripe>> | null>(null);

  useEffect(() => {
    const initStripe = async () => {
      const stripe = await getStripe();
      setStripeInstance(stripe);
    };
    initStripe();
  }, []);

  useEffect(() => {
    const createPaymentIntent = async () => {
      setIsLoading(true);
      setError(null);

      const result = await api.createPaymentIntent({
        amount,
        billing_cycle: billingCycle,
      });

      if (result.success && result.clientSecret) {
        setClientSecret(result.clientSecret);
        setOrderUuid(result.orderUuid || null);
        setPaymentIntentId(result.paymentIntentId || null);
      } else {
        setError(result.message || 'Impossible de créer le paiement');
        onError?.(result.message || 'Erreur');
      }

      setIsLoading(false);
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, billingCycle]);

  const handleSuccess = async (intentId: string) => {
    // Confirm payment on backend
    if (orderUuid) {
      const confirmResult = await api.confirmPayment({
        paymentIntentId: intentId,
        orderUuid,
      });

      if (confirmResult.success) {
        onSuccess?.(intentId, orderUuid);
      }
    } else {
      onSuccess?.(intentId, '');
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    onError?.(errorMessage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Chargement du paiement...</span>
      </div>
    );
  }

  if (error && !clientSecret) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (!clientSecret || !stripeInstance) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>Configuration Stripe non disponible</span>
        </div>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripeInstance}
      options={{
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#8b5cf6',
            colorBackground: '#1a1a2e',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      <PaymentForm onSuccess={handleSuccess} onError={handleError} />
    </Elements>
  );
}

export default StripePaymentForm;
