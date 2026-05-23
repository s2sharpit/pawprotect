export interface UserPolicy {
  id: number;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface UserPet {
  id: number;
  name: string;
  species: string;
  breed: string;
  eligibilityStatus?: string;
  policies?: UserPolicy[];
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  pets?: UserPet[];
}
