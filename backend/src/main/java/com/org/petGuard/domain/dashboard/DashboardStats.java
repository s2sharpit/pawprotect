package com.org.petGuard.domain.dashboard;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
public class DashboardStats {
    private long totalUsers;
    private long totalPets;
    private long activePolicies;
    private long claimsToday;
    private long claimsThisWeek;
    private long claimsThisMonth;
    private Double approvalRate;
    private Double averageProcessingTimeHours;
    private long pendingClaims;
    private long processingClaims;
    private long approvedClaims;
    private long rejectedClaims;
}
