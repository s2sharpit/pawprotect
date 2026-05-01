export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
}
