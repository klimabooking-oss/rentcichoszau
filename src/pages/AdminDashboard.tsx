import { Settings2, LayoutDashboard, Radio, Headphones, Users, Terminal, Search, Bell, LogOut, Ticket, RefreshCw, AlertTriangle, Download, Plus, MoreVertical, TrendingUp, TrendingDown, CheckCircle, Loader2, Calendar, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function AdminDashboard() {
    const { signOut } = useAuth();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const { data, error } = await supabase
                    .from('tickets')
                    .select('*, events(*)')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setTickets(data || []);
            } catch (err) {
                console.error('Błąd pobierania biletów:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    const totalTickets = tickets.length;
    const activeRentals = tickets.filter(t => t.status === 'valid').length;
    const lostRentals = tickets.filter(t => t.status === 'cancelled').length;
    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-[#0F0F11] font-sans text-white">

            {/* Sidebar */}
            <aside className="hidden lg:flex w-64 border-r border-fuchsia-500/20 bg-[#0F0F11] flex-col relative">
                <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent pointer-events-none" />

                <div className="p-6 flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 bg-fuchsia-500/20 rounded-lg flex items-center justify-center border border-fuchsia-500/40">
                        <Settings2 className="w-6 h-6 text-fuchsia-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold leading-tight tracking-tight">DISCO COMMAND</h2>
                        <p className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-widest mt-0.5">v2.0 Restored</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 mt-4 space-y-2 relative z-10">
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-fuchsia-500 text-black shadow-[0_0_15px_rgba(217,70,239,0.3)] font-bold">
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link to="/admin/events" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <Radio className="w-5 h-5" />
                        <span className="text-sm font-medium">Aktywne Wydarzenia</span>
                    </Link>
                    <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <Calendar className="w-5 h-5" />
                        <span className="text-sm font-medium">Wydarzenia</span>
                    </Link>
                    <Link to="/admin/rentals" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <Headphones className="w-5 h-5" />
                        <span className="text-sm font-medium">Flota Słuchawek</span>
                    </Link>
                    <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <Users className="w-5 h-5" />
                        <span className="text-sm font-medium">Użytkownicy</span>
                    </Link>
                    <Link to="/admin/packages" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <Package className="w-5 h-5" />
                        <span className="text-sm font-medium">Paczki Sprzętowe</span>
                    </Link>
                    <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <Terminal className="w-5 h-5" />
                        <span className="text-sm font-medium">Logi Systemowe</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/10 relative z-10">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-fuchsia-900 border border-fuchsia-500 flex items-center justify-center font-bold shrink-0">
                            AD
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">Admin Operator</p>
                            <p className="text-xs text-fuchsia-400">Master Level</p>
                        </div>
                    </div>
                    <button onClick={() => signOut()} className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-bold transition-colors border border-red-500/20">
                        <LogOut className="w-4 h-4" />
                        Wyloguj
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto relative">

                {/* Header */}
                <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between sticky top-0 bg-[#0F0F11]/80 backdrop-blur-md z-30">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all text-sm"
                                placeholder="Szukaj w systemie..."
                                type="text"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]"></div>
                            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider hidden sm:inline">System Live</span>
                        </div>

                        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <Bell className="w-5 h-5 text-gray-300" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full"></span>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <LogOut className="w-5 h-5 text-gray-300" />
                        </button>
                    </div>
                </header>

                <div className="p-4 sm:p-8 space-y-8">

                    {/* Stats Grid */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-fuchsia-500/50 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity text-fuchsia-500">
                                <Ticket className="w-10 h-10" />
                            </div>
                            <p className="text-sm font-medium text-gray-400 mb-1">Sprzedane Bilety</p>
                            <h3 className="text-3xl font-bold">{loading ? <Loader2 className="w-6 h-6 animate-spin text-fuchsia-500" /> : totalTickets}</h3>
                            <div className="mt-4 flex items-center gap-1 text-emerald-500 text-sm font-bold">
                                <TrendingUp className="w-4 h-4" />
                                <span>+12.5%</span>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-fuchsia-500/50 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity text-fuchsia-500">
                                <Headphones className="w-10 h-10" />
                            </div>
                            <p className="text-sm font-medium text-gray-400 mb-1">Dostępne Słuchawki</p>
                            <h3 className="text-3xl font-bold">{loading ? <Loader2 className="w-6 h-6 animate-spin text-fuchsia-500" /> : Math.max(0, 1000 - activeRentals)}</h3>
                            <div className="mt-4 flex items-center gap-1 text-amber-500 text-sm font-bold">
                                <TrendingDown className="w-4 h-4" />
                                <span>-5.2%</span>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-fuchsia-500/50 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity text-fuchsia-500">
                                <RefreshCw className="w-10 h-10" />
                            </div>
                            <p className="text-sm font-medium text-gray-400 mb-1">Wypożyczone i Aktywne</p>
                            <h3 className="text-3xl font-bold">{loading ? <Loader2 className="w-6 h-6 animate-spin text-fuchsia-500" /> : activeRentals}</h3>
                            <div className="mt-4 flex items-center gap-1 text-emerald-500 text-sm font-bold">
                                <TrendingUp className="w-4 h-4" />
                                <span>+2.1%</span>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-fuchsia-500/50 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity text-fuchsia-500">
                                <AlertTriangle className="w-10 h-10" />
                            </div>
                            <p className="text-sm font-medium text-gray-400 mb-1">Braki (Zagubione/Awaria)</p>
                            <h3 className="text-3xl font-bold">{loading ? <Loader2 className="w-6 h-6 animate-spin text-fuchsia-500" /> : lostRentals}</h3>
                            <div className="mt-4 flex items-center gap-1 text-emerald-500 text-sm font-bold">
                                <CheckCircle className="w-4 h-4" />
                                <span>Poniżej normy</span>
                            </div>
                        </div>
                    </section>

                    {/* Active Event Table Component */}
                    <section className="bg-[#1C1C1E] border border-fuchsia-500/20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(217,70,239,0.05)]">
                        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10B981]"></div>
                                <h2 className="text-xl font-bold">Aktywne Wydarzenie: Ostatnie Wypożyczenia</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-300 font-bold text-sm border border-white/10 hover:bg-white/10 transition-all">
                                    <Download className="w-4 h-4" />
                                    Eksportuj Raport
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fuchsia-500 text-black font-bold text-sm hover:bg-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all">
                                    <Plus className="w-4 h-4" />
                                    Check-in Ręczny
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Użytkownik (ID)</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ID Biletu</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Słuchawki</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Wystawiono</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Akcja</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                                Ładowanie z bazy danych...
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto mt-2 text-fuchsia-500" />
                                            </td>
                                        </tr>
                                    ) : tickets.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Brak otwartych biletów lub historii transakcji w systemie.</td>
                                        </tr>
                                    ) : tickets.slice(0, 5).map(ticket => (
                                        <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-fuchsia-900 border border-fuchsia-500 flex items-center justify-center font-bold text-xs">{ticket.user_id ? ticket.user_id.substring(0, 2).toUpperCase() : 'U'}</div>
                                                    <span className="font-medium">{ticket.user_id ? `UserID ${ticket.user_id.substring(0, 5)}` : 'Nieznany'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 font-mono text-sm">{ticket.qr_code}</td>
                                            <td className="px-6 py-4 text-gray-400 font-mono text-sm">N/D</td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">{format(new Date(ticket.created_at), "HH:mm", { locale: pl })}</td>
                                            <td className="px-6 py-4">
                                                {ticket.status === 'valid' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span>Oczekujące
                                                    </span>
                                                )}
                                                {ticket.status === 'returned' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Zwrócone
                                                    </span>
                                                )}
                                                {ticket.status === 'cancelled' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Zgubione
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link to="/admin/rentals" className="text-gray-500 hover:text-white transition-colors">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination / Footer */}
                        <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-500">Pokazuje od {Math.min(tickets.length, 1)} do {Math.min(tickets.length, 5)} z {tickets.length} wypożyczeń w systemie</p>
                            <div className="flex gap-2">
                                <Link to="/admin/rentals" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fuchsia-500 text-black font-bold text-sm hover:bg-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all">
                                    Wyświetl pełną listę
                                </Link>
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
