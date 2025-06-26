# Campus Cheers MVP

A positivity-first, anonymous social polling app designed for U.S. high-school students. Spread cheer across your campus with daily polls and selfie videos!

## 🎯 Core Features

- **Anonymous Voting**: 100% anonymous polls with no personal data tracking
- **Daily Polls**: One poll per school at 1:00 PM local time
- **2-Minute Urgency**: Quick polls with countdown timer for engagement
- **Selfie Integration**: Record 3-5 second videos to complete your vote
- **Real-time Results**: See anonymous results from your school
- **PWA Support**: Installable app with offline capabilities
- **Push Notifications**: Get reminded about daily polls

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campuscheers
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **PWA**: Next-PWA with service worker
- **Database**: Mock database (ready for production DB)
- **Notifications**: Web Push API

### Project Structure

```
campuscheers/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main app page
├── components/            # React components
│   ├── CountdownTimer.tsx # 2-minute countdown
│   ├── PollCard.tsx       # Poll display
│   ├── ResultsScreen.tsx  # Results display
│   ├── SelfieRecorder.tsx # Video recording
│   └── WelcomeScreen.tsx  # Login screen
├── lib/                   # Utilities and data
│   ├── automations.ts     # Daily automations
│   ├── database.ts        # Mock database
│   └── types.ts           # TypeScript types
├── public/                # Static assets
│   ├── manifest.json      # PWA manifest
│   └── sw.js             # Service worker
└── package.json
```

## 🎨 Design System

### Colors
- **Viva Magenta** (#BE3455) - Primary brand color
- **Magenta Light** (#D15A7A) - Secondary
- **Cheer Yellow** (#FFD700) - Accent
- **Cheer Blue** (#4A90E2) - Accent
- **Cheer Green** (#7ED321) - Success

### Typography
- **Satoshi** - Headings and display text
- **Inter** - Body text and UI elements

### Components
- Modern card-based design
- Smooth animations and micro-interactions
- Mobile-first responsive design
- Accessibility-focused

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Database (for production)
DATABASE_URL=your_database_url

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# Analytics (optional)
ANALYTICS_ID=your_analytics_id
```

### PWA Configuration

The app is configured as a Progressive Web App with:

- Installable manifest
- Service worker for offline support
- Push notifications
- App-like experience

## 📱 User Flow

1. **Welcome Screen**: Email/SMS login with GDPR consent
2. **Poll Waiting**: Countdown to 1:00 PM poll time
3. **Active Poll**: 2-minute voting window with selfie recording
4. **Results**: Anonymous results display with engagement metrics

## 🤖 Automations

### Daily Schedule
- **12:05 AM**: Create daily polls for all schools
- **12:59 PM**: Send pre-poll notifications
- **1:00 PM**: Activate polls (2-minute window)
- **2:00 AM**: Clean up old data (30-day retention)

### Weekly Tasks
- Generate analytics reports
- Update school leaderboards
- Send engagement summaries

## 🔒 Security & Privacy

### Data Protection
- All votes are completely anonymous
- Selfie videos auto-delete after 30 days
- No personal data shared with third parties
- GDPR compliant with user consent
- AES-256 encryption for sensitive data

### Access Control
- School email verification
- JWT-based authentication
- Role-based permissions
- Rate limiting on submissions

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Set environment variables**
3. **Deploy** automatically on push

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Analytics & Monitoring

### Key Metrics
- Daily active users
- Poll participation rates
- Video submission success
- School engagement levels
- User retention rates

### Monitoring
- Real-time error tracking
- Performance monitoring
- User behavior analytics
- A/B testing framework

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

### Test Coverage
- Component testing with React Testing Library
- Integration tests for user flows
- Performance testing
- Accessibility testing

## 📈 Roadmap

### Phase 1 (MVP) ✅
- [x] Basic polling functionality
- [x] Selfie recording
- [x] Anonymous results
- [x] PWA support

### Phase 2 (Growth)
- [ ] School leaderboards
- [ ] Achievement badges
- [ ] Social sharing
- [ ] Advanced analytics

### Phase 3 (Scale)
- [ ] Multi-language support
- [ ] Advanced moderation
- [ ] API for third-party integrations
- [ ] Enterprise features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🆘 Support

- **Documentation**: [docs.campuscheers.com](https://docs.campuscheers.com)
- **Issues**: [GitHub Issues](https://github.com/campuscheers/issues)
- **Email**: support@campuscheers.com

## 🙏 Acknowledgments

- Design inspiration from modern social platforms
- Built with Next.js and React ecosystem
- Icons from [Heroicons](https://heroicons.com)
- Fonts from Google Fonts

---

**Campus Cheers** - Spreading positivity, one poll at a time! 🎉 