import { test, expect } from '@playwright/test';
const testData = JSON.parse(JSON.stringify(require('../test-data/testData.json')));

test.describe('Login Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.douglas.de/login');
    await page.getByRole('button', { name: 'Nur Unbedingt Erforderlich' }).click();
  });

  test('Check UI elements of Login form', async ({ page }) => {

    // Expect the login form to have the title 'Ich bin bereits Douglas-Kund*in'
    await expect(page.getByText('Ich bin bereits Douglas-Kund*in')).toBeVisible();

    // Expect '* Pflichtfeld' text to be displayed above the fields
    await expect(page.locator('#loginForm').getByText('* Pflichtfeld')).toBeVisible();

    // Expect E-mail field to be visible and have placeholder 'E-Mail-Adresse*'
    await expect(page.getByTestId('grid').locator('input[type="email"]')).toBeVisible();
    const emailPlaceholderText = await page.getByTestId('grid').locator('input[type="email"]').getAttribute('placeholder');
    await expect(emailPlaceholderText).toBe('E-Mail-Adresse*');

    // Expect Password field to be visible and have placeholder 'Passwort*'
    await expect(page.locator('#loginForm').getByPlaceholder('Passwort*')).toBeVisible();

    // Expect Show Password button to be visible
    await expect(page.getByTestId('grid').getByRole('button').first()).toBeVisible();

    // Expect Forget Password link to be visible
    await expect(page.getByText('Passwort vergessen?')).toBeVisible();

    // Expect Remember Me checkbox to be visible and have 'Eingeloggt bleiben' label
    await expect(page.getByTestId('checkbox-remember-me')).not.toBeChecked();
    await expect(page.getByText('Eingeloggt bleiben')).toBeVisible();

    // Expect Login button to be visible and enabled
    await expect(page.getByTestId('grid').getByRole('button', { name: 'Anmelden' })).toBeEnabled()
  });

  test('Login with valid credentials', async ({ page }) => {

    // Fill in the E-mail field with valid e-mail
    await page.getByTestId('grid').locator('input[type="email"]').click();
    await page.getByTestId('grid').locator('input[type="email"]').fill(testData.validUser.email);
    await expect(page.getByTestId('grid').getByRole('img').first()).toBeVisible();

    // Fill in the Password field with valid password
    await page.locator('#loginForm').getByPlaceholder('Passwort*').click();
    await page.locator('#loginForm').getByPlaceholder('Passwort*').fill(testData.validUser.password);

    // Check the Remember Me checkbox    
    await page.getByTestId('checkbox-remember-me').check();

    // Log in
    await page.getByTestId('grid').getByRole('button', { name: 'Anmelden' }).click();

    // Check that user is redirected to the Account page and its heading shows the correct user name
    await expect(page.getByTestId('grid')).toHaveClass(/account-page/);
    await expect(page.getByRole('heading', { name: `Hallo ${testData.validUser.name}` })).toBeVisible();
  });

  test('Login with valid e-mail and invalid password', async ({ page }) => {

    // Fill in the E-mail field with valid e-mail
    await page.getByTestId('grid').locator('input[type="email"]').click();
    await page.getByTestId('grid').locator('input[type="email"]').fill('kar.love.art@gmail.com');

    // Fill in the Password field with invalid password
    await page.locator('#loginForm').getByPlaceholder('Passwort*').click();
    await page.locator('#loginForm').getByPlaceholder('Passwort*').fill('123456');

    // Log in
    await page.getByTestId('grid').getByRole('button', { name: 'Anmelden' }).click();

    // Expect error message to be visible
    await expect(page.getByText('Falsche Zugangsdaten')).toBeVisible();
  });

  test('Login with valid e-mail and without password', async ({ page }) => {

    // Fill in the E-mail field with valid e-mail
    await page.getByTestId('grid').locator('input[type="email"]').click();
    await page.getByTestId('grid').locator('input[type="email"]').fill('kar.love.art@gmail.com');

    // Log in
    await page.getByTestId('grid').getByRole('button', { name: 'Anmelden' }).click();

    // Expect error message to be visible
    await expect(page.getByText('Bitte überprüfe deine Angaben')).toBeVisible();

    // Expect '* Pflichtfeld' text to be displayed below the Password field
    await expect(page.getByText('* Pflichtfeld').nth(1)).toBeVisible();

    // Expect Password field to change appearance / to have red border
    await expect(page.locator('#loginForm').getByPlaceholder('Passwort*')).toHaveClass(/input__input--error/);
  });

  test('Login with empty fields', async ({ page }) => {

    // Log in
    await page.getByTestId('grid').getByRole('button', { name: 'Anmelden' }).click();

    // Expect error message to be visible
    await expect(page.getByText('Bitte überprüfe deine Angaben')).toBeVisible();

    // Expect '!' icon to be displayed in the E-mail field
    await expect(page.locator('div').filter({ hasText: /^E-Mail-Adresse\*\* Pflichtfeld$/ }).getByRole('img')).toBeVisible();

    // Expect '* Pflichtfeld' text to be displayed below E-mail and Password fields
    await expect(page.getByText('* Pflichtfeld').nth(1)).toBeVisible();
    await expect(page.getByText('* Pflichtfeld').nth(2)).toBeVisible();

    // Expect E-mail and Password fields to change appearance / to have red border
    await expect(page.getByTestId('grid').locator('input[type="email"]')).toHaveClass(/input__input--error/);
    await expect(page.locator('#loginForm').getByPlaceholder('Passwort*')).toHaveClass(/input__input--error/);
  });

  test('Login with non-existing account', async ({ page }) => {

    // Fill in the E-mail field with non-existing e-mail
    await page.getByTestId('grid').locator('input[type="email"]').click();
    await page.getByTestId('grid').locator('input[type="email"]').fill(testData.invalidUser.email);

    // Fill in the Password field with non-existing password
    await page.locator('#loginForm').getByPlaceholder('Passwort*').click();
    await page.locator('#loginForm').getByPlaceholder('Passwort*').fill(testData.invalidUser.password);

    // Log in
    await page.getByTestId('grid').getByRole('button', { name: 'Anmelden' }).click();

    // Expect error message to be visible
    await expect(page.getByText('Falsche Zugangsdaten')).toBeVisible();
  });

  test('Enter e-mail in invalid format into Login form', async ({ page }) => {

    // Fill in the E-mail field with an e-mail in invalid format
    await page.getByTestId('grid').locator('input[type="email"]').click();
    await page.getByTestId('grid').locator('input[type="email"]').fill('abcd');

    // Move focus to the Password field
    await page.locator('#loginForm').getByPlaceholder('Passwort*').click();

    // Expect error message to appear under the E-mail field
    await expect(page.getByText('Ungültige E-Mail-Adresse')).toBeVisible();

    // Expect '!' icon to be displayed in the E-mail field
    await expect(page.locator('div').filter({ hasText: /^E-Mail-Adresse\*Ungültige E-Mail-Adresse$/ }).getByRole('img')).toBeVisible();

    // Expect the E-mail field to change appearance / to have red border
    await expect(page.getByTestId('grid').locator('input[type="email"]')).toHaveClass(/input__input--error/);
  });
});

test.describe('Password Reset Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.douglas.de/login');
    await page.getByRole('button', { name: 'Nur Unbedingt Erforderlich' }).click();
    await page.getByText('Passwort vergessen?').click();
  });

  test('Check UI elements of Reset Password form', async ({ page }) => {

    // Expect dialog to have title 'Du hast dein Passwort vergessen?'
    await expect(page.getByText('Du hast dein Passwort vergessen?')).toBeVisible();

    // Expect explaanation text to be displayed below the title
    await expect(page.getByText('Bitte gib hier die E-Mail-Adresse ein, mit der du dein Douglas-Konto erstellt ha')).toBeVisible();

    // Expect X button to be visible
    await expect(page.getByTestId('modal-header-close')).toBeVisible();

    // Expect '* Pflichtfeld' text to be displayed above the e-mail field
    await expect(page.locator('#forgotPasswordForm').getByText('* Pflichtfeld')).toBeVisible();

    // Expect E-mail field to be visible and to have a placeholder
    await expect(page.getByRole('textbox', { name: 'E-Mail-Adresse*' })).toBeVisible();
    const emailPlaceholderText = await page.getByRole('textbox', { name: 'E-Mail-Adresse*' }).getAttribute('placeholder');
    await expect(emailPlaceholderText).toBe('E-Mail-Adresse*');

    // Expect Send E-mail button to be visibla and enabled
    await expect(page.getByRole('button', { name: 'E-Mail absenden' })).toBeEnabled();

    // Expect Close button to be visibla and enabled
    await expect(page.getByRole('button', { name: 'Schliessen' })).toBeEnabled();
  });

  test('Reset password with valid e-mail', async ({ page }) => {

    // Enter existing e-mail to reset password
    await page.getByRole('textbox', { name: 'E-Mail-Adresse*' }).click();
    await page.getByRole('textbox', { name: 'E-Mail-Adresse*' }).fill(testData.validUser.email);
    await expect(page.locator('#forgotPasswordForm').getByRole('img')).toBeVisible();

    // Click on Send E-mail button
    await page.getByRole('button', { name: 'E-Mail absenden' }).click();

    // Expect 'E-mail sent' dialog to be opened
    await expect(page.getByRole('heading', { name: 'E-Mail verschickt' })).toBeVisible();

    // Close the dialog
    await page.getByRole('button', { name: 'Schliessen' }).click();
  });

  test('Reset password with empty e-mail', async ({ page }) => {

    // Click on Send E-mail button
    await page.getByRole('button', { name: 'E-Mail absenden' }).click();

     // Expect '* Pflichtfeld' text to be displayed below the E-mail field
    await expect(page.getByText('* Pflichtfeld').nth(3)).toBeVisible();

    // Expect '!' icon to be displayed in the E-mail field
    await expect(page.locator('#forgotPasswordForm').getByRole('img')).toBeVisible();

    // Expect the E-mail field to change appearance / to have red border
    await expect(page.getByRole('textbox', { name: 'E-Mail-Adresse*' })).toHaveClass(/input__input--error/);
  });

  test('Reset password for non-existing e-mail', async ({ page }) => {

    // Enter non-existing e-mail to reset password
    await page.getByRole('textbox', { name: 'E-Mail-Adresse*' }).click();
    await page.getByRole('textbox', { name: 'E-Mail-Adresse*' }).fill(testData.invalidUser.email);

    // Click on Send E-mail button
    await page.getByRole('button', { name: 'E-Mail absenden' }).click();

    // Expect 'E-mail sent' dialog to be opened
    await expect(page.getByRole('heading', { name: 'E-Mail verschickt' })).toBeVisible();

    // Close the dialog
    await page.getByTestId('modal-header-close').click();
  });

  test('Enter e-mail in invalid format into Reset Password form', async ({ page }) => {

    // Fill in the E-mail field with an e-mail in invalid format
    await page.getByRole('textbox', { name: 'E-Mail-Adresse*' }).click();
    await page.getByRole('textbox', { name: 'E-Mail-Adresse*' }).fill('abcde');

    // Click on Send E-mail button
    await page.getByRole('button', { name: 'E-Mail absenden' }).click();

    // Expect error message to be visible
    await expect(page.getByText('Ungültige E-Mail-Adresse')).toBeVisible();

    // Expect '!' icon to be displayed in the E-mail field
    await expect(page.locator('#forgotPasswordForm').getByRole('img')).toBeVisible();

    // Expect the E-mail field to change appearance / to have red border
    await expect(page.getByRole('textbox', { name: 'E-Mail-Adresse*' })).toHaveClass(/input__input--error/);
  });

  test('Check UI elements of E-mail sent dialog', async ({ page }) => {

    // Enter existing e-mail to reset password and send e-mail
    await page.getByRole('textbox', { name: 'E-Mail-Adresse*' }).click();
    await page.getByRole('textbox', { name: 'E-Mail-Adresse*' }).fill(testData.validUser.email);
    await page.getByRole('button', { name: 'E-Mail absenden' }).click();

    // Expect checkmark icon to be displayed on the top of the dialog
    await expect(page.getByRole('img').locator('path').first()).toBeVisible();

    // Expect dialog to have title 'E-Mail verschickt'
    await expect(page.getByRole('heading', { name: 'E-Mail verschickt' })).toBeVisible();

    // Expect 'Thank you..' text to be displayed below the title
    await expect(page.getByText('Vielen Dank für die Anforderung eines neuen Passworts! Wir haben dir an folgende')).toBeVisible();

    // Expect valid e-mail, that user entered before, to be displayed in the middle of the dialog
    await expect(page.getByText(testData.validUser.email)).toBeVisible();

    // Expect instructions to be displayed below the e-mail
    await expect(page.getByText('Bitte klicke auf den Link und lege innerhalb der nächsten 24 Stunden dein Passwo')).toBeVisible();
    await expect(page.getByText('Bitte beachte: Wenn du mit der oben genannten E-Mail-Adresse noch kein Konto bei')).toBeVisible();

    // Expect Close button to be displayed and enabled
    await expect(page.getByRole('button', { name: 'Schliessen' })).toBeEnabled();
  });
});