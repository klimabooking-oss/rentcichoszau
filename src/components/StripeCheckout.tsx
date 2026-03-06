import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';

// Używamy publicznego klucza
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = ({ amount, onSuccess }: { amount: number, ticketId?: string, onSuccess: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        // SYMULACJA: sprawdzamy tylko czy wpisano poprawny numer karty lokalnie
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        // Używamy bezpiecznej weryfikacji struktury numeru karty publicznym API Stripe
        const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (stripeError) {
            setError(stripeError.message || 'Wystąpił błąd przy weryfikacji karty');
            setProcessing(false);
        } else {
            console.log('PaymentMethod utworzony w symulacji:', paymentMethod);

            // Sztuczne opóźnienie dla wiarygodnego efektu sprawdzania kaucji 
            setTimeout(() => {
                setProcessing(false);
                onSuccess();
            }, 1500);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#fff',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#ef4444',
                            },
                        },
                    }}
                />
            </div>

            {error && <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}

            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full py-4 text-black font-black bg-gradient-to-r from-fuchsia-500 to-amber-500 rounded-xl hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(217,70,239,0.3)]">
                {processing ? 'Autoryzacja (Symulacja)...' : `Zablokuj Kaucję (Symulowane: ${amount} PLN)`}
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">Działamy w trybie symulacji – wpisz dowolny numer testowy (np. 4242 4242...). Żadne środki nie zostaną pobrane.</p>
        </form>
    );
};

export default function StripeCheckout({ amount, ticketId, open, onClose, onSuccess }: { amount: number, ticketId?: string, open: boolean, onClose: () => void, onSuccess: () => void }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#161618] border border-fuchsia-500/20 rounded-2xl w-full max-w-md p-6 relative shadow-[0_0_50px_rgba(217,70,239,0.1)]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    Zamknij
                </button>
                <h2 className="text-2xl font-bold text-white mb-2">Autoryzacja Kaucji</h2>
                <p className="text-gray-400 text-sm mb-6">Podepnij kartę, aby zablokować kaucję przed pobraniem sprzętu. Proces jest tu całkowicie symulowany (Frontend Only).</p>

                <Elements stripe={stripePromise}>
                    <CheckoutForm amount={amount} ticketId={ticketId} onSuccess={onSuccess} />
                </Elements>
            </div>
        </div>
    );
}
