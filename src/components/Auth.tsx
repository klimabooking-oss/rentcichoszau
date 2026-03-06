import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage({ text: 'Konto utworzone! Potwierdź email (jeśli włączone). Możesz się zalogować.', type: 'success' });
                setIsSignUp(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error: any) {
            setMessage({ text: error.message || 'Wystąpił błąd podczas logowania', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#1C1C1E]/80 backdrop-blur-md border border-fuchsia-500/20 rounded-2xl p-6 mb-8 flex flex-col shadow-[0_0_30px_-5px_rgba(217,70,239,0.15)]">
            <h3 className="text-xl font-bold mb-1 text-center">
                {isSignUp ? 'Utwórz konto' : 'Zaloguj się'}
            </h3>
            <p className="text-gray-400 text-sm mb-6 text-center">
                {isSignUp
                    ? 'Konto jest wymagane do przypisania słuchawek.'
                    : 'Zaloguj się, aby uzyskać dostęp do biletów i słuchawek.'}
            </p>

            {message && (
                <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleAuth} className="flex flex-col gap-4">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Twój adres email"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all text-white placeholder-gray-500"
                        required
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Twoje hasło"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all text-white placeholder-gray-500"
                        required
                        minLength={6}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 bg-gradient-to-r from-fuchsia-500 to-amber-500 text-black font-bold py-3 px-8 rounded-full hover:scale-[1.02] transition-transform duration-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        isSignUp ? 'ZAREJESTRUJ SIĘ' : 'ZALOGUJ SIĘ TERAZ'
                    )}
                </button>
            </form>

            <div className="mt-4 text-center">
                <button
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setMessage(null);
                    }}
                    className="text-sm text-gray-400 hover:text-fuchsia-400 transition-colors"
                    type="button"
                >
                    {isSignUp ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się'}
                </button>
            </div>
        </div>
    );
}
