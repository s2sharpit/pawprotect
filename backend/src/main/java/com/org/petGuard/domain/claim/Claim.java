package com.org.petGuard.domain.claim;

import com.org.petGuard.domain.user.User;
import com.org.petGuard.domain.policy.Policy;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    private LocalDate treatmentDate;
    private String vetClinicName;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    private String treatmentType;

    @Column(columnDefinition = "TEXT")
    private String medications;

    @Column(precision = 10, scale = 2)
    private BigDecimal claimAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal approvedAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal deductibleApplied;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status = ClaimStatus.PROCESSING;

    @Column(columnDefinition = "TEXT")
    private String decisionReason;

    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    private LocalDateTime reviewedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum ClaimStatus {
        PENDING, APPROVED, REJECTED, PROCESSING
    }
}
