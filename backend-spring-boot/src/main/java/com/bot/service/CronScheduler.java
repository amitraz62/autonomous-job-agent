package com.bot.service;

import com.bot.model.JobApplication;
import com.bot.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@EnableScheduling
@RequiredArgsConstructor
public class CronScheduler {

    private final RedisTemplate<String, Object> redisTemplate;
    private final JobRepository jobRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public static final String BULL_QUEUE_WAIT = "bull:job-applications:wait";

    public static String computeFingerprint(String userId, String jobUrl) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((userId + ":" + jobUrl.trim().toLowerCase()).getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 fingerprint generation failed", e);
        }
    }

    /**
     * Dispatch fresh daily batches to Redis queue.
     */
    @Scheduled(cron = "0 0 9 * * ?") // Daily at 09:00 AM
    public void executeDailyBatchDispatch() {
        log.info("Starting Daily Batch Job Application Dispatch...");

        // Simulated seeds for multi-portal jobs (Naukri, LinkedIn, etc.)
        List<Map<String, String>> discoveredJobs = List.of(
            Map.of("platform", "naukri", "title", "Senior Java Engineer", "company", "Tech Global", "url", "https://www.naukri.com/job-101"),
            Map.of("platform", "linkedin", "title", "Backend Developer (Spring Boot)", "company", "FinTech Solutions", "url", "https://www.linkedin.com/jobs/view/202"),
            Map.of("platform", "naukri", "title", "Full Stack Developer", "company", "Enterprise Cloud", "url", "https://www.naukri.com/job-303")
        );

        String activeUserId = "user_amitraj";
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);

        int queuedCount = 0;
        for (Map<String, String> job : discoveredJobs) {
            String url = job.get("url");
            String fingerprint = computeFingerprint(activeUserId, url);

            if (!jobRepository.existsByFingerprintWithinWindow(fingerprint, thirtyDaysAgo)) {
                JobApplication app = JobApplication.builder()
                        .fingerprint(fingerprint)
                        .platform(job.get("platform"))
                        .jobUrl(url)
                        .title(job.get("title"))
                        .company(job.get("company"))
                        .location("India / Remote")
                        .status("PENDING")
                        .appliedAt(Instant.now())
                        .build();

                jobRepository.save(app);

                Map<String, Object> queuePayload = new HashMap<>();
                queuePayload.put("id", app.getId());
                queuePayload.put("fingerprint", fingerprint);
                queuePayload.put("platform", app.getPlatform());
                queuePayload.put("jobUrl", app.getJobUrl());
                queuePayload.put("title", app.getTitle());
                queuePayload.put("company", app.getCompany());

                redisTemplate.opsForList().rightPush(BULL_QUEUE_WAIT, queuePayload);
                queuedCount++;
            }
        }

        log.info("Daily Dispatch Complete. Enqueued {} fresh tasks.", queuedCount);
        broadcastMetrics();
    }

    /**
     * Layer 9: Dynamic State Restoration Engine.
     * Re-attempts FAILED or STUCK jobs with retry count < 3.
     */
    @Scheduled(fixedDelay = 600000) // Every 10 minutes
    public void retryFailedApplications() {
        List<JobApplication> retryCandidates = jobRepository.findByStatusAndRetryCountLessThan("FAILED", 3);
        if (!retryCandidates.isEmpty()) {
            log.info("Restoration Engine found {} retry candidate(s). Re-enqueueing...", retryCandidates.size());
            for (JobApplication app : retryCandidates) {
                app.setStatus("PENDING");
                app.setRetryCount(app.getRetryCount() + 1);
                jobRepository.save(app);

                Map<String, Object> queuePayload = new HashMap<>();
                queuePayload.put("id", app.getId());
                queuePayload.put("fingerprint", app.getFingerprint());
                queuePayload.put("platform", app.getPlatform());
                queuePayload.put("jobUrl", app.getJobUrl());
                queuePayload.put("title", app.getTitle());
                queuePayload.put("company", app.getCompany());

                redisTemplate.opsForList().rightPush(BULL_QUEUE_WAIT, queuePayload);
            }
            broadcastMetrics();
        }
    }

    public void broadcastMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalApplications", jobRepository.count());
        metrics.put("appliedToday", jobRepository.countAppliedToday(Instant.now().truncatedTo(ChronoUnit.DAYS)));
        metrics.put("totalPending", jobRepository.countByStatus("PENDING"));
        metrics.put("totalApplied", jobRepository.countByStatus("APPLIED"));
        metrics.put("totalFailed", jobRepository.countByStatus("FAILED"));
        messagingTemplate.convertAndSend("/topic/metrics", metrics);
    }
}
