
import { Member, Village, Business, MatrimonialProfile, SocialScheme, Sponsor, ZoneMinister, GetTogetherConfig } from '../types';
import { MEMBERS, VILLAGES, SCHEMES, SPONSORS, ZONE_MINISTERS, BUSINESSES, MATRIMONIALS } from './mockData';

const STORAGE_KEYS = {
  MEMBERS: 'jagodana_members',
  VILLAGES: 'jagodana_villages',
  SCHEMES: 'jagodana_schemes',
  SPONSORS: 'jagodana_sponsors',
  MINISTERS: 'jagodana_ministers',
  BUSINESSES: 'jagodana_businesses',
  MATRIMONIALS: 'jagodana_matrimonials',
  CONFIG: 'jagodana_config',
};

class DatabaseService {
  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(MEMBERS));
      localStorage.setItem(STORAGE_KEYS.VILLAGES, JSON.stringify(VILLAGES));
      localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(SCHEMES));
      localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(SPONSORS));
      localStorage.setItem(STORAGE_KEYS.MINISTERS, JSON.stringify(ZONE_MINISTERS));
      localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(BUSINESSES));
      localStorage.setItem(STORAGE_KEYS.MATRIMONIALS, JSON.stringify(MATRIMONIALS));
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({
        isEnabled: true,
        villageName: 'લખતર',
        date: '2024-11-15',
        time: '10:00 AM'
      }));
    }
  }

  constructor() {
    this.init();
  }

  get<T>(key: string): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  save<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export const db = new DatabaseService();
export { STORAGE_KEYS };
