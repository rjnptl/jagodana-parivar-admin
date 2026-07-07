import React, { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import logo from './assets/jagodanaparivar.png';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import ManageBloodGroups from './components/admin/ManageBloodGroups';
import ManageEvents from './components/admin/ManageEvents';
import ManageFamilies from './components/admin/ManageFamilies';
import ManageMinisters from './components/admin/ManageMinisters';
import ManageOtpRequests from './components/admin/ManageOtpRequests';
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

  const handleLogout = () => {
    logout();
  };

  if (isAuthLoading || (isLoggedIn && isLoading)) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
        <img src={logo} alt="Jagodana Parivar Admin" className="brand-logo h-24 w-24 mb-5 drop-shadow-lg" />
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-slate-600 font-semibold animate-pulse">Loading Jagodana Parivar Admin...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/overview" replace />} />
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
        <Route index element={<Navigate to="/admin/overview" replace />} />
        <Route path="overview" element={<AdminDashboard members={members} villages={villages} sponsors={sponsors} />} />
        <Route path="dashboard" element={<Navigate to="/admin/overview" replace />} />
        <Route path="families" element={<ManageFamilies members={members} villages={villages} />} />
        <Route path="families/:familyCode" element={<ManageFamilies members={members} villages={villages} />} />
        <Route path="members" element={<ManageFamilies members={members} villages={villages} />} />
        <Route path="members/:memberId" element={<ManageFamilies members={members} villages={villages} />} />
        <Route path="otp-requests" element={<ManageOtpRequests />} />
        <Route path="events" element={<ManageEvents config={getTogetherConfig} setConfig={setGetTogetherConfig} />} />
        <Route path="events/new" element={<ManageEvents config={getTogetherConfig} setConfig={setGetTogetherConfig} />} />
        <Route path="events/:eventId/edit" element={<ManageEvents config={getTogetherConfig} setConfig={setGetTogetherConfig} />} />
        <Route path="villages" element={<ManageVillages villages={villages} setVillages={setVillages} />} />
        <Route path="villages/new" element={<ManageVillages villages={villages} setVillages={setVillages} />} />
        <Route path="villages/:villageCode/edit" element={<ManageVillages villages={villages} setVillages={setVillages} />} />
        <Route path="schemes" element={<ManageSchemes schemes={schemes} setSchemes={setSchemes} />} />
        <Route path="schemes/new" element={<ManageSchemes schemes={schemes} setSchemes={setSchemes} />} />
        <Route path="schemes/:schemeId/edit" element={<ManageSchemes schemes={schemes} setSchemes={setSchemes} />} />
        <Route path="sponsors" element={<ManageSponsors sponsors={sponsors} setSponsors={setSponsors} schemes={schemes} villages={villages} />} />
        <Route path="sponsors/new" element={<ManageSponsors sponsors={sponsors} setSponsors={setSponsors} schemes={schemes} villages={villages} />} />
        <Route path="sponsors/:sponsorId/edit" element={<ManageSponsors sponsors={sponsors} setSponsors={setSponsors} schemes={schemes} villages={villages} />} />
        <Route path="zone-ministers" element={<ManageMinisters ministers={ministers} setMinisters={setMinisters} villages={villages} />} />
        <Route path="zone-ministers/new" element={<ManageMinisters ministers={ministers} setMinisters={setMinisters} villages={villages} />} />
        <Route path="zone-ministers/:id/edit" element={<ManageMinisters ministers={ministers} setMinisters={setMinisters} villages={villages} />} />
        <Route path="ministers" element={<Navigate to="/admin/zone-ministers" replace />} />
        <Route path="blood-groups" element={<ManageBloodGroups members={members} setMembers={setMembers} />} />
        <Route path="settings" element={<div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"><h2 className="text-2xl font-bold text-slate-800">Admin Settings</h2><p className="mt-2 text-slate-500">Application settings will appear here when configuration options are available.</p></div>} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/overview" replace />} />
    </Routes>
  );
};

export default App;
