import { QrCode, Flashlight, Settings, Check, Headset, ScanLine, Users, Package, BarChart3, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function ScannerSystem() {
    const [scanMode, setScanMode] = useState<'ticket' | 'headphones'>('ticket');
    const [scannedTicket, setScannedTicket] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [scannerActive, setScannerActive] = useState(true);

    useEffect(() => {
        if (!scannerActive) return;

        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
            false
        );

        const onScanSuccess = async (decodedText: string) => {
            if (processing) return;
            setProcessing(true);
            setErrorMsg(null);

            try {
                // Pause scanner while processing
                scanner.pause(true);

                const { data, error } = await supabase
                    .from('tickets')
                    .select('*, events(*)')
                    .eq('qr_code', decodedText)
                    .single();

                if (error || !data) {
                    setErrorMsg("Bilet nie znaleziony w systemie.");
                    setTimeout(() => {
                        setErrorMsg(null);
                        scanner.resume();
                        setProcessing(false);
                    }, 3000);
                    return;
                }

                setScannedTicket(data);
                setScannerActive(false);
                scanner.clear();
            } catch (err) {
                console.error("Scanning error:", err);
                setErrorMsg("Błąd połączenia z bazą.");
                setTimeout(() => {
                    setErrorMsg(null);
                    scanner.resume();
                    setProcessing(false);
                }, 3000);
            }
        };

        const onScanFailure = (/* error: any */) => {
            // ignore scan failures as they happen continuously
        };

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            scanner.clear().catch(console.error);
        };
    }, [scannerActive, processing]);

    const handleAction = async (newStatus: string) => {
        if (!scannedTicket) return;
        setProcessing(true);
        try {
            const { error } = await supabase
                .from('tickets')
                .update({ status: newStatus })
                .eq('id', scannedTicket.id);

            if (error) throw error;

            setScannedTicket(null);
            setScannerActive(true);
            setProcessing(false);
        } catch (err) {
            console.error("Error updating ticket status:", err);
            alert("Błąd aktualizacji statusu");
            setProcessing(false);
        }
    };

    const resetScanner = () => {
        setScannedTicket(null);
        setScannerActive(true);
        setProcessing(false);
    };

    return (
        <div className="flex min-h-screen w-full flex-col max-w-md mx-auto bg-[#0F0F11] font-sans text-white relative overflow-hidden shadow-2xl border-x border-white/5">

            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-[#0F0F11]/80 backdrop-blur-md z-20 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="text-fuchsia-500">
                        <QrCode className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">Sztab Cichoszau</h1>
                        <p className="text-emerald-500 text-[10px] uppercase tracking-widest font-bold">Nocna Zmiana Aktywna</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300">
                        <Flashlight className="w-5 h-5" />
                    </button>
                    <Link to="/admin" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300">
                        <Settings className="w-5 h-5" />
                    </Link>
                </div>
            </header>

            {/* Main Viewport / Scanner */}
            <main className="relative flex-1 flex flex-col overflow-hidden bg-black">

                {scannerActive ? (
                    <div className="relative flex-1 w-full h-full">
                        <div id="qr-reader" className="w-full h-full flex flex-col" />

                        {/* Mode Switcher Overlay */}
                        <div className="absolute top-6 left-0 right-0 px-6 flex justify-center z-10">
                            <div className="flex bg-[#161618]/80 backdrop-blur-xl p-1.5 rounded-xl border border-white/10 w-full max-w-xs">
                                <button
                                    onClick={() => setScanMode('ticket')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${scanMode === 'ticket' ? 'bg-fuchsia-500 text-black shadow-[0_0_15px_rgba(217,70,239,0.4)]' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Skanuj Bilet
                                </button>
                                <button
                                    onClick={() => setScanMode('headphones')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${scanMode === 'headphones' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Słuchawki
                                </button>
                            </div>
                        </div>

                        {processing && !scannedTicket && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
                                <Loader2 className="w-12 h-12 text-fuchsia-500 animate-spin" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col p-6 items-center justify-center bg-[#0F0F11]">
                        {/* We hide the scanner and show the background if scanner not active but ticket not loaded yet? No, it's handled by scannedTicket */}
                    </div>
                )}

                {/* Bottom Sheet: Result Card */}
                {scannedTicket && (
                    <div className="absolute bottom-0 left-0 right-0 bg-[#161618] border-t border-white/10 rounded-t-[2rem] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] z-30 p-6 pt-4 transform transition-transform duration-300">
                        {/* Pull bar */}
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>

                        {/* Success State Container */}
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4">
                                <div className={`w-20 h-20 rounded-full ${scannedTicket.status === 'valid' ? 'bg-[#39ff14]/10 border-[#39ff14]' : 'bg-amber-500/10 border-amber-500'} border-4 flex items-center justify-center shadow-[0_0_30px_rgba(57,255,20,0.4)]`}>
                                    <Check className={`w-10 h-10 ${scannedTicket.status === 'valid' ? 'text-[#39ff14]' : 'text-amber-500'} stroke-[3]`} />
                                </div>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
                                    {scannedTicket.status === 'valid' ? 'Oczekujący Bilet' : 'Wydane Słuchawki'}
                                </h2>
                                <p className="text-gray-400 tracking-wide">Zeskanowano: <span className="text-fuchsia-500 font-bold">{scannedTicket.qr_code}</span></p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full mb-6">
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-start text-left">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Status</span>
                                    <span className="text-lg font-bold">{scannedTicket.status.toUpperCase()}</span>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-start text-left relative overflow-hidden">
                                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-emerald-500/10 to-transparent"></div>
                                    <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-1 flex items-center gap-1">
                                        Wydarzenie
                                    </span>
                                    <span className="text-sm font-bold text-white truncate w-full">{scannedTicket.events?.title || 'Brak'}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 w-full">
                                {scannedTicket.status === 'valid' ? (
                                    <button
                                        onClick={() => handleAction('returned')} // or 'active' depending on actual business logic if 'active' exists
                                        disabled={processing}
                                        className="w-full h-16 bg-gradient-to-r from-fuchsia-500 to-amber-500 text-black rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                                        {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                            <>
                                                <Headset className="w-6 h-6" />
                                                WYDAJ SŁUCHAWKI (ZWRÓC)
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleAction('returned')}
                                        disabled={processing}
                                        className="w-full h-16 bg-gradient-to-r from-emerald-500 to-teal-500 text-black rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                                        {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                            <>
                                                <Check className="w-6 h-6" />
                                                ODBIERZ Z POWROTEM
                                            </>
                                        )}
                                    </button>
                                )}

                                <button
                                    onClick={resetScanner}
                                    className="w-full h-12 border border-white/10 bg-white/5 text-gray-300 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                                    Anuluj / Kolejny Skan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating Feedback Toast */}
                {errorMsg && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[90%] bg-red-500/10 border border-red-500/50 backdrop-blur-md rounded-xl p-4 flex items-center gap-3 z-50">
                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
                            <X className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-500 leading-tight text-sm">Błąd Skanowania</h3>
                            <p className="text-gray-300 text-xs">{errorMsg}</p>
                        </div>
                    </div>
                )}

            </main>

            {/* Tab Bar Navigation */}
            <nav className="flex items-center justify-around px-4 pb-8 pt-3 bg-[#0F0F11] border-t border-white/5 z-40 relative">
                <Link to="/scanner" className="flex flex-col items-center gap-1.5 text-fuchsia-500">
                    <ScanLine className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Skaner</span>
                </Link>
                <Link to="/admin" className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors">
                    <Users className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Panel</span>
                </Link>
                <Link to="/admin/rentals" className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors">
                    <Package className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Baza</span>
                </Link>
                <button className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors">
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Statystyki</span>
                </button>
            </nav>

        </div>
    );
}
