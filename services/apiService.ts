
import { db, STORAGE_KEYS } from './databaseService';
import { Member, Village, Business, MatrimonialProfile, SocialScheme, Sponsor, ZoneMinister, GetTogetherConfig } from '../types';

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

const normalizeVillage = (village: any): Village => ({
  ...village,
  id: String(village.id ?? village._id ?? village.villageId ?? ''),
  name: village.name ?? village.villageName ?? '',
  nameGujarati: village.nameGujarati ?? village.gujaratiName ?? village.name_gujarati ?? '',
  district: village.district ?? village.districtName ?? '',
  villageCode: village.villageCode ?? village.village_code ?? '',
  coordinatorContact: village.coordinatorContact ?? '',
});

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

export const ApiService = {
  // Admin Authentication
  async adminLogin(email: string, password: string) {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
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
    return fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });
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
    await delay();
    return db.get<Member[]>(STORAGE_KEYS.MEMBERS);
  },

  async updateMember(member: Member): Promise<Member> {
    await delay();
    const members = db.get<Member[]>(STORAGE_KEYS.MEMBERS);
    const index = members.findIndex(m => m.id === member.id);
    if (index !== -1) {
      members[index] = member;
    } else {
      members.push(member);
    }
    db.save(STORAGE_KEYS.MEMBERS, members);
    return member;
  },

  async deleteMember(id: string): Promise<void> {
    await delay();
    const members = db.get<Member[]>(STORAGE_KEYS.MEMBERS);
    db.save(STORAGE_KEYS.MEMBERS, members.filter(m => m.id !== id));
  },

  async getVillages(): Promise<Village[]> {
    await delay();
    return db.get<Village[]>(STORAGE_KEYS.VILLAGES);
  },

  async login(mobile: string, password?: string): Promise<Member | null> {
    await delay(800);
    const members = db.get<Member[]>(STORAGE_KEYS.MEMBERS);
    return members.find(m => m.mobile === mobile && m.password === password) || null;
  },

  async validateFamilyId(familyId: string): Promise<boolean> {
    await delay(300);
    const members = db.get<Member[]>(STORAGE_KEYS.MEMBERS);
    return members.some(m => m.familyId === familyId);
  },

  async getFamilyHeadVillage(familyId: string): Promise<string | null> {
    await delay(300);
    const members = db.get<Member[]>(STORAGE_KEYS.MEMBERS);
    const head = members.find(m => m.familyId === familyId && m.headOfHousehold);
    return head ? head.villageId : null;
  },

  async getBusinesses(): Promise<Business[]> {
    await delay();
    return db.get<Business[]>(STORAGE_KEYS.BUSINESSES);
  },

  async saveConfig(config: GetTogetherConfig): Promise<void> {
    db.save(STORAGE_KEYS.CONFIG, config);
  },

  async fetchAll() {
    await delay(1000);
    return {
      members: db.get<Member[]>(STORAGE_KEYS.MEMBERS),
      villages: db.get<Village[]>(STORAGE_KEYS.VILLAGES),
      schemes: db.get<SocialScheme[]>(STORAGE_KEYS.SCHEMES),
      sponsors: db.get<Sponsor[]>(STORAGE_KEYS.SPONSORS),
      ministers: db.get<ZoneMinister[]>(STORAGE_KEYS.MINISTERS),
      businesses: db.get<Business[]>(STORAGE_KEYS.BUSINESSES),
      matrimonials: db.get<MatrimonialProfile[]>(STORAGE_KEYS.MATRIMONIALS),
      config: db.get<GetTogetherConfig>(STORAGE_KEYS.CONFIG),
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
    db.save(STORAGE_KEYS.MEMBERS, data.members);
    db.save(STORAGE_KEYS.VILLAGES, data.villages);
    db.save(STORAGE_KEYS.SCHEMES, data.schemes);
    db.save(STORAGE_KEYS.SPONSORS, data.sponsors);
    db.save(STORAGE_KEYS.MINISTERS, data.ministers);
    db.save(STORAGE_KEYS.BUSINESSES, data.businesses);
    db.save(STORAGE_KEYS.MATRIMONIALS, data.matrimonials);
    db.save(STORAGE_KEYS.CONFIG, data.config);
  }
};
