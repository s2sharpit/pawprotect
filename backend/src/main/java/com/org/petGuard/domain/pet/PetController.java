package com.org.petGuard.domain.pet;

import com.org.petGuard.core.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/pets")
@RequiredArgsConstructor
public class PetController {

    @Autowired
    private PetService petService;

    @PostMapping
    public ResponseEntity<PetResponse> addPet(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody PetRequest request) {
        System.out.println("Add Pet Request: " + request);
        return ResponseEntity.ok(petService.addPet(principal.getUserId(), request));
    }

    @GetMapping
    public ResponseEntity<List<PetResponse>> getUserPets(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(petService.getUserPets(principal.getUserId()));
    }

    @GetMapping("/{petId}")
    public ResponseEntity<PetResponse> getPetById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long petId) {
        return ResponseEntity.ok(petService.getPetById(petId, principal.getUserId()));
    }

    @PutMapping("/{petId}")
    public ResponseEntity<PetResponse> updatePet(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long petId,
            @Valid @RequestBody PetRequest request) {
        return ResponseEntity.ok(petService.updatePet(petId, principal.getUserId(), request));
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<Void> deletePet(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long petId) {
        petService.deletePet(petId, principal.getUserId());
        return ResponseEntity.noContent().build();
    }
}
