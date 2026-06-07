
export enum BloodGroup {
  A_POS = "A+", A_NEG = "A-",
  B_POS = "B+", B_NEG = "B-",
  O_POS = "O+", O_NEG = "O-",
  AB_POS = "AB+", AB_NEG = "AB-",
  UNKNOWN = "Unknown"
}

export enum MaritalStatus {
  SINGLE = "Single",
  MARRIED = "Married",
  DIVORCED = "Divorced",
  WIDOWED = "Widowed"
}

export enum JobType {
  GOVERNMENT = "Government",
  BUSINESS = "Business",
  PRIVATE = "Private Job",
  RETIRED = "Retired",
  STUDENT = "Student",
  HOMEMAKER = "Homemaker",
  AGRICULTURE = "Agriculture",
  UNEMPLOYED = "Unemployed"
}

export type AppView = 'login' | 'register' | 'admin-login' | 'user-app' | 'admin-app';

export interface Member {
  id: string;
  familyId: string;
  password?: string;
  fullName: string;
  firstName?: string;
  fatherHusbandName?: string;
  dob?: string;
  age: number;
  gender: 'Male' | 'Female';
  villageId: string;
  currentCity: string;
  currentAddress?: string;
  bloodGroup: BloodGroup;
  mobile: string;
  occupation: string;
  jobType: JobType; 
  maritalStatus: MaritalStatus;
  headOfHousehold: boolean;
  avatarUrl?: string;
  relationToHead?: string;
  // Background details
  fatherName?: string;
  motherName?: string;
  totalSiblings?: string;
  landOwnership?: string;
  permanentAddress?: string;
  maternalUncleSurname?: string;
  maternalUncleName?: string;
  maternalUncleVillage?: string;
  // Professional details
  companyName?: string;
  jobLocation?: string;
}

export interface Village {
  id: string;
  name: string;
  nameGujarati?: string;
  district: string;
  villageCode?: string;
  coordinatorContact: string;
}

export interface Business {
  id: string;
  ownerId: string;
  type?: 'Business' | 'Job' | 'FARMING' | 'RETIRED';
  location: string;
  city?: string;
  description?: string;
  contactNumber?: string;
  contactPerson?: string;
  businessName: string;
  category: string;
  gstNumber?: string;
  businessDuration?: string;
  jobStatus?: 'Government' | 'Private';
}

export interface MatrimonialProfile {
  id: string;
  memberId: string;
  height: string;
  weight?: string;
  education: string;
  annualIncome: string;
  expectations: string;
  hobbies: string[];
  images: string[];
}

export interface SocialScheme {
  id: string;
  title: string;
  description: string;
  eligibility: string;
  contactPerson: string;
  amount?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  amount: string;
  eventOrScheme: string;
  contactNumber: string;
  date: string;
}

export interface ZoneMinister {
  id: string;
  memberId: string;
  zoneName: string; 
  role: string; 
  currentCity?: string;
}

export interface GetTogetherConfig {
  isEnabled: boolean;
  villageName: string;
  date: string;
  time: string;
}

/**
 * Added missing Event interface to resolve import errors in mockData.ts
 */
export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}
