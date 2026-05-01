import { Policy } from './policy.model';

export interface Claim {
  id: number;
  policyId: number;
  petName: string;
  treatmentDate: Date;
  vetClinicName: string;
  diagnosis: string;
  treatmentType: string;
  medications?: string;
  claimAmount: number;
  approvedAmount?: number;
  deductibleApplied?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING';
  decisionReason?: string;
  reviewedBy?: number;
  reviewedAt?: Date;
  createdAt: Date;
  policy?: Policy;
}
