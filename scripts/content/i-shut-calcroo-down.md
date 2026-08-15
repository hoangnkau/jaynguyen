title: I shut Calcroo down, and the analytics were not the reason
slug: i-shut-calcroo-down
publishedAt: 2026-08-16
tags: Product, Post-mortem
summary: I built a set of Australian finance calculators, watched the traffic arrive, and found almost none of it was human. Killing it took two weeks longer than the data did, and that delay is the part worth writing about.
---

Calcroo was a set of Australian finance and utility calculators — the sort of thing you reach for when you want to know what a rate change does to a repayment. Next.js, decent Lighthouse scores, sensible SEO. It went up, it got indexed, and traffic started arriving.

I shut it down. It is still on this site, still linked, marked archived, because a portfolio that shows only the things that worked is a portfolio telling you it has been edited.

## What the numbers said

Traffic grew. Sessions climbed. On the dashboard it looked like the thing was working.

It was not. Once I looked past the totals at behaviour — where sessions came from, what they did, how they moved through pages — the overwhelming majority of it was not people. Bots, scrapers, and whatever else crawls a freshly indexed site full of calculator pages. The human residue underneath was small enough that I could have called every one of them.

That was not a subtle finding. It took one afternoon of actually reading the analytics rather than glancing at the number that goes up.

## Why it still took two more weeks

Here is the honest bit, and the reason this is worth a post rather than a line on a CV.

I knew inside a day. I shut it down about two weeks later. In between I did the things people do when they have an answer they do not like:

I looked for a segment that was working. I found one, sort of, if you squinted at a particular category of page over a particular window. It was noise, and I knew it was noise while I was constructing it.

I considered a pivot. Same calculators, different niche, different framing. I got some way into planning it before noticing that the pivot did not address a single one of the reasons the first version had no audience — it just gave me something to build, which is not the same as something to build *for*.

I told myself the SEO needed more time. This one is the most dangerous, because it is sometimes true. Organic search is slow. Three months is not long. But "it needs more time" is unfalsifiable in the short run, which makes it the perfect thing to believe when you do not want to stop.

What broke the loop was writing down, in one sentence, what would have to become true for the project to be worth continuing, and then asking whether anything I was doing would make it true. Nothing was. The sentence took ten minutes to write and I had been avoiding writing it for two weeks.

## What it actually cost

The build was not wasted. The Next.js work went straight into the site you are reading. The SEO work taught me what indexing a content site actually looks like from the inside, which is not what the guides describe. The analytics work is the reason I now instrument things before launching them rather than after.

The two weeks were the waste. Not the project — **the fortnight I spent knowing and not acting.** That is the number I would put on the post-mortem if I had to put one number on it.

## The rule I use now

Before I start something, I write down the condition under which I will stop. Not a target — a stopping condition. Specific enough to be checked, and written before I am emotionally invested in the answer.

For PTE Target, which is still running, that condition exists and has not been met. If it ever is, the decision has already been made by someone with better judgement than the version of me who will be looking at it: the version who had not yet spent a year on it.

## Why this is on the portfolio

Because everyone's project list is a list of wins, and a list of wins is unfalsifiable. It reads as either luck or selective reporting, and the reader cannot tell which.

A killed project with a written post-mortem is the one thing on a portfolio that is hard to fake, because faking it requires admitting to something. If you are hiring someone to make decisions about systems, the interesting question is not whether they can build. It is what they do in the fortnight after the data comes back wrong.

This is my answer to that question. It is not a flattering one, which is roughly the point.
