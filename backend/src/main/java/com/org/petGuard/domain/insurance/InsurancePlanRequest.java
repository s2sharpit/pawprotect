package com.org.petGuard.domain.insurance;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsurancePlanRequest {
    @NotBlank(message = "Plan name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Monthly premium is required")
    @DecimalMin(value = "0.0", message = "Premium must be positive")
    private java.math.BigDecimal monthlyPremium;
    
    @NotNull(message = "Coverage limit is required")
    @DecimalMin(value = "0.0", message = "Coverage must be positive")
    private java.math.BigDecimal coverageLimit;
    
    @NotNull(message = "Deductible is required")
    @DecimalMin(value = "0.0", message = "Deductible must be positive")
    private java.math.BigDecimal deductible;

    private Boolean isActive;
    
    private java.util.Map<String, Object> coverageDetails;
}
