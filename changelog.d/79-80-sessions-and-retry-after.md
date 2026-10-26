Phase W1: active sessions and devices ([issue #79](https://github.com/DocForum/docforum-web/issues/79))
and rate-limit/lockout UX with `Retry-After` ([issue #80](https://github.com/DocForum/docforum-web/issues/80)).

Sessions section in account settings lists coarse device/location, marks the
current device, revokes one or all others after confirmation, treats an
already-revoked session as gone (404), and clears React Query cache plus auth
state when the current session is revoked. No IP address is requested or shown.

`429` responses become typed `RateLimitError`s (`Retry-After` as delta-seconds
or an HTTP date, 60s fallback) that also raise one global non-blocking notice.
Login and signup show an account-agnostic countdown with screen-reader interval
announcements and disable submit until it ends. Both the fetch `withRetry` loop
and the React Query `retryDelay` use `Retry-After` as a floor, so no request is
retried sooner than the server allows.

Sessions API shapes are assumed pending docforum-core#38 (rate limiting depends
on docforum-core#35); documented in `ARCHITECTURE_ESSENTIALS.md` "Known
assumptions".
