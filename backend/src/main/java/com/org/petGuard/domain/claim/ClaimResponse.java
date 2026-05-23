package com.org.petGuard.domain.claim;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
public class ClaimResponse {
    private Long id;
    private Long policyId;
    private String petName;
    private java.time.LocalDate treatmentDate;
    private String vetClinicName;
    private String diagnosis;
    private String treatmentType;
    private String medications;
    private java.math.BigDecimal claimAmount;
    private java.math.BigDecimal approvedAmount;
    private java.math.BigDecimal deductibleApplied;
    private String status;
    private String decisionReason;
    private Long reviewedBy;
    private String reviewedByName;
    private java.time.LocalDateTime reviewedAt;
    private java.time.LocalDateTime createdAt;
    private String userName;
    private String userEmail;
}
