# CampusCheers MVP - Closed Beta Testing Guide

## Welcome to CampusCheers Beta! 🎉

Thank you for participating in our closed beta test. Your feedback is crucial in helping us build the best campus social experience possible.

## What is CampusCheers?

CampusCheers is a Progressive Web App (PWA) designed to foster positive and authentic connections among high school and university students through:

- **Hype Rounds**: Daily anonymous polls where classmates can "cheer" for each other
- **Cheers Moments**: Spontaneous photo captures to share authentic moments
- **Friend Discovery**: Privacy-first friend finding based on your contacts

## Beta Access Information

### Environment Details
- **Frontend URL**: https://cee780fd3fd7.ngrok-free.app (public beta access)
- **Backend API**: http://localhost:3001 (local only)
- **Database**: PostgreSQL (local Docker container)

### Test Account
A test account has been pre-created for you:
- **Email**: test@example.com
- **Password**: password
- **Friends**: 4 pre-created friend accounts (Friend 1, Friend 2, Friend 3, Friend 4)

## How to Run the Application

### Prerequisites
- Node.js 18+ installed
- Docker Desktop running
- Git

### Setup Instructions

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd campuscheers
   ```

2. **Start the database**
   ```bash
   docker-compose up -d
   ```

3. **Set up the backend**
   ```bash
   cd server
   npm install
   npm start
   ```
   The backend will run on http://localhost:3001

4. **Set up the frontend** (in a new terminal)
   ```bash
   npm install --legacy-peer-deps
   npm run dev
   ```
   The frontend will run on http://localhost:3000

## Testing Scenarios

### Core User Flows

#### 1. Landing Page & Onboarding
- [ ] Visit the landing page
- [ ] Click "Get Started"
- [ ] Experience the value proposition messaging
- [ ] Note any issues with the UI/UX

#### 2. Hype Round Experience
- [ ] Navigate to the Dashboard
- [ ] Click "Start Hype Round"
- [ ] Complete all 12 polls
- [ ] View your results on the Results page
- [ ] Test the anonymity aspect
- [ ] Note poll question quality and relevance

#### 3. Dashboard Navigation
- [ ] Test all navigation buttons
- [ ] Verify "You Have Cheers" notification appears after voting
- [ ] Test responsiveness on different screen sizes

#### 4. Results Page
- [ ] View cheers received
- [ ] Test the voting reciprocity (must complete all polls to see results)
- [ ] Note any issues with result display

#### 5. Settings & God Mode
- [ ] Navigate to Settings
- [ ] Explore God Mode features (UI only, backend not implemented yet)
- [ ] Test any available settings

### Feature-Specific Testing

#### Performance
- [ ] Test app loading times
- [ ] Test poll voting speed
- [ ] Test navigation between pages
- [ ] Note any lag or slow responses

#### Mobile Experience
- [ ] Test on mobile devices/browsers
- [ ] Test PWA installation (Add to Home Screen)
- [ ] Test touch interactions
- [ ] Test camera access (for future Cheers Moment feature)

#### Error Handling
- [ ] Test what happens with network issues
- [ ] Test invalid inputs
- [ ] Test edge cases (e.g., no friends available)

## Known Issues & Limitations

### Current Limitations
1. **Authentication**: Using hardcoded test user - no real login system
2. **Push Notifications**: Not implemented yet
3. **Cheers Moments**: Photo capture UI exists but backend not fully implemented
4. **God Mode**: UI exists but monetization features not implemented
5. **School Verification**: Mock implementation only
6. **Contact Import**: Not implemented (privacy-first approach planned)

### Expected Behavior
- Some features may show placeholder content
- Error messages may be generic
- Some API calls may fail gracefully with fallbacks

## How to Provide Feedback

### Bug Reports
Please report any bugs using this format:

```
**Bug Title:** [Brief description]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:** [What should happen]

**Actual Behavior:** [What actually happens]

**Environment:**
- Browser: [Chrome/Firefox/Safari/Edge]
- OS: [Windows/Mac/Linux]
- Device: [Desktop/Mobile]
- Screen Size: [Resolution]

**Screenshots:** [Attach if relevant]
```

### Feature Feedback
For feature impressions, please consider:

1. **Usability**: How easy is it to use?
2. **Intuitiveness**: Does the flow make sense?
3. **Visual Design**: How does it look and feel?
4. **Performance**: Speed and responsiveness
5. **Missing Features**: What would you like to see?

### General Comments
- What's working well?
- What's confusing or difficult?
- Any suggestions for improvement?
- Overall impression of the app concept?

## Testing Timeline

- **Beta Period**: [Date range]
- **Feedback Deadline**: [Date]
- **Follow-up**: We'll review all feedback and may reach out for clarification

## Contact Information

For questions during testing:
- **Technical Issues**: [Contact info]
- **General Feedback**: [Contact info]

## Thank You!

Your participation in this beta test is invaluable. CampusCheers aims to create more positive social interactions on campus, and your input will help us achieve that goal.

Happy testing! 🚀