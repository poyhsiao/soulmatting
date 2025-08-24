import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('should display login form', async ({ page }) => {
      // Check for login form elements
      await expect(page.locator('[data-testid="email"], input[type="email"]')).toBeVisible();
      await expect(page.locator('[data-testid="password"], input[type="password"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-button"], button[type="submit"]')).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      const loginButton = page.locator('[data-testid="login-button"], button[type="submit"]');
      await loginButton.click();
      
      // Check for validation error messages
      await expect(page.locator('text=/email.*required/i, text=/email.*invalid/i')).toBeVisible();
      await expect(page.locator('text=/password.*required/i')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.fill('[data-testid="email"], input[type="email"]', 'invalid@example.com');
      await page.fill('[data-testid="password"], input[type="password"]', 'wrongpassword');
      
      const loginButton = page.locator('[data-testid="login-button"], button[type="submit"]');
      await loginButton.click();
      
      // Check for error message
      await expect(page.locator('text=/invalid.*credentials/i, text=/login.*failed/i, [data-testid="error-message"]')).toBeVisible();
    });

    test('should have link to registration page', async ({ page }) => {
      const signUpLink = page.locator('a[href*="register"], a[href*="signup"], text=/sign up/i, text=/create account/i');
      await expect(signUpLink.first()).toBeVisible();
    });

    test('should have forgot password link', async ({ page }) => {
      const forgotPasswordLink = page.locator('a[href*="forgot"], a[href*="reset"], text=/forgot.*password/i');
      await expect(forgotPasswordLink.first()).toBeVisible();
    });
  });

  test.describe('Registration Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
    });

    test('should display registration form', async ({ page }) => {
      // Check for registration form elements
      await expect(page.locator('[data-testid="email"], input[type="email"]')).toBeVisible();
      await expect(page.locator('[data-testid="password"], input[type="password"]')).toBeVisible();
      await expect(page.locator('[data-testid="register-button"], button[type="submit"]')).toBeVisible();
    });

    test('should show validation errors for invalid email', async ({ page }) => {
      await page.fill('[data-testid="email"], input[type="email"]', 'invalid-email');
      await page.fill('[data-testid="password"], input[type="password"]', 'password123');
      
      const registerButton = page.locator('[data-testid="register-button"], button[type="submit"]');
      await registerButton.click();
      
      // Check for email validation error
      await expect(page.locator('text=/email.*invalid/i, text=/valid.*email/i')).toBeVisible();
    });

    test('should show validation errors for weak password', async ({ page }) => {
      await page.fill('[data-testid="email"], input[type="email"]', 'test@example.com');
      await page.fill('[data-testid="password"], input[type="password"]', '123');
      
      const registerButton = page.locator('[data-testid="register-button"], button[type="submit"]');
      await registerButton.click();
      
      // Check for password validation error
      await expect(page.locator('text=/password.*weak/i, text=/password.*short/i, text=/password.*requirements/i')).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
      const loginLink = page.locator('a[href*="login"], text=/sign in/i, text=/already.*account/i');
      await expect(loginLink.first()).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing protected route without auth', async ({ page }) => {
      // Try to access a protected route
      await page.goto('/dashboard');
      
      // Should be redirected to login
      await page.waitForURL('**/login');
      expect(page.url()).toContain('/login');
    });

    test('should redirect to login when accessing profile without auth', async ({ page }) => {
      // Try to access profile page
      await page.goto('/profile');
      
      // Should be redirected to login
      await page.waitForURL('**/login');
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Social Authentication', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('should display social login options', async ({ page }) => {
      // Check for social login buttons
      const googleButton = page.locator('button:has-text("Google"), [data-testid="google-login"]');
      const facebookButton = page.locator('button:has-text("Facebook"), [data-testid="facebook-login"]');
      
      // At least one social login option should be available
      const socialButtons = page.locator('button:has-text("Google"), button:has-text("Facebook"), button:has-text("GitHub")');
      await expect(socialButtons.first()).toBeVisible();
    });
  });
});