class SubscriptionPage {
  constructor(page) {
    this.page = page;
    this.userIdInput = page.locator('#userId');
    this.durationSelect = page.locator('#duration');
    this.extendButton = page.locator('#extendBtn');
    this.resultArea = page.locator('#result');
  }

  async navigate() {
    await this.page.goto('/');
  }

  async setUserId(userId) {
    await this.userIdInput.fill(String(userId));
  }

  async selectDuration(months) {
    await this.durationSelect.selectOption(String(months));
  }

  async clickExtend() {
    await this.extendButton.click();
  }

  async extendSubscription(userId, months) {
    await this.setUserId(userId);
    await this.selectDuration(months);
    await this.clickExtend();
  }

  async getResultText() {
    await this.resultArea.waitFor();
    return (await this.resultArea.textContent())?.trim();
  }

  async getResultClass() {
    return await this.resultArea.getAttribute('class');
  }

  async expectSuccess() {
    await this.resultArea.waitFor();
    const className = await this.getResultClass();
    return className.includes('success');
  }

  async expectError() {
    await this.resultArea.waitFor();
    const className = await this.getResultClass();
    return className.includes('error');
  }
}

module.exports = SubscriptionPage;