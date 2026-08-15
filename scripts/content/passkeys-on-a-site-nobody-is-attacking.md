title: Passkeys on a site nobody is attacking
slug: passkeys-on-a-site-nobody-is-attacking
publishedAt: 2026-08-16
tags: Authentication, WebAuthn, Security
summary: I put WebAuthn on the admin panel of a personal portfolio — a system with one user and no attackers. The useful part was not making it work. It was writing down what it does not protect.
---

The admin panel on this site has exactly one user. Nobody is trying to get into it. There is no bug bounty, no threat model worth the name, and if someone did break in, the worst they could do is edit my CV.

I put passkeys on it anyway, and then I did the thing that actually mattered: I wrote down, in the code, everything the passkeys do not do.

## What went in

The implementation is unremarkable, which is the point. `@simplewebauthn/server` handles registration and authentication ceremonies. A successful assertion mints an HMAC-signed session cookie, and a custom Payload auth strategy reads that cookie and resolves it to a user. There is a single-use recovery code, scrypt-hashed, for the day I lose both authenticators. The authenticator's signature counter is checked on every login, so a cloned credential replaying an old assertion is rejected.

None of that is clever. All of it is in the SimpleWebAuthn documentation. The whole thing was an evening.

The interesting part started afterwards.

## Three things that were decoration

**The password login is still there.** Payload ships email-and-password authentication, and my first instinct was to rip it out — a passkey-only admin sounds better. It would also have meant that a browser profile reset before I had registered a second authenticator would have locked me out of my own site permanently. So the password stays as break-glass, and the health panel on the admin dashboard shows a red row until two authenticators are registered. The security control is not "passkeys only". It is "passkeys, plus a route back in that I have thought about".

**The rate limiter counts in the wrong place.** I wrote a fixed-window limiter for the WebAuthn endpoints, because `/auth/passkey/recover` accepted an email and a recovery code and would happily take an unlimited number of guesses at them. Then I read my own code and noticed the counter lives in the memory of one serverless instance. Vercel runs several. Each keeps its own tally. An attacker spreading requests across instances gets some multiple of the nominal limit.

The fix is a shared store — Postgres, or KV — and a database round trip on every request to an endpoint that gets hit approximately never. I decided that was not worth it here, and then I wrote thirty lines of comment above the limiter saying exactly that, naming the correct fix, so that whoever reads it next does not have to rediscover the hole.

That comment is the actual security artefact. The code is a speed bump. The comment is the thing that stops the speed bump being mistaken for a wall.

**A comment described a defence I did not have.** An earlier version of my security-headers file claimed the admin panel was WAF-restricted by geography. It was not. DNS points straight at Vercel, so there is no Cloudflare proxy in the request path and no rule to enforce. I had written down a control that existed only in my intentions, and then stopped thinking about the problem because the note said it was handled.

I deleted the claim and replaced it with a description of what actually protects that route. This is, I think, the most common security failure I have seen in twenty years of infrastructure work, and it has nothing to do with cryptography: **a documented defence you do not have is worse than an undocumented gap, because the gap at least still itches.**

## What I would tell someone doing this for real

Adding WebAuthn to a system that matters is not harder than this. The libraries are good. The specification is finished. The browsers agree with each other. If you are putting it off because it sounds like a large piece of work, it is not.

What is harder — and what the tutorials skip, because it is not a code sample — is the part where you write down honestly what the control covers. Passkeys make credential phishing very hard. They do nothing about an authenticated session being used from a machine that has been compromised. They do nothing about your recovery path, which is now the weakest thing in the system by construction, because it has to work when everything else has failed. They do nothing about the endpoint you forgot to put behind them.

I could only see all of that because the site is small enough to hold in my head. That is the one advantage a personal project has over a real system, and it seems a waste not to use it.

## The receipts

Everything above is in the repository behind this site, in the comments, including the paragraphs where I explain what I chose not to fix. I test the registration flow against a Chrome virtual authenticator rather than against my actual laptop, because a test you can only run by physically touching a fingerprint reader is a test you will stop running.

If you want to look at how a control is written down rather than just implemented, that is what to read — not the ceremony code, which is the same as everyone else's.
