import { Calendar, Users, Package, Menu, Bell, Search, Filter, CheckCircle2, Trash2, MoreVertical, ChevronLeft, ChevronRight, Loader2, LayoutDashboard, Radio, Headphones, Terminal, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function RentalsTable() {
    const { signOut } = useAuth();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTickets = async () => {
        try {
            setLoading(true);
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

    useEffect(() => {
        fetchTickets();
    }, []);

    const toggleTicketSelection = (id: string) => {
        if (selectedTickets.includes(id)) {
            setSelectedTickets(selectedTickets.filter(t => t !== id));
        } else {
            setSelectedTickets([...selectedTickets, id]);
        }
    };

    const handleUpdateStatus = async (status: string) => {
        if (selectedTickets.length === 0) return;
        try {
            const { error } = await supabase
                .from('tickets')
                .update({ status })
                .in('id', selectedTickets);

            if (error) throw error;

            setSelectedTickets([]);
            fetchTickets(); // Refresh
        } catch (err) {
            console.error('Błąd podczas aktualizacji statusu:', err);
            alert('Nie udało się zaktualizować statusu biletów.');
        }
    };

    const filteredTickets = tickets.filter(t =>
        (t.user_id && t.user_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.qr_code && t.qr_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                    <Link to="/admin/events" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                        <Radio className="w-5 h-5" />
                        Aktywne Wydarzenia
                    </Link>
                    <Link to="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                        <Calendar className="w-5 h-5" />
                        Wydarzenia
                    </Link>
                    <Link to="/admin/rentals" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl bg-fuchsia-500 text-black shadow-[0_0_15px_rgba(217,70,239,0.3)]">
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
                    <h1 className="text-xl font-bold hidden md:block">Słuchawki w użyciu - Baza biletów</h1>

                    <div className="flex items-center space-x-6">
                        <button className="relative text-gray-400 hover:text-white transition-colors">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full"></span>
                        </button>
                        <div className="h-10 w-10 rounded-full bg-fuchsia-900 border border-fuchsia-500 flex items-center justify-center text-white font-bold">
                            AD
                        </div>
                    </div>
                </header>

                {/* Main Workspace */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 relative">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Filter Bar */}
                        <div className="bg-[#1C1C1E] p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 shadow-[0_0_20px_rgba(217,70,239,0.02)]">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all placeholder-gray-500 text-white"
                                    placeholder="Szukaj ID Słuchawek, Użytkownika lub Statusu..."
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <select className="bg-white/5 border border-white/10 rounded-lg text-sm px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 text-gray-300 w-full sm:w-48 appearance-none">
                                    <option value="" className="bg-[#1C1C1E]">Wszystkie Wydarzenia</option>
                                    <option value="1" className="bg-[#1C1C1E]">Silent Disco Wrocław</option>
                                    <option value="2" className="bg-[#1C1C1E]">Energetic Night</option>
                                </select>
                                <button onClick={() => fetchTickets()} className="bg-fuchsia-500 hover:bg-fuchsia-400 text-black px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center whitespace-nowrap shadow-[0_0_15px_rgba(217,70,239,0.2)]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Odśwież
                                </button>
                            </div>
                        </div>

                        {/* Mass Action Floating Bar */}
                        {selectedTickets.length > 0 && (
                            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#2A2A2E] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-full px-6 py-3 flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-300">
                                <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-fuchsia-500 text-black text-xs font-bold">{selectedTickets.length}</span>
                                    <span className="text-sm font-medium text-white hidden sm:inline">Wybrane rekordy</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <button
                                        onClick={() => handleUpdateStatus('returned')}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                    >
                                        <CheckCircle2 className="w-5 h-5 mr-1.5 sm:mr-2" />
                                        <span className="hidden sm:inline">Oznacz jako </span>Zwrócone
                                    </button>
                                    <button
                                        onClick={() => setSelectedTickets([])}
                                        className="text-gray-400 hover:text-white px-3 py-2 rounded-full text-sm font-medium transition-colors hidden sm:block"
                                    >
                                        Odznacz
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus('cancelled')}
                                        className="text-red-400 hover:text-red-300 p-2 transition-colors"
                                        title="Usuń / Oznacz jako Zgubione"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Table Area */}
                        <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto min-h-[400px]">
                                <table className="w-full text-left border-collapse whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-widest text-gray-500">
                                            <th className="p-4 w-12 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedTickets(filteredTickets.map(t => t.id));
                                                        else setSelectedTickets([]);
                                                    }}
                                                    className="w-4 h-4 rounded border-gray-600 bg-transparent text-fuchsia-500 focus:ring-fuchsia-500 accent-fuchsia-500"
                                                />
                                            </th>
                                            <th className="p-4 font-bold">Użytkownik (ID)</th>
                                            <th className="p-4 font-bold">QR Kod</th>
                                            <th className="p-4 font-bold">Wydarzenie</th>
                                            <th className="p-4 font-bold">Wypożyczono</th>
                                            <th className="p-4 font-bold">Status</th>
                                            <th className="p-4 font-bold text-right">Akcje</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-gray-400">
                                                    Wczytywanie biletów z bazy danych...
                                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mt-4 text-fuchsia-500" />
                                                </td>
                                            </tr>
                                        ) : filteredTickets.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-gray-400">Brak pasujących biletów lub wypożyczeń.</td>
                                            </tr>
                                        ) : (
                                            filteredTickets.map((ticket) => (
                                                <tr key={ticket.id} className={`${selectedTickets.includes(ticket.id) ? 'bg-fuchsia-500/10' : 'hover:bg-white/5'} transition-colors group`}>
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTickets.includes(ticket.id)}
                                                            onChange={() => toggleTicketSelection(ticket.id)}
                                                            className="w-4 h-4 rounded border-gray-600 bg-transparent text-fuchsia-500 focus:ring-fuchsia-500 accent-fuchsia-500"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-xs font-bold text-gray-300">
                                                                {ticket.user_id ? ticket.user_id.substring(0, 2).toUpperCase() : 'U'}
                                                            </div>
                                                            <span className="font-medium text-white">{ticket.user_id ? `UserID ${ticket.user_id.substring(0, 5)}` : 'Nieznany'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-mono text-gray-300">{ticket.qr_code}</td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${ticket.events?.title?.includes('Festiwal') ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                                            {ticket.events?.title || 'Wydarzenie usunięte'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-gray-400">{format(new Date(ticket.created_at), "d MMM, HH:mm", { locale: pl })}</td>
                                                    <td className="p-4">
                                                        {ticket.status === 'valid' && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span>Zakupiony / Aktywny
                                                            </span>
                                                        )}
                                                        {ticket.status === 'returned' && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Zwrócone Słuchawki
                                                            </span>
                                                        )}
                                                        {ticket.status === 'cancelled' && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Zgubione / Anulowane
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button className="text-gray-500 hover:text-white transition-colors">
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-gray-500">
                                    Pokazuję <span className="font-bold text-white">{filteredTickets.length > 0 ? '1' : '0'}</span> do <span className="font-bold text-white">{filteredTickets.length}</span> z <span className="font-bold text-white">{tickets.length}</span> wyników
                                </p>
                                <div className="flex gap-2">
                                    <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-fuchsia-500/20 border border-fuchsia-500 text-fuchsia-500 font-bold transition-all">
                                        1
                                    </button>
                                    <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Empty Space at the bottom for floating bar clearance */}
                        <div className="h-24"></div>

                    </div>
                </main>

            </div>
        </div>
    );
}
