import { Calendar, Users, Package, Menu, Search, Download, LayoutDashboard, Radio, Headphones, Terminal, Mail, Phone, LogOut, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    created_at: string;
}

export default function AdminUsers() {
    const { signOut } = useAuth();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Stany dla modalu generowania biletów
    const [events, setEvents] = useState<{ id: string, title: string }[]>([]);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [generatingTicket, setGeneratingTicket] = useState(false);
    const [ticketSuccess, setTicketSuccess] = useState('');

    useEffect(() => {
        fetchProfiles();
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const { data } = await supabase.from('events').select('id, title').eq('status', 'active');
        if (data) setEvents(data);
    };

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (err) {
            console.error('Błąd pobierania profili:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateTicket = async () => {
        if (!selectedUser || !selectedEventId) return;
        setGeneratingTicket(true);
        setTicketSuccess('');

        try {
            const qrCodePlain = `EV${selectedEventId}U${selectedUser.id.substring(0, 4).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            const { error } = await supabase.from('tickets').insert({
                event_id: selectedEventId,
                user_id: selectedUser.id,
                ticket_type: 'manual_admin',
                qr_code: qrCodePlain,
                status: 'valid'
            });

            if (error) throw error;
            setTicketSuccess('Bilet został wygenerowany pomyślnie!');
            setTimeout(() => {
                setIsTicketModalOpen(false);
                setTicketSuccess('');
                setSelectedEventId('');
            }, 2000);
        } catch (err) {
            console.error('Błąd generowania biletu:', err);
            alert('Wystąpił błąd podczas generowania biletu.');
        } finally {
            setGeneratingTicket(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ['ID', 'Imię i Nazwisko', 'Email', 'Telefon', 'Rola', 'Data Rejestracji'];
        const csvContent = [
            headers.join(','),
            ...profiles.map(p => [
                p.id,
                `"${p.full_name || ''}"`,
                `"${p.email || ''}"`,
                `"${p.phone || ''}"`,
                p.role,
                new Date(p.created_at).toISOString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `uzytkownicy_cichoszau_${format(new Date(), 'yyyyMMdd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredProfiles = profiles.filter(p =>
        (p.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.phone?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                    <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl bg-fuchsia-500 text-black shadow-[0_0_15px_rgba(217,70,239,0.3)]">
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
                    <h1 className="text-xl font-bold hidden md:block">Baza Użytkowników CRM</h1>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleExportCSV}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold tracking-wider uppercase rounded-xl border border-white/10 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Eksportuj CSV
                        </button>
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Szukaj użytkownika..."
                                className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-fuchsia-500">Ładowanie profilów...</div>
                    ) : (
                        <div className="bg-[#161618] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-black/40 text-xs uppercase tracking-wider text-gray-400">
                                            <th className="p-4 font-bold">Użytkownik</th>
                                            <th className="p-4 font-bold">Role</th>
                                            <th className="p-4 font-bold">Kontakt</th>
                                            <th className="p-4 font-bold text-right">Data Dołączenia</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {filteredProfiles.map((profile) => (
                                            <tr key={profile.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-600/20 to-amber-500/20 border border-fuchsia-500/30 flex items-center justify-center font-bold text-fuchsia-400">
                                                            {(profile.full_name || '?')[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white">{profile.full_name || 'Brak danych'}</div>
                                                            <div className="text-xs text-gray-500">{profile.id.substring(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {profile.role === 'admin' && <span className="px-2 py-1 rounded bg-fuchsia-500/10 text-fuchsia-400 text-xs font-bold uppercase border border-fuchsia-500/20">Admin</span>}
                                                    {profile.role === 'staff' && <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-bold uppercase border border-amber-500/20">Pracownik</span>}
                                                    {profile.role === 'user' && <span className="px-2 py-1 rounded bg-white/5 text-gray-400 text-xs font-bold uppercase border border-white/10">Uczestnik</span>}
                                                </td>
                                                <td className="p-4 space-y-1">
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <Mail className="w-4 h-4 text-gray-500" />
                                                        {profile.email || 'Brak'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <Phone className="w-4 h-4 text-gray-500" />
                                                        {profile.phone || 'Brak telefonu'}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right text-gray-400 whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-4">
                                                        <span>{format(new Date(profile.created_at), 'dd MMM yyyy', { locale: pl })}</span>
                                                        <button
                                                            onClick={() => { setSelectedUser(profile); setIsTicketModalOpen(true); }}
                                                            className="p-2 bg-white/5 hover:bg-fuchsia-500 hover:text-black text-gray-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Wystaw awaryjny bilet"
                                                        >
                                                            <Ticket className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredProfiles.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                                    Brak użytkowników pasujących do kryteriów.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            {/* Ticket Generation Modal */}
            {isTicketModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#161618] border border-fuchsia-500/20 rounded-2xl w-full max-w-md p-6 relative shadow-[0_0_50px_rgba(217,70,239,0.1)]">
                        <button
                            onClick={() => { setIsTicketModalOpen(false); setTicketSuccess(''); setSelectedEventId(''); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            Zamknij
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-2">Awaryjny Bilet</h2>
                        <p className="text-gray-400 text-sm mb-6">Wystawiasz manualny bilet dla użytkownika <strong>{selectedUser.full_name || selectedUser.email}</strong>. Zapisze się on w bazie Supabase do natychmiastowego użytku przy skanowaniu.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Wybierz wydarzenie:</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500 transition-colors"
                                    value={selectedEventId}
                                    onChange={(e) => setSelectedEventId(e.target.value)}
                                >
                                    <option value="">-- Wybierz wydarzenie --</option>
                                    {events.map(ev => (
                                        <option key={ev.id} value={ev.id}>{ev.title}</option>
                                    ))}
                                </select>
                            </div>

                            {ticketSuccess ? (
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-center font-bold">
                                    {ticketSuccess}
                                </div>
                            ) : (
                                <button
                                    onClick={handleGenerateTicket}
                                    disabled={generatingTicket || !selectedEventId}
                                    className="w-full py-4 bg-fuchsia-500 hover:bg-fuchsia-600 text-black font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Ticket className="w-5 h-5" />
                                    {generatingTicket ? 'Generowanie...' : 'Wygeneruj i Zapisz Bilet'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
