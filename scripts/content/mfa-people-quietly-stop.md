title: The MFA question nobody measures is whether people keep using it
slug: mfa-people-quietly-stop
publishedAt: 2026-08-16
tags: Authentication, Research, Usability
summary: Twenty years of watching users route around security they find annoying convinced me the interesting MFA question is not which method is strongest. It is which one is still switched on in six months.
---

Ask which multi-factor method is most secure and you will get a confident answer, roughly the same one from everyone: hardware security keys, then app-based codes, then SMS a long way behind. The ordering is well established and I have no argument with it.

Ask a different question — which method is still switched on, by the same person, six months after they enrolled — and the confident answers stop.

This is the question my MSc research at York is built around. I am not going to publish findings here; the study involves human participants and an ethics process, and results go through that before they go anywhere else. But the question itself is not confidential, and it is the part I would want to argue about with another engineer.

## Where the question came from

Not from a paper. From twenty years of watching what people do when security gets in their way.

I have watched a shared password get taped to a monitor because the rotation policy made it impossible to remember. I have watched a VPN get bypassed for a "quick" file transfer, repeatedly, by people who knew exactly why the VPN existed. I have watched a second factor get enrolled during onboarding — because IT was standing there — and quietly disabled the following month.

None of those people were careless, and none of them were unaware of the risk. They were making a rational trade against a cost the security design had not counted: their own time and attention, spent every single day, against a harm that is probabilistic and might never arrive.

Security controls that lose that trade do not fail loudly. Nobody files a ticket saying "I have stopped using MFA." The dashboard still shows enrolment. Enrolment is the metric almost everyone reports, and enrolment is a measurement taken at the exact moment when the cost has not yet been paid.

## Why "just make it mandatory" is not the answer

The obvious objection is that abandonment is an administrative problem: enforce it, and the behaviour follows.

Sometimes it does. But enforcement moves the pressure, it does not remove it. Make a method mandatory and painful and you get the predictable adaptations — codes shared over chat so a colleague can log in, a second factor enrolled onto the same device as the first, a permanently-trusted-device tick that quietly turns two factors back into one. The control still shows green. The property it was supposed to guarantee is gone.

That is the failure mode that interests me: not a control that is refused, but a control that is complied with in a way that hollows it out. You cannot detect it by asking whether the policy is followed, because it is.

## What a usability evaluation actually has to do

My study is a task-based usability evaluation across three methods — TOTP authenticator apps, FIDO2 security keys, and SMS codes. Task-based matters. Asking people how they feel about a method produces answers about how they think they should feel; watching them attempt a task produces answers about what actually happens at the moment of friction.

The design problems are more interesting than the technology:

**Recovery is where the cost concentrates.** Everyday logins with any of the three are fine. The pain arrives on the new phone, the lost key, the flat battery in an airport. That moment is rare enough to be invisible in aggregate usage data and severe enough to determine whether someone re-enrols afterwards. A study that only measures the happy path measures the part nobody abandons over.

**Participants know they are being watched.** Somebody in a study, in a session they agreed to, with a researcher present, is at their most patient. Real abandonment happens on a Tuesday when they are late. Any honest write-up has to state that gap rather than assume it away.

**The right comparison is not method against method.** It is each method against the thing the user would otherwise do — which is often "reuse a password and hope". A method that is 90% as strong and that people keep may protect more accounts than one that is theoretically stronger and gets turned off. Whether that is true is exactly the sort of thing worth measuring instead of asserting.

## Why this is not just an academic question

Because the same reasoning applies to every control any of us ship.

The rate limiter that gets removed because it fired on a colleague. The alerting that gets muted after the third false positive. The code review step that becomes a rubber stamp under deadline. In each case the control still exists on paper, and the property it guaranteed is gone, and nothing anywhere reports it.

Designing for the moment of adoption is easy and most of us are decent at it. Designing for month six, when the novelty is gone and the person is tired and the cost is being paid again — that is a different discipline, and I do not think our field is nearly as good at it as it thinks.

That is the thing I am trying to learn how to measure.
