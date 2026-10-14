/**
 * Strategy Pattern: Base Job Portal Adapter.
 */
export class BasePortalAdapter {
  constructor(platformName) {
    this.platformName = platformName;
  }

  async extractJobDetails(page, jobUrl) {
    throw new Error('extractJobDetails() must be implemented by subclass.');
  }

  async submitApplication(page, jobDetails, candidateFiles) {
    throw new Error('submitApplication() must be implemented by subclass.');
  }

  /**
   * Layer 16: Shadow Honeypot Evasion.
   * Ensures element is strictly visible, has positive dimensions, and non-zero opacity.
   */
  async isElementSafeAndVisible(locator) {
    if (await locator.count() === 0) return false;
    return await locator.first().evaluate((el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const isVisible = style.display !== 'none' && 
                        style.visibility !== 'hidden' && 
                        style.opacity !== '0' &&
                        rect.width > 0 && 
                        rect.height > 0;
      return isVisible;
    });
  }

  /**
   * Layer 14: Unexpected Pop-up Dismisser.
   */
  async dismissOverlays(page, overlaySelectors = []) {
    for (const selector of overlaySelectors) {
      try {
        const btn = page.locator(selector);
        if (await btn.count() > 0 && await btn.first().isVisible()) {
          console.log(`[${this.platformName}] Dismissing overlay: ${selector}`);
          await btn.first().click();
          await page.waitForTimeout(500);
        }
      } catch (err) {
        // Ignored
      }
    }
  }
}
