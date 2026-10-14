package com.bot.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailParserService {

    private final SimpMessagingTemplate messagingTemplate;

    private static final List<String> HIGH_INTENT_KEYWORDS = List.of(
            "interview", "shortlist", "shortlisted", "schedule an interview", 
            "hiring team", "technical assessment", "online round", "offer discussion"
    );

    private static final Pattern HIGH_INTENT_PATTERN = Pattern.compile(
            "\\b(" + String.join("|", HIGH_INTENT_KEYWORDS) + ")\\b",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * Layer 6: Inbound Email Interview Scanner.
     * Intercepts transactional and employer notifications.
     */
    public boolean processIncomingEmail(String sender, String subject, String body) {
        String combined = (subject + " " + body).toLowerCase(Locale.ROOT);
        
        if (HIGH_INTENT_PATTERN.matcher(combined).find()) {
            log.warn("🚨 [CRITICAL ALERT] High-Intent Interview Token Detected in Email from {}!", sender);

            // Broadcast immediate high-priority alert to WebSocket clients (Mobile/Laptop)
            Map<String, Object> alertPayload = Map.of(
                    "type", "INTERVIEW_ALERT",
                    "priority", "CRITICAL",
                    "sender", sender,
                    "subject", subject,
                    "preview", body.length() > 200 ? body.substring(0, 200) + "..." : body,
                    "timestamp", System.currentTimeMillis()
            );

            messagingTemplate.convertAndSend("/topic/alerts", alertPayload);
            return true;
        }

        log.info("Email from {} parsed: Standard confirmation or update.", sender);
        return false;
    }
}
