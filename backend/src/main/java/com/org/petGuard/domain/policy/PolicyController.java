package com.org.petGuard.domain.policy;

import com.org.petGuard.core.security.UserPrincipal;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/policies")
@RequiredArgsConstructor
public class PolicyController {

    @Autowired
    private PolicyService policyService;

    @PostMapping
    public ResponseEntity<PolicyResponse> createPolicy(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PolicyRequest request) {
        return ResponseEntity.ok(policyService.createPolicy(principal.getUserId(), request));
    }

    @GetMapping
    public ResponseEntity<List<PolicyResponse>> getUserPolicies(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(policyService.getUserPolicies(principal.getUserId()));
    }

    @GetMapping("/{policyId}")
    public ResponseEntity<PolicyResponse> getPolicyById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long policyId) {
        return ResponseEntity.ok(policyService.getPolicyById(policyId, principal.getUserId()));
    }

    @PatchMapping("/{policyId}/cancel")
    public ResponseEntity<Void> cancelPolicy(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long policyId) {
        policyService.cancelPolicy(policyId, principal.getUserId());
        return ResponseEntity.ok().build();
    }
}
