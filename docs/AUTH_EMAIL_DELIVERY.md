# Confirmation email delivery — 8 October 2026

The reported “Too many attempts” message was caused by Supabase's confirmation-email quota. Auth logs showed three `/signup` HTTP 429 responses with `over_email_send_rate_limit`. Password sign-in `/token` requests instead showed successful logins or `invalid_credentials`, not a sign-in rate-limit error, in the inspected window.

The live Auth SMTP dashboard shows custom SMTP disabled. The user confirmed no SMTP provider is available yet. The application cannot override the built-in delivery quota or create an account when Supabase rejects signup. Email confirmation remains enabled; no users were manually confirmed and no passwords or security protections were changed.

## Implemented correction

`authErrorMessage` distinguishes confirmation-email quota exhaustion from password-attempt throttling. Signup now says that confirmation email could not be sent because the project reached its email limit and directs the user to retry later/contact the team. A quota rejection is never displayed as a successful confirmation request. Actual HTTP 429 password-attempt errors retain their throttling message.

Validation: 51 automated tests passed and production build passed. Added regression coverage for a mocked real `over_email_send_rate_limit` response and preserved normal throttling behavior. No test emails or accounts were created for verification.

## Required delivery setup

To support signup by multiple real users, choose a transactional email provider, configure a verified sender according to that provider's requirements, and enter its SMTP host, port, username, password and sender identity directly in Supabase Authentication > Emails > SMTP Settings. Verify a real confirmation email after saving, including its production destination. Existing production Site URL and exact allowed redirect remain configured.

This is an external configuration dependency, not resolved by the frontend message correction. Retrying after the quota recovers can permit another attempt; recovery time was not supplied by the inspected error, so the UI does not promise a particular countdown. Supabase's built-in email service also has recipient restrictions and is not appropriate for general production signup. See [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp) and [Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits).
