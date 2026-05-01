package com.org.petGuard.domain.insurance;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsurancePlanService {

    @Autowired
    private InsurancePlanRepository planRepository;

    public List<InsurancePlanResponse> getPopularPlans() {
        return planRepository.findByIsPopularTrueAndIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<InsurancePlanResponse> getAllActivePlans() {
        return planRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<InsurancePlanResponse> getAllPlans() {
        return planRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public InsurancePlanResponse getPlanById(Long id) {
        InsurancePlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        return mapToResponse(plan);
    }

    @Transactional
    public InsurancePlanResponse createPlan(InsurancePlanRequest request) {
        InsurancePlan plan = InsurancePlan.builder()
                .name(request.getName())
                .description(request.getDescription())
                .monthlyPremium(request.getMonthlyPremium())
                .coverageLimit(request.getCoverageLimit())
                .deductible(request.getDeductible())
                .isActive(request.getIsActive())
                .coverageDetails(request.getCoverageDetails())
                .build();

        plan = planRepository.save(plan);
        return mapToResponse(plan);
    }

    @Transactional
    public InsurancePlanResponse updatePlan(Long id, InsurancePlanRequest request) {
        InsurancePlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setMonthlyPremium(request.getMonthlyPremium());
        plan.setCoverageLimit(request.getCoverageLimit());
        plan.setDeductible(request.getDeductible());
        plan.setCoverageDetails(request.getCoverageDetails());

        plan = planRepository.save(plan);
        return mapToResponse(plan);
    }

    @Transactional
    public InsurancePlanResponse togglePopularStatus(Long id) {
        InsurancePlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        plan.setIsPopular(plan.getIsPopular() == null ? true : !plan.getIsPopular());
        plan = planRepository.save(plan);
        return mapToResponse(plan);
    }

    @Transactional
    public void togglePlanStatus(Long id) {
        InsurancePlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        plan.setIsActive(!plan.getIsActive());
        planRepository.save(plan);
    }

    private InsurancePlanResponse mapToResponse(InsurancePlan plan) {
        return InsurancePlanResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .monthlyPremium(plan.getMonthlyPremium())
                .coverageLimit(plan.getCoverageLimit())
                .deductible(plan.getDeductible())
                .isPopular(plan.getIsPopular())
                .coverageDetails(plan.getCoverageDetails())
                .isActive(plan.getIsActive())
                .createdAt(plan.getCreatedAt())
                .build();
    }
}
