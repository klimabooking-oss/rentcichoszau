import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Zap, Info, Loader2 } from 'lucide-react';
import Auth from '../components/Auth';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function EventTickets() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        async function fetchEvent() {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setEvent(data);
            } catch (err) {
                console.error("Błąd podczas pobierania wydarzenia: ", err);
            } finally {
                setLoading(false);
            }
        }
        fetchEvent();
    }, [id]);

    const handleBuyTicket = async () => {
        if (!user || !event) return;
        setPurchasing(true);
        try {
            // Generujemy wewnetrzne ID biletu z QR - prefix EV[ID Wydarzenia]U[Sufix Uzytkownika] i znacznik czasu
            const qrCode = `EV${event.id}U${user.id.substring(0, 4).toUpperCase()}${Date.now().toString().slice(-6)}`;

            const { error: ticketError } = await supabase.from('tickets').insert({
                user_id: user.id,
                event_id: event.id,
                ticket_type: 'standard',
                qr_code: qrCode,
                status: 'valid'
            });

            if (ticketError) throw ticketError;

            // Przejdz na strone usera z widokiem jego biletow po zakonczeniu
            navigate('/dashboard');
        } catch (error) {
            console.error("Błąd zakupu biletu", error);
            alert("Nie udało się zakupić biletu. Spróbuj ponownie.");
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-fuchsia-500" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-[#0F0F11] text-white flex items-center justify-center flex-col">
                <h1 className="text-3xl font-bold mb-4">Nie znaleziono wydarzenia.</h1>
                <p className="text-gray-400">Prawdopodobnie błędny link lub wydarzenie nie istnieje.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F0F11] text-white flex justify-center p-4 sm:p-8 font-sans">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Lewa kolumna - Zdjecie i Gradient */}
                <div className="lg:col-span-5 relative h-64 lg:h-[800px] rounded-3xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F11] via-transparent to-transparent z-10 lg:bg-gradient-to-r" />
                    <img
                        src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=3270&auto=format&fit=crop"
                        alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Akcent glow */}
                    <div className="absolute bottom-1/4 left-0 w-2 h-2 bg-fuchsia-500 rounded-full shadow-[0_0_20px_10px_rgba(217,70,239,0.8)] z-20" />
                </div>

                {/* Prawa kolumna - Treść */}
                <div className="lg:col-span-7 flex flex-col pt-4 lg:pt-12 px-2 lg:px-8">
                    <span className="text-fuchsia-500 font-bold tracking-widest text-sm uppercase mb-2">Wydarzenie</span>
                    <h1 className="text-4xl lg:text-5xl font-black italic tracking-tight mb-4 uppercase leading-none">
                        {event.title}
                    </h1>
                    {event.description && (
                        <p className="text-gray-400 mb-8 max-w-xl">{event.description}</p>
                    )}

                    {/* Panel Wymagane Logowanie / Stan Zalogowany */}
                    {!user ? (
                        <Auth />
                    ) : (
                        <div className="bg-[#1C1C1E]/80 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between text-left shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)]">
                            <div>
                                <h3 className="text-xl font-bold mb-1 text-emerald-400">Jesteś zalogowany!</h3>
                                <p className="text-gray-400 text-sm">Masz dostęp do przypisania biletu i kaucji słuchawek na koncie: {user.email}</p>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="mt-4 sm:mt-0 px-4 py-2 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors shrink-0"
                            >
                                Wyloguj
                            </button>
                        </div>
                    )}

                    {/* Info - Kiedy i Gdzie */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                        <div className="bg-[#1C1C1E] border border-white/5 rounded-xl p-5 flex flex-col">
                            <span className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Kiedy</span>
                            <div className="flex items-center text-lg font-bold">
                                <Calendar className="w-5 h-5 mr-3 text-fuchsia-500 shrink-0" />
                                <span>{format(new Date(event.date), "d MMMM yyyy, HH:mm", { locale: pl })}</span>
                            </div>
                        </div>
                        <div className="bg-[#1C1C1E] border border-white/5 rounded-xl p-5 flex flex-col">
                            <span className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Gdzie</span>
                            <div className="flex items-center text-lg font-bold">
                                <MapPin className="w-5 h-5 mr-3 text-fuchsia-500 shrink-0" />
                                <span>{event.location}</span>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mb-4 flex items-center uppercase tracking-wide">
                        <Zap className="w-5 h-5 mr-2 text-amber-400" /> Wybierz typ biletu
                    </h2>

                    {/* Lista Biletów */}
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-center hover:border-fuchsia-500/50 transition-colors cursor-pointer relative overflow-hidden group">
                        {/* Subtle glow effect on hover inside ticket */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="mb-4 sm:mb-0 z-10 w-full sm:w-auto text-center sm:text-left">
                            <h3 className="text-2xl font-bold">Bilet Standardowy</h3>
                            <p className="text-gray-400 text-sm mt-1">Gwarantuje wejście oraz wydanie pary słuchawek CICHOSZAU.</p>
                        </div>
                        <div className="flex items-center z-10 gap-6 w-full sm:w-auto justify-between sm:justify-end">
                            <span className="text-3xl font-black">{event.ticket_price_standard || event.ticket_price || 89} zł</span>
                            <button
                                onClick={handleBuyTicket}
                                disabled={!user || purchasing}
                                className="bg-gradient-to-r from-fuchsia-500 to-amber-500 text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shrink-0 whitespace-nowrap min-w-[160px] flex items-center justify-center"
                            >
                                {purchasing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'KUP BILET'}
                            </button>
                        </div>
                    </div>

                    {!user && (
                        <p className="text-red-400 text-sm text-center sm:text-right mt-[-10px] mb-4 font-medium px-4">Zaloguj się powyżej, by kupić bilet.</p>
                    )}

                    {/* Info o kaucji */}
                    <div className="bg-[#2A1A1A] border border-amber-500/20 rounded-xl p-4 flex items-start text-sm text-gray-300">
                        <Info className="w-5 h-5 mr-3 text-amber-500 shrink-0 mt-0.5" />
                        <p>Po zakupie bilet znajdziesz w zakładce <strong className="text-white">PANEL UŻYTKOWNIKA</strong>. Pokaż kod QR na miejscu, by odebrać sprzęt.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
