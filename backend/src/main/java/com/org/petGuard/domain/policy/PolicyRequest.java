package com.org.petGuard.domain.policy;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyRequest {
    @NotNull(message = "Pet ID is required")
    private Long petId;

    @NotNull(message = "Plan ID is required")
    private Long planId;
}
