
import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Menu, X, Map, ShieldCheck, HandHeart, Briefcase, Droplet, LogOut, Calendar, Users
} from 'lucide-react';
import { Member, Village, SocialScheme, Sponsor, ZoneMinister, GetTogetherConfig } from '../../types';

interface AdminLayoutProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  villages: Village[];
  setVillages: React.Dispatch<React.SetStateAction<Village[]>>;
  schemes: SocialScheme[];
  setSchemes: React.Dispatch<React.SetStateAction<SocialScheme[]>>;
  sponsors: Sponsor[];
  setSponsors: React.Dispatch<React.SetStateAction<Sponsor[]>>;
  ministers: ZoneMinister[];
  setMinisters: React.Dispatch<React.SetStateAction<ZoneMinister[]>>;
  getTogetherConfig: GetTogetherConfig;
  setGetTogetherConfig: React.Dispatch<React.SetStateAction<GetTogetherConfig>>;
  onLogout: () => void;
}

const NavItem = ({ path, label, icon: Icon, currentPath, navigate, setIsMobileMenuOpen }: any) => {
  const isActive = (path === '/admin' && currentPath === '/admin') || (path !== '/admin' && currentPath === path);
  
  return (
    <button
      onClick={() => {
        navigate(path);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive 
          ? 'bg-indigo-50 text-indigo-700 font-semibold' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  onLogout 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Admin<span className="text-indigo-600">Portal</span>
            </h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-500">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NavItem path="/admin" label="Overview" icon={LayoutDashboard} currentPath={location.pathname} navigate={navigate} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          <NavItem path="/admin/families" label="Families" icon={Users} currentPath={location.pathname} navigate={navigate} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          <NavItem path="/admin/events" label="Get-Together" icon={Calendar} currentPath={location.pathname} navigate={navigate} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          <NavItem path="/admin/villages" label="Villages" icon={Map} currentPath={location.pathname} navigate={navigate} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          <NavItem path="/admin/schemes" label="Schemes" icon={ShieldCheck} currentPath={location.pathname} navigate={navigate} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          <NavItem path="/admin/sponsors" label="Sponsors" icon={HandHeart} currentPath={location.pathname} navigate={navigate} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          <NavItem path="/admin/ministers" label="Zone Ministers" icon={Briefcase} currentPath={location.pathname} navigate={navigate} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          <NavItem path="/admin/blood-groups" label="Blood Groups" icon={Droplet} currentPath={location.pathname} navigate={navigate} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut size={20} />
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-slate-50">
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-30 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
              <h1 className="text-lg font-bold text-slate-800">Admin<span className="text-indigo-600">Portal</span></h1>
            </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
        </header>

        <div className="p-4 lg:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
