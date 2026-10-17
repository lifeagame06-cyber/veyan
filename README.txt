VAYEN PWA INSTALL FIX

1. Replace profile.html in your website root with the file from this ZIP.
2. Ensure manifest.json is in the same website root.
3. Confirm images/icon-192.png and images/icon-512.png actually exist and are valid PNG files.
4. Confirm service-worker.js exists at the website root and registration works (already referenced by index.html).
5. Publish to HTTPS and reload the live profile page.

This adds the missing manifest reference to profile.html and preserves existing code.
The install button already listens for Chrome's beforeinstallprompt event.
Browsers only allow direct installation prompts when their eligibility criteria are met.
No website can force the native prompt when the browser does not provide that event.
If the prompt still does not appear, provide service-worker.js and both icon files for verification.
