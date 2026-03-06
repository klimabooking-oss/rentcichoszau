import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScannerSystem from './pages/ScannerSystem';
import DigitalTicket from './pages/DigitalTicket';
import AttendeeDashboard from './pages/AttendeeDashboard';
import EventTickets from './pages/EventTickets';
import AdminDashboard from './pages/AdminDashboard';
import RentalsTable from './pages/RentalsTable';
import ActiveEvents from './pages/ActiveEvents';
import AdminUsers from './pages/AdminUsers';
import HardwarePackages from './pages/HardwarePackages';
import Layout from './Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public / Attendee Routes */}
          <Route index element={<Navigate to="/event/1" replace />} />
          <Route path="event/:id" element={<EventTickets />} />

          <Route path="ticket/:id" element={
            <ProtectedRoute><DigitalTicket /></ProtectedRoute>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute><AttendeeDashboard /></ProtectedRoute>
          } />

          {/* Admin / Staff Routes */}
          <Route path="scanner" element={<ScannerSystem />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/rentals" element={<RentalsTable />} />
          <Route path="admin/events" element={<ActiveEvents />} />
          <Route path="admin/users" element={<AdminUsers />} />
          <Route path="admin/packages" element={<HardwarePackages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
