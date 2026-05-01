package com.org.petGuard.domain.claim;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByPolicyId(Long policyId);
    List<Claim> findByPolicyPetUserId(Long userId);
    List<Claim> findByStatus(Claim.ClaimStatus status);
    long countByStatus(Claim.ClaimStatus status);
    
    @Query("SELECT c FROM Claim c WHERE c.policy.pet.user.id = :userId AND c.status = :status")
    List<Claim> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Claim.ClaimStatus status);
    
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.createdAt >= :startDate")
    long countClaimsSince(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT AVG(TIMESTAMPDIFF(SECOND, c.createdAt, c.reviewedAt)) FROM Claim c WHERE c.reviewedAt IS NOT NULL")
    Double getAverageProcessingTimeInSeconds();
    
    // Simple queries for approval rate calculation
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.status = 'APPROVED'")
    long countApprovedClaims();
    
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.status != 'PROCESSING'")
    long countProcessedClaims();
}
