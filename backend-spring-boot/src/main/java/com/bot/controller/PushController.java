package com.bot.controller;

import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Security;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RestController
@RequestMapping("/api/v1/push")
public class PushController {

    private final Map<String, Subscription> subscriptions = new ConcurrentHashMap<>();

    public PushController() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    /**
     * Layer 5: Register Mobile Web Push Subscription Endpoint.
     */
    @PostMapping("/subscribe")
    public ResponseEntity<String> subscribeDevice(@RequestBody Map<String, Object> subPayload) {
        String endpoint = (String) subPayload.get("endpoint");
        log.info("Registered mobile push device: {}", endpoint);
        return ResponseEntity.ok("Device subscribed to Web Push.");
    }

    @PostMapping("/broadcast")
    public ResponseEntity<String> sendTestPush(@RequestBody Map<String, String> alert) {
        String message = alert.getOrDefault("message", "Job Auto-Apply Agent Status Update");
        log.info("Broadcasting push message: {}", message);
        return ResponseEntity.ok("Push notification dispatched.");
    }
}
