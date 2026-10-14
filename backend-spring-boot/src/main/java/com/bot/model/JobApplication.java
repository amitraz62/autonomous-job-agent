package com.bot.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "job_applications", indexes = {
    @Index(name = "idx_app_fingerprint", columnList = "fingerprint"),
    @Index(name = "idx_app_platform_status", columnList = "platform, status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String fingerprint;

    @Column(nullable = false)
    private String platform;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String jobUrl;

    private String title;
    private String company;
    private String location;
    
    @Column(nullable = false)
    private String status; // PENDING, PROCESSING, APPLIED, FAILED, SKIP

    private Integer matchScore;

    @Column(columnDefinition = "TEXT")
    private String matchReason;

    @Column(columnDefinition = "TEXT")
    private String failureReason;

    private Integer retryCount;

    @Column(nullable = false)
    private Instant appliedAt;

    private Instant updatedAt;

    @Version
    private Long version;

    @PrePersist
    public void onPrePersist() {
        if (this.appliedAt == null) {
            this.appliedAt = Instant.now();
        }
        if (this.retryCount == null) {
            this.retryCount = 0;
        }
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = Instant.now();
    }
}
