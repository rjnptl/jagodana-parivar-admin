import React, { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import ManageBloodGroups from './components/admin/ManageBloodGroups';
import ManageEvents from './components/admin/ManageEvents';
import ManageFamilies from './components/admin/ManageFamilies';
import ManageMinisters from './components/admin/ManageMinisters';
import ManageSchemes from './components/admin/ManageSchemes';
import ManageSponsors from './components/admin/ManageSponsors';
import ManageVillages from './components/admin/ManageVillages';
import AdminLogin from './components/auth/AdminLogin';
import { ApiService } from './services/apiService';
import { useAuth } from './context/AuthContext';
import {
  Business,
  GetTogetherConfig,
  MatrimonialProfile,
  Member,
  SocialScheme,
  Sponsor,
  Village,
  ZoneMinister,
} from './types';

const ProtectedAdminRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { isLoggedIn, isLoading: isAuthLoading, logout } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [schemes, setSchemes] = useState<SocialScheme[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [ministers, setMinisters] = useState<ZoneMinister[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [matrimonials, setMatrimonials] = useState<MatrimonialProfile[]>([]);
  const [getTogetherConfig, setGetTogetherConfig] = useState<GetTogetherConfig>({
    isEnabled: false,
    villageName: '',
    date: '',
    time: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedAdminDataRef = useRef(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        const [data, apiVillages] = await Promise.all([
          ApiService.fetchAll(),
          ApiService.getAllVillages(),
        ]);

        setMembers(data.members || []);
        setVillages(apiVillages);
        setSchemes(data.schemes || []);
        setSponsors(data.sponsors || []);
        setMinisters(data.ministers || []);
        setBusinesses(data.businesses || []);
        setMatrimonials(data.matrimonials || []);
        setGetTogetherConfig(data.config || { isEnabled: false, villageName: '', date: '', time: '' });
      } catch (error) {
        console.error('Failed to load admin data', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn && !isAuthLoading && !hasLoadedAdminDataRef.current) {
      hasLoadedAdminDataRef.current = true;
      initApp();
    } else if (!isLoggedIn) {
      hasLoadedAdminDataRef.current = false;
      setIsLoading(false);
    }
  }, [isLoggedIn, isAuthLoading]);

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      ApiService.saveAll({
        members,
        villages,
        schemes,
        sponsors,
        ministers,
        businesses,
        matrimonials,
        config: getTogetherConfig,
      });
    }
  }, [businesses, getTogetherConfig, isLoading, isLoggedIn, matrimonials, members, ministers, schemes, sponsors, villages]);

  const handleLogout = () => {
    logout();
  };

  if (isAuthLoading || (isLoggedIn && isLoading)) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading Jagodana Admin...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isLoggedIn ? '/admin/dashboard' : '/admin/login'} replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout
              members={members}
              setMembers={setMembers}
              villages={villages}
              setVillages={setVillages}
              schemes={schemes}
              setSchemes={setSchemes}
              sponsors={sponsors}
              setSponsors={setSponsors}
              ministers={ministers}
              setMinisters={setMinisters}
              getTogetherConfig={getTogetherConfig}
              setGetTogetherConfig={setGetTogetherConfig}
              onLogout={handleLogout}
            />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard members={members} villages={villages} sponsors={sponsors} />} />
        <Route path="families" element={<ManageFamilies members={members} villages={villages} />} />
        <Route path="events" element={<ManageEvents config={getTogetherConfig} setConfig={setGetTogetherConfig} />} />
        <Route path="villages" element={<ManageVillages villages={villages} setVillages={setVillages} />} />
        <Route path="schemes" element={<ManageSchemes schemes={schemes} setSchemes={setSchemes} />} />
        <Route path="sponsors" element={<ManageSponsors sponsors={sponsors} setSponsors={setSponsors} schemes={schemes} />} />
        <Route path="ministers" element={<ManageMinisters ministers={ministers} setMinisters={setMinisters} members={members} villages={villages} />} />
        <Route path="blood-groups" element={<ManageBloodGroups members={members} setMembers={setMembers} />} />
      </Route>
      <Route path="*" element={<Navigate to={isLoggedIn ? '/admin/dashboard' : '/admin/login'} replace />} />
    </Routes>
  );
};

export default App;
