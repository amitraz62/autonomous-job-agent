import { chromium } from 'playwright';
import Redis from 'ioredis';
import { evaluateJobFit } from '../core/aiEngine.js';
import { RateLimiter } from '../core/rateLimiter.js';
import { NaukriAdapter } from '../adapters/naukriAdapter.js';
import { LinkedInAdapter } from '../adapters/linkedinAdapter.js';
import { loadEncryptedSession } from '../core/sessionVault.js';

const redis = new Redis({ host: process.env.REDIS_HOST || 'localhost', port: 6379 });
const rateLimiter = new RateLimiter(10, 2);

const adapters = {
  naukri: new NaukriAdapter(),
  linkedin: new LinkedInAdapter()
};

const candidateProfile = {
  name: "Amit Raj",
  title: "Backend SDE & Automation Engineer",
  skills: ["Java 21", "Spring Boot", "REST APIs", "Redis", "PostgreSQL", "Docker", "Microservices", "Playwright"],
  yearsExperience: 2.2
};

const SPRING_BOOT_API = process.env.SPRING_BOOT_API || 'http://localhost:8080/api/v1/bot';

async function updateBackendStatus(jobId, status, matchScore = null, reason = null) {
  try {
    await fetch(`${SPRING_BOOT_API}/applications/${jobId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, matchScore, matchReason: reason })
    });
  } catch (err) {
    console.error(`Failed to update Spring Boot status for job ${jobId}:`, err.message);
  }
}

/**
 * Layer 17: Sandbox Memory Containment Loop.
 * Periodically recycles the Chromium browser context to guarantee leak-free 24/7 uptime.
 */
export async function startWorker() {
  console.log('🚀 [Worker] Starting Node.js Autonomous Queue Consumer...');

  let browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  });

  let processedCount = 0;

  while (true) {
    try {
      // Blocking pop from Redis BullMQ wait queue
      const rawItem = await redis.blpop('bull:job-applications:wait', 5);
      if (!rawItem) continue;

      const jobData = JSON.parse(rawItem[1]);
      console.log(`\n[Worker] Processing Job ID: ${jobData.id} (${jobData.platform}) - ${jobData.title}`);

      await rateLimiter.acquireToken();

      const adapter = adapters[jobData.platform.toLowerCase()] || adapters.naukri;
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        // Step 1: Extract real description
        const details = await adapter.extractJobDetails(page, jobData.jobUrl);

        // Step 2: Layer 4 AI ATS Scoring Check
        const fitResult = await evaluateJobFit(details.title || jobData.title, details.description, candidateProfile);
        console.log(`[AI Match] Score: ${fitResult.matchScore}% | Action: ${fitResult.action} | Reason: ${fitResult.reason}`);

        if (fitResult.action === 'SKIP') {
          console.log(`[Worker] Match score below 70%. Skipping application.`);
          await updateBackendStatus(jobData.id, 'SKIP', fitResult.matchScore, fitResult.reason);
        } else {
          // Step 3: Automated submission via Adapter
          const submitResult = await adapter.submitApplication(page, details);
          if (submitResult.success) {
            console.log(`✅ [Worker] Applied successfully: ${jobData.title} @ ${jobData.company}`);
            await updateBackendStatus(jobData.id, 'APPLIED', fitResult.matchScore, fitResult.reason);
          } else {
            console.log(`⚠️ [Worker] Submission failed: ${submitResult.reason}`);
            await updateBackendStatus(jobData.id, 'FAILED', fitResult.matchScore, submitResult.reason);
          }
        }
      } catch (execError) {
        console.error(`[Worker Execution Error]: ${execError.message}`);
        await updateBackendStatus(jobData.id, 'FAILED', 0, execError.message);
      } finally {
        await page.close();
        await context.close();
      }

      processedCount++;
      // Memory Leak Containment: recycle browser instance every 10 jobs
      if (processedCount % 10 === 0) {
        console.log('[Worker] Recycling browser context for memory containment...');
        await browser.close();
        browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
      }

    } catch (loopErr) {
      console.error('[Worker Fatal Loop Exception]:', loopErr.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

startWorker().catch(console.error);
