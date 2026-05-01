package com.org.petGuard.domain.dashboard;

import lombok.*;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDashboardStats {
    private long totalPets;
    private long activePolicies;
    private long totalClaims;
    private Double approvalRate;
    private List<ActivityItem> recentActivity;
}
