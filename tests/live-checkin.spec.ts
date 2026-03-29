import { test, expect } from '@playwright/test';

// You can use a dedicated test user.
const HOST_EMAIL = process.env.TEST_HOST_EMAIL || 'test-host@ezcheck.me';
const HOST_PASS = process.env.TEST_HOST_PASSWORD || 'password123';

test.describe('Live Check-in Multi-Context Flow', () => {

  test('Host starts a session and Attendee joins via mobile tab', async ({ browser }) => {
    
    // ---------------------------------------------------------
    // CONTEXT 1: The Host (Desktop)
    // ---------------------------------------------------------
    
    // 1. Launch a dedicated browser context for the Host
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    
    // 2. Host Logs In
    await hostPage.goto('/login');
    // Note: Adjust the data-testids or locators to match your actual UI
    await hostPage.fill('input[type="email"]', HOST_EMAIL);
    await hostPage.fill('input[type="password"]', HOST_PASS);
    await hostPage.click('button[type="submit"]');

    // 3. Wait for dashboard and navigate to a course
    // Assuming there's a link or button indicating a course to start
    await expect(hostPage.locator('text=Dashboard')).toBeVisible();
    await hostPage.click('text=Test Course 101'); // Placeholder course name

    // 4. Start a Live Check-in Session
    await hostPage.click('button:has-text("Start Check-in")');
    
    // 5. Extract the Session PIN or URL generated for the attendees
    // We assume the PIN is displayed in a specific element
    await expect(hostPage.locator('.session-pin-display')).toBeVisible({ timeout: 10000 });
    const sessionPin = await hostPage.locator('.session-pin-display').innerText();
    
    console.log(`Live Session Started! PIN extracted: ${sessionPin}`);

    
    // ---------------------------------------------------------
    // CONTEXT 2: The Attendee (Simulated Mobile Device)
    // ---------------------------------------------------------
    
    // 1. Launch a separate context simulating a mobile device (e.g. iPhone)
    // This allows us to test the mobile Check-in flow fully isolated from the Host's session
    const attendeeContext = await browser.newContext({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15',
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const attendeePage = await attendeeContext.newPage();
    
    // 2. Attendee navigates to the checkin URL directly
    // The link might be /checkin, /student-login, or dynamic based on the PIN
    await attendeePage.goto('/checkin');
    
    // 3. Attendee signs up / logs in
    // Matching your AttendeeSignUp.tsx flow
    await attendeePage.fill('input[name="name"]', 'Playwright Attendee');
    await attendeePage.fill('input[name="email"]', 'attendee-test@ezcheck.me');
    await attendeePage.click('button:has-text("Next")');
    
    // Note: Assuming no SMS validation block on staging/test environments,
    // or you mock the endpoints using attendeePage.route()
    
    // 4. Input the Host's live session PIN
    await attendeePage.fill('input[name="pin"]', sessionPin.trim());
    await attendeePage.click('button:has-text("Join Session")');
    
    // 5. Confirm Attendee sees "Checked In" success screen
    await expect(attendeePage.locator('text=Check-in Successful')).toBeVisible({ timeout: 15000 });


    // ---------------------------------------------------------
    // VERIFICATION: Back to Host Context 1
    // ---------------------------------------------------------
    
    // 1. Verify that the Host's attendance grid/WebSocket updated in real-time
    // The Host's live view should now reflect the new attendee
    await expect(hostPage.locator('text=Playwright Attendee')).toBeVisible();
    
    console.log('Test Passed! Attendee successfully checked in and was verified on Host dashboard.');
    
    // Cleanup
    await hostContext.close();
    await attendeeContext.close();
  });

});
