package com.org.petGuard.domain.claim;

import com.org.petGuard.core.security.UserPrincipal;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/v1/claims")
@RequiredArgsConstructor
public class ClaimController {

    @Autowired
    private ClaimService claimService;

    @PostMapping
    public ResponseEntity<ClaimResponse> submitClaim(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam Long policyId,
            @RequestPart("receipt") MultipartFile receipt) {
        return ResponseEntity.ok(claimService.submitClaim(principal.getUserId(), policyId, receipt));
    }

    @GetMapping
    public ResponseEntity<List<ClaimResponse>> getUserClaims(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(claimService.getUserClaims(principal.getUserId()));
    }

    @GetMapping("/{claimId}")
    public ResponseEntity<ClaimResponse> getClaimById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long claimId) {
        return ResponseEntity.ok(claimService.getClaimById(claimId, principal.getUserId()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClaimResponse>> getAllClaims(
            @RequestParam(required = false, defaultValue = "ALL") String status) {
        return ResponseEntity.ok(claimService.getClaimsByStatus(status));
    }

    @PostMapping("/{claimId}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClaimResponse> reviewClaim(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long claimId,
            @Valid @RequestBody ClaimDecisionRequest decision) {
        return ResponseEntity.ok(claimService.reviewClaim(claimId, principal.getUserId(), decision));
    }

}
