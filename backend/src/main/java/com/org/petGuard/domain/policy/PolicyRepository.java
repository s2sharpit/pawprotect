package com.org.petGuard.domain.policy;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByPetId(Long petId);
    List<Policy> findByPetUserId(Long userId);
    List<Policy> findByStatus(Policy.PolicyStatus status);
    
    boolean existsByPetIdAndStatus(Long petId, Policy.PolicyStatus status);

    @Query("SELECT COUNT(p) FROM Policy p WHERE p.status = 'ACTIVE'")
    long countActivePolicies();
}
