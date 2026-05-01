package com.org.petGuard.domain.insurance;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
public class InsurancePlanResponse {
    private Long id;
    private String name;
    private String description;
    private java.math.BigDecimal monthlyPremium;
    private java.math.BigDecimal coverageLimit;
    private java.math.BigDecimal deductible;
    private Boolean isPopular;
    private java.util.Map<String, Object> coverageDetails;
    private Boolean isActive;
    private java.time.LocalDateTime createdAt;
}
