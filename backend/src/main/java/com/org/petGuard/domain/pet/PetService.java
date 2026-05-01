package com.org.petGuard.domain.pet;

import com.org.petGuard.domain.policy.Policy;
import com.org.petGuard.domain.policy.PolicyRepository;
import com.org.petGuard.domain.user.User;
import com.org.petGuard.domain.user.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PetService {

    @Autowired
    private PetRepository petRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PolicyRepository policyRepository;

    @Transactional
    public PetResponse addPet(Long userId, PetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = Pet.builder()
                .user(user)
                .name(request.getName())
                .species(request.getSpecies())
                .breed(request.getBreed())
                .age(request.getAge())
                .gender(request.getGender())
                .eligibilityStatus(Pet.EligibilityStatus.valueOf(request.getEligibilityStatus()))
                .medicalSummary(request.getMedicalSummary())
                .preExistingConditions(request.getPreExistingConditions())
                .eligibilityReason(request.getEligibilityReason())
                .eligibilityCheckedAt(request.getEligibilityCheckedAt())
                .build();

        pet = petRepository.save(pet);

        return mapToResponse(pet);
    }

    public List<PetResponse> getUserPets(Long userId) {
        return petRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PetResponse getPetById(Long petId, Long userId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!pet.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to pet");
        }

        return mapToResponse(pet);
    }

    @Transactional
    public PetResponse updatePet(Long petId, Long userId, PetRequest request) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!pet.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to pet");
        }

        pet.setName(request.getName());
        pet.setSpecies(request.getSpecies());
        pet.setBreed(request.getBreed());
        pet.setAge(request.getAge());
        pet.setGender(request.getGender());

        pet = petRepository.save(pet);
        return mapToResponse(pet);
    }

    @Transactional
    public void deletePet(Long petId, Long userId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!pet.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to pet");
        }

        // Check for active policies
        boolean hasActivePolicy = policyRepository.existsByPetIdAndStatus(petId, Policy.PolicyStatus.ACTIVE);
        if (hasActivePolicy) {
            throw new RuntimeException("Cannot delete pet with an active policy. Please cancel the policy first.");
        }

        petRepository.delete(pet);
    }

    private PetResponse mapToResponse(Pet pet) {
        return PetResponse.builder()
                .id(pet.getId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .age(pet.getAge())
                .gender(pet.getGender())
                .photoUrl(pet.getPhotoUrl())
                .medicalSummary(pet.getMedicalSummary())
                .preExistingConditions(pet.getPreExistingConditions())
                .eligibilityStatus(pet.getEligibilityStatus().name())
                .eligibilityReason(pet.getEligibilityReason())
                .eligibilityCheckedAt(pet.getEligibilityCheckedAt())
                .createdAt(pet.getCreatedAt())
                .build();
    }
}
