
# CampusCheers App Documentation

## 1. Vision & Business Concept
**Mission:** Turn every student into a daily hero for their peers by making it effortless to share genuine, uplifting moments—no filters, no negativity, just real cheers.

**Problem We Solve:**
- **Social Isolation & FOMO:** Teens feel pressure to perform on curated feeds.
- **Bullying & Negativity:** Anonymous platforms often devolve into harassment.
- **Comparison Burnout:** Endless highlight reels fuel anxiety.

**Solution:** A school-fenced, ambassador-driven app that combines:
1. **CheerCards** (templated, positive polls)
2. **CheerSnaps** (once-a-day dual-camera captures)
3. **Micro-video shout-outs** (5s clips)
4. **Leaderboards & rewards** (peer recognition loops)

**Business Model:**
- **Freemium Core:** Free to use—students earn points and badges.
- **Brand Partnerships:** Co-branded “Cheer Challenges” with teen-centric sponsors.
- **School Analytics Dashboard:** Subscription for wellness coordinators to view anonymized positivity metrics and trends.

## 2. Design System & Aesthetics
**Pantone-Inspired 2025 Gen Z Palette:**
- **cherryRed** (`#E63946`) – Primary CTA, highlights
- **butterYellow** (`#F4D35E`) – Accent backgrounds, badges
- **auraIndigo** (`#2E294E`) – Headers, dark-mode base
- **dillGreen** (`#80B918`) – Success states, confetti elements
- **alpineOat** (`#F1FAEE`) – Neutral backgrounds, cards

**Typography & Iconography:**
- **Font:** Inter (bold XL headlines, base for body)
- **Icons:** Lucide-React set, emoji-style stickers for CheerCards

**Trends:**
1. **Micro-interactions:** button hovers, confetti bursts on send, card flips
2. **Immersive Scrolling:** parallax layered backgrounds
3. **Dark/Light Toggle:** Light default, Dark mode in auraIndigo & butterYellow highlights
4. **Emoji & Sticker Overlays:** playful AR stickers on CheerSnaps and reactions

## 3. Key Features & Flow
| Phase  | Feature                           | Design & Interaction                                                                            |
|--------|-----------------------------------|-------------------------------------------------------------------------------------------------|
| Phase 1| CheerCard Engine                  | alpineOat card, auraIndigo header, butterYellow friend buttons, cherryRed send button          |
| Phase 2| CheerSnap Daily Capture           | dual-camera view with dillGreen border, butterYellow timer                                     |
| Phase 3| School-Fence & Ambassador Seeding | onboarding with parallax campus art, NFC badge scan with micro-vibration feedback              |
| Phase 4| Virality Amplifiers               | cherryRed “Top Cheer Moment” banner, dillGreen & butterYellow confetti                          |
| Phase 5| Analytics & Compliance Dashboard  | alpineOat cards, auraIndigo headers, cherryRed export CSV                                      |

## 4. Technical Blueprint
```
/apps/web/               
  /styles/               # tailwind.config.js with custom colors
  /components/
/apps/mobile/            
  /components/
/backend/                
  /services/
/infrastructure/         # Terraform, CI/CD, edge compute for AI
```

**Tailwind Config Snippet:**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        cherryRed: '#E63946',
        butterYellow: '#F4D35E',
        auraIndigo: '#2E294E',
        dillGreen: '#80B918',
        alpineOat: '#F1FAEE',
      },
    },
  },
}
```

## 5. Seeding & Scaling Strategy
1. **Collin County Pilot:**
   - Recruit “CheerSquad” ambassadors, branded T-shirts (cherryRed), butterYellow wristbands.
   - “Cheer Week” pop-ups with parallax backdrops of Plano/Frisco/McKinney campuses.
2. **Texas Rollout:**
   - Neighboring districts after 4–6 weeks, with alpineOat email templates and auraIndigo headers.
   - Statewide “CheerFest” concert livestream with cherryRed overlays.
3. **National Expansion:**
   - University ambassadors in top markets.
   - Brand-sponsored monthly challenges with custom AR filters in dillGreen.

## 6. Impact & Metrics
- **Week 1 Pilot:** 5K downloads, 2K DAU, 20% activation
- **Month 2 Texas:** 200K downloads, 50K DAU, 30% WoW growth
- **Quarter 2 National:** 1M downloads, 300K DAU, 5+ brand partnerships

## 7. Hand-Off Prompt for No-Code Agent
> Build CampusCheers MVP in our no-code platform:
> 1. **Onboarding & Consent:** alpineOat splash, cherryRed CTAs, GDPR modal in auraIndigo.
> 2. **CheerCard Module:** alpineOat card, auraIndigo header, butterYellow buttons, cherryRed send, dillGreen confetti.
> 3. **CheerSnap Module:** full-screen dual camera (dillGreen border, butterYellow timer).
> 4. **Ambassador & Referral:** cherryRed invite links, butterYellow NFC flow.
> 5. **Dashboard:** alpineOat cards, auraIndigo headers, cherryRed export CSV.
> 6. **Design:** cherryRed, butterYellow, auraIndigo, dillGreen, alpineOat; micro-interactions, parallax, dark/light toggle.
