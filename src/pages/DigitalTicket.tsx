import { Headphones, ArrowLeft, Download, Share2, MapPin, CreditCard, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import StripeCheckout from '../components/StripeCheckout';

export default function DigitalTicket() {
    const { id } = useParams();
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutOpen, setCheckoutOpen] = useState(false);

    useEffect(() => {
        const fetchTicket = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('tickets')
                    .select('*, events(*)')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setTicket(data);
            } catch (err) {
                console.error("Błąd pobierania biletu:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-fuchsia-500" />
                    <p className="font-medium text-gray-400">Ładowanie biletu...</p>
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <p className="font-bold text-xl text-red-500">Nie znaleziono biletu.</p>
                    <Link to="/dashboard" className="text-fuchsia-400 hover:text-fuchsia-300">Wróć do Panelu</Link>
                </div>
            </div>
        );
    }

    // Default dates if event is not fully mapped
    const eventDate = ticket.events?.start_date ? new Date(ticket.events.start_date) : new Date();

    return (
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#0F0F11] font-sans text-white">
            <div className="flex h-full grow flex-col">

                {/* Top Navigation Bar */}
                <header className="flex items-center justify-between border-b border-fuchsia-500/20 px-6 py-4 md:px-20 lg:px-40 bg-[#0F0F11]/80 backdrop-blur-md sticky top-0 z-50">
                    <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-semibold hidden sm:inline">Powrót do Panelu</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="bg-fuchsia-500 p-1.5 rounded-lg flex items-center justify-center">
                            <Headphones className="text-black w-6 h-6 font-bold" />
                        </div>
                        <h2 className="text-white text-xl font-bold leading-tight tracking-tight hidden sm:block">Cichoszau</h2>
                    </div>
                    <div className="w-8"></div> {/* Spacer for perfect center */}
                </header>

                <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-10">
                    <div className="max-w-[480px] w-full space-y-6">

                        {/* Header Content */}
                        <div className="flex flex-col gap-2 text-center md:text-left">
                            <h1 className="text-white text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">Twój E-Bilet</h1>
                            <p className="text-fuchsia-500 font-medium text-sm md:text-base tracking-widest uppercase">ID: {ticket.id.split('-')[0].toUpperCase()}</p>
                        </div>

                        {/* Ticket Card (Wallet Style) */}
                        <div className="bg-[#161618] rounded-2xl overflow-hidden shadow-2xl border border-fuchsia-500/20">

                            {/* Top Hero Image */}
                            <div className="relative h-48 w-full">
                                <img
                                    src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop"
                                    alt="Event"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#161618] to-transparent"></div>
                                <div className="absolute bottom-4 left-6">
                                    {ticket.status === 'valid' && (
                                        <span className="bg-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full text-black mb-2 inline-block uppercase tracking-wider">Potwierdzony</span>
                                    )}
                                    {ticket.status === 'returned' && (
                                        <span className="bg-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full text-white mb-2 inline-block uppercase tracking-wider">Wykorzystany</span>
                                    )}
                                    <h3 className="text-white text-2xl font-black italic">{ticket.events?.title || "Wydarzenie Cichoszau"}</h3>
                                </div>
                            </div>

                            {/* Ticket Details */}
                            <div className="p-6 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Data i Czas</p>
                                        <p className="text-white font-medium capitalize">{format(eventDate, 'EEEE, d MMMM', { locale: pl })}</p>
                                        <p className="text-gray-300 text-sm">{format(eventDate, 'HH:mm')} - Zakończenie</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Lokalizacja</p>
                                        <p className="text-white font-medium">{ticket.events?.location || "TBA"}</p>
                                        <p className="text-gray-300 text-sm">Polska</p>
                                    </div>
                                </div>

                                {/* QR Code Section */}
                                <div className="flex flex-col items-center justify-center gap-6 py-4">
                                    <div className="relative">
                                        {/* Neon Glow Effect */}
                                        <div className="absolute -inset-4 bg-fuchsia-500/30 blur-2xl rounded-full"></div>
                                        <div className="relative bg-white p-4 rounded-xl shadow-[0_0_30px_rgba(217,70,239,0.3)] transition-transform hover:scale-105">
                                            <QRCodeSVG
                                                value={ticket.qr_code}
                                                size={192}
                                                bgColor="#ffffff"
                                                fgColor="#000000"
                                                level="H"
                                                includeMargin={false}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-400 text-xs uppercase tracking-[0.2em]">Kod Weryfikacyjny</p>
                                        <p className="text-fuchsia-400 text-xl font-mono font-bold mt-1 tracking-widest">{ticket.qr_code}</p>
                                    </div>
                                </div>

                                {/* Dashed Divider */}
                                <div className="border-t-2 border-dashed border-white/10 -mx-6 relative">
                                    <div className="absolute -left-3 -top-3 w-6 h-6 bg-[#0F0F11] rounded-full"></div>
                                    <div className="absolute -right-3 -top-3 w-6 h-6 bg-[#0F0F11] rounded-full"></div>
                                </div>

                                {/* Rental Status Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-white text-lg font-bold tracking-tight">Kaucja za Słuchawki</h4>
                                        <span className="bg-amber-500/20 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Oczekująca</span>
                                    </div>

                                    <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-fuchsia-500/20 p-2 rounded-lg">
                                                <Headphones className="w-6 h-6 text-fuchsia-500" />
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold flex items-center gap-2">
                                                    Gotowość do wynajmu
                                                </p>
                                                <p className="text-gray-400 text-xs mt-0.5">Pokaż ten kod QR obsłudze przy wejściu.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {ticket.status === 'valid' && (
                                        <button
                                            onClick={() => setCheckoutOpen(true)}
                                            className="w-full bg-gradient-to-r from-fuchsia-500 to-amber-500 hover:scale-[1.02] text-black font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.3)]">
                                            <CreditCard className="w-5 h-5" />
                                            Kaucja (Stripe Checkout)
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className="bg-[#1C1C1E] p-4 flex justify-center gap-6 border-t border-white/5">
                                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold">
                                    <Download className="w-4 h-4" />
                                    Zapisz PDF
                                </button>
                                <div className="w-px h-5 bg-white/10"></div>
                                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold">
                                    <Share2 className="w-4 h-4" />
                                    Udostępnij
                                </button>
                            </div>
                        </div>

                        {/* Venue Map Teaser */}
                        <div className="bg-[#161618] rounded-xl p-4 border border-white/5 flex items-center gap-4 hover:border-fuchsia-500/30 transition-colors cursor-pointer group">
                            <div className="w-16 h-16 rounded-lg bg-[#2A2A2E] flex items-center justify-center shrink-0 group-hover:bg-fuchsia-500/20 transition-colors">
                                <MapPin className="w-6 h-6 text-gray-400 group-hover:text-fuchsia-500 transition-colors" />
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-bold text-sm">Mapa Terenu Wydarzenia</p>
                                <p className="text-gray-400 text-xs mt-0.5">Znajdź punkt wydawki słuchawek i wejście.</p>
                            </div>
                        </div>

                    </div>
                </main>

                <footer className="py-8 text-center">
                    <p className="text-gray-600 text-[10px] uppercase tracking-widest font-medium">
                        System Zabezpieczeń Cichoszau QR
                    </p>
                </footer>
            </div>

            <StripeCheckout
                amount={250}
                ticketId={ticket.id}
                open={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                onSuccess={() => {
                    setCheckoutOpen(false);
                    alert("Sukces! Kaucja autoryzowana. Możesz podejść po słuchawki bez kolejki.");
                }}
            />
        </div>
    );
}
