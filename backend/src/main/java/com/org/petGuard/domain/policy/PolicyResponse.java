package com.org.petGuard.domain.policy;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
public class PolicyResponse {
    private Long id;
    private Long petId;
    private String petName;
    private Long planId;
    private String planName;
    private String status;
    private java.time.LocalDate startDate;
    private java.time.LocalDate endDate;
    private java.math.BigDecimal monthlyPremium;
    private java.time.LocalDateTime createdAt;
}
