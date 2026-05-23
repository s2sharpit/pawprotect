package com.org.petGuard.domain.user;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getCurrentUser(Long userId) {
        return getUserById(userId);
    }

    private UserResponse mapToResponse(User user) {
        List<UserResponse.UserPetDto> pets = user.getPets() == null ? List.of() : user.getPets().stream()
                .map(pet -> UserResponse.UserPetDto.builder()
                        .id(pet.getId())
                        .name(pet.getName())
                        .species(pet.getSpecies())
                        .breed(pet.getBreed())
                        .eligibilityStatus(pet.getEligibilityStatus() != null ? pet.getEligibilityStatus().name() : null)
                        .policies(pet.getPolicies() == null ? List.of() : pet.getPolicies().stream()
                                .map(policy -> UserResponse.UserPolicyDto.builder()
                                        .id(policy.getId())
                                        .planName(policy.getPlan().getName())
                                        .status(policy.getStatus().name())
                                        .startDate(policy.getStartDate())
                                        .endDate(policy.getEndDate())
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .pets(pets)
                .build();
    }
}
