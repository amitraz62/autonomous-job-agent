package com.bot.controller;

import com.bot.model.JobApplication;
import com.bot.repository.JobRepository;
import com.bot.service.CronScheduler;
import com.bot.service.EmailParserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bot")
@RequiredArgsConstructor
public class BotController {

    private final JobRepository jobRepository;
    private final CronScheduler cronScheduler;
    private final EmailParserService emailParserService;

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        long total = jobRepository.count();
        long today = jobRepository.countAppliedToday(Instant.now().truncatedTo(ChronoUnit.DAYS));
        long pending = jobRepository.countByStatus("PENDING");
        long applied = jobRepository.countByStatus("APPLIED");
        long failed = jobRepository.countByStatus("FAILED");

        return ResponseEntity.ok(Map.of(
                "totalApplications", total,
                "appliedToday", today,
                "pending", pending,
                "applied", applied,
                "failed", failed,
                "engineStatus", "ACTIVE_MONITORING"
        ));
    }

    @GetMapping("/applications")
    public ResponseEntity<List<JobApplication>> getRecentApplications() {
        return ResponseEntity.ok(jobRepository.findAll());
    }

    @PostMapping("/trigger-batch")
    public ResponseEntity<String> triggerBatch() {
        cronScheduler.executeDailyBatchDispatch();
        return ResponseEntity.ok("Batch dispatch triggered successfully.");
    }

    @PostMapping("/inbound-email")
    public ResponseEntity<Map<String, Object>> receiveEmailHook(@RequestBody Map<String, String> payload) {
        String sender = payload.getOrDefault("sender", "unknown");
        String subject = payload.getOrDefault("subject", "");
        String body = payload.getOrDefault("body", "");

        boolean isInterviewAlert = emailParserService.processIncomingEmail(sender, subject, body);
        return ResponseEntity.ok(Map.of(
                "processed", true,
                "highIntentAlert", isInterviewAlert
        ));
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<JobApplication> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updatePayload
    ) {
        return jobRepository.findById(id).map(app -> {
            if (updatePayload.containsKey("status")) {
                app.setStatus((String) updatePayload.get("status"));
            }
            if (updatePayload.containsKey("matchScore")) {
                app.setMatchScore((Integer) updatePayload.get("matchScore"));
            }
            if (updatePayload.containsKey("matchReason")) {
                app.setMatchReason((String) updatePayload.get("matchReason"));
            }
            if (updatePayload.containsKey("failureReason")) {
                app.setFailureReason((String) updatePayload.get("failureReason"));
            }
            JobApplication saved = jobRepository.save(app);
            cronScheduler.broadcastMetrics();
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
