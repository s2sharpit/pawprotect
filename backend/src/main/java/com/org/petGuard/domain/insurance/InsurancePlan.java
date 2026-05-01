package com.org.petGuard.domain.insurance;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "insurance_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsurancePlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 10, scale = 2)
    private BigDecimal monthlyPremium;

    @Column(precision = 10, scale = 2)
    private BigDecimal coverageLimit;

    @Column(precision = 10, scale = 2)
    private BigDecimal deductible;

    @Column
    private Boolean isPopular;

    @Column(columnDefinition = "JSON")
    private String coverageDetailsJson;

    @Transient
    private Map<String, Object> coverageDetails;

    @PostLoad
    private void parseCoverageDetails() {
        if (coverageDetailsJson != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                coverageDetails = mapper.readValue(
                        coverageDetailsJson,
                        new TypeReference<Map<String, Object>>() {
                        });
            } catch (Exception e) {
                coverageDetails = new HashMap<>();
            }
        }
    }

    @PrePersist
    @PreUpdate
    private void stringifyCoverageDetails() {
        if (coverageDetails != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                coverageDetailsJson = mapper.writeValueAsString(coverageDetails);
            } catch (Exception e) {
                coverageDetailsJson = "{}";
            }
        }
    }

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
