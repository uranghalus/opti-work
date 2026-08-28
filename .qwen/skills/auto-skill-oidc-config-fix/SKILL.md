---
name: oidc-config-fix
description: Fixes OpenID Connect (OIDC) invalid_client errors in Laravel Socialite by verifying and correcting .env and config/services.php configurations.
source: auto-skill
extracted_at: '2026-07-10T02:55:08.256Z'
---

# OIDC Configuration Fix for Laravel Socialite

## Problem
You encounter an `{"error":"invalid_client","error_description":"Client authentication failed"}` error when attempting to authenticate via OpenID Connect (OIDC) using Laravel Socialite.

## Solution
Follow these steps to diagnose and fix the OIDC configuration:

### 1. Verify Environment Variables (.env file)
Check your `.env` file for the following OIDC-related variables:

```env
OIDC_VERIFY_SSL=false
OIDC_CLIENT_ID=your_client_id_here
OIDC_CLIENT_SECRET=your_client_secret_here
OIDC_REDIRECT_URI='https://your-app-domain.com/auth/oidc/callback'
OIDC_BASE_URL='https://your-oidc-provider.com'
OIDC_AUTHORIZATION_URL="https://your-oidc-provider.com/oauth/authorize"
OIDC_TOKEN_URL="https://your-oidc-provider.com/oauth/token"
OIDC_USER_INFO_URL="https://your-oidc-provider.com/api/user"
```

**Common issues to check:**
- Remove any extra spaces, quotes, or invisible characters around values
- Ensure `OIDC_CLIENT_SECRET` has no leading/trailing spaces (common copy-paste error)
- Verify `OIDC_REDIRECT_URI` exactly matches the redirect URI registered in your OIDC provider (including trailing slashes and protocol)
- Confirm `OIDC_BASE_URL` is the base URL of your OIDC provider (without trailing slash unless required by provider)

### 2. Verify Configuration File (config/services.php)
Ensure your `config/services.php` contains the correct OIDC configuration:

```php
'oidc' => [
    'base_url' => env('OIDC_BASE_URL'),
    'client_id' => env('OIDC_CLIENT_ID'),
    'client_secret' => env('OIDC_CLIENT_SECRET'),
    'redirect' => env('OIDC_REDIRECT_URI'),
    'user_info_url' => env('OIDC_USER_INFO_URL'),
    'guzzle' => [
        'http_errors' => false,
        'verify' => env('OIDC_VERIFY_SSL', true),
    ],
],
```

**Important:** The `redirect` key must match the `redirect` key used by the Socialite provider (as configured by the SocialiteProviders/OIDC package).

### 3. Clear Configuration Cache
After modifying `.env` or `config/services.php`, clear the configuration cache:

```bash
php artisan config:clear
```

### 4. Verify OIDC Provider Settings
Log into your OIDC provider's admin console and confirm:
- The client ID and client secret match those in your `.env` file
- The redirect URI is exactly `https://your-app-domain.com/auth/oidc/callback` (or your `OIDC_REDIRECT_URI` value)
- OAuth/OIDC flows are enabled for the client (authorization code flow)
- Requested scopes (typically `openid`, `profile`, `email`) are allowed for the client

### 5. Check Application URL
Ensure your `APP_URL` in `.env` matches the domain you're accessing the application from (important when behind proxies/load balancers).

### 6. Test the Flow
After making changes:
1. Clear config cache: `php artisan config:clear`
2. Clear route cache (if routes changed): `php artisan route:clear`
3. Clear application cache: `php artisan cache:clear`
4. Retry the OIDC login flow

### 7. Enable Debugging (Optional)
If issues persist, temporarily enable debug logging in `.env`:

```env
APP_DEBUG=true
LOG_DEBUG=true
```

Then check `storage/logs/laravel.log` for detailed error messages during the OIDC callback.

## Prevention
- Use double quotes in `.env` only when necessary (to escape spaces/special characters); prefer single quotes for simple values
- When copying secrets, paste them into a plain text editor first to reveal hidden characters
- Use environment-specific `.env` files (e.g., `.env.local`) for development to avoid committing sensitive data

## Verification
After fixing the configuration, you should be able to:
1. Redirect to the OIDC provider's login page
2. Successfully authenticate with the OIDC provider
3. Be redirected back to your application's callback URL
4. Be logged in and redirected to your intended destination (e.g., dashboard)

If problems persist, verify that your OIDC provider is reachable from your application server and that no network/firewall issues block the connection.