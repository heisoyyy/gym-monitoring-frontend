import { Bell, Search, User } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Topbar = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="h-16 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8 select-none">
      <div className="flex items-center gap-4 text-neutral-400">
        <Search size={18} className="text-neutral-500" />
        <input 
          type="text" 
          placeholder="Cari latihan, resep makanan..." 
          className="bg-transparent border-none outline-none text-xs placeholder-neutral-500 w-64 text-white"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-neutral-400 hover:text-white transition-colors cursor-pointer p-1.5 hover:bg-neutral-900 rounded-lg">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-5 border-l border-neutral-800">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-white tracking-tight">{user?.name || 'Fighter'}</p>
            <p className="text-[10px] text-neutral-500 font-semibold uppercase mt-0.5 tracking-wider">
              {user?.target || 'Antusias Fitness'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold overflow-hidden border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <User size={16} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
