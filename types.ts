
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

export interface BloodGroupOption {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Member {
  id: string;
  familyId: string;
  passcode?: string;
  fullName: string;
  firstName?: string;
  middleName?: string;
  fatherHusbandName?: string;
  dob?: string;
  age: number;
  gender: 'Male' | 'Female';
  villageId: string;
  currentCity: string;
  currentAddress?: string;
  bloodGroupId?: string | null;
  bloodGroup?: BloodGroupOption | null;
  mobile: string;
  occupation: string;
  jobType: JobType; 
  maritalStatus: MaritalStatus;
  headOfHousehold: boolean;
  isFamilyHead?: boolean;
  hasMobileLogin?: boolean;
  mobileVerified?: boolean;
  isActiveUser?: boolean;
  addedByMemberId?: string;
  avatarUrl?: string;
  relationToHead?: string;
  relationWithHead?: string;
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
  eligibilityCriteria: string;
  contactPersonName: string;
  isActive: boolean;
}

export type SponsorType = 'lifetime' | 'one-time';

export interface Sponsor {
  id: string;
  sponsorMemberId: string;
  sponsorName: string;
  familyCode?: string;
  villageId: string;
  villageName?: string;
  schemeId?: string | null;
  schemeTitle?: string;
  eventName: string;
  amount: string;
  contactNumber: string;
  sponsorshipDate: string;
  sponsorType: SponsorType;
  isVisibleOnMemberUI: boolean;
}

export interface ZoneMinister {
  id: string;
  villageId: string;
  villageName?: string;
  villageNameGujarati?: string;
  villageCode?: string;
  memberId: string;
  memberName?: string;
  familyCode?: string;
  mobileNumber?: string;
  currentCity?: string;
  role?: string;
}

export interface GetTogetherConfig {
  id?: string;
  isEnabled: boolean;
  isVisible?: boolean;
  villageName: string;
  villageLocation?: string;
  date: string;
  eventDate?: string;
  time: string;
  eventTime?: string;
  title?: string;
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}
