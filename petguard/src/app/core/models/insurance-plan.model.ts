export interface InsurancePlan {
  id: number;
  name: string;
  description: string;
  monthlyPremium: number;
  coverageLimit: number;
  deductible: number;
  isPopular: boolean;
  coverageDetails: any;
  isActive: boolean;
  createdAt: Date;
}
