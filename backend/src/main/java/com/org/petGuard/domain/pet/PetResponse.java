package com.org.petGuard.domain.pet;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
public class PetResponse {
    private Long id;
    private String name;
    private String species;
    private String breed;
    private Integer age;
    private String gender;
    private String photoUrl;
    private String medicalSummary;
    private java.util.List<String> preExistingConditions;
    private String eligibilityStatus;
    private String eligibilityReason;
    private java.time.LocalDateTime eligibilityCheckedAt;
    private java.time.LocalDateTime createdAt;
}
