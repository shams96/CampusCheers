
# Campus Cheers MVP Specification

## Role
You are the **Campus Cheers No-Code Agent**. Your mission is to build the Campus Cheers MVP in the no-code platform exactly as specified.

## Purpose & Audience
**Campus Cheers** is a positivity-first, anonymous social polling app designed for U.S. high-school students. It fills a need for safe, low-pressure peer recognition—helping teens uplift one another with short “cheer” polls and selfie video clips. We’ll seed first in Collin County schools, expand statewide in Texas, then nationally, targeting 5 million downloads in nine weeks via organic, peer-driven viral loops.

## High-Level Overview
- **Core Value:** Positive peer recognition without free-text negativity.
- **Daily Moment:** One poll per school at 1:00 PM local time.
- **Urgency Mechanic:** Poll opens with a 2-minute countdown; submit your vote + selfie before it expires to unlock results.

## User Roles & Access Rules
- **Student:** Participate in daily poll (anonymous), record 3–5 sec selfie, view results.
- **Ambassadors:** Offline champions driving adoption; no special in-app permissions.
> **Access Rules:** Frictionless signup via school email or SMS; immediate poll access; no referrals/invitations; results auto-unlock after 2-minute timer; fully anonymous data.

## Data Model / Schema
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  school_email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE schools (
  school_id UUID PRIMARY KEY,
  name TEXT, district TEXT, state TEXT
);
CREATE TABLE daily_polls (
  poll_id UUID PRIMARY KEY,
  school_id UUID REFERENCES schools(school_id),
  question TEXT NOT NULL,
  options TEXT[4] NOT NULL,
  scheduled_for DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE responses (
  response_id UUID PRIMARY KEY,
  poll_id UUID REFERENCES daily_polls(poll_id),
  responder_id UUID REFERENCES users(user_id),
  chosen_option TEXT NOT NULL,
  selfie_video_url TEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (poll_id, responder_id)
);
```

## UI Component Functions
- **Welcome & Consent:** Email/SMS login + GDPR notice.
- **Home Screen:** Countdown to 1 PM poll or active poll card.
- **Poll Card:** Question + 4 options, starts 2-min timer.
- **Selfie Recorder:** Live camera preview, record 3–5 sec, retake/submit.
- **Results Screen:** Anonymous percentage bars after timer.
- **Settings:** Notifications toggle, data-delete request.

## Workflow Logic & Automations
1. **Daily Poll Creation** at 12:05 AM: create polls for each school.
2. **Pre-Poll Notification** at 12:59 PM: push “Cheer starts in 1 min!”
3. **Poll Activation** at 1:00 PM: display poll card + start timer.
4. **Submission Handling:** insert responses, fetch aggregates.
5. **Result Unlock:** fetch and display results on timer expiry.
6. **Weekly Iterations:** ship minor UI/theme updates based on feedback.

## Edge Cases & Validations
- **Duplicate Votes:** Prevented via UNIQUE constraint.
- **Missed Submissions:** Show “Time’s up!” and results; no data saved.
- **Video Constraints:** Reject >5 MB or non-MP4.
- **Offline Mode:** Gray out submit, show connectivity warning.
- **Clock Tampering:** Use server time for synchronization.

## No-Code Platform Prompt Templates
```yaml
- component: DataTable
  name: daily_polls
  fields:
    - name: question; type: text
    - name: options; type: list; maxItems: 4
    - name: scheduled_for; type: date

- component: DataTable
  name: responses
  fields:
    - name: chosen_option; type: select; choices: bind(daily_polls.options)
    - name: selfie_video_url; type: file; accept: video/mp4
    - name: responder_id; type: hidden; value: currentUser.user_id

- component: CountdownTimer
  props:
    targetTime: daily_polls.scheduled_for + 'T13:00:00'
    onExpire: showResults()

- automation: DailyPollCreator
  schedule: "0 5 * * *"
  actions:
    - insert: daily_polls; with: preconfiguredTemplates

- automation: PrePollNotify
  schedule: "59 12 * * *"
  actions:
    - notify: studentsBySchool

- automation: OnFormSubmit
  triggers: FormSubmit(respondPoll)
  actions:
    - insert: responses
    - fetch: updateChart
```

## Security & Compliance Guidelines
- **Transport:** HTTPS/TLS 1.3 only.
- **Encryption at Rest:** AES-256 for video URLs & user IDs.
- **Consent Logging:** Write-once logs with timestamp & IP.
- **RBAC:** JWT scopes enforce data access; clients get only aggregates.
- **Data Retention:** Auto-delete all responses/videos after 30 days.

## Web Trends, Typography & PWA Suitability
- **2025 Web Trends:** Dark mode, micro-interactions, lightweight animations.
- **Fonts:** Satoshi & Inter; scale from 14px (body) to 32px (headings).
- **Pantone 2025:** Viva Magenta (18-1750) for vibrant, bold teen appeal.
- **PWA Features:** Offline caching, installable manifest, push notifications, <300ms load.

