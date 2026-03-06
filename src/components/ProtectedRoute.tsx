import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-fuchsia-500" />
            </div>
        );
    }

    if (!user) {
        // Przekieruj niezalogowanych do widoku EventTickets (gdzie jest ekran logowania/powitania)
        return <Navigate to="/event/1" replace />;
    }

    return <>{children}</>;
}
