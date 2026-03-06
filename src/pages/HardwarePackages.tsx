import { Calendar, Users, Package, Menu, Search, LayoutDashboard, Radio, Headphones, Terminal, Plus, Box, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface EventWithPackages {
    id: string;
    title: string;
    event_date: string;
    headphone_pool_size: number;
    status: string;
}

export default function HardwarePackages() {
    const { signOut } = useAuth();
    const [events, setEvents] = useState<EventWithPackages[]>([]);
    const [totalHardware, setTotalHardware] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPackagesData();
    }, []);

    const fetchPackagesData = async () => {
        try {
            setLoading(true);

            // 1. Wszystkie wydarzenia potrzebujące słuchawek
            const { data: eventsData, error: eventsError } = await supabase
                .from('events')
                .select('*')
                .order('event_date', { ascending: false });

            if (eventsError) throw eventsError;

            // 2. Całkowita ilość zarejestrowanych słuchawek do wypożyczeń w bazie
            const { count: hardwareCount } = await supabase
                .from('headphones')
                .select('*', { count: 'exact', head: true });

            setTotalHardware(hardwareCount || 0);
            setEvents(eventsData || []);
        } catch (err) {
            console.error('Błąd pobierania paczek:', err);
        } finally {
            setLoading(false);
        }
    };

    const countAllocated = events.reduce((acc, ev) => acc + (ev.headphone_pool_size || 0), 0);
    const countAvailable = totalHardware - countAllocated;

    const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex h-screen overflow-hidden bg-[#0F0F11] font-sans text-white">

            {/* Sidebar */}
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
                    <Link to="/admin/events" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
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
                    <Link to="/admin/packages" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl bg-fuchsia-500 text-black shadow-[0_0_15px_rgba(217,70,239,0.3)]">
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
                    <h1 className="text-xl font-bold hidden md:block">Paczkowanie / Wydawanie</h1>

                    <div className="flex items-center space-x-6">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Szukaj paczek..."
                                className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-black text-sm font-bold tracking-wider rounded-xl transition-colors">
                            <Plus className="w-4 h-4" /> Nowa Paczka
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-fuchsia-500">Kalkulowanie sprzętu...</div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Box className="w-16 h-16" />
                                    </div>
                                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Całkowity Magazyn</h3>
                                    <div className="text-4xl font-black text-white">{totalHardware} <span className="text-lg text-gray-500">Szt.</span></div>
                                </div>
                                <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-2xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 blur-3xl rounded-full" />
                                    <h3 className="text-fuchsia-400/80 text-sm font-bold uppercase tracking-wider mb-2">W Paczkach (Alokacja)</h3>
                                    <div className="text-4xl font-black text-fuchsia-400">{countAllocated}</div>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full" />
                                    <h3 className="text-emerald-500/80 text-sm font-bold uppercase tracking-wider mb-2">Wolny Sprzęt</h3>
                                    <div className="text-4xl font-black text-emerald-500">{countAvailable}</div>
                                </div>
                            </div>

                            {/* List of active allocations */}
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-3">
                                <Package className="w-5 h-5 text-fuchsia-500" /> Paczki przypisane do Wydarzeń
                            </h2>

                            <div className="bg-[#161618] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-black/40 text-xs uppercase tracking-wider text-gray-400">
                                            <th className="p-4 font-bold">Wydarzenie</th>
                                            <th className="p-4 font-bold">Data Realizacji</th>
                                            <th className="p-4 font-bold text-center">Ilość Słuchawek w Paczce</th>
                                            <th className="p-4 font-bold">Zapas z Wolnych %</th>
                                            <th className="p-4 font-bold text-right">Opcje</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {filteredEvents.map((ev) => (
                                            <tr key={ev.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4">
                                                    <div className="font-bold text-white text-base">{ev.title}</div>
                                                    <div className="text-xs text-gray-500">ID: {ev.id.substring(0, 8)}...</div>
                                                </td>
                                                <td className="p-4 text-gray-300">
                                                    {format(new Date(ev.event_date), 'dd MMMM yyyy', { locale: pl })}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1 bg-fuchsia-500/20 text-fuchsia-400 rounded-full font-bold border border-fuchsia-500/30">
                                                        {ev.headphone_pool_size || 0}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {/* Prosta predykcja - zapas w stosunku do magazynu - w celach deweloperskich omijaj Zero Division */}
                                                    <div className="w-full bg-black/50 rounded-full h-2 mt-2 overflow-hidden border border-white/5">
                                                        <div
                                                            className="bg-gradient-to-r from-fuchsia-600 to-amber-500 h-2 rounded-full"
                                                            style={{ width: `${totalHardware > 0 ? ((ev.headphone_pool_size || 0) / totalHardware) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded text-xs font-medium transition-colors border border-white/10">Edytuj Paczkę</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredEvents.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                                    Brak wydarzeń i przypisanych paczek sprzętowych.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
