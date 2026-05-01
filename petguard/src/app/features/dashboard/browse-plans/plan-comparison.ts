import { Component, input, computed } from '@angular/core';
import { InsurancePlan } from '@core/models/models';

@Component({
  selector: 'app-plan-comparison',
  standalone: true,
  template: `
    <div class="bg-white rounded-2xl shadow-lg p-8">
      <h3 class="text-2xl font-bold text-gray-800 mb-6">Compare Plans</h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-gray-200">
              <th class="text-left py-4 px-4">Feature</th>
              @for (plan of plans(); track plan.id) {
              <th class="text-center py-4 px-4">
                {{ plan.name }}
              </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (feature of comparisonFeatures(); track feature.name) {
            <tr class="border-b border-gray-100">
              <td class="py-4 px-4 font-semibold text-gray-700">{{ feature.name }}</td>
              @for (value of feature.values; let i = $index; track i) {
              <td class="py-4 px-4 text-center">
                @if (value === true) {
                <span class="text-green-500 text-xl">✓</span>
                } @if (value === false) {
                <span class="text-gray-300 text-xl">✗</span>
                } @if (value !== true && value !== false) {
                <span>{{ value }}</span>
                }
              </td>
              }
            </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class PlanComparison {
  plans = input.required<InsurancePlan[]>();

  comparisonFeatures = computed(() => {
    const defaultPlans = this.plans();
    if (!defaultPlans || defaultPlans.length === 0) return [];

    const currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });

    const features: { name: string; values: any[] }[] = [];

    // Base attributes manually extracted
    features.push({
      name: 'Annual Coverage',
      values: defaultPlans.map(p => p.coverageLimit ? currencyFormatter.format(p.coverageLimit) : 'Unlimited')
    });
    
    features.push({
      name: 'Deductible',
      values: defaultPlans.map(p => p.deductible ? currencyFormatter.format(p.deductible) : '$0')
    });

    // Dynamic attributes extracted from coverageDetails dictionary (assumes homogenous keys or merges them)
    const allDetailKeys = new Set<string>();
    defaultPlans.forEach(plan => {
      if (plan.coverageDetails) {
        Object.keys(plan.coverageDetails).forEach(key => allDetailKeys.add(key));
      }
    });

    Array.from(allDetailKeys).forEach(key => {
      features.push({
        name: key,
        values: defaultPlans.map(p => 
          (p.coverageDetails && p.coverageDetails[key] !== undefined) ? p.coverageDetails[key] : false
        )
      });
    });

    return features;
  });
}
