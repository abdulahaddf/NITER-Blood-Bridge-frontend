// Blood Groups
export type BloodGroup = 
  | 'A_POS' | 'A_NEG' 
  | 'B_POS' | 'B_NEG' 
  | 'AB_POS' | 'AB_NEG' 
  | 'O_POS' | 'O_NEG';

export const BloodGroupLabels: Record<BloodGroup, string> = {
  A_POS: 'A+',
  A_NEG: 'A-',
  B_POS: 'B+',
  B_NEG: 'B-',
  AB_POS: 'AB+',
  AB_NEG: 'AB-',
  O_POS: 'O+',
  O_NEG: 'O-',
};

// Departments
export type Department = 'TE' | 'IP' | 'EE' | 'CS' | 'FD';

export const DepartmentLabels: Record<Department, string> = {
  TE: 'Textile Engineering',
  IP: 'Industrial & Production Engineering',
  EE: 'Electrical Engineering',
  CS: 'Computer Science & Engineering',
  FD: 'Fashion Design',
};

// Availability Status
export type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'INACTIVE';

export const AvailabilityStatusLabels: Record<AvailabilityStatus, string> = {
  AVAILABLE: 'Available',
  UNAVAILABLE: 'Unavailable',
  INACTIVE: 'Inactive',
};

// User Roles
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

// Deletion Status
export type DeletionStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';

// Notification Types
export type NotificationType = 
  | 'ELIGIBILITY_RESTORED' 
  | 'BLOOD_REQUEST' 
  | 'BROADCAST' 
  | 'CONTACT_REVEALED' 
  | 'PROFILE_VERIFIED' 
  | 'DELETION_UPDATE';

// Eligibility Status
export type EligibilityStatus = 'ELIGIBLE' | 'UNCONFIRMED' | 'NOT_YET' | 'OPTED_OUT';

export interface EligibilityResult {
  status: EligibilityStatus;
  label: string;
  eligible: boolean;
  daysRemaining?: number;
}

// User
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  profile?: DonorProfile;
}

// Donor Profile
export interface DonorProfile {
  id: string;
  userId: string;
  fullName: string;
  department?: Department | null;
  idNumber?: string | null;
  studentId: string;
  batch?: number | null;
  phone: string;
  email: string;
  currentLocation: string;
  hometown: string;
  bloodGroup: BloodGroup;
  lastDonationDate?: Date;
  totalDonations: number;
  availabilityStatus: AvailabilityStatus;
  availabilityNote?: string;
  willingToDonate: boolean;
  seedMatched: boolean;
  seedMatchedAt?: Date;
  profileComplete: boolean;
  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
  donationHistory: DonationLog[];
}

// Donation Log
export interface DonationLog {
  id: string;
  profileId: string;
  donationDate: Date;
  location: string;
  notes?: string;
  verified: boolean;
  verifiedBy?: string;
  createdAt: Date;
}

// Seed Donor
export interface SeedDonor {
  id: string;
  studentId: string;
  fullName: string;
  bloodGroup: BloodGroup;
  hometown?: string;
  phone?: string;
  isClaimed: boolean;
  claimedAt?: Date;
  importedAt: Date;
}

// Deletion Request
export interface DeletionRequest {
  id: string;
  userId: string;
  profileId: string;
  seedMatched: boolean;
  status: DeletionStatus;
  adminNote?: string;
  requestedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

// Contact Reveal
export interface ContactReveal {
  id: string;
  requesterId: string;
  requesterName: string;
  donorId: string;
  revealedAt: Date;
  purpose?: string;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

// Blood Request
export interface BloodRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  bloodGroup: BloodGroup;
  urgency: 'routine' | 'urgent' | 'critical';
  location: string;
  hospital?: string;
  neededBy?: Date;
  message?: string;
  contactPhone: string;
  status: 'open' | 'matched' | 'fulfilled' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Admin Audit Log
export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetUserId?: string;
  targetUserName?: string;
  details?: string;
  createdAt: Date;
}

// Search Filters
export interface DonorSearchFilters {
  bloodGroups: BloodGroup[];
  compatibilityMode: boolean;
  eligibilityOnly: boolean;
  departments: Department[];
  batchRange: [number, number];
  onCampusOnly: boolean;
  willingToDonate: boolean;
  searchQuery: string;
  sortBy: 'eligible' | 'donations' | 'recent' | 'batch';
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface PasswordResetData {
  email: string;
}

// Form Types
export interface ProfileFormData {
  fullName: string;
  department: Department;
  idNumber: string;
  batch: number;
  phone: string;
  email: string;
  currentLocation: string;
  hometown: string;
  bloodGroup: BloodGroup;
  lastDonationDate?: Date;
  neverDonated: boolean;
  willingToDonate: boolean;
  availabilityNote?: string;
}

export interface DonationFormData {
  donationDate: Date;
  location: string;
  notes?: string;
}

export interface BloodRequestFormData {
  bloodGroup: BloodGroup;
  urgency: 'routine' | 'urgent' | 'critical';
  location: string;
  hospital?: string;
  neededBy?: Date;
  contactPhone: string;
  message?: string;
}

// Stats Types
export interface DashboardStats {
  totalUsers: number;
  verifiedProfiles: number;
  eligibleDonors: number;
  pendingDeletions: number;
  openBloodRequests: number;
}

export interface BloodGroupStats {
  bloodGroup: BloodGroup;
  count: number;
  eligibleCount: number;
}

// Compatibility Matrix
export const BloodCompatibility: Record<BloodGroup, BloodGroup[]> = {
  A_POS: ['A_POS', 'A_NEG', 'O_POS', 'O_NEG'],
  A_NEG: ['A_NEG', 'O_NEG'],
  B_POS: ['B_POS', 'B_NEG', 'O_POS', 'O_NEG'],
  B_NEG: ['B_NEG', 'O_NEG'],
  AB_POS: ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'],
  AB_NEG: ['A_NEG', 'B_NEG', 'AB_NEG', 'O_NEG'],
  O_POS: ['O_POS', 'O_NEG'],
  O_NEG: ['O_NEG'],
};

// Utility Functions
export function calculateEligibility(profile: DonorProfile): EligibilityResult {
  if (!profile.willingToDonate) {
    return { status: 'OPTED_OUT', label: 'Not accepting requests', eligible: false };
  }
  
  if (!profile.lastDonationDate) {
    return { status: 'UNCONFIRMED', label: 'First-time or unconfirmed donor', eligible: true };
  }
  
  const ELIGIBILITY_DAYS = 90;
  const daysSince = Math.floor((new Date().getTime() - new Date(profile.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSince >= ELIGIBILITY_DAYS) {
    return { status: 'ELIGIBLE', label: 'Eligible to donate', eligible: true };
  }
  
  const daysRemaining = ELIGIBILITY_DAYS - daysSince;
  return {
    status: 'NOT_YET',
    label: `Eligible in ${daysRemaining} days`,
    eligible: false,
    daysRemaining
  };
}

export function getBatchLabel(batch: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const suffix = batch % 100 >= 11 && batch % 100 <= 13 ? 'th' : suffixes[batch % 10] || 'th';
  return `${batch}${suffix} Batch`;
}

export function formatStudentId(department: Department, idNumber: string): string {
  return `${department}-${idNumber}`;
}

export function parseStudentId(studentId: string): { department: Department; idNumber: string } | null {
  const parts = studentId.split('-');
  if (parts.length !== 2) return null;
  const department = parts[0] as Department;
  if (!DepartmentLabels[department]) return null;
  return { department, idNumber: parts[1] };
}
