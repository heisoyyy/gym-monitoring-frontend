import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, Dumbbell, Apple, Bot, LogOut, Shield } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Analisis Tubuh', path: '/body-analysis', icon: <Activity size={20} /> },
    { name: 'Rencana Latihan', path: '/workout', icon: <Dumbbell size={20} /> },
    { name: 'Nutrisi & Diet', path: '/nutrition', icon: <Apple size={20} /> },
    { name: 'AI Fitness Chat', path: '/chat', icon: <Bot size={20} /> },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ name: 'Admin Panel', path: '/admin', icon: <Shield size={20} /> });
  }

  return (
    <aside className="w-64 h-screen bg-neutral-900 border-r border-neutral-800 flex flex-col fixed left-0 top-0 z-20 shadow-2xl">
      <div className="h-16 flex items-center px-6 border-b border-neutral-800 gap-2 select-none">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <Dumbbell size={18} />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">
          GymAI <span className="text-emerald-400 text-xs font-semibold px-1.5 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">PRO</span>
        </span>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-1.5 px-4 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer text-sm font-medium ${
                isActive 
                  ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 font-semibold' 
                  : 'text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-850">
        <button
          onClick={logout}
          className="flex items-center gap-3.5 w-full px-4 py-3 text-neutral-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all cursor-pointer font-medium text-sm"
        >
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
