package com.bot.service;

import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class CryptoGcmService {

    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int IV_LENGTH_BYTES = 12;
    private final SecureRandom secureRandom = new SecureRandom();

    private SecretKey resolveKey() {
        String keyEnv = System.getenv("VAULT_AES_256_KEY");
        if (keyEnv == null || keyEnv.getBytes(StandardCharsets.UTF_8).length < 32) {
            // Default 32-byte fallback key for local dev if environment variable is not explicitly injected
            keyEnv = "enterprise_autonomous_agent_key_256bit!!";
        }
        byte[] keyBytes = new byte[32];
        System.arraycopy(keyEnv.getBytes(StandardCharsets.UTF_8), 0, keyBytes, 0, 32);
        return new SecretKeySpec(keyBytes, "AES");
    }

    public String encrypt(String rawText) {
        if (rawText == null || rawText.isEmpty()) return null;
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, resolveKey(), new GCMParameterSpec(GCM_TAG_LENGTH, iv));

            byte[] cipherText = cipher.doFinal(rawText.getBytes(StandardCharsets.UTF_8));
            byte[] combined = ByteBuffer.allocate(iv.length + cipherText.length)
                                        .put(iv)
                                        .put(cipherText)
                                        .array();
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new IllegalStateException("AES-GCM Encryption failed", e);
        }
    }

    public String decrypt(String base64Encrypted) {
        if (base64Encrypted == null || base64Encrypted.isEmpty()) return null;
        try {
            byte[] decoded = Base64.getDecoder().decode(base64Encrypted);
            ByteBuffer buffer = ByteBuffer.wrap(decoded);

            byte[] iv = new byte[IV_LENGTH_BYTES];
            buffer.get(iv);

            byte[] cipherText = new byte[buffer.remaining()];
            buffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, resolveKey(), new GCMParameterSpec(GCM_TAG_LENGTH, iv));

            return new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("AES-GCM Decryption failed", e);
        }
    }
}
