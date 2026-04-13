const { test, expect } = require('@playwright/test');
const SubscriptionPage = require('../pages/SubscriptionPage');

test.describe('Продление подписки', () => {
  let subscriptionPage;

  test.beforeEach(async ({ page }) => {
    subscriptionPage = new SubscriptionPage(page);
    await subscriptionPage.navigate();
  });

  test('успешное продление подписки для user1 на 1 месяц', async () => {
    await subscriptionPage.extendSubscription('user1', 1);

    await expect(subscriptionPage.resultArea).toContainText('2024-04-15');

    const resultText = await subscriptionPage.getResultText();

    expect(await subscriptionPage.expectSuccess()).toBeTruthy();
    expect(resultText).toContain('2024-04-15');
  });


  test('ошибка для пользователя со статусом Declined', async () => {
    await subscriptionPage.extendSubscription('user3', 3);

    await expect(subscriptionPage.resultArea).toContainText('Declined');
    expect(await subscriptionPage.expectError()).toBeTruthy();
  });

  test('ошибка для несуществующего пользователя', async () => {
    await subscriptionPage.extendSubscription('user999', 6);

    await expect(subscriptionPage.resultArea).toContainText('Пользователь не найден');
    expect(await subscriptionPage.expectError()).toBeTruthy();
  });

  test('ошибка при пустом ID', async () => {
    await subscriptionPage.setUserId('');
    await subscriptionPage.selectDuration(1);
    await subscriptionPage.clickExtend();

    await expect(subscriptionPage.resultArea).toContainText('Введите ID пользователя');
    expect(await subscriptionPage.expectError()).toBeTruthy();
  });

  test('endpoint /status возвращает метаданные сервиса', async ({ request }) => {
    const response = await request.get('/status');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('Subscription API');
    expect(body.version).toBe('1.0.0');
  });
});

const successCases = [
  {
    userId: 'user1',
    duration: 1,
    expectedDate: '2024-04-15'
  },
  {
    userId: 'user1',
    duration: 3,
    expectedDate: '2024-06-15'
  },
  {
    userId: 'user1',
    duration: 6,
    expectedDate: '2024-09-15'
  },
  {
    userId: 'user1',
    duration: 12,
    expectedDate: '2025-03-15'
  },
  {
    userId: 'user2',
    duration: 1,
    expectedDate: '2024-02-29'
  }
];

test.describe('Data-Driven: успешные сценарии', () => {
  for (const testCase of successCases) {
    test(`user=${testCase.userId}, duration=${testCase.duration}`, async ({ page }) => {
      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();

      await subscriptionPage.extendSubscription(testCase.userId, testCase.duration);

      await expect(subscriptionPage.resultArea).toContainText(testCase.expectedDate);
      expect(await subscriptionPage.expectSuccess()).toBeTruthy();
    });
  }
});

const errorCases = [
  {
    userId: 'user3',
    duration: 1,
    expectedMessage: 'Declined'
  },
  {
    userId: 'unknown_user',
    duration: 3,
    expectedMessage: 'Пользователь не найден'
  }
];

test.describe('Data-Driven: ошибочные сценарии', () => {
  for (const testCase of errorCases) {
    test(`user=${testCase.userId}, duration=${testCase.duration}`, async ({ page }) => {
      const subscriptionPage = new SubscriptionPage(page);
      await subscriptionPage.navigate();

      await subscriptionPage.extendSubscription(testCase.userId, testCase.duration);

      await expect(subscriptionPage.resultArea).toContainText(testCase.expectedMessage);
      expect(await subscriptionPage.expectError()).toBeTruthy();
    });
  }
});