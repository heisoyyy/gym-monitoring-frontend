import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-neutral-950 text-white selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Sidebar Navigasi Kiri */}
      <Sidebar />
      
      {/* Konten Kanan */}
      <div className="flex-1 pl-64 flex flex-col relative min-h-screen">
        <Topbar />
        
        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-x-hidden animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
