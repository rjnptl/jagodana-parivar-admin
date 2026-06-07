
import { Member, Village, Business, MatrimonialProfile, SocialScheme, BloodGroup, MaritalStatus, Event, Sponsor, ZoneMinister, JobType } from '../types';

export const VILLAGES: Village[] = [
  { id: 'v1', name: 'ઉમિયાનગર', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v2', name: 'કચોલીયા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v3', name: 'કલ્યાણપુરા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v4', name: 'ઘેલડા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v5', name: 'ચણોઠીયા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v6', name: 'જાદવપુરા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v7', name: 'જેઠીપુરા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v8', name: 'જેસીંગપુરા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v9', name: 'થળા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v10', name: 'ધરમપુર', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v11', name: 'નાના ગોરૈયા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v12', name: 'નાના હરીપુરા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v13', name: 'પીપળી', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v14', name: 'બજાણા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v15', name: 'ભડાણા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v16', name: 'મદ્રીસણા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v17', name: 'માંડવધાર', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v18', name: 'માનગઢ', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v19', name: 'માલવણ', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v20', name: 'મોટા ખીજડીયા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v21', name: 'મોટા ગોરૈયા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v22', name: 'યશવંતપુરા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v23', name: 'રણછોડપુરા', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v24', name: 'રામનગર', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v25', name: 'લખતર', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v26', name: 'લીલાપુર', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v27', name: 'સજ્જનપુર', district: 'Surendranagar', coordinatorContact: '' },
  { id: 'v28', name: 'સિધ્ધસર', district: 'Surendranagar', coordinatorContact: '' },
];

export const MEMBERS: Member[] = [
  // Family 1
  { id: 'm1', familyId: 'fam_1', password: '123', fullName: 'Ramesh Jagodana', age: 55, gender: 'Male', villageId: 'v1', currentCity: 'Surat', bloodGroup: BloodGroup.O_POS, mobile: '9876543210', occupation: 'Farming', jobType: JobType.AGRICULTURE, maritalStatus: MaritalStatus.MARRIED, headOfHousehold: true, relationToHead: 'Self' },
  { id: 'm5', familyId: 'fam_1', password: '123', fullName: 'Savita Jagodana', age: 50, gender: 'Female', villageId: 'v1', currentCity: 'Surat', bloodGroup: BloodGroup.AB_POS, mobile: '9876543214', occupation: 'Teacher', jobType: JobType.GOVERNMENT, maritalStatus: MaritalStatus.MARRIED, headOfHousehold: false, relationToHead: 'Wife' },
  
  // Family 2
  { id: 'm2', familyId: 'fam_2', password: '123', fullName: 'Suresh Jagodana', age: 45, gender: 'Male', villageId: 'v2', currentCity: 'Ahmedabad', bloodGroup: BloodGroup.A_POS, mobile: '9876543211', occupation: 'Textile Trading', jobType: JobType.BUSINESS, maritalStatus: MaritalStatus.MARRIED, headOfHousehold: true, relationToHead: 'Self' },
  { id: 'm3', familyId: 'fam_2', password: '123', fullName: 'Priya Jagodana', age: 24, gender: 'Female', villageId: 'v2', currentCity: 'Bangalore', bloodGroup: BloodGroup.B_POS, mobile: '9876543212', occupation: 'Software Engineer', jobType: JobType.PRIVATE, maritalStatus: MaritalStatus.SINGLE, headOfHousehold: false, relationToHead: 'Daughter' },
  
  // Single Members
  { id: 'm4', familyId: 'fam_3', password: '123', fullName: 'Amit Jagodana', age: 28, gender: 'Male', villageId: 'v3', currentCity: 'Mumbai', bloodGroup: BloodGroup.O_NEG, mobile: '9876543213', occupation: 'Medical Officer', jobType: JobType.GOVERNMENT, maritalStatus: MaritalStatus.SINGLE, headOfHousehold: true, relationToHead: 'Self' },
  { id: 'm6', familyId: 'fam_4', password: '123', fullName: 'Rahul Jagodana', age: 30, gender: 'Male', villageId: 'v4', currentCity: 'Barwala', bloodGroup: BloodGroup.A_NEG, mobile: '9876543215', occupation: 'Contractor', jobType: JobType.BUSINESS, maritalStatus: MaritalStatus.MARRIED, headOfHousehold: true, relationToHead: 'Self' },
  { id: 'm7', familyId: 'fam_5', password: '123', fullName: 'Kiran Jagodana', age: 60, gender: 'Male', villageId: 'v14', currentCity: 'Bajana', bloodGroup: BloodGroup.B_POS, mobile: '9876543216', occupation: 'Retiree', jobType: JobType.RETIRED, maritalStatus: MaritalStatus.MARRIED, headOfHousehold: true, relationToHead: 'Self' },
  { id: 'm8', familyId: 'fam_5', password: '123', fullName: 'Meena Jagodana', age: 55, gender: 'Female', villageId: 'v14', currentCity: 'Bajana', bloodGroup: BloodGroup.O_POS, mobile: '9876543217', occupation: 'Homemaker', jobType: JobType.HOMEMAKER, maritalStatus: MaritalStatus.MARRIED, headOfHousehold: false, relationToHead: 'Wife' },
];

export const BUSINESSES: Business[] = [
  { id: 'b1', ownerId: 'm2', type: 'Business', businessName: 'Jagodana Textiles', category: 'Retail', description: 'Wholesale and retail sarees and dress materials.', location: 'Ahmedabad', city: 'Ahmedabad', contactNumber: '9876543211' },
  { id: 'b2', ownerId: 'm4', type: 'Business', businessName: 'Sanjeevani Clinic', category: 'Healthcare', description: 'General physician and emergency care.', location: 'Mumbai', city: 'Mumbai', contactNumber: '9876543213' },
  { id: 'b3', ownerId: 'm6', type: 'Business', businessName: 'BuildWell Constructions', category: 'Construction', description: 'Residential and commercial contractors.', location: 'Barwala', city: 'Barwala', contactNumber: '9876543215' },
];

export const MATRIMONIALS: MatrimonialProfile[] = [
  { id: 'mat1', memberId: 'm3', height: "5'4\"", education: 'B.Tech CS', annualIncome: '12 LPA', expectations: 'Looking for a well-educated partner working in IT or Management.', hobbies: ['Reading', 'Traveling'], images: [] },
  { id: 'mat2', memberId: 'm4', height: "5'10\"", education: 'MBBS, MD', annualIncome: '25 LPA', expectations: 'Looking for a doctor or medical professional.', hobbies: ['Cricket', 'Music'], images: [] },
];

export const SCHEMES: SocialScheme[] = [
  { id: 's1', title: 'Education Scholarship 2024', description: 'Financial aid for students scoring above 80% in 12th grade.', eligibility: 'Must be a student from the family.', contactPerson: 'Ramesh Jagodana', amount: '₹15,000' },
  { id: 's2', title: 'Medical Emergency Fund', description: 'Interest-free loan for major surgeries.', eligibility: 'Family members with income < 3LPA.', contactPerson: 'Suresh Jagodana', amount: 'Up to ₹1,00,000' },
];

export const SPONSORS: Sponsor[] = [
  { id: 'sp1', name: 'Kishor Bhai Jagodana', amount: '₹51,000', eventOrScheme: 'Annual Get-Together 2024', contactNumber: '9988776655', date: '2024-01-10' },
  { id: 'sp2', name: 'Jagodana Textiles Group', amount: '₹1,00,000', eventOrScheme: 'Education Scholarship Fund', contactNumber: '9876543211', date: '2024-03-15' },
];

export const ZONE_MINISTERS: ZoneMinister[] = [
  { id: 'zm1', memberId: 'm1', zoneName: 'ઉમિયાનગર Zone', role: 'President' },
  { id: 'zm2', memberId: 'm2', zoneName: 'કચોલીયા Zone', role: 'Secretary' },
];

export const EVENTS: Event[] = [
  { id: 'e1', title: 'Annual Jagodana Family Get-Together 2024', date: '2024-11-15', location: 'લખતર', description: 'Join us for a day of celebration, food, and bonding.' },
];
