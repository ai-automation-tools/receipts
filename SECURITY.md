# Security policy

Receipts makes one promise that matters more than any feature: nothing leaves your browser
except requests for the pages a Google AI Overview cites. Those pages are fetched without your
cookies. Your search, the overview text and the results stay on your machine. There is no
server, no analytics and no API key. A bug that breaks that promise is a security bug.

## Reporting a vulnerability

Report it privately through GitHub's security advisories: open the repository's
**Security** tab and click **Report a vulnerability**
(`https://github.com/ai-automation-tools/receipts/security/advisories/new`). Please don't
open a public issue for it.

Say what you found, the steps or page that show it, and the browser and extension versions
you saw it on. You'll get a reply within a week. Once a fix ships, the advisory is published
with credit to you unless you'd rather stay anonymous.

## What counts

- The extension contacting any host that isn't a URL the overview cites.
- A cited page fetched with your cookies or other credentials.
- Text from a fetched page or the results page run as HTML or script inside the popup, the
  demo or the results page (Receipts treats all page text as untrusted).
- The extension asking for a permission the README's permissions table doesn't list.

A claim marked `not located` that the page really does contain is a matching bug, not a
vulnerability. Open a normal issue for that.

## Supported versions

Only the latest release gets fixes.
