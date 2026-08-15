title: Everyone enrols in MFA. That is not the number that matters.
slug: mfa-people-quietly-stop
publishedAt: 2026-08-16
tags: Authentication, Security, Usability
summary: Twenty years of watching people route around security they find inconvenient convinced me the interesting question is not which second factor is strongest. It is which one is still switched on in six months.
---

Ask which multi-factor method is most secure and you will get a confident answer, roughly the same one from everyone: hardware security keys, then app-based codes, then SMS a long way behind. The ordering is well established and I have no argument with it.

Ask a different question — which method is still switched on, by the same person, six months after they enrolled — and the confident answers stop.

I have never seen that number reported. I have seen enrolment reported constantly.

## Where this question came from

Not from a paper. From twenty years of watching what people do when security gets in their way.

I have watched a shared password get taped to a monitor because the rotation policy made it impossible to remember. I have watched a VPN get bypassed for a "quick" file transfer, repeatedly, by people who knew exactly why the VPN existed. I have watched a second factor get enrolled during onboarding — because IT was standing there — and quietly disabled the following month.

None of those people were careless, and none of them were unaware of the risk. They were making a rational trade against a cost the security design had not counted: their own time and attention, spent every single day, against a harm that is probabilistic and might never arrive.

Controls that lose that trade do not fail loudly. Nobody raises a ticket saying "I have stopped using MFA." The dashboard still shows enrolment, and enrolment is a measurement taken at the exact moment when the cost has not yet been paid.

## Why "just make it mandatory" is not the answer

The obvious objection is that abandonment is an administrative problem: enforce it, and the behaviour follows.

Sometimes it does. But enforcement moves the pressure, it does not remove it. Make a method mandatory and painful and you get the predictable adaptations — codes read out over chat so a colleague can get in, a second factor enrolled onto the same device as the first, a permanently-trusted-device tick that turns two factors back into one. The control still reports green. The property it was supposed to guarantee is gone.

That is the failure mode worth worrying about: not a control that is refused, but one that is complied with in a way that hollows it out. You cannot detect it by asking whether the policy is followed, because it is.

## Three things I would look at instead of enrolment

**Recovery, because that is where the cost concentrates.** Everyday logins with any of the common methods are fine. The pain arrives on the new phone, the lost key, the flat battery at an airport. That moment is rare enough to disappear in aggregate usage data and severe enough to decide whether someone re-enrols afterwards. Measuring only the happy path measures the part nobody abandons over.

**The comparison that matters is not method against method.** It is each method against what the person would otherwise do — which is often "reuse a password and hope". A method that is somewhat weaker and that people keep may protect more accounts than one that is theoretically stronger and gets switched off. That is an empirical question, and it is worth measuring rather than assuming in either direction.

**Whether the second factor is still independent.** Both factors on one device is the most common quiet collapse I have seen, and nothing in a typical compliance report distinguishes it from the intended arrangement.

## This is not really about MFA

The same reasoning applies to every control any of us ship.

The rate limiter that gets removed because it fired on a colleague. The alerting that gets muted after the third false positive. The code review step that becomes a rubber stamp under deadline. In each case the control still exists on paper, the property it guaranteed is gone, and nothing anywhere reports it.

Designing for the moment of adoption is easy and most of us are decent at it. Designing for month six — when the novelty has gone, the person is tired, and the cost is being paid again — is a different discipline, and I do not think our field is nearly as good at it as it believes.

If I could add one row to every security dashboard I have ever been shown, it would not be a stronger control. It would be a number that goes down when people quietly give up.
