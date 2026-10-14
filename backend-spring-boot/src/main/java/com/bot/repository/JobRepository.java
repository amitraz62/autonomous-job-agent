package com.bot.repository;

import com.bot.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<JobApplication, Long> {

    Optional<JobApplication> findByFingerprint(String fingerprint);

    @Query("SELECT COUNT(j) > 0 FROM JobApplication j WHERE j.fingerprint = :fingerprint AND j.appliedAt >= :threshold")
    boolean existsByFingerprintWithinWindow(@Param("fingerprint") String fingerprint, @Param("threshold") Instant threshold);

    List<JobApplication> findByStatusAndRetryCountLessThan(String status, int maxRetries);

    long countByStatus(String status);

    @Query("SELECT COUNT(j) FROM JobApplication j WHERE j.appliedAt >= :startOfDay")
    long countAppliedToday(@Param("startOfDay") Instant startOfDay);
}
