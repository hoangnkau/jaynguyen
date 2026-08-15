title: What it actually costs to host it yourself
slug: self-hosting-pte-target
publishedAt: 2026-08-16
tags: Infrastructure, Self-hosted, Operations
summary: PTE Target serves public traffic from a machine I own, behind Cloudflare, administered remotely. Deploying to a platform is easier. This is what the easier option is buying you, and what it hides.
---

Anyone can push a repository to a platform and have a running site four minutes later. I do it too — this blog is on one. It is the right default for most things.

PTE Target is not on one. It runs on a LAMP stack on hardware I own and administer, fronted by Cloudflare. That decision has a price, and the price is not the one people expect.

## The bill is not the point

The usual argument for self-hosting is money, and the usual argument against it is that your time is worth more than the difference. Both are about the wrong axis.

What actually drove the decision was the AI scoring. PTE Target evaluates spoken and written answers, which means the expensive request is not the page load — it is the inference. On a platform, that work either goes to a metered API or to a runtime priced by execution time, and both of those bills scale with exactly the thing you want to encourage users to do more of. A product whose cost per active user rises with engagement is a product that quietly wants fewer users.

Owning the machine flips that. The capacity is bought; using it more does not cost more. The trade is that the ceiling is fixed and you are the one who has to notice when you approach it.

That is the honest shape of the choice, and it has nothing to do with saving a monthly fee.

## What Cloudflare is doing there

A single machine on the public internet has a specific set of problems, and the reverse proxy exists for those and not for glamour:

**The origin address should not be public.** Without a proxy in front, the machine's address is in DNS for anyone to read, and everything you have ever left listening is reachable by anyone who bothers. With one, the only route in is through the proxy.

**TLS stops being a recurring task.** Certificates expire. A renewal that depends on a cron job you wrote once and a Slack alert you now ignore is a January outage waiting for a public holiday.

**Static assets should never touch the box.** Every request the CDN answers is a request the origin does not, which is the cheapest capacity you will ever add.

**Traffic you did not ask for is filtered before it costs you anything.** On a platform that traffic shows up as a bill. On your own machine it shows up as latency for real users, which is worse, because a bill at least tells you.

None of that is clever. It is the standard arrangement, and the reason to write it down is that "self-hosted" is often used to mean *a box with a public IP*, which is a different and much worse thing.

## The parts nobody puts in the tutorial

The setup is an afternoon. What follows is the actual commitment:

**You are the on-call.** Not metaphorically. If it stops at 11pm on a Saturday, either you fix it or it is down until you wake up. This is fine — it is a practice platform, not a payment processor — but it is only fine because I decided in advance that it was, rather than discovering my own tolerance during an outage.

**Backups are not backups until you have restored one.** Anyone can write a dump to a second disk. The question is whether you have ever brought the application up against that dump and used it. Until you have, you own a file with an optimistic filename. I know this because the first time I tried it, the restore worked and the application did not — and finding that out on a Tuesday afternoon on purpose is a completely different experience from finding it out on a Saturday night by accident.

**Updates are yours now.** The platform silently patched the runtime under you. Nobody is doing that here.

**The machine accumulates history.** A platform gives you a fresh container every deploy, which is a real feature — it means your production environment cannot slowly drift into a state that exists nowhere in version control. On your own box, drift is the default. The discipline of writing down what you changed is the thing standing between you and a server only you can operate, and only for another year or so.

## What you learn that the platform hides

Here is the part I would not trade.

On a platform, when something is slow, you read a dashboard someone else designed and choose between the options they gave you. On your own machine, when something is slow, you find out *why* — which query, which process, which disk, which limit. You develop the habit of asking what the machine is actually doing, and that habit transfers to every system you will ever be handed, including the ones you did not build and cannot redeploy.

Twenty years of infrastructure work taught me that the people who are good in an incident are the ones who know what the layer below is doing. You cannot get that from a service whose whole value proposition is that you never have to look.

## So which should you pick

For most things: the platform. It is not a lesser choice, it is the correct one when the constraint is your time rather than your unit economics.

Self-host when the cost model genuinely bites — a workload that gets more expensive as it succeeds — or when you specifically want the education. Do not do it to save a monthly fee. The fee is the smallest number in the whole equation, and the largest one is the Saturday night.

I would make the same call again for PTE Target, and I would not make it for this site. That is not inconsistency. It is the same question producing two different answers, because the two systems are asked to do different things.
