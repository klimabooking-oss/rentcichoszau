import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0F0F11] text-white">
      <Outlet />
    </div>
  );
}
