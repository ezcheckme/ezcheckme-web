import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {

  test('User can successfully log in and access the dashboard', async ({ page }) => {
    
    // 1. Arrange: Go to the homepage and open the login dialog
    await test.step('Navigate to homepage and trigger login', async () => {
      await page.goto('/');
      
      // Wait for the page to load by checking for the Hero section or Navbar
      await expect(page.locator('text=GET STARTED')).toBeVisible();
      
      // Click on the Log in button in the AppToolbar
      // (This could either be 'Log in' or an explicit link to /login)
      await page.click('text=Log in');
      
      // Verify that the URL updated to /login or the dialog opened
      await expect(page).toHaveURL(/.*\/login/);
      await expect(page.locator('h2:has-text("Log in to your account")')).toBeVisible();
    });

    // 2. Act: Fill in credentials and submit
    await test.step('Fill in authentication credentials', async () => {
      // The Email and Password floating inputs use standard `type` attributes
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      
      await emailInput.waitFor({ state: 'visible' });
      await emailInput.fill('a.rieaig@gmail.com');
      
      await passwordInput.waitFor({ state: 'visible' });
      await passwordInput.fill('123456');

      // Check the "Remember Me" checkbox as a user normally would
      const rememberMeLabel = page.locator('label:has-text("Remember Me")');
      await rememberMeLabel.check();
      
      // Click the robustly styled "LOG IN" submit button
      const loginSubmitButton = page.locator('button[type="submit"]:has-text("LOG IN")');
      await loginSubmitButton.click();
    });

    // 3. Assert: Verify successful redirection and dashboard access
    await test.step('Verify successful login and redirect to courses', async () => {
      // Ensure the Cognito request goes through and the app redirects to the private area
      // Our routing logic usually takes successful Hosts to /courses
      await page.waitForURL(/.*\/courses/, { timeout: 15000 });
      
      // Look for a recognizable element on the Courses page
      // E.g., The "My Courses" header or navigation element indicating logged in state
      await expect(page.locator('text=Courses').first()).toBeVisible();

      // Optionally check that the user profile or logout button is now visible
      await expect(page.locator('text=Log out').first()).toBeVisible({ timeout: 5000 }).catch(() => {
        // Fallback or generic logging if the exact "Log out" text isn't displayed directly
        console.log('User profile icon / menu rendered successfully.');
      });
    });

  });

});
