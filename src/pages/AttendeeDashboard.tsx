import { LayoutDashboard, Ticket, Wallet, History, LogOut, Search, Bell, Settings, MapPin, QrCode, Headphones, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AttendeeDashboard() {
    const { user, signOut } = useAuth();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        async function fetchTickets() {
            try {
                const { data, error } = await supabase
                    .from('tickets')
                    .select('*, events(*)')
                    .eq('user_id', user!.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setTickets(data || []);
            } catch (err) {
                console.error("Błąd ładowania biletów:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTickets();
    }, [user]);

    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-[#0F0F11] text-white font-sans">

            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 flex flex-col justify-between p-6 bg-[#161618]">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-fuchsia-500 rounded flex items-center justify-center text-black">
                            <Headphones className="w-5 h-5 font-bold" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Cichoszau</h2>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-fuchsia-500/10 text-fuchsia-500">
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="text-sm font-semibold">Dashboard</span>
                        </Link>
                        <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-gray-400">
                            <Ticket className="w-5 h-5" />
                            <span className="text-sm font-medium">Moje Bilety</span>
                        </Link>
                        <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-gray-400">
                            <Wallet className="w-5 h-5" />
                            <span className="text-sm font-medium">Kaucje (Rozliczenia)</span>
                        </Link>
                        <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-gray-400">
                            <History className="w-5 h-5" />
                            <span className="text-sm font-medium">Historia</span>
                        </Link>
                    </nav>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <div className="w-10 h-10 rounded-full bg-fuchsia-900 border border-fuchsia-500 flex items-center justify-center font-bold">
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold truncate">{user?.email?.split('@')[0] || 'Użytkownik'}</span>
                            <span className="text-xs text-gray-400 truncate">Konto Zweryfikowane</span>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-gray-500 hover:text-fuchsia-500 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Wyloguj się
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto">

                {/* Header */}
                <header className="flex items-center justify-between px-8 py-6 sticky top-0 bg-[#0F0F11]/80 backdrop-blur-md z-10 border-b border-white/5">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 text-sm transition-all"
                            placeholder="Szukaj wydarzeń..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 text-gray-300 relative hover:bg-white/10 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse"></span>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <div className="px-8 pb-12 pt-6 flex flex-col gap-10">

                    {/* Welcome */}
                    <section>
                        <h1 className="text-4xl font-black tracking-tight mb-2">Cześć, {user?.email?.split('@')[0] || 'Użytkownik'}</h1>
                        <p className="text-gray-400">Masz {tickets.length} nadchodzące wydarzenia{/* future logic: i x aktywnych wypozyczen */}</p>
                    </section>

                    {/* Active Deposits */}
                    <section>
                        <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-emerald-500" /> Moje Wypożyczenia i Kaucje
                        </h2>
                        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                            {/* Background glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

                            <div className="flex items-center gap-6 flex-1 z-10">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                    <Headphones className="w-8 h-8 text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-1">Słuchawki: Zestaw #8821</h4>
                                    <p className="text-gray-400 text-sm">Wydane na: Silent Disco Festival Wrocław</p>
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                        <span className="text-emerald-500 text-xs font-black uppercase tracking-widest">Wypożyczone - Kaucja Zablokowana</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:block w-px h-16 bg-white/10 z-10"></div>

                            <div className="flex flex-col items-center md:items-end min-w-40 z-10">
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Zabezpieczenie na karcie</span>
                                <span className="text-3xl font-black text-white">200 PLN</span>
                                <span className="text-gray-500 text-[10px] mt-1 italic flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Stripe Pre-Auth
                                </span>
                            </div>

                            <Link to="/ticket/1" className="w-full md:w-auto px-6 py-3 bg-white/10 text-white border border-white/20 font-bold rounded-lg hover:bg-white/20 transition-all text-center z-10">
                                Pokaż QR Biletu
                            </Link>
                        </div>
                        <p className="text-sm text-gray-500 mt-4 ml-2">Kaucja zostanie zwolniona natychmiast po zeskanowaniu tych słuchawek przy wyjściu.</p>
                    </section>

                    {/* Horizontal Tickets Carousel */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold tracking-tight">Nadchodzące Wydarzenia</h2>
                        </div>

                        {loading ? (
                            <p className="text-gray-400">Pobieranie biletów...</p>
                        ) : tickets.length === 0 ? (
                            <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-8 text-center">
                                <p className="text-gray-400 mb-4">Nie masz jeszcze żadnych biletów.</p>
                                <Link to="/event/1" className="inline-flex bg-white/10 hover:bg-white/20 transition-colors px-6 py-2 rounded-full text-sm font-bold text-white">Znajdź Wydarzenie</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {tickets.map((ticket) => (
                                    <Link key={ticket.id} to={`/ticket/${ticket.id}`} className="bg-[#1C1C1E] border border-white/10 rounded-2xl overflow-hidden hover:border-fuchsia-500/50 transition-all group flex flex-col">
                                        <div className="h-40 relative overflow-hidden">
                                            <img
                                                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop"
                                                alt={ticket.events?.title || 'Wydarzenie'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 right-4 bg-fuchsia-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                                                Kupiony
                                            </div>
                                        </div>
                                        <div className="p-6 flex justify-between items-start flex-1">
                                            <div>
                                                <h3 className="text-lg font-bold mb-1 group-hover:text-fuchsia-400 transition-colors">{ticket.events?.title}</h3>
                                                <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
                                                    <MapPin className="w-4 h-4" />
                                                    {ticket.events?.location}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                                                    {ticket.events?.date && (
                                                        <>
                                                            <span>{new Date(ticket.events.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}</span>
                                                            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                                            <span>{new Date(ticket.events.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-fuchsia-500/20 group-hover:text-fuchsia-500 transition-colors">
                                                <QrCode className="w-6 h-6 pattern-current" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                </div>
            </main>
        </div>
    );
}
