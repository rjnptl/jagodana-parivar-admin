
import { BloodGroupOption, Member, Village, Business, MatrimonialProfile, SocialScheme, Sponsor, SponsorType, ZoneMinister, GetTogetherConfig } from '../types';

const normalizeVillage = (village: any): Village => ({
  ...village,
  id: String(village.id ?? village._id ?? village.villageId ?? ''),
  name: village.name ?? village.villageName ?? '',
  nameGujarati: village.nameGujarati ?? village.gujaratiName ?? village.name_gujarati ?? '',
  district: village.district ?? village.districtName ?? '',
  villageCode: village.villageCode ?? village.village_code ?? '',
  coordinatorContact: village.coordinatorContact ?? '',
});

const normalizeMember = (member: any): Member => {
  const isFamilyHead = member.isFamilyHead ?? member.headOfHousehold ?? member.type === 'head';
  const hasMobileLogin = member.hasMobileLogin ?? Boolean(member.mobileNumber ?? member.mobile ?? member.phoneNumber);
  const mobileVerified = member.mobileVerified ?? member.isPhoneVerified ?? false;

  return {
    id: String(member.id ?? member._id ?? ''),
    familyId: member.familyId ?? member.familyCode ?? '',
    passcode: undefined,
    fullName: member.fullName ?? member.name ?? [member.firstName, member.middleName, member.lastName].filter(Boolean).join(' '),
    firstName: member.firstName ?? '',
    middleName: member.middleName ?? member.fatherHusbandName ?? member.fatherOrHusbandName ?? '',
    fatherHusbandName: member.middleName ?? member.fatherHusbandName ?? member.fatherOrHusbandName ?? '',
    dob: member.dob ?? member.dateOfBirth ?? '',
    age: member.age ?? 0,
    gender: member.gender ?? 'Male',
    villageId: String(member.villageId ?? member.nativeVillageId ?? ''),
    currentCity: member.currentCity ?? member.address ?? '',
    currentAddress: member.address ?? '',
    bloodGroupId: member.bloodGroupId ? String(member.bloodGroupId) : null,
    bloodGroup: member.bloodGroup ? {
      id: String(member.bloodGroup.id),
      name: member.bloodGroup.name,
      isActive: member.bloodGroup.isActive ?? true,
    } : null,
    mobile: member.mobile ?? member.mobileNumber ?? member.phoneNumber ?? '',
    occupation: member.occupation ?? 'Not Specified',
    jobType: member.jobType ?? 'Unemployed',
    maritalStatus: member.maritalStatus ?? 'Single',
    headOfHousehold: isFamilyHead,
    isFamilyHead,
    hasMobileLogin,
    mobileVerified,
    isActiveUser: member.isActiveUser ?? (hasMobileLogin && mobileVerified),
    addedByMemberId: member.addedByMemberId ? String(member.addedByMemberId) : undefined,
    avatarUrl: member.profilePhoto ?? '',
    relationToHead: isFamilyHead ? 'Self' : (member.relationToHead ?? member.relationWithHead ?? undefined),
    relationWithHead: isFamilyHead ? 'Self' : (member.relationWithHead ?? member.relationToHead ?? undefined),
  };
};


const normalizeEventConfig = (event: any): GetTogetherConfig => ({
  id: event?.id ? String(event.id) : undefined,
  isEnabled: Boolean(event?.isEnabled ?? event?.isVisible ?? event?.isActive ?? false),
  isVisible: Boolean(event?.isVisible ?? event?.isEnabled ?? event?.isActive ?? false),
  villageName: event?.villageName ?? event?.villageLocation ?? event?.location ?? '',
  villageLocation: event?.villageLocation ?? event?.villageName ?? event?.location ?? '',
  date: event?.date ?? event?.eventDate ?? '',
  eventDate: event?.eventDate ?? event?.date ?? '',
  time: event?.time ?? event?.eventTime ?? '',
  eventTime: event?.eventTime ?? event?.time ?? '',
  title: event?.title ?? 'Next Family Get-Together',
  description: event?.description ?? '',
});
const normalizeScheme = (scheme: any): SocialScheme => ({
  id: String(scheme?.id ?? ''),
  title: scheme?.title ?? '',
  description: scheme?.description ?? '',
  eligibilityCriteria: scheme?.eligibilityCriteria ?? scheme?.eligibility ?? '',
  contactPersonName: scheme?.contactPersonName ?? scheme?.contactPerson ?? '',
  isActive: Boolean(scheme?.isActive),
});

const normalizeSponsor = (sponsor: any): Sponsor => ({
  id: String(sponsor?.id ?? ''),
  sponsorMemberId: String(sponsor?.sponsorMemberId ?? ''),
  sponsorName: sponsor?.sponsorName ?? '',
  familyCode: sponsor?.familyCode ?? '',
  villageId: String(sponsor?.villageId ?? ''),
  villageName: sponsor?.villageName ?? '',
  schemeId: sponsor?.schemeId ? String(sponsor.schemeId) : null,
  schemeTitle: sponsor?.schemeTitle ?? '',
  eventName: sponsor?.eventName ?? '',
  amount: String(sponsor?.amount ?? ''),
  contactNumber: sponsor?.contactNumber ?? '',
  sponsorshipDate: sponsor?.sponsorshipDate ?? '',
  sponsorType: (sponsor?.sponsorType === 'lifetime' ? 'lifetime' : 'one-time') as SponsorType,
  isVisibleOnMemberUI: Boolean(sponsor?.isVisibleOnMemberUI),
});

const normalizeZoneMinister = (minister: any): ZoneMinister => ({
  id: String(minister?.id ?? ''),
  villageId: String(minister?.villageId ?? ''),
  villageName: minister?.villageName ?? '',
  villageNameGujarati: minister?.villageNameGujarati ?? '',
  villageCode: minister?.villageCode ?? '',
  memberId: String(minister?.memberId ?? ''),
  memberName: minister?.memberName ?? '',
  familyCode: minister?.familyCode ?? '',
  mobileNumber: minister?.mobileNumber ?? '',
  currentCity: minister?.currentCity ?? '',
  role: minister?.role ?? '',
});

const extractMemberList = (payload: any): Member[] => {
  const members = [
    payload,
    payload?.data,
    payload?.data?.data,
    payload?.members,
    payload?.result,
  ].find(Array.isArray) ?? [];

  return members.map(normalizeMember);
};

const extractVillageList = (payload: any): Village[] => {
  const villages = [
    payload,
    payload?.data,
    payload?.data?.data,
    payload?.data?.villages,
    payload?.data?.rows,
    payload?.data?.items,
    payload?.data?.docs,
    payload?.data?.data?.villages,
    payload?.data?.data?.rows,
    payload?.data?.data?.items,
    payload?.data?.data?.docs,
    payload?.villages,
    payload?.result,
  ].find(Array.isArray) ?? [];

  return villages.map(normalizeVillage);
};

const extractVillage = (payload: any): Village | null => {
  const village = payload?.data?.village ?? payload?.data ?? payload?.village ?? payload?.result ?? payload;

  if (!village || typeof village !== 'object' || Array.isArray(village)) {
    return null;
  }

  return normalizeVillage(village);
};

const parseJsonSafely = async (response: Response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const ADMIN_AUTH_EXPIRED_EVENT = 'jagodana:admin-auth-expired';
let adminRefreshPromise: Promise<string | null> | null = null;

const clearAdminSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('adminUser');
  window.dispatchEvent(new Event(ADMIN_AUTH_EXPIRED_EVENT));
};

const refreshAdminAccessToken = async (): Promise<string | null> => {
  if (adminRefreshPromise) return adminRefreshPromise;
  adminRefreshPromise = (async () => {
    try {
      const response = await fetch('/api/admin/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const data = await parseJsonSafely(response);
      const token = data?.data?.accessToken;
      const user = data?.data?.user;
      if (!response.ok || data?.success === false || !token || !user) {
        clearAdminSession();
        return null;
      }
      localStorage.setItem('accessToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      return token;
    } catch {
      clearAdminSession();
      return null;
    }
  })().finally(() => {
    adminRefreshPromise = null;
  });
  return adminRefreshPromise;
};

const fetchWithAdminAuth = async (url: string, options: RequestInit = {}, retryOnUnauthorized = true): Promise<Response> => {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem('accessToken');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(url, { ...options, credentials: 'include', headers });
  if (response.status === 401 && retryOnUnauthorized && !url.endsWith('/auth/refresh')) {
    const refreshedToken = await refreshAdminAccessToken();
    if (refreshedToken) return fetchWithAdminAuth(url, options, false);
  }
  return response;
};

export interface OtpRequestRecord {
  id: string | number;
  firstName: string;
  lastName: string;
  villageName?: string;
  mobileNumber: string;
  familyCode: string;
  status: 'CREATED' | 'SENT' | 'ACTIVE' | 'EXPIRED';
  createdAt?: string;
  sentAt?: string | null;
  expiresAt?: string;
}

export const ApiService = {
  // Admin Authentication
  async adminLogin(email: string, password: string) {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(error.message || 'Login failed');
      }

      return response.json();
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to server. Please check if the backend is running on http://localhost:5682');
      }
      throw error;
    }
  },

  // Make authenticated requests
  async fetchWithAuth(url: string, options: RequestInit = {}) {
    return fetchWithAdminAuth(url, options);
  },

  async refreshAdminSession() {
    return refreshAdminAccessToken();
  },

  async getCurrentAdmin() {
    const response = await fetchWithAdminAuth('/api/admin/auth/me', { method: 'GET', cache: 'no-store' });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false || !data?.user) {
      throw new Error(data?.message || 'Administrator session is invalid');
    }
    return data.user;
  },

  async adminLogout() {
    try {
      await fetchWithAdminAuth('/api/admin/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('adminUser');
    }
  },

  // Village Management
  async getAllVillages(): Promise<Village[]> {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '1000',
        _: String(Date.now()),
      });

      const response = await this.fetchWithAuth(`/api/admin/village/getAllVillages?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch villages (${response.status})`);
      }

      const data = await parseJsonSafely(response);
      return extractVillageList(data);
    } catch (error) {
      console.error('Error fetching villages:', error);
      throw error;
    }
  },

  async createVillage(name: string, nameGujarati: string, district: string, villageCode: string): Promise<Village | null> {
    try {
      const trimmedName = name.trim();
      const trimmedNameGujarati = nameGujarati.trim();
      const trimmedDistrict = district.trim();
      const trimmedVillageCode = villageCode.trim();

      const response = await this.fetchWithAuth('/api/admin/village/createVillage', {
        method: 'POST',
        body: JSON.stringify({
          name: trimmedName,
          village: trimmedName,
          villageName: trimmedName,
          village_name: trimmedName,
          nameGujarati: trimmedNameGujarati,
          gujaratiName: trimmedNameGujarati,
          name_gujarati: trimmedNameGujarati,
          district: trimmedDistrict,
          districtName: trimmedDistrict,
          district_name: trimmedDistrict,
          villageCode: trimmedVillageCode,
          village_code: trimmedVillageCode,
        }),
      });

      const data = await parseJsonSafely(response);

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || `Failed to create village (${response.status})`);
      }

      return extractVillage(data);
    } catch (error) {
      console.error('Error creating village:', error);
      throw error;
    }
  },

  async updateVillage(id: string, name: string, nameGujarati: string, district: string, villageCode: string): Promise<Village | null> {
    try {
      const trimmedName = name.trim();
      const trimmedNameGujarati = nameGujarati.trim();
      const trimmedDistrict = district.trim();
      const trimmedVillageCode = villageCode.trim();

      const response = await this.fetchWithAuth(`/api/admin/village/updateVillage/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: trimmedName,
          village: trimmedName,
          villageName: trimmedName,
          village_name: trimmedName,
          nameGujarati: trimmedNameGujarati,
          gujaratiName: trimmedNameGujarati,
          name_gujarati: trimmedNameGujarati,
          district: trimmedDistrict,
          districtName: trimmedDistrict,
          district_name: trimmedDistrict,
          villageCode: trimmedVillageCode,
          village_code: trimmedVillageCode,
        }),
      });

      const data = await parseJsonSafely(response);

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || `Failed to update village (${response.status})`);
      }

      return extractVillage(data);
    } catch (error) {
      console.error('Error updating village:', error);
      throw error;
    }
  },

  async deleteVillage(id: string): Promise<boolean> {
    try {
      const response = await this.fetchWithAuth(`/api/admin/village/removeVillage/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete village');
      }

      return true;
    } catch (error) {
      console.error('Error deleting village:', error);
      throw error;
    }
  },

  async getMembers(): Promise<Member[]> {
    try {
      const response = await this.fetchWithAuth('/api/admin/members', {
        method: 'GET',
        cache: 'no-store',
      });
      const data = await parseJsonSafely(response);

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || `Failed to fetch members (${response.status})`);
      }

      return extractMemberList(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  async updateMember(member: Member): Promise<Member> {
    const response = await this.fetchWithAuth(`/api/admin/members/${encodeURIComponent(member.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        firstName: member.firstName,
        middleName: member.middleName || member.fatherHusbandName,
        fullName: member.fullName,
        gender: member.gender,
        currentCity: member.currentCity,
        address: member.currentAddress || member.currentCity,
        dateOfBirth: member.dob,
        relationWithHead: member.headOfHousehold ? 'Self' : (member.relationToHead || member.relationWithHead || null),
        profilePhoto: member.avatarUrl,
        bloodGroupId: member.bloodGroupId || null,
      }),
    });
    const data = await parseJsonSafely(response);

    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || `Failed to update member (${response.status})`);
    }

    return normalizeMember(data?.data ?? member);
  },

  async deleteMember(id: string): Promise<void> {
    console.warn('Delete member API is not available yet', id);
  },

  async getVillages(): Promise<Village[]> {
    return this.getAllVillages();
  },

  async getBloodGroups(): Promise<BloodGroupOption[]> {
    const response = await this.fetchWithAuth('/api/blood-groups', {
      method: 'GET',
      cache: 'no-store',
    });
    const data = await parseJsonSafely(response);

    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || `Failed to fetch blood groups (${response.status})`);
    }

    const groups = Array.isArray(data?.data) ? data.data : [];
    return groups.map((group: any) => ({
      id: String(group.id),
      name: group.name,
      isActive: group.isActive ?? true,
    }));
  },

  async login(mobile: string, passcode?: string): Promise<Member | null> {
    console.warn('Admin-side member login helper is not used with API auth', mobile, passcode);
    return null;
  },

  async validateFamilyId(familyId: string): Promise<boolean> {
    try {
      const response = await this.fetchWithAuth(`/api/families/${encodeURIComponent(familyId)}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const data = await parseJsonSafely(response);
      return response.ok && data?.success !== false && Boolean(data?.data);
    } catch {
      return false;
    }
  },

  async getFamilyHeadVillage(familyId: string): Promise<string | null> {
    try {
      const response = await this.fetchWithAuth(`/api/families/${encodeURIComponent(familyId)}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const data = await parseJsonSafely(response);
      return data?.data?.head?.villageId || data?.data?.members?.[0]?.villageId || null;
    } catch {
      return null;
    }
  },

  async getBusinesses(): Promise<Business[]> {
    const response = await this.fetchWithAuth('/api/occupations', { method: 'GET', cache: 'no-store' });
    const data = await parseJsonSafely(response);
    return Array.isArray(data?.data) ? data.data : [];
  },

  async getEvents(): Promise<GetTogetherConfig[]> {
    const response = await this.fetchWithAuth('/api/admin/events', { method: 'GET', cache: 'no-store' });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to load events');
    }
    return Array.isArray(data?.data) ? data.data.map(normalizeEventConfig) : [];
  },

  async getActiveEvents(): Promise<GetTogetherConfig[]> {
    const response = await fetch('/api/events/active', { method: 'GET', cache: 'no-store' });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to load active events');
    }
    return Array.isArray(data?.data) ? data.data.map(normalizeEventConfig) : [];
  },

  async saveEvent(config: GetTogetherConfig): Promise<GetTogetherConfig> {
    const payload = {
      villageLocation: config.villageLocation || config.villageName,
      eventDate: config.eventDate || config.date,
      eventTime: config.eventTime || config.time,
      title: config.title,
      description: config.description,
      isVisible: config.isVisible ?? config.isEnabled,
    };
    const isUpdate = Boolean(config.id);
    const response = await this.fetchWithAuth(isUpdate ? `/api/admin/events/${encodeURIComponent(String(config.id))}` : '/api/admin/events', {
      method: isUpdate ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to save event');
    }
    return normalizeEventConfig(data?.data);
  },

  async toggleEvent(id: string, isVisible: boolean): Promise<GetTogetherConfig> {
    const response = await this.fetchWithAuth(`/api/admin/events/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ isVisible }),
    });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to update event visibility');
    }
    return normalizeEventConfig(data?.data);
  },

  async deleteEvent(id: string): Promise<void> {
    const response = await this.fetchWithAuth(`/api/admin/events/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to delete event');
    }
  },
  async saveConfig(config: GetTogetherConfig): Promise<void> {
    await this.saveEvent(config);
  },

  async getOtpRequests(): Promise<OtpRequestRecord[]> {
    const response = await this.fetchWithAuth('/api/admin/otp-requests', { method: 'GET', cache: 'no-store' });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) throw new Error(data?.message || 'Failed to load OTP requests');
    return Array.isArray(data?.data) ? data.data.map((request: any) => ({
      ...request,
      id: request.id,
      firstName: request.firstName || request.first_name || '',
      lastName: request.lastName || request.last_name || '',
      villageName: request.villageName || request.village_name || '',
      mobileNumber: request.mobileNumber || request.mobile_number || '',
      familyCode: request.familyCode || request.family_code || '',
      status: request.status,
      createdAt: request.createdAt || request.created_at,
      sentAt: request.sentAt || request.sent_at,
      expiresAt: request.expiresAt || request.expires_at,
    })) : [];
  },

  async markOtpRequestSent(id: string | number): Promise<OtpRequestRecord> {
    const response = await this.fetchWithAuth(`/api/admin/otp-requests/${encodeURIComponent(String(id))}/sent`, { method: 'PATCH' });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) throw new Error(data?.message || 'Failed to mark OTP sent');
    return data.data;
  },

  async resendOtpRequest(id: string | number): Promise<OtpRequestRecord> {
    const response = await this.fetchWithAuth(`/api/admin/otp-requests/${encodeURIComponent(String(id))}/resend`, { method: 'POST' });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) throw new Error(data?.message || 'Failed to resend OTP');
    return data.data;
  },

  async expireOtpRequest(id: string | number): Promise<OtpRequestRecord> {
    const response = await this.fetchWithAuth(`/api/admin/otp-requests/${encodeURIComponent(String(id))}/expire`, { method: 'PATCH' });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) throw new Error(data?.message || 'Failed to expire OTP');
    return data.data;
  },

  // Social Schemes (admin)
  async getAdminSchemes(): Promise<SocialScheme[]> {
    const response = await this.fetchWithAuth('/api/admin/schemes', { method: 'GET', cache: 'no-store' });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || `Failed to load schemes (${response.status})`);
    }
    return Array.isArray(data?.data) ? data.data.map(normalizeScheme) : [];
  },

  async createScheme(payload: Omit<SocialScheme, 'id'>): Promise<SocialScheme> {
    const response = await this.fetchWithAuth('/api/admin/schemes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to create scheme');
    }
    return normalizeScheme(data?.data);
  },

  async updateScheme(id: string, payload: Omit<SocialScheme, 'id'>): Promise<SocialScheme> {
    const response = await this.fetchWithAuth(`/api/admin/schemes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to update scheme');
    }
    return normalizeScheme(data?.data);
  },

  async deleteScheme(id: string): Promise<void> {
    const response = await this.fetchWithAuth(`/api/admin/schemes/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to delete scheme');
    }
  },

  // Sponsors (admin)
  async getAdminSponsors(): Promise<Sponsor[]> {
    const response = await this.fetchWithAuth('/api/admin/sponsors', { method: 'GET', cache: 'no-store' });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || `Failed to load sponsors (${response.status})`);
    }
    return Array.isArray(data?.data) ? data.data.map(normalizeSponsor) : [];
  },

  async createSponsor(payload: Record<string, unknown>): Promise<Sponsor> {
    const response = await this.fetchWithAuth('/api/admin/sponsors', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to create sponsor');
    }
    return normalizeSponsor(data?.data);
  },

  async updateSponsor(id: string, payload: Record<string, unknown>): Promise<Sponsor> {
    const response = await this.fetchWithAuth(`/api/admin/sponsors/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to update sponsor');
    }
    return normalizeSponsor(data?.data);
  },

  async deleteSponsor(id: string): Promise<void> {
    const response = await this.fetchWithAuth(`/api/admin/sponsors/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to delete sponsor');
    }
  },

  // Zone Ministers (admin)
  async getAdminZoneMinisters(): Promise<ZoneMinister[]> {
    const response = await this.fetchWithAuth('/api/admin/zone-ministers', { method: 'GET', cache: 'no-store' });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || `Failed to load zone ministers (${response.status})`);
    }
    return Array.isArray(data?.data) ? data.data.map(normalizeZoneMinister) : [];
  },

  async createZoneMinister(villageId: string, payload: { memberId: string; role?: string }): Promise<ZoneMinister> {
    const response = await this.fetchWithAuth(`/api/admin/villages/${encodeURIComponent(villageId)}/zone-minister`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to assign zone minister');
    }
    return normalizeZoneMinister(data?.data);
  },

  async updateZoneMinister(villageId: string, id: string, payload: { memberId: string; role?: string }): Promise<ZoneMinister> {
    const response = await this.fetchWithAuth(`/api/admin/villages/${encodeURIComponent(villageId)}/zone-minister/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to update zone minister');
    }
    return normalizeZoneMinister(data?.data);
  },

  async deleteZoneMinister(villageId: string, id: string): Promise<void> {
    const response = await this.fetchWithAuth(`/api/admin/villages/${encodeURIComponent(villageId)}/zone-minister/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || 'Failed to remove zone minister');
    }
  },

  // Members of one village, for searchable dropdowns (admin)
  async getVillageMembers(villageId: string): Promise<Member[]> {
    const params = new URLSearchParams({ villageId, limit: '1000' });
    const response = await this.fetchWithAuth(`/api/admin/members?${params.toString()}`, { method: 'GET', cache: 'no-store' });
    const data = await parseJsonSafely(response);
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || `Failed to load village members (${response.status})`);
    }
    return extractMemberList(data);
  },

  async fetchAll() {
    const [members, villages, schemes, sponsors, ministers, businesses, matrimonials, events] = await Promise.all([
      this.getMembers(),
      this.getAllVillages(),
      this.getAdminSchemes().catch(() => []),
      this.getAdminSponsors().catch(() => []),
      this.getAdminZoneMinisters().catch(() => []),
      this.fetchWithAuth('/api/occupations', { method: 'GET', cache: 'no-store' }).then(parseJsonSafely).then(data => Array.isArray(data?.data) ? data.data : []).catch(() => []),
      this.fetchWithAuth('/api/matrimonial-profiles', { method: 'GET', cache: 'no-store' }).then(parseJsonSafely).then(data => Array.isArray(data?.data) ? data.data : []).catch(() => []),
      this.getEvents().catch(() => []),
    ]);
    return {
      members,
      villages,
      schemes,
      sponsors,
      ministers,
      businesses,
      matrimonials,
      config: events.find(event => event.isEnabled) || { isEnabled: false, villageName: '', date: '', time: '' },
    };
  },

  saveAll(data: {
    members: Member[];
    villages: Village[];
    schemes: SocialScheme[];
    sponsors: Sponsor[];
    ministers: ZoneMinister[];
    businesses: Business[];
    matrimonials: MatrimonialProfile[];
    config: GetTogetherConfig;
  }): void {
    console.warn('Bulk save API is not available yet; state changes remain in memory only.', data);
  }
};
