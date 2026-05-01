export interface Pet {
  id: number;
  userId: number;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  medicalSummary?: string;
  preExistingConditions?: string[];
  eligibilityStatus: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'PENDING';
  eligibilityReason?: string;
  eligibilityCheckedAt?: Date;
  createdAt: Date;
}
