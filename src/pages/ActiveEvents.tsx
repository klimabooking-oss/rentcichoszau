import { Calendar, Users, Package, Menu, Search, MoreVertical, LayoutDashboard, Radio, Headphones, Terminal, Bell, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface EventStats {
    id: string;
    title: string;
    event_date: string;
    status: string;
    location: string;
    headphone_pool_size: number;
    scanned_tickets: number;
    total_tickets: number;
    active_rentals: number;
    returned_rentals: number;
}

export default function ActiveEvents() {
    const { signOut } = useAuth();
    const [events, setEvents] = useState<EventStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEventsWithStats();
    }, []);

    const fetchEventsWithStats = async () => {
        try {
            setLoading(true);

            // 1. Pobierz same wydarzenia
            const { data: eventsData, error: eventsError } = await supabase
                .from('events')
                .select('*')
                .order('event_date', { ascending: false });

            if (eventsError) throw eventsError;

            // 2. Pobierz zgrupowane statystyki dla każdego wydarzenia (aby było optymalniej, zrobimy to iteracyjnie dla małej liczby)
            const eventsWithStats = await Promise.all((eventsData || []).map(async (ev) => {
                // Bilety
                const { count: totalTickets } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('event_id', ev.id);
                const { count: scannedTickets } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('event_id', ev.id).eq('status', 'used');

                // Wypożyczenia
                const { count: activeRentals } = await supabase.from('rentals').select('*', { count: 'exact', head: true }).eq('event_id', ev.id).eq('status', 'active');
                const { count: returnedRentals } = await supabase.from('rentals').select('*', { count: 'exact', head: true }).eq('event_id', ev.id).in('status', ['returned', 'deposit_captured', 'deposit_released']);

                return {
                    ...ev,
                    total_tickets: totalTickets || 0,
                    scanned_tickets: scannedTickets || 0,
                    active_rentals: activeRentals || 0,
                    returned_rentals: returnedRentals || 0
                } as EventStats;
            }));

            setEvents(eventsWithStats);
        } catch (err) {
            console.error('Błąd pobierania wydarzeń:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex h-screen overflow-hidden bg-[#0F0F11] font-sans text-white">

            {/* Sidebar (Desktop) */}
            <aside className="w-64 bg-[#0F0F11] border-r border-fuchsia-500/20 hidden md:flex flex-col relative">
                <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent pointer-events-none" />

                <div className="h-20 flex items-center px-6 border-b border-white/10 relative z-10">
                    <Link to="/admin" className="text-xl font-bold tracking-tight text-fuchsia-500">CICHOSZAU</Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto relative z-10">
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link to="/admin/events" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl bg-fuchsia-500 text-black shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                        <Radio className="w-5 h-5" />
                        Aktywne Wydarzenia
                    </Link>
                    <Link to="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                        <Calendar className="w-5 h-5" />
                        Wydarzenia
                    </Link>
                    <Link to="/admin/rentals" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                        <Headphones className="w-5 h-5" />
                        Flota Słuchawek
                    </Link>
                    <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                        <Users className="w-5 h-5" />
                        Użytkownicy
                    </Link>
                    <Link to="/admin/packages" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                        <Package className="w-5 h-5" />
                        Paczki Sprzętowe
                    </Link>
                    <Link to="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                        <Terminal className="w-5 h-5" />
                        Logi Systemowe
                    </Link>
                </nav>
                <div className="p-4 border-t border-white/10 relative z-10">
                    <button onClick={() => signOut()} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-bold transition-colors border border-red-500/20">
                        <LogOut className="w-5 h-5" />
                        Wyloguj się
                    </button>
                </div>
            </aside>

            {/* Main Content Pane */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-6 bg-[#0F0F11]/80 backdrop-blur-md border-b border-white/10 z-20 sticky top-0">
                    <div className="flex items-center md:hidden">
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="ml-4 text-xl font-bold text-fuchsia-500">CICHOSZAU</span>
                    </div>
                    <h1 className="text-xl font-bold hidden md:block">Aktywne Wydarzenia</h1>

                    <div className="flex items-center space-x-6">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Szukaj wydarzenia..."
                                className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-fuchsia-500 rounded-full border-2 border-[#0F0F11]"></span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-600 to-amber-500 p-[2px]">
                            <div className="w-full h-full bg-[#0F0F11] rounded-full flex items-center justify-center font-bold text-sm">
                                AD
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">

                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-fuchsia-500">Ładowanie statystyk wydarzeń...</div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {filteredEvents.map(event => (
                                <div key={event.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-fuchsia-500/30 transition-colors relative group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 blur-3xl group-hover:bg-fuchsia-500/10 transition-all" />

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h2 className="text-xl font-bold">{event.title}</h2>
                                                    {event.status === 'active' && <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">TRWA</span>}
                                                    {event.status === 'draft' && <span className="px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-400 text-[10px] font-bold uppercase tracking-wider border border-gray-500/20">SZKIC</span>}
                                                </div>
                                                <p className="text-gray-400 text-sm flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {format(new Date(event.event_date), 'dd MMMM yyyy, HH:mm', { locale: pl })}
                                                </p>
                                            </div>
                                            <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Pula Sprzętu</p>
                                                <p className="text-2xl font-bold text-white">{event.headphone_pool_size}</p>
                                            </div>
                                            <div className="bg-black/30 p-4 rounded-xl border border-fuchsia-500/20 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-fuchsia-500/10 blur-xl" />
                                                <p className="text-xs text-fuchsia-400/80 uppercase font-bold tracking-wider mb-1">Wypożyczone</p>
                                                <p className="text-2xl font-bold text-fuchsia-400">{event.active_rentals}</p>
                                            </div>
                                            <div className="bg-black/30 p-4 rounded-xl border border-emerald-500/20">
                                                <p className="text-xs text-emerald-500/80 uppercase font-bold tracking-wider mb-1">Zwrócone</p>
                                                <p className="text-2xl font-bold text-emerald-500">{event.returned_rentals}</p>
                                            </div>
                                            <div className="bg-black/30 p-4 rounded-xl border border-amber-500/20">
                                                <p className="text-xs text-amber-500/80 uppercase font-bold tracking-wider mb-1">Skanów na Wej.</p>
                                                <p className="text-2xl font-bold text-amber-500">{event.scanned_tickets} <span className="text-sm font-normal text-gray-500">/ {event.total_tickets}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-black/20 px-6 py-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {/* Fake avatars for participants context */}
                                            <div className="w-8 h-8 rounded-full border-2 border-[#161618] bg-gray-700"></div>
                                            <div className="w-8 h-8 rounded-full border-2 border-[#161618] bg-gray-600"></div>
                                            <div className="w-8 h-8 rounded-full border-2 border-[#161618] bg-fuchsia-900 flex items-center justify-center text-[10px] font-bold">+{event.total_tickets}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors border border-white/5">Edytuj Pule</button>
                                            <Link to="/admin/rentals" className="px-4 py-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-black text-sm font-bold rounded-lg transition-colors">Tabela Wynajmu</Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
