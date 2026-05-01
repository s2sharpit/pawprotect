
package com.org.petGuard.domain.ai;

import com.org.petGuard.domain.pet.PetRequest;
import com.org.petGuard.domain.pet.Pet;
import com.org.petGuard.domain.pet.PetRepository;
import com.org.petGuard.core.security.UserPrincipal;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AIController {

    @Autowired
    private AIService aiService;
    @Autowired
    private PetRepository petRepository;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChatRequest request) {
        System.out.println("Request: " + request);
        String petContext = null;
        if (request.getPetId() != null) {
            Pet pet = petRepository.findById(request.getPetId()).orElse(null);
            if (pet != null && pet.getUser().getId().equals(principal.getUserId())) {
                petContext = String.format("Pet: %s, Species: %s, Age: %d, Medical Summary: %s",
                        pet.getName(), pet.getSpecies(), pet.getAge(), pet.getMedicalSummary());
            }
        }
        System.out.println("Pet Context: " + petContext);
        System.out.println("User Message: " + request.getMessage());
        System.out.println("User Message: " + request);
        String response = aiService.getChatbotResponse(request.getMessage(), petContext);
        System.out.println("AI Response: " + response);
        return ResponseEntity.ok(ChatResponse.builder()
                .response(response)
                .timestamp(LocalDateTime.now())
                .build());
    }

    // New endpoint for eligibility check
    @PostMapping("/check-eligibility")
    public ResponseEntity<?> checkEligibility(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestPart("file") MultipartFile file) {
        try {
            PetRequest petRequest = aiService.processEligibility(file);
            if (petRequest == null) {
                return ResponseEntity.badRequest()
                        .body("Failed to process eligibility. Please check the file and try again.");
            }
            return ResponseEntity.ok(petRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
