package com.org.petGuard.domain.pet;

import com.org.petGuard.domain.user.User;
import com.org.petGuard.domain.policy.Policy;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.hibernate.annotations.SoftDelete;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SoftDelete
public class Pet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String name;
    private String species;
    private String breed;
    private Integer age;
    private String gender;
    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String medicalSummary;

    @Column(columnDefinition = "JSON")
    private String preExistingConditionsJson;

    @Transient
    private List<String> preExistingConditions;

    @PostLoad
    private void parsePreExistingConditions() {
        if (preExistingConditionsJson != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                preExistingConditions = mapper.readValue(
                        preExistingConditionsJson,
                        new TypeReference<List<String>>() {
                        });
            } catch (Exception e) {
                preExistingConditions = new ArrayList<>();
            }
        }
    }

    @PrePersist
    @PreUpdate
    private void stringifyPreExistingConditions() {
        if (preExistingConditions != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                preExistingConditionsJson = mapper.writeValueAsString(preExistingConditions);
            } catch (Exception e) {
                preExistingConditionsJson = "[]";
            }
        }
    }

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private EligibilityStatus eligibilityStatus = EligibilityStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String eligibilityReason;

    private LocalDateTime eligibilityCheckedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL)
    private List<Policy> policies;

    public enum EligibilityStatus {
        ELIGIBLE, NOT_ELIGIBLE, PENDING
    }
}
