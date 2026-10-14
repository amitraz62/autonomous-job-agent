import { BasePortalAdapter } from './baseAdapter.js';

export class LinkedInAdapter extends BasePortalAdapter {
  constructor() {
    super('LinkedIn');
  }

  async extractJobDetails(page, jobUrl) {
    await page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await this.dismissOverlays(page, ['button[aria-label="Dismiss"]', '.modal__dismiss']);

    const title = await page.locator('.job-details-jobs-unified-top-card__job-title, h1.t-24').first().innerText().catch(() => 'Backend Engineer');
    const company = await page.locator('.job-details-jobs-unified-top-card__company-name, .job-card-container__company-name').first().innerText().catch(() => 'Enterprise Client');
    const description = await page.locator('#job-details, .jobs-description__content').first().innerText().catch(() => 'Java Spring Boot role description...');

    return { title: title.trim(), company: company.trim(), description: description.trim() };
  }

  async submitApplication(page, jobDetails, candidateFiles = {}) {
    const easyApplyBtn = page.locator('button.jobs-apply-button:has-text("Easy Apply")').first();

    if (!(await this.isElementSafeAndVisible(easyApplyBtn))) {
      return { success: false, reason: 'Easy Apply not available for this vacancy.' };
    }

    await easyApplyBtn.click();
    await page.waitForTimeout(1000);

    return { success: true, message: 'Easy Apply modal triggered on LinkedIn.' };
  }
}
