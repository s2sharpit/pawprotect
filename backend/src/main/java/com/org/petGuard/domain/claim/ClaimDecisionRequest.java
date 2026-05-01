package com.org.petGuard.domain.claim;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimDecisionRequest {
    @NotNull(message = "Approved amount is required")
    private java.math.BigDecimal approvedAmount;
    
    @NotBlank(message = "Decision reason is required")
    private String decisionReason;
    
    @NotBlank(message = "Status is required")
    private String status; // APPROVED or REJECTED
}
