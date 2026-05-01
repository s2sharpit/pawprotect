package com.org.petGuard.domain.dashboard;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.org.petGuard.domain.claim.ClaimRepository;
import com.org.petGuard.domain.pet.PetRepository;
import com.org.petGuard.domain.policy.PolicyRepository;
import com.org.petGuard.domain.user.UserRepository;

import java.time.LocalDateTime;

import com.org.petGuard.domain.claim.Claim;

@Service
@RequiredArgsConstructor
public class DashboardService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PetRepository petRepository;
    @Autowired
    private PolicyRepository policyRepository;
    @Autowired
    private ClaimRepository claimRepository;

    public DashboardStats getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfWeek = now.minusDays(7);
        LocalDateTime startOfMonth = now.minusDays(30);

        long totalUsers = userRepository.count();
        long totalPets = petRepository.count();
        long activePolicies = policyRepository.countActivePolicies();

        long claimsToday = claimRepository.countClaimsSince(startOfDay);
        long claimsThisWeek = claimRepository.countClaimsSince(startOfWeek);
        long claimsThisMonth = claimRepository.countClaimsSince(startOfMonth);

        long approvedCount = claimRepository.countApprovedClaims();
        long totalProcessed = claimRepository.countProcessedClaims();
        Double approvalRate = totalProcessed > 0 ? (approvedCount * 100.0 / totalProcessed) : 0.0;
        Double avgProcessingTimeSeconds = claimRepository.getAverageProcessingTimeInSeconds();
        Double avgProcessingTimeHours = avgProcessingTimeSeconds != null
                ? avgProcessingTimeSeconds / 3600.0
                : null;

        long pendingClaims = claimRepository.countByStatus(Claim.ClaimStatus.PENDING);
        long processingClaims = claimRepository.countByStatus(Claim.ClaimStatus.PROCESSING);
        long rejectedClaims = claimRepository.countByStatus(Claim.ClaimStatus.REJECTED);
        // approvedCount is already calculated above as approvedClaims

        return DashboardStats.builder()
                .totalUsers(totalUsers)
                .totalPets(totalPets)
                .activePolicies(activePolicies)
                .claimsToday(claimsToday)
                .claimsThisWeek(claimsThisWeek)
                .claimsThisMonth(claimsThisMonth)
                .approvalRate(approvalRate)
                .averageProcessingTimeHours(avgProcessingTimeHours)
                .pendingClaims(pendingClaims)
                .processingClaims(processingClaims)
                .approvedClaims(approvedCount)
                .rejectedClaims(rejectedClaims)
                .build();
    }

    public com.org.petGuard.domain.dashboard.UserDashboardStats getUserDashboardStats(Long userId) {
        long totalPets = petRepository.findByUserId(userId).size();

        java.util.List<com.org.petGuard.domain.policy.Policy> userPolicies = policyRepository.findByPetUserId(userId);
        long activePolicies = userPolicies.stream()
                .filter(p -> p.getStatus() == com.org.petGuard.domain.policy.Policy.PolicyStatus.ACTIVE).count();

        java.util.List<Claim> userClaims = claimRepository.findByPolicyPetUserId(userId);
        long totalClaims = userClaims.size();

        long approvedCount = userClaims.stream().filter(c -> c.getStatus() == Claim.ClaimStatus.APPROVED).count();
        long processedCount = userClaims.stream().filter(
                c -> c.getStatus() != Claim.ClaimStatus.PROCESSING && c.getStatus() != Claim.ClaimStatus.PENDING)
                .count();

        Double approvalRate = processedCount > 0 ? (approvedCount * 100.0 / processedCount) : 0.0;

        java.util.List<com.org.petGuard.domain.dashboard.ActivityItem> recentActivity = new java.util.ArrayList<>();

        userClaims.stream()
                .sorted(java.util.Comparator.comparing(Claim::getCreatedAt).reversed())
                .limit(3)
                .forEach(c -> {
                    String icon = c.getStatus() == Claim.ClaimStatus.APPROVED ? "✅"
                            : (c.getStatus() == Claim.ClaimStatus.REJECTED ? "❌" : "📄");
                    String desc = c.getStatus() == Claim.ClaimStatus.APPROVED
                            ? "Claim approved for $" + c.getApprovedAmount()
                            : "Claim is " + c.getStatus().name().toLowerCase();
                    recentActivity.add(com.org.petGuard.domain.dashboard.ActivityItem.builder()
                            .icon(icon)
                            .title("Claim " + c.getStatus().name())
                            .description(desc)
                            .timestamp(c.getCreatedAt() != null ? c.getCreatedAt().toString() : "")
                            .build());
                });

        petRepository.findByUserId(userId).stream()
                .sorted(java.util.Comparator.comparing(com.org.petGuard.domain.pet.Pet::getCreatedAt).reversed())
                .limit(2)
                .forEach(p -> {
                    recentActivity.add(com.org.petGuard.domain.dashboard.ActivityItem.builder()
                            .icon("🐕")
                            .title("Pet Added")
                            .description(p.getName() + " was successfully added")
                            .timestamp(p.getCreatedAt() != null ? p.getCreatedAt().toString() : "")
                            .build());
                });

        recentActivity.sort(java.util.Comparator.comparing(com.org.petGuard.domain.dashboard.ActivityItem::getTimestamp)
                .reversed());
        java.util.List<com.org.petGuard.domain.dashboard.ActivityItem> finalActivity = recentActivity;
        if (recentActivity.size() > 4) {
            finalActivity = recentActivity.subList(0, 4);
        }

        return com.org.petGuard.domain.dashboard.UserDashboardStats.builder()
                .totalPets(totalPets)
                .activePolicies(activePolicies)
                .totalClaims(totalClaims)
                .approvalRate(approvalRate)
                .recentActivity(finalActivity)
                .build();
    }
}
