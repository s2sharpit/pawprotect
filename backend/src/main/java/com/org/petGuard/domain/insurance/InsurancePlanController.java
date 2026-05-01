package com.org.petGuard.domain.insurance;

import com.org.petGuard.core.security.UserPrincipal;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/plans")
@RequiredArgsConstructor
public class InsurancePlanController {

    @Autowired
    private InsurancePlanService planService;

    @GetMapping
    public ResponseEntity<List<InsurancePlanResponse>> getPlans(
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive,
            @RequestParam(required = false, defaultValue = "false") boolean popularOnly) {
        
        if (popularOnly) {
            return ResponseEntity.ok(planService.getPopularPlans());
        }
        
        if (includeInactive) {
            return ResponseEntity.ok(planService.getAllPlans());
        }
        
        return ResponseEntity.ok(planService.getAllActivePlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsurancePlanResponse> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(planService.getPlanById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InsurancePlanResponse> addInsurancePlan(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody InsurancePlanRequest request) {
        InsurancePlanResponse response = planService.createPlan(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InsurancePlanResponse> updateInsurancePlan(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody InsurancePlanRequest request) {
        InsurancePlanResponse response = planService.updatePlan(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> togglePlanStatus(@PathVariable Long id) {
        planService.togglePlanStatus(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/popular-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InsurancePlanResponse> togglePopularStatus(@PathVariable Long id) {
        return ResponseEntity.ok(planService.togglePopularStatus(id));
    }
}
