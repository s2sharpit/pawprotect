package com.org.petGuard.domain.claim;

import com.org.petGuard.domain.ai.AIService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.org.petGuard.domain.policy.Policy;
import com.org.petGuard.domain.user.User;
import com.org.petGuard.domain.policy.PolicyRepository;
import com.org.petGuard.domain.user.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimService {

    @Autowired
    private ClaimRepository claimRepository;
    @Autowired
    private PolicyRepository policyRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AIService aiService;

    @Transactional
    public ClaimResponse submitClaim(Long userId, Long policyId, MultipartFile receipt) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        if (!policy.getPet().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to policy");
        }

        if (policy.getStatus() != Policy.PolicyStatus.ACTIVE) {
            throw new RuntimeException("Policy is not active");
        }

        Claim claim = Claim.builder()
                .policy(policy)
                .status(Claim.ClaimStatus.PROCESSING)
                .build();

        claim = claimRepository.save(claim);

        // Process receipt with AI
        if (receipt != null && !receipt.isEmpty()) {
            try {
                aiService.processClaimReceiptAsync(claim.getId(), receipt);
            } catch (Exception e) {
                System.err.println("OCR processing failed: " + e.getMessage());
            }
        }

        return mapToResponse(claim);
    }

    public List<ClaimResponse> getUserClaims(Long userId) {
        return claimRepository.findByPolicyPetUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ClaimResponse> getClaimsByStatus(String status) {
        if (status == null || status.equalsIgnoreCase("ALL")) {
            return claimRepository.findAll().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        Claim.ClaimStatus claimStatus = Claim.ClaimStatus.valueOf(status.toUpperCase());
        return claimRepository.findByStatus(claimStatus).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ClaimResponse getClaimById(Long claimId, Long userId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        if (!claim.getPolicy().getPet().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to claim");
        }

        return mapToResponse(claim);
    }

    @Transactional
    public ClaimResponse reviewClaim(Long claimId, Long adminId, ClaimDecisionRequest decision) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        Claim.ClaimStatus status = Claim.ClaimStatus.valueOf(decision.getStatus().toUpperCase());

        claim.setStatus(status);
        claim.setApprovedAmount(decision.getApprovedAmount());
        claim.setDecisionReason(decision.getDecisionReason());
        claim.setReviewedBy(admin);
        claim.setReviewedAt(LocalDateTime.now());

        // Calculate deductible if approved
        if (status == Claim.ClaimStatus.APPROVED) {
            claim.setDeductibleApplied(claim.getPolicy().getPlan().getDeductible());
        }

        claim = claimRepository.save(claim);
        return mapToResponse(claim);
    }

    private ClaimResponse mapToResponse(Claim claim) {
        return ClaimResponse.builder()
                .id(claim.getId())
                .policyId(claim.getPolicy().getId())
                .petName(claim.getPolicy().getPet().getName())
                .treatmentDate(claim.getTreatmentDate())
                .vetClinicName(claim.getVetClinicName())
                .diagnosis(claim.getDiagnosis())
                .treatmentType(claim.getTreatmentType())
                .medications(claim.getMedications())
                .claimAmount(claim.getClaimAmount())
                .approvedAmount(claim.getApprovedAmount())
                .deductibleApplied(claim.getDeductibleApplied())
                .status(claim.getStatus().name())
                .decisionReason(claim.getDecisionReason())
                .reviewedBy(claim.getReviewedBy() != null ? claim.getReviewedBy().getId() : null)
                .reviewedByName(claim.getReviewedBy() != null ? claim.getReviewedBy().getFullName() : null)
                .reviewedAt(claim.getReviewedAt())
                .createdAt(claim.getCreatedAt())
                .build();
    }
}
