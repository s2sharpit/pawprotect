package com.org.petGuard.domain.pet;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetRequest {
    @NotBlank(message = "Pet name is required")
    private String name;
    
    @NotBlank(message = "Species is required")
    private String species;
    
    private String breed;
    
    @Min(value = 0, message = "Age must be positive")
    private Integer age;
    
    private String gender;

    // add medicalsumary, preexisting conditions, eligibilitystatuseligibilityreason, eligibilitycheckedat fields as needed
    private String medicalSummary;
    private List<String> preExistingConditions;
    private String eligibilityStatus;
    private String eligibilityReason;
    private LocalDateTime eligibilityCheckedAt;

}
