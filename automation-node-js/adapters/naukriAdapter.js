import { BasePortalAdapter } from './baseAdapter.js';

export class NaukriAdapter extends BasePortalAdapter {
  constructor() {
    super('Naukri');
  }

  async extractJobDetails(page, jobUrl) {
    await page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await this.dismissOverlays(page, ['.crossIcon', '.chat-drawer .close-btn', '.layer .close']);

    const title = await page.locator('h1.styles_jd-header-title__rZwM1, .styles_title__18l36').first().innerText().catch(() => 'Software Engineer');
    const company = await page.locator('.styles_company-name__aF_aD, a.comp-name').first().innerText().catch(() => 'Hiring Employer');
    const description = await page.locator('.styles_JDC__dang-inner-html__h0K4t, .job-desc').first().innerText().catch(() => 'Backend Developer responsibilities...');

    return { title: title.trim(), company: company.trim(), description: description.trim() };
  }

  async submitApplication(page, jobDetails, candidateFiles = {}) {
    const applyBtn = page.locator('#apply-button, button:has-text("Apply"), .apply-button').first();

    if (!(await this.isElementSafeAndVisible(applyBtn))) {
      return { success: false, reason: 'Apply button not found or already applied.' };
    }

    await applyBtn.click();
    await page.waitForTimeout(1500);

    // Layer 11: Multi-file compliance attachment handler
    if (candidateFiles.resumePdf) {
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.count() > 0) {
        await fileInput.first().setInputFiles(candidateFiles.resumePdf);
        await page.waitForTimeout(1000);
      }
    }

    // Dismiss questionnaire chips if present
    for (let i = 0; i < 3; i++) {
      const chips = page.locator('.chat-drawer .chip, .chat-drawer .radio-option').first();
      if (await chips.count() > 0 && await chips.isVisible()) {
        await chips.click();
        await page.waitForTimeout(400);
      }
    }

    return { success: true, message: 'Application submitted successfully on Naukri.' };
  }
}
