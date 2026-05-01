import { Pet } from './pet.model';
import { InsurancePlan } from './insurance-plan.model';

export interface Policy {
  id: number;
  petId: number;
  planId: number;
  planName: string;
  petName: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  pet?: Pet;
  plan?: InsurancePlan;
}
