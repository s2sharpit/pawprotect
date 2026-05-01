package com.org.petGuard.domain.policy;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.org.petGuard.domain.insurance.InsurancePlan;
import com.org.petGuard.domain.pet.Pet;
import com.org.petGuard.domain.insurance.InsurancePlanRepository;
import com.org.petGuard.domain.pet.PetRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PolicyService {

    @Autowired
    private PolicyRepository policyRepository;
    @Autowired
    private PetRepository petRepository;
    @Autowired
    private InsurancePlanRepository planRepository;

    @Transactional
    public PolicyResponse createPolicy(Long userId, PolicyRequest request) {
        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!pet.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to pet");
        }

        if (pet.getEligibilityStatus() != Pet.EligibilityStatus.ELIGIBLE) {
            throw new RuntimeException("Pet is not eligible for insurance");
        }

        InsurancePlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        if (!plan.getIsActive()) {
            throw new RuntimeException("Plan is not active");
        }

        // Check for existing active policy for the same pet
        boolean hasActivePolicy = policyRepository.existsByPetIdAndStatus(pet.getId(), Policy.PolicyStatus.ACTIVE);
        if (hasActivePolicy) {
            throw new RuntimeException("Pet already has an active policy. Please cancel the current policy before subscribing to a new one.");
        }

        Policy policy = Policy.builder()
                .pet(pet)
                .plan(plan)
                .status(Policy.PolicyStatus.ACTIVE)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusYears(1))
                .build();

        policy = policyRepository.save(policy);
        return mapToResponse(policy);
    }

    public List<PolicyResponse> getUserPolicies(Long userId) {

        return policyRepository.findByPetUserId(userId).stream()
                .map(policy -> {
                    PolicyResponse response = mapToResponse(policy);
                    response.setPetName(policy.getPet().getName());
                    response.setPlanName(policy.getPlan().getName());
                    return response;
                })
                .collect(Collectors.toList());
    }

    public PolicyResponse getPolicyById(Long policyId, Long userId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        if (!policy.getPet().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to policy");
        }

        return mapToResponse(policy);
    }

    @Transactional
    public void cancelPolicy(Long policyId, Long userId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        if (!policy.getPet().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to policy");
        }

        policy.setStatus(Policy.PolicyStatus.CANCELLED);
        policyRepository.save(policy);
    }

    private PolicyResponse mapToResponse(Policy policy) {
        return PolicyResponse.builder()
                .id(policy.getId())
                .petId(policy.getPet().getId())
                .petName(policy.getPet().getName())
                .planId(policy.getPlan().getId())
                .planName(policy.getPlan().getName())
                .status(policy.getStatus().name())
                .startDate(policy.getStartDate())
                .endDate(policy.getEndDate())
                .monthlyPremium(policy.getPlan().getMonthlyPremium())
                .createdAt(policy.getCreatedAt())
                .build();
    }
}
