# CampusCheers: Product & Technical Blueprint

## Introduction

This document outlines the product and technical blueprint for CampusCheers, a Progressive Web App (PWA) designed to foster positive and authentic connections among high school and university students. This blueprint is created from the perspective of a world-class Product Manager and Lead Full-Stack Developer, drawing inspiration from successful social apps like GAS and BeReal, and the product philosophy of entrepreneurs like Nikita Bier.

---

## 1. Core User Flow & Feature Breakdown

The user journey is designed to be simple, secure, and engaging, moving the user from initial setup to a daily loop of positive reinforcement and authentic sharing.

### Onboarding

1.  **Welcome & Value Proposition:** The user is greeted with a clear, concise explanation of CampusCheers: "Your daily dose of positive vibes. Get hyped by your classmates, anonymously."
2.  **School Verification:**
    *   Users sign up using their school-issued email address (`.edu` or equivalent). An email with a verification link/code is sent.
    *   For schools without standard emails, a system of invite codes, distributed by verified student ambassadors, will be used.
    *   **Geofencing:** During onboarding, the PWA will request one-time location access to verify the user is on or near campus, preventing cross-school contamination.
3.  **Profile Setup:**
    *   **Minimalism is Key:** Users provide their First Name, Last Initial, Graduation Year, and a Profile Photo. No bios, no follower counts.
    *   **Pronouns:** A dedicated, optional field for pronouns will be included to foster inclusivity.
4.  **Friend Finding (Privacy-First):**
    *   The app will request access to the user's device contacts.
    *   **On-Device Hashing:** The contact list is processed *on the user's device*. Phone numbers are hashed, and only the hashes are sent to the server to be matched against other users' hashed numbers. The raw contact list never leaves the device.
    *   Users are presented with a list of matched contacts already on CampusCheers and can add them with a single tap.

### Daily Engagement Loop

#### The Polling System ("The Hype Round")

*   **Timing:** A new "Hype Round" of 12 polls is delivered at the same time each day (e.g., 3 PM). A push notification announces its arrival: "🔥 The Hype Round is live! See what your friends are saying."
*   **Mechanics:**
    *   Each poll is a positive, pre-written compliment (e.g., "Whose smile brightens up the room?").
    *   The options are four names, dynamically selected from the user's friend list.
    *   To see the results of the polls they've received votes in, the user must first answer all 12 polls in their own Hype Round. This is the core reciprocity loop.
*   **Receiving "Cheers":** After voting, the user sees a summary of the "Cheers" they received. It will show the poll question and the number of votes, but not who voted. The sender remains anonymous.

#### The Moment Capture ("Cheers Moment")

*   **The Notification:** At a random time each day, a push notification is sent to all users in a school: "⚠️ Cheers Moment! You have 2 minutes to capture your moment."
*   **The Capture:** The PWA opens a camera interface that simultaneously captures a photo from the front and back cameras. This is a core feature of PWAs using the `getUserMedia` API.
*   **Authenticity:** There are no filters, no uploads from the camera roll, and only one retake is allowed.
*   **The Feed:** Once captured, the user's Moment is shared with their friends in a simple, chronological feed that disappears when the next day's Moment notification arrives. Users can react with pre-set emojis.

#### The "Reveal" Mechanism (Monetization)

*   This is the "God Mode" subscription feature. Subscribers get hints about who "Cheered" for them. See the "Monetization & Ethics" section for a full breakdown.

#### Trust & Safety

*   **Proactive Moderation:** Poll questions are sourced exclusively from a pre-approved, curated library. There is no user-generated poll creation.
*   **User Reporting:** Users can easily report a "Moment" photo if it is inappropriate. A simple "long-press" on a Moment will bring up a "Report" button. Reported content is immediately hidden from view and flagged for human review.

---

## 2. Critical Challenge Solutions

### Challenge A: Nailing the Anonymous "Hype Round"

#### Poll Content Strategy

The system must generate an endless supply of positive, non-repetitive polls.

1.  **The "Compliment Component" System:** Instead of writing static questions, we create a library of compliment "components" that can be dynamically assembled.
    *   **[Attribute]:** "smile," "laugh," "energy," "style," "vibe," "sense of humor"
    *   **[Action]:** "brightens up the room," "is infectious," "is always on point," "makes my day"
    *   **[Context]:** "in class," "in the halls," "on a gloomy day"
    *   **Dynamic Assembly:** An AI model (like a fine-tuned GPT-3.5) combines these components into fresh questions: "Whose [Attribute] [Action] [Context]?" -> "Whose sense of humor always makes my day in class?"
2.  **University-Specific Content:** We will seed the system with university-specific components based on majors, clubs, and campus landmarks.
    *   **[Context]:** "in the engineering lab," "at the student union," "during the theatre production"
    *   **Example:** "Who has the most creative energy in the engineering lab?"
3.  **Preventing Negativity (The "Positive Valence" Guardrail):**
    *   Every single compliment component is pre-approved by a human content strategist.
    *   An AI sentiment analysis model scores every dynamically generated poll question. Any question that doesn't score above a 95% "positive sentiment" threshold is rejected and flagged for human review. This prevents backhanded compliments (e.g., "Who tries the hardest but...").

#### Preventing Misuse

1.  **Algorithmic Fairness in Polls:** The algorithm for selecting the four names in a poll must be carefully designed to prevent exclusion.
    *   **Inclusion Score:** Every user has an "inclusion score." The algorithm will prioritize showing users who have appeared in fewer polls recently, ensuring everyone gets a chance to be "Cheered."
    *   **No "Best Friend" Spam:** The system will prevent the same two people from appearing in a poll together too frequently to avoid clique-like behavior.
2.  **Community Guidelines & Transparency Hub:**
    *   During onboarding, users must agree to a "Positivity Pledge."
    *   A permanent "Transparency Hub" in the app will explain *why* the app is designed the way it is, including a section titled "Why You'll Never See a Mean Poll." This builds trust and educates the user base.

#### Sustaining Engagement

1.  **Streak Rewards:** Daily participation in the Hype Round builds a streak. Streaks unlock non-monetized rewards:
    *   **3-Day Streak:** Unlock one free "Hint Token" (see below).
    *   **7-Day Streak:** Unlock a special "Throwback" poll about you and your friends.
2.  **Hint Tokens (Non-monetized Curiosity Loop):** Users can earn "Hint Tokens" through streaks or by inviting friends. A token can be used on a "Cheer" to get a small, non-identifying hint about the sender, such as:
    *   The first letter of their name.
    *   Their graduation year.
    *   A hint about a class you share.
3.  **Daily & Weekly Themes:**
    *   **"Major Mondays":** Polls focused on academic life.
    *   **"Spirit Fridays":** Polls about school spirit and weekend plans.
    *   This adds a layer of predictability and excitement to the daily routine.

---

### Challenge B: Meaningful Integration of the "Cheers Moment"

The "Cheers Moment" must feel integral to the core polling loop.

#### Integration Concepts

1.  **Concept A: "The Reveal Photo"**
    *   **Description:** When a user redeems a "Hint Token" or uses the paid "God Mode" to get a hint about who sent a "Cheer," the app also reveals the sender's "Cheers Moment" photo from the day the compliment was sent.
    *   **Synergy:** This adds a powerful layer of authentic context. You don't just see *who* complimented you; you see *what they were doing* in that moment. It connects the abstract compliment to a real, uncurated slice of their life, making the interaction feel more personal and grounded.

2.  **Concept B: "Moment-Gated Cheers"**
    *   **Description:** Users can only participate in the daily "Hype Round" *after* they have posted their "Cheers Moment" for the day.
    *   **Synergy:** This creates a strong dependency between the two features. It positions the "Cheers Moment" as the "ticket" to the main event. This would dramatically increase participation in the photo-capture feature, but it might feel like a chore to some users and could create a barrier to engagement if they miss the 2-minute window.

3.  **Concept C: "Contextual Polls 2.0"**
    *   **Description:** After the "Cheers Moment" photos are live, a secondary, smaller "Bonus Round" of 3 polls is generated. An AI image recognition model (like Google Vision AI) analyzes the photos for common themes (e.g., "books," "coffee," "laptop," "outdoors").
    *   **Synergy:** The bonus polls are directly based on these themes: "Who had the coziest study spot today?" or "Who was enjoying the sunshine?" This makes the "Cheers Moment" directly influence the content of the app, making users feel like their daily life contributes to the community experience.

#### Selected Concept & Justification

**The best concept is Concept A: "The Reveal Photo."**

**Justification:** This concept creates the most compelling and cohesive user experience because it directly ties the core reward (solving the mystery of a compliment) to the core value of the "Cheers Moment" (authenticity).

*   **Enhances the Core Loop:** The primary driver of the app is the curiosity of who complimented you. By linking the reveal to the sender's authentic moment, we make the reward richer and more meaningful.
*   **Humanizes the Interaction:** It transforms an anonymous compliment from a simple piece of text into a message from a real person who was living their life, just like you, at that moment. This powerfully combats the feeling of alienation.
*   **Low Friction:** Unlike Concept B, it doesn't gate content. Unlike Concept C, it doesn't require complex and potentially error-prone AI analysis of photos. It's a simple, elegant, and powerful integration that enhances the emotional core of the app.

---

## 3. PWA Technical Architecture

The architecture must be scalable, reliable, and optimized for a PWA experience.

### Frontend

*   **Framework: React with Next.js**
*   **Justification:**
    *   **PWA Support:** Next.js has excellent built-in support for PWA features like service workers for offline capabilities and push notifications.
    *   **Performance:** Server-Side Rendering (SSR) and Static Site Generation (SSG) capabilities ensure a fast initial load time, which is critical for user retention.
    *   **Ecosystem:** The React ecosystem is vast, with mature libraries for state management (Zustand or Redux Toolkit), animations, and UI components.
    *   **Developer Pool:** A large pool of React developers is available for future team growth.

### Backend

*   **Language/Framework: Node.js with a framework like NestJS or Fastify.**
*   **Server Strategy: Serverless (e.g., AWS Lambda or Google Cloud Functions)**
*   **Justification:**
    *   **Scalability:** A serverless architecture is ideal for handling viral, spiky traffic. We only pay for what we use, and it scales automatically to handle millions of requests during peak times (like when a Hype Round or Cheers Moment notification goes out).
    *   **Development Speed:** Node.js allows for using JavaScript/TypeScript across the entire stack, streamlining development. NestJS provides a structured, modular architecture that is excellent for building robust APIs.
    *   **Real-time:** Node.js is well-suited for any potential real-time features in the future.

### Database

*   **Type: NoSQL (e.g., Amazon DynamoDB or Google Firestore)**
*   **Justification:** NoSQL databases are highly scalable, flexible, and a natural fit for the serverless architecture. They excel at handling the simple key-value lookups and document storage our app requires.

#### High-Level Schema

*   **Users Collection:**
    *   `userId` (Primary Key)
    *   `email`
    *   `firstName`
    *   `lastNameInitial`
    *   `gradYear`
    *   `schoolId`
    *   `hashedPhone`
    *   `friends` (Array of `userId`s)
    *   `createdAt`
*   **Polls Collection:**
    *   `pollId` (Primary Key)
    *   `questionText`
    *   `theme`
    *   `isActive`
*   **Cheers (Votes) Collection:**
    *   `cheerId` (Primary Key)
    *   `pollId`
    *   `voterId` (the user who cast the vote)
    *   `recipientId` (the user who received the vote)
    *   `createdAt`
*   **Moments Collection:**
    *   `momentId` (Primary Key)
    *   `userId`
    *   `frontPhotoURL`
    *   `backPhotoURL`
    *   `createdAt` (used to group by day)

### Push Notifications for PWA

This is critical for the time-sensitive "Cheers Moment."

1.  **Permission Request:** The PWA will request push notification permission after the user has completed onboarding and understands the value (i.e., "Enable notifications so you don't miss the Cheers Moment!").
2.  **Service Workers:** A service worker will be registered in the user's browser. This script runs in the background, separate from the web page.
3.  **Implementation:**
    *   When the user grants permission, the browser gives us a `PushSubscription` object containing a unique endpoint URL. This URL is saved to the `Users` collection in our database.
    *   Our server-side logic (a scheduled AWS Lambda function) will trigger at a random time each day for each school.
    *   This function queries the database for all `PushSubscription` endpoints associated with that school and sends a notification payload to each one using the Web Push Protocol.
    *   The service worker on the user's device receives the push event and displays the native OS notification, even if the browser is closed.

---

## 4. Monetization & Ethics

### "God Mode" Subscription

This is a monthly subscription ($2.99/month, with a discount for an annual plan) designed to satisfy curiosity without compromising the core positive experience.

*   **Unlocked Features:**
    1.  **Unlimited Hints:** Subscribers can see the first letter of the name and the graduation year for *every* "Cheer" they receive.
    2.  **"Who Added You?":** Get a notification when someone from your contacts joins the app and adds you as a friend.
    3.  **"Crush Alerts":** This is the mutual crush mechanic. If you add someone to a private "My Crushes" list and they also add you, you both get a notification: "Someone you're crushing on is crushing on you too 👀." This is a powerful, ethical monetization of a common social dynamic.
    4.  **Advanced "Reveal Photo":** For two "Cheers" per week, a subscriber can fully reveal the sender's name *and* their "Reveal Photo." This is limited to prevent the complete erosion of anonymity.

### Privacy & Safety Pledge

Building trust is paramount. This pledge will be presented during onboarding and be accessible in the Transparency Hub.

*   **Our Pledge to You:**
    1.  **Your Safety is Our #1 Priority:** We will never allow user-generated polls. Our content is designed by experts to be uplifting and safe.
    2.  **Your Data is Yours, Not Ours:** We will never sell your personal data or contact information to third parties. Your contact list is hashed on your device and never seen by us.
    3.  **We Believe in Transparency:** We will always be clear about how our app works and how we make money. There are no hidden algorithms designed to make you feel bad.
    4.  **You Are in Control:** You can easily report content, manage your friends, and delete your account and all associated data at any time.

This blueprint provides a comprehensive foundation for building CampusCheers as an engaging, safe, and scalable PWA that can genuinely improve the social fabric of school communities.

---

## 5. Phased Development & Testing Plan

This section outlines a structured, phased approach to building CampusCheers, ensuring quality and manageability throughout the development lifecycle. Each phase concludes with a dedicated testing sub-phase before proceeding to the next.

### Phase 1: Frontend Development (with Mock Data)

The goal of this phase is to build and test the complete user interface and user experience without any dependency on a live backend.

*   **Step 1.1: Project Setup & UI Kit**
    *   Initialize Next.js project.
    *   Set up TailwindCSS for styling.
    *   Create a basic UI kit of reusable components (Buttons, Modals, Input Fields, Profile Avatars).
    *   **Testing:** Use Storybook to visually test and document each component in isolation.

*   **Step 1.2: Onboarding & Authentication Screens**
    *   Build the UI for the Welcome, School Verification, Profile Setup, and Friend Finding screens.
    *   Create a mock authentication flow (e.g., a "Login" button that simulates a successful login and stores a fake user object in the global state).
    *   **Testing:** Use Cypress to run end-to-end tests on the onboarding flow, ensuring a user can navigate from the first screen to the main app dashboard.

*   **Step 1.3: Core Features UI**
    *   Build the "Hype Round" polling interface.
    *   Build the "Cheers Moment" camera interface (using `getUserMedia`) and the Moment feed.
    *   Build the "Results" screen where users see the Cheers they've received.
    *   All data will be sourced from local, static JSON files that mimic the structure of the future API responses.
    *   **Testing:** Cypress tests to simulate voting in polls, taking a photo, and viewing results, all using mock data.

*   **Step 1.4: Monetization & Settings UI**
    *   Build the UI for the "God Mode" subscription page and the user settings page.
    *   **Testing:** Cypress tests to ensure all settings and subscription options are displayed correctly.

### Phase 2: Backend Development & API Implementation

The goal of this phase is to build a robust, scalable, and secure backend API that can support all frontend features.

*   **Step 2.1: Infrastructure & Database Setup**
    *   Initialize a serverless project (e.g., using the Serverless Framework on AWS).
    *   Define and deploy the NoSQL database schema (e.g., DynamoDB tables or Firestore collections).

*   **Step 2.2: User & Auth Endpoints**
    *   Implement API endpoints for user registration, email verification, login, and profile management.
    *   Implement the on-device contact hashing logic for friend-finding.
    *   **Testing:** Use Jest for unit tests on each function. Use Postman or Insomnia to conduct integration tests on the live endpoints, ensuring users can be created, authenticated, and managed.

*   **Step 2.3: Core Features Endpoints**
    *   Implement the logic for generating and delivering daily "Hype Rounds."
    *   Implement endpoints for submitting votes ("Cheers") and retrieving results.
    *   Implement endpoints for uploading "Cheers Moment" photos (to a service like AWS S3) and retrieving the daily feed.
    *   **Testing:** Rigorous unit and integration tests for the core logic, ensuring polls are generated correctly and votes are recorded accurately.

*   **Step 2.4: Push Notifications & Monetization**
    *   Implement the scheduled serverless function to send out daily push notifications.
    *   Integrate with a payment provider like Stripe to manage "God Mode" subscriptions.
    *   **Testing:** Test push notifications on a staging device. Use Stripe's test environment to validate the entire subscription lifecycle.

### Phase 3: Full Integration & End-to-End Testing

The goal of this phase is to connect the frontend to the live backend and conduct comprehensive testing of the full application.

*   **Step 3.1: API Integration**
    *   Remove all mock data services from the frontend.
    *   Replace them with live API calls to the backend endpoints developed in Phase 2.
    *   Integrate the real authentication flow.
    *   Connect the image upload functionality to the backend storage solution.
    *   **Testing:** As each feature is connected, perform smoke tests to ensure basic functionality works.

*   **Step 3.2: Comprehensive E2E Testing**
    *   Run the full suite of Cypress end-to-end tests against the integrated application on a staging environment.
    *   This will test the entire user journey: signing up, adding friends, participating in a Hype Round, posting a Cheers Moment, and viewing results.

*   **Step 3.3: Closed Beta**
    *   Deploy the application to a production-like environment.
    *   Invite a small group of trusted users (e.g., a single class or student club) to participate in a closed beta.
    *   Use this phase to gather real-world feedback, identify usability issues, and find bugs that were not caught in automated testing.

### Phase 4: Public Launch & Iteration

*   **Step 4.1: Go-Live**
    *   Based on the results of the closed beta, make final adjustments.
    *   Launch CampusCheers to the first target school.

*   **Step 4.2: Monitor & Iterate**
    *   Closely monitor application performance, user engagement metrics, and community feedback.
    *   Continue to iterate on the product, adding new features and refining existing ones based on user data and feedback, following the same phased test-and-develop methodology.
