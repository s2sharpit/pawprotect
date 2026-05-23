package com.org.petGuard.domain.claim;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimRequest {
    @NotNull(message = "Policy ID is required")
    private Long policyId;

    @NotNull(message = "Treatment date is required")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate treatmentDate;

    @NotBlank(message = "Vet clinic name is required")
    private String vetClinicName;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    @NotBlank(message = "Treatment type is required")
    private String treatmentType;

    private String medications;

    @NotNull(message = "Claim amount is required")
    @PositiveOrZero(message = "Claim amount must be positive or zero")
    private BigDecimal claimAmount;
}
