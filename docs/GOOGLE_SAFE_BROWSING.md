# Google security review — 8 October 2026

## Confirmed finding

Google's public Safe Browsing report classified `https://protostar-campus.vercel.app/` as unsafe. After URL-prefix ownership verification in Search Console, the Security Issues report showed one issue: **Deceptive pages**, with the homepage as its sample URL. This is a Google classification, not an HTTPS certificate failure. Google's original detection trigger is unknown.

## Checks and changes

- Inspected homepage/login code uses the project's local Vite assets and Supabase Auth for this app's accounts. No unexpected external scripts, automatic third-party redirects or software-install prompts were found in the inspected code. These checks are not a complete infrastructure security assessment.
- Added visible wording above the authentication form identifying Porto-Star as an independent student hackathon prototype, not an official college portal. It tells users to use only their Porto-Star password, never their email-provider or college password, identifies Supabase Auth and links to the public project source.
- Public synthetic demo remains available without an account. Authentication, confirmation requirements and data permissions were not weakened.
- Added Google's verification meta tag to `index.html`. Ownership verification succeeded. Keep the tag in future deployments to retain verification.
- Deployed the changes to production: `dpl_HnfUzvb7JGytJ8RCLERxM33wueme`, Vercel status `READY` and stable domain alias confirmed.
- Local production build and all 51 tests passed. Deployed `/assets/index-Co7FG4Ce.js` matches the local build with SHA-256 `17eb2157cd0a796b1f8dd08ec0922b470859b93ae04e1f549324b3c58baa0ace`.

## Review submissions and current limit

The earlier Google Safe Browsing possible-false-positive form returned **Submission was successful**. Receipt: [Safe Browsing submission](review/google-safe-browsing-submitted.png).

After verification and deployment, the Search Console owner review was submitted with the observed findings, identity clarification, source link and validation results. Google displayed **Request submitted successfully** in a temporary notification. The saved [Search Console report screenshot](review/search-console-review-submitted.png) captures the issue still listed after submission; the temporary success notification had disappeared before that file was saved.

The submission explicitly states that the original detection trigger is unknown and requests re-evaluation; it does not claim every backend component is secure. The Security Issues report still showed the issue immediately after submission. No review approval, removal of the warning, case ID or completion date was provided.

Google must decide the review and update its classification. Do not bypass Chrome's interstitial, disable Safe Browsing or change domains to evade the warning. Check the [Security Issues report](https://search.google.com/search-console/security-issues?resource_id=https%3A%2F%2Fprotostar-campus.vercel.app%2F) for Google's response and any additional findings. Follow [Google's social-engineering remediation guidance](https://developers.google.com/search/docs/monitor-debug/security/social-engineering) if the review identifies specific remaining problems.
