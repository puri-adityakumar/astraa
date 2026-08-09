# Privacy Policy

Last updated: August 8, 2026

This page describes the data flows implemented by Astraa. It is intended to be
a technically accurate explanation of the current application, not a promise
about features Astraa does not provide.

## Summary

Most Astraa tools process their input entirely in your browser. A small number
of provider-backed features send only the data needed to perform the requested
operation. Astraa has no user accounts, purchase flow, advertising profile, or
cloud-sync feature.

Do not enter secrets or personal information into a provider-backed feature.
Third-party providers process requests under their own terms and privacy
policies.

## Tools that process data locally

The calculator, password generator, hash generator, image tools, unit
converter, JSON tools, Markdown tools, Base64 tools, regex tester, and snippet
generator perform their core input processing in the browser. Their working
content is not intentionally uploaded to Astraa's servers.

Some pages load public visual assets such as flags, cryptocurrency icons, or
contributor avatars from third-party hosts. Loading an asset sends the ordinary
web request metadata needed to retrieve it, but not the content entered into a
tool.

## Provider-backed features

### AI text generation

When you choose **Generate**, Astraa sends the topic and requested word count to
an Astraa server action. The server forwards them to the configured OpenRouter
model provider and returns the generated output. Astraa does not intentionally
store the topic or generated output. Provider policies may apply to that
request.

To limit abuse, the server derives a salted one-way hash from request network
metadata. The production rate-limit entry is used only to count requests and
expires after approximately ten minutes. The raw value is not used as the
rate-limit key.

### Currency and cryptocurrency rates

The browser sends the selected currency or cryptocurrency pair to Astraa's
rate endpoints. The amount you type remains in the browser and is multiplied by
the returned rate locally.

The server obtains fiat data from the configured currency providers (the
Fawaz Ahmed currency dataset through jsDelivr, with ExchangeRate-API as a
fallback) and cryptocurrency data from CoinGecko. Fiat responses are cached for
about one hour; cryptocurrency responses are cached for about one minute.

### Public contributor data

Astraa's server fetches public contributor names, profile links, avatars, and
contribution counts from GitHub. This public data is cached for about one hour
and passed to the page; the visitor's browser does not call GitHub's contributor
API directly. The Contribute page also contains a GitHub Sponsors embed, which
loads from GitHub when that page is viewed.

## Browser storage

Astraa stores preferences, tool settings, editor state, and local usage state in
IndexedDB, with localStorage as a fallback when needed. This data is not a cloud
account and is not synced by Astraa. You can remove it by clearing site data for
Astraa in your browser. If browser storage is unavailable, the tools continue
with non-persistent defaults where possible.

## Production analytics and performance data

Production deployments enable Vercel Web Analytics and Speed Insights by
default. They provide limited aggregate page-view and performance signals and
do not use an Astraa-created advertising identifier. Operators can disable both
together by setting `ASTRAA_ENABLE_ANALYTICS=false` before building or
deploying.

Vercel, the hosting provider, also receives ordinary request metadata needed to
serve and protect the site. See Vercel's privacy documentation for its handling
and retention practices.

## Error monitoring

Sentry error and trace reporting is optional and remains disabled unless a DSN
and deployment environment are configured. When enabled:

- default personal-data collection is disabled;
- session replay and Sentry logs are disabled;
- production traces are sampled at a low rate;
- error messages, URLs, headers, request bodies, form values, tool input,
  clipboard content, and rate-limit identities are removed or redacted before
  an event is sent.

Operational error codes, route templates, release/environment identifiers, and
coarse timings may be retained to diagnose failures. Sentry's configured
project retention and privacy terms apply.

## External links

Astraa links to GitHub, Notion, X, Telegram, and other third-party sites. Once
you follow an external link, that site's privacy policy and settings apply.

## Children

Astraa is a general-purpose utility site and does not provide accounts or
features designed to collect information from children. If you believe the
service has received personal information unexpectedly, contact us so the issue
can be investigated.

## Changes

This policy should be updated whenever a feature adds or materially changes an
external data flow. The current version and date will be posted on this page.

## Contact

Questions about this policy can be sent to
[contact@astraa.tech](mailto:contact@astraa.tech).
