---
title: "CampusCheers Student Verification Guide"
version: "1.0.0"
last-updated: "2025-08-29"
authors: ["CampusCheers Team"]
reviewers: ["Product Team", "Security Team", "Legal Team"]
status: "Draft"
---

# CampusCheers Student Verification Guide

> **Secure • Safe • School-Focused**
>
> A comprehensive guide to CampusCheers' Gas app-style student verification system

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Student Verification Process](#student-verification-process)
4. [Technical Implementation](#technical-implementation)
5. [Security & Compliance](#security--compliance)
6. [User Experience Guidelines](#user-experience-guidelines)
7. [Integration & Deployment](#integration--deployment)
8. [Troubleshooting & Support](#troubleshooting--support)
9. [Future Enhancements](#future-enhancements)
10. [Appendices](#appendices)

---

## Executive Summary

### What is CampusCheers?

CampusCheers is a safe, school-focused social platform designed specifically for high school students, inspired by the success of apps like Gas and tbh. Our platform creates authentic, supportive communities where students can connect, share, and build meaningful relationships within their trusted school environment.

### The Verification Challenge

Traditional social platforms face significant challenges in creating safe spaces for young users:

- **Age Verification Gaps**: Many platforms lack robust methods to verify user age and school affiliation
- **Community Fragmentation**: Users often interact with strangers rather than building local, trusted communities
- **Safety Concerns**: Inappropriate interactions and content can proliferate without proper community boundaries
- **Fraud Prevention**: Fake accounts and impersonation undermine platform trust and safety

### Our Solution: Gas App-Style Verification

CampusCheers implements a comprehensive, multi-layered student verification system that addresses these challenges through:

#### 🔐 **Security First Approach**
- **Phone Number Verification**: SMS-based authentication ensures genuine user identity
- **Geographic School Validation**: Zip code fencing confirms users are in legitimate school districts
- **Age-Appropriate Communities**: Grade-based segmentation creates safe, peer-appropriate spaces
- **Fraud Prevention**: Multi-layer validation prevents fake accounts and impersonation

#### 🎯 **Friction-Free User Experience**
- **5-Step Onboarding**: Streamlined process completed in under 2 minutes
- **Auto-Detection**: Browser geolocation automatically suggests user's zip code
- **Smart Defaults**: Pre-filled forms and intelligent suggestions reduce manual input
- **Mobile Optimized**: Touch-friendly interface designed for high school students

#### 🏫 **School-Centric Architecture**
- **Complete Isolation**: Users can only interact with verified students from their school
- **Geographic Proximity**: Schools are validated based on user's physical location
- **Institutional Trust**: School affiliation creates inherent credibility and safety
- **Community Building**: Local connections foster genuine relationships and support

### Key Benefits

#### For Students
- **Safe Environment**: Interact only with verified peers from your school
- **Easy Access**: Simple, fast verification process
- **Local Community**: Connect with classmates and build authentic relationships
- **Privacy Protection**: Age-appropriate content and interaction guidelines

#### For Parents
- **Peace of Mind**: Know your child is interacting in a verified, school-based community
- **Safety Assurance**: Multi-layer verification prevents inappropriate interactions
- **Community Trust**: School affiliation provides inherent credibility
- **Content Safety**: Age-appropriate platform design and moderation

#### For Schools
- **Student Safety**: Platform supports positive school culture and relationships
- **Community Building**: Enhances school spirit and student connections
- **Safety Monitoring**: Provides tools for appropriate online interaction
- **Institutional Partnership**: Creates positive digital extension of school community

### System Architecture Overview

#### Core Components
1. **Frontend Verification Flow**: React-based mobile-first interface
2. **SMS Verification Service**: Twilio-powered phone number validation
3. **Geographic School Database**: Location-based school validation
4. **User Isolation Engine**: School-specific community segmentation
5. **Security & Compliance Layer**: Data protection and privacy controls

#### Data Flow
```
User Input → Location Detection → School Validation → Phone Verification → Profile Creation → Community Access
```

#### Security Layers
- **Input Validation**: All user inputs validated and sanitized
- **Rate Limiting**: Prevents abuse and ensures fair access
- **Data Encryption**: Sensitive information protected at rest and in transit
- **Audit Logging**: Comprehensive activity tracking for security monitoring

---

## System Overview

### Authentication Architecture

CampusCheers implements a **5-layer verification system** that creates secure, school-specific communities:

#### Layer 1: Geographic Validation
- **Zip Code Fencing**: Users must provide valid US zip code
- **Auto-Detection**: Browser geolocation suggests user's location
- **Proximity Filtering**: Schools filtered by geographic proximity (15-mile radius)

#### Layer 2: Institutional Affiliation
- **School Database**: Pre-populated with verified educational institutions
- **Location Matching**: Schools matched to user's geographic area
- **Institutional Trust**: School affiliation provides credibility foundation

#### Layer 3: Identity Verification
- **Phone Number Validation**: SMS-based identity confirmation
- **Temporary Codes**: 6-digit verification codes with 10-minute expiration
- **Rate Limiting**: Prevents abuse and ensures genuine verification

#### Layer 4: Age Segmentation
- **Grade Selection**: Users specify their high school grade (9-12)
- **Age-Appropriate Communities**: Grade-based content and interaction guidelines
- **Developmental Appropriateness**: Content tailored to age and maturity level

#### Layer 5: Profile Completion
- **Basic Information**: First name, last initial for community identification
- **Privacy Controls**: User data access and sharing preferences
- **Community Integration**: Seamless onboarding into school-specific community

### Technical Implementation

#### Frontend Architecture
```typescript
// Authentication Flow Components
├── ZipCodePage          // Location input with auto-detection
├── SelectSchoolPage     // Geographic school filtering
├── PhoneVerificationPage // SMS code validation
├── SelectGradePage      // Age-appropriate community selection
├── SetupProfilePage     // Basic profile completion
└── FindFriendsPage      // School-specific user discovery
```

#### Backend Services
```typescript
// Core Services
├── SMSService           // Twilio integration for phone verification
├── GoogleMapsService    // Geographic school validation
├── AuthRoutes           // Authentication API endpoints
└── UserManagement       // Profile and community management
```

#### Database Schema
```sql
-- Core Tables
User {
  phoneNumber: String (unique)
  grade: Int (9-12)
  schoolId: String (foreign key)
  isVerified: Boolean
  verificationCode: String?
  verificationExpiry: DateTime?
}

School {
  name: String
  address: String?
  city: String?
  state: String?
  zipCode: String?
  latitude: Float?
  longitude: Float?
}
```

### Security Implementation

#### Data Protection
- **Phone Number Encryption**: All phone numbers encrypted at rest
- **Secure Transmission**: HTTPS-only communication with certificate pinning
- **Data Minimization**: Only collect necessary information for verification
- **Retention Policies**: Automatic data deletion for inactive accounts

#### Fraud Prevention
- **SMS Rate Limiting**: Maximum 3 verification attempts per hour per IP
- **Device Fingerprinting**: Basic device identification for abuse prevention
- **Pattern Detection**: Automated detection of suspicious verification patterns
- **Manual Review**: Human oversight for flagged accounts

#### Privacy Controls
- **User Data Access**: Users can view and delete their data
- **Parental Controls**: Framework for parental oversight and consent
- **Data Export**: Users can export their data in standard formats
- **Account Deletion**: Complete data removal upon user request

---

## Student Verification Process

### Complete User Journey

CampusCheers' verification process is designed to be **intuitive, fast, and secure**:

#### Step 1: Location Discovery (30 seconds)
**User Experience:**
- Clean, welcoming interface with clear value proposition
- Auto-detection of user's location via browser geolocation
- Manual zip code entry option with real-time validation
- Progress indicator showing "Step 1 of 5"

**Technical Implementation:**
```typescript
// Auto-detection with fallback
const detectLocation = async () => {
  try {
    const position = await navigator.geolocation.getCurrentPosition();
    const zipCode = await reverseGeocodeToZip(position.coords);
    setZipCode(zipCode);
    // Auto-advance after 1.5 seconds
    setTimeout(() => router.push('/auth/select-school'), 1500);
  } catch {
    // Fallback to manual entry
    setShowManualEntry(true);
  }
};
```

#### Step 2: School Selection (45 seconds)
**User Experience:**
- Dynamic school list filtered by geographic proximity
- Clear school information (name, address, distance)
- Auto-selection if only one school found
- Visual feedback for selected school
- Easy back navigation

**Technical Implementation:**
```typescript
// Geographic school filtering
const loadSchools = async (zipCode: string) => {
  const schools = await GoogleMapsService.findSchoolsNearZipCode(zipCode, 15);
  const transformedSchools = schools.map(school => ({
    id: school.placeId,
    name: school.name,
    city: school.city,
    state: school.state,
    distance: school.distance
  }));
  setSchools(transformedSchools);
};
```

#### Step 3: Phone Verification (60 seconds)
**User Experience:**
- Clear phone number formatting (XXX) XXX-XXXX
- SMS code delivery confirmation
- 60-second resend timer with visual countdown
- Code input with automatic advancement
- Error handling with helpful messages

**Technical Implementation:**
```typescript
// SMS verification flow
const handleSendCode = async () => {
  const response = await fetch('/api/auth/send-verification-code', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber: formattedNumber })
  });

  if (response.ok) {
    setIsCodeSent(true);
    setResendTimer(60);
  }
};
```

#### Step 4: Grade Selection (20 seconds)
**User Experience:**
- Simple grade selection (9th-12th)
- Clear grade labels (Freshman, Sophomore, etc.)
- Auto-calculation of graduation year
- Visual feedback for selection
- Quick transition to next step

**Technical Implementation:**
```typescript
// Grade-based community assignment
const GRADES = [
  { value: 9, label: '9th Grade (Freshman)' },
  { value: 10, label: '10th Grade (Sophomore)' },
  { value: 11, label: '11th Grade (Junior)' },
  { value: 12, label: '12th Grade (Senior)' }
];
```

#### Step 5: Profile Completion (45 seconds)
**User Experience:**
- Pre-filled school and grade information
- Simple name entry (first name + last initial)
- Clear privacy explanation
- Final confirmation before community access
- Smooth transition to friend finding

**Technical Implementation:**
```typescript
// Profile creation with school context
const handleProfileSetup = async () => {
  const response = await axios.post('/api/auth/setup-profile', {
    phoneNumber,
    name: `${firstName} ${lastInitial}.`,
    schoolId: selectedSchool.id,
    grade: selectedGrade,
    profileImage: ''
  });

  // Store user data and redirect to community
  sessionStorage.setItem('userData', JSON.stringify(response.data));
  router.push('/auth/find-friends');
};
```

### Error Handling & Edge Cases

#### Network Issues
- **SMS Delivery Failure**: Clear retry options with alternative contact methods
- **API Timeouts**: Automatic retry with exponential backoff
- **Connection Loss**: State preservation and recovery instructions

#### Validation Errors
- **Invalid Phone Number**: Real-time formatting and validation feedback
- **Expired Codes**: Automatic resend options with improved UX
- **School Not Found**: Helpful suggestions and manual entry options

#### User Experience Issues
- **Auto-Detection Failure**: Graceful fallback to manual entry
- **Multiple Schools**: Clear selection interface with distance indicators
- **Technical Difficulties**: Step-by-step troubleshooting guidance

### Performance Metrics

#### Target Performance
- **Total Verification Time**: < 2 minutes
- **Step Completion Rate**: > 95% per step
- **SMS Delivery Success**: > 98%
- **User Drop-off Rate**: < 5% total

#### Monitoring & Analytics
- **Step-by-Step Conversion**: Track completion rates per verification step
- **Error Rate Monitoring**: Identify and resolve common failure points
- **Performance Tracking**: Monitor API response times and user experience
- **Success Metrics**: Track successful verifications and user retention

---

## Technical Implementation

### Frontend Architecture

#### Component Structure
```
src/app/auth/
├── zip-code/page.tsx          # Location discovery
├── select-school/page.tsx     # Geographic filtering
├── phone-verification/page.tsx # SMS validation
├── select-grade/page.tsx      # Age segmentation
├── setup-profile/page.tsx     # Profile completion
└── find-friends/page.tsx      # Community integration
```

#### Key Components

**InputField Component:**
```typescript
interface InputFieldProps {
  id: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  disabled?: boolean;
}
```

**Button Component:**
```typescript
interface ButtonProps {
  primary?: boolean;
  size?: 'small' | 'medium' | 'large';
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}
```

### Backend Architecture

#### API Endpoints

**Authentication Routes:**
```typescript
// GET /api/auth/schools-by-zip?zip=12345
// Returns schools near specified zip code

// POST /api/auth/send-verification-code
// Sends SMS verification code to phone number

// POST /api/auth/verify-code
// Validates SMS verification code

// POST /api/auth/setup-profile
// Creates user profile with verification data
```

**Request/Response Examples:**

```typescript
// School search response
{
  "schools": [
    {
      "id": "school_123",
      "name": "Lincoln High School",
      "address": "123 Main St, Springfield, IL 62701",
      "city": "Springfield",
      "state": "IL",
      "zipCode": "62701",
      "distance": 2.3
    }
  ]
}

// Verification code request
{
  "phoneNumber": "+15551234567"
}

// Profile setup request
{
  "phoneNumber": "+15551234567",
  "name": "John D.",
  "schoolId": "school_123",
  "grade": 11,
  "profileImage": ""
}
```

#### Database Schema

**User Model:**
```sql
model User {
  id                String   @id @default(cuid())
  email             String?  // Temporary for migration compatibility
  phoneNumber       String?  @unique
  password          String
  name              String?
  profileImage      String?
  schoolId          String
  school            School   @relation(fields: [schoolId], references: [id])
  grade             Int?     // 9-12 for high school grades
  isVerified        Boolean  @default(false)
  verificationCode  String?
  verificationExpiry DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  inclusionScore    Float    @default(0)

  // Relations
  friends           Friendship[] @relation("friends")
  friendOf          Friendship[] @relation("friendOf")
  sentHypes         PollVote[]   @relation("sentHypes")
  receivedHypes     PollVote[]   @relation("receivedHypes")
  hypeRounds        HypeRound[]
  moments           Moment[]
}
```

**School Model:**
```sql
model School {
  id        String  @id @default(cuid())
  name      String
  domain    String  @unique
  address   String?
  city      String?
  state     String?
  zipCode   String?
  latitude  Float?
  longitude Float?
  users     User[]
}
```

### SMS Integration

#### Twilio Configuration
```typescript
// Environment variables
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567
```

#### SMS Service Implementation
```typescript
export class SMSService {
  static async sendVerificationCode(phoneNumber: string, code: string) {
    const formattedNumber = this.formatPhoneNumber(phoneNumber);

    const message = await twilio.messages.create({
      body: `Your CampusCheers verification code is: ${code}. This code expires in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber,
    });

    return { success: true, messageId: message.sid };
  }

  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
```

### Geographic Services

#### Google Maps Integration
```typescript
export class GoogleMapsService {
  static async findSchoolsNearZipCode(zipCode: string, radiusMiles: number = 10) {
    // 1. Convert zip code to coordinates
    const zipLocation = await this.getZipCodeLocation(zipCode);

    // 2. Search for schools within radius
    const response = await googleMapsClient.placesNearby({
      params: {
        location: `${zipLocation.latitude},${zipLocation.longitude}`,
        radius: radiusMeters,
        type: 'school',
        key: apiKey,
      },
    });

    // 3. Filter and format results
    return this.filterSchoolResults(response.data.results);
  }
}
```

---

## Security & Compliance

### COPPA Compliance

#### Age Verification Strategy
- **Phone Number Verification**: Confirms user has access to mobile device (typically age 13+)
- **School Affiliation**: High school enrollment indicates appropriate age range
- **Grade Selection**: Self-reported grade provides additional age context
- **Parental Consent Framework**: Built-in support for parental oversight

#### Data Collection Standards
- **Minimal Data Collection**: Only collect information necessary for verification
- **No Marketing Data**: Platform does not collect data for advertising purposes
- **User Control**: Users can access, modify, and delete their data
- **Data Retention**: Automatic deletion of inactive accounts after 1 year

### Data Protection

#### Encryption Standards
- **Phone Numbers**: Encrypted at rest using AES-256
- **Transmission**: All data transmitted over HTTPS with TLS 1.3
- **API Keys**: Securely stored in environment variables
- **Database**: Encrypted backups and secure access controls

#### Privacy Controls
- **User Data Access**: Users can view all collected data
- **Data Export**: Standard JSON/CSV export functionality
- **Account Deletion**: Complete data removal within 30 days
- **Consent Management**: Clear privacy policy and user agreements

### Fraud Prevention

#### Rate Limiting
- **SMS Verification**: Maximum 3 attempts per hour per IP address
- **Account Creation**: Maximum 1 account per phone number
- **API Requests**: Rate limiting on all public endpoints
- **Geographic Validation**: Prevents location spoofing

#### Abuse Detection
- **Pattern Analysis**: Automated detection of suspicious activity
- **Device Fingerprinting**: Basic device identification
- **Manual Review**: Human oversight for flagged accounts
- **Account Suspension**: Temporary blocks for policy violations

### Security Monitoring

#### Logging & Auditing
- **API Access Logs**: All endpoint access recorded
- **User Activity**: Authentication attempts and profile changes
- **Security Events**: Failed verifications and suspicious patterns
- **System Health**: Performance and error monitoring

#### Incident Response
- **Security Breach Protocol**: 24/7 response team
- **User Notification**: Transparent communication about incidents
- **Regulatory Reporting**: Compliance with data breach notification laws
- **Post-Incident Review**: Analysis and improvement implementation

---

## User Experience Guidelines

### Design Principles

#### Friction-Free Experience
- **Progressive Disclosure**: Show only necessary information at each step
- **Smart Defaults**: Pre-fill forms with available data
- **Auto-Advancement**: Move to next step when conditions are met
- **Clear Feedback**: Visual indicators for progress and status

#### Mobile-First Design
- **Touch Targets**: Minimum 44px touch targets for all interactive elements
- **Readable Text**: 16px minimum font size for body text
- **Thumb Zone**: Primary actions placed in easy thumb reach
- **One-Handed Use**: Interface optimized for single-hand operation

### Accessibility Standards

#### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 ratio for text and backgrounds
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order

#### Inclusive Design
- **Multiple Input Methods**: Support for touch, keyboard, and voice input
- **Error Prevention**: Clear validation and helpful error messages
- **Flexible Time Limits**: No strict time limits for form completion
- **Cognitive Load**: Simple language and clear visual hierarchy

### Performance Standards

#### Loading Times
- **Initial Page Load**: < 2 seconds
- **API Response Time**: < 1 second for verification endpoints
- **SMS Delivery**: < 30 seconds for code delivery
- **Form Submission**: < 500ms for local validation

#### Offline Capability
- **Progressive Web App**: Service worker for offline functionality
- **Form Persistence**: Save form data during network interruptions
- **Offline Messaging**: Clear indicators when offline functionality is limited
- **Sync on Reconnect**: Automatic data synchronization when connection restored

---

## System Architecture Diagrams

### High-Level System Architecture

```mermaid
graph TB
    subgraph "User Layer"
        A[📱 Mobile/Web App]
    end

    subgraph "Frontend Layer"
        B[⚛️ Next.js Application]
        C[🔐 Authentication Flow]
        D[🎨 UI Components]
    end

    subgraph "API Layer"
        E[🚀 Next.js API Routes]
        F[📡 Authentication Endpoints]
        G[🏫 School Data API]
        H[💬 SMS Integration]
    end

    subgraph "Service Layer"
        I[📧 Twilio SMS Service]
        J[🗺️ Google Maps API]
        K[🏫 School Database]
    end

    subgraph "Data Layer"
        L[(📊 PostgreSQL Database)]
        M[👤 User Table]
        N[🏫 School Table]
        O[🔑 Verification Codes]
    end

    A --> B
    B --> C
    B --> D
    C --> F
    D --> G
    F --> I
    F --> J
    G --> K
    I --> L
    J --> L
    K --> L
    L --> M
    L --> N
    L --> O

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style E fill:#e8f5e8
    style I fill:#fff3e0
    style L fill:#fce4ec
```

### Authentication Flow Sequence Diagram

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant F as 🎨 Frontend
    participant A as 🚀 API
    participant S as 📧 SMS Service
    participant D as 📊 Database
    participant G as 🗺️ Google Maps

    rect rgb(240, 248, 255)
        Note over U,G: Phase 1: Location Discovery
        U->>F: Enter zip code or allow auto-detection
        F->>F: Validate zip code format
        F->>A: GET /api/auth/schools-by-zip?zip=75013
        A->>G: Request schools near zip code
        G-->>A: Return nearby schools
        A->>D: Store school data (cache)
        A-->>F: Return formatted school list
        F-->>U: Display schools with distances
    end

    rect rgb(255, 248, 220)
        Note over U,G: Phase 2: School Selection
        U->>F: Select school from list
        F->>F: Validate school selection
        F->>F: Store selected school in session
    end

    rect rgb(240, 255, 240)
        Note over U,G: Phase 3: Phone Verification
        U->>F: Enter phone number
        F->>F: Format and validate phone number
        F->>A: POST /api/auth/send-verification-code
        A->>A: Generate 6-digit verification code
        A->>D: Store code with expiration (10 min)
        A->>S: Send SMS with verification code
        S-->>A: SMS delivery confirmation
        A-->>F: Success response
        F-->>U: Show code input field

        U->>F: Enter verification code
        F->>A: POST /api/auth/verify-code
        A->>D: Validate code and expiration
        D-->>A: Code validation result
        A-->>F: Verification success/failure
        F-->>U: Proceed to grade selection or show error
    end

    rect rgb(255, 240, 245)
        Note over U,G: Phase 4: Grade Selection & Profile Creation
        U->>F: Select grade (9-12)
        F->>F: Calculate graduation year
        U->>F: Enter name (first + last initial)
        F->>A: POST /api/auth/setup-profile
        A->>D: Create user record
        D-->>A: User creation confirmation
        A-->>F: Return user data
        F-->>U: Redirect to community dashboard
    end
```

### Database Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Friendship : "friends"
    User ||--o{ PollVote : "sent_hypes"
    User ||--o{ HypeRound : "participates"
    User ||--o{ Moment : "creates"
    User }o--|| School : "belongs_to"

    School ||--o{ User : "has_students"

    Friendship {
        string id PK
        string user1Id FK
        string user2Id FK
        datetime createdAt
    }

    PollVote {
        string id PK
        string pollQuestionId FK
        string voterId FK
        string recipientId FK
        string hypeRoundId FK
        datetime createdAt
    }

    HypeRound {
        string id PK
        string userId FK
        datetime createdAt
    }

    Moment {
        string id PK
        string userId FK
        string caption
        datetime createdAt
    }

    User {
        string id PK
        string email "nullable for migration"
        string phoneNumber UK "nullable for migration"
        string password
        string name
        string profileImage
        string schoolId FK
        int grade "9-12, nullable"
        boolean isVerified
        string verificationCode "nullable"
        datetime verificationExpiry "nullable"
        datetime createdAt
        datetime updatedAt
        float inclusionScore
    }

    School {
        string id PK
        string name
        string domain UK
        string address "nullable"
        string city "nullable"
        string state "nullable"
        string zipCode "nullable"
        float latitude "nullable"
        float longitude "nullable"
    }
```

### Data Flow Architecture

```mermaid
flowchart TD
    subgraph "Input Layer"
        A[👤 User Actions] --> B[📱 Form Submissions]
        C[🌐 Browser Geolocation] --> D[📍 Location Data]
    end

    subgraph "Validation Layer"
        B --> E{🔍 Input Validation}
        D --> F{📍 Zip Code Validation}
        E --> G[✅ Valid Data]
        F --> H[✅ Valid Location]
        E --> I[❌ Validation Error]
        F --> J[❌ Location Error]
    end

    subgraph "Processing Layer"
        G --> K[🎯 API Request Formation]
        H --> L[🗺️ Geographic Processing]
        K --> M[🚀 HTTP Request]
        L --> N[📊 School Filtering]
    end

    subgraph "Service Layer"
        M --> O[📧 Twilio SMS API]
        M --> P[🗺️ Google Maps API]
        N --> Q[🏫 School Database Query]
    end

    subgraph "Response Layer"
        O --> R[📨 SMS Delivery]
        P --> S[🏫 School Data]
        Q --> T[👥 Filtered Results]
    end

    subgraph "Output Layer"
        R --> U[📱 UI Updates]
        S --> V[🎨 School List Display]
        T --> W[💾 Session Storage]
    end

    I --> X[🚨 Error Display]
    J --> Y[🔄 Fallback to Manual Entry]

    style A fill:#e3f2fd
    style E fill:#fff3e5
    style K fill:#e8f5e8
    style O fill:#fce4ec
    style U fill:#f3e5f5
```

---

## Complete API Documentation

### Authentication Endpoints

#### `GET /api/auth/schools-by-zip`

**Purpose**: Retrieve schools within geographic proximity of a zip code

**Authentication**: None required

**Query Parameters**:
```typescript
{
  zip: string; // Required: Valid US zip code (5 or 9 digits)
}
```

**Success Response (200)**:
```typescript
{
  schools: Array<{
    id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
    distance?: number; // Miles from zip code center
    rating?: number;
    types?: string[];
  }>;
  message?: string; // Optional success message
}
```

**Error Responses**:
```typescript
// 400 Bad Request
{
  error: "Zip code is required" | "Invalid zip code format"
}

// 500 Internal Server Error
{
  error: "Failed to search schools",
  details: "Please try again or contact support if the issue persists"
}
```

**Example Request**:
```bash
curl -X GET "http://localhost:3001/api/auth/schools-by-zip?zip=75013"
```

**Example Response**:
```json
{
  "schools": [
    {
      "id": "school_123",
      "name": "Allen High School",
      "address": "300 Rivercrest Blvd, Allen, TX 75002",
      "city": "Allen",
      "state": "TX",
      "zipCode": "75013",
      "latitude": 33.1032,
      "longitude": -96.6989,
      "distance": 0.8,
      "rating": 4.5,
      "types": ["school", "point_of_interest", "establishment"]
    },
    {
      "id": "school_124",
      "name": "Lovejoy High School",
      "address": "1575 Eagle Dr, Lucas, TX 75002",
      "city": "Lucas",
      "state": "TX",
      "zipCode": "75013",
      "latitude": 33.1032,
      "longitude": -96.6989,
      "distance": 2.1,
      "rating": 4.3,
      "types": ["school", "point_of_interest", "establishment"]
    }
  ],
  "message": "Found 2 schools near 75013"
}
```

#### `POST /api/auth/send-verification-code`

**Purpose**: Send SMS verification code to user's phone number

**Authentication**: None required

**Request Body**:
```typescript
{
  phoneNumber: string; // Required: Valid US phone number (10 digits, no formatting)
}
```

**Success Response (200)**:
```typescript
{
  message: "Verification code sent successfully"
}
```

**Error Responses**:
```typescript
// 400 Bad Request
{
  error: "Phone number is required" | "Invalid phone number format"
}

// 429 Too Many Requests
{
  error: "Too many verification attempts. Please try again later."
}

// 500 Internal Server Error
{
  error: "Failed to send verification code"
}
```

**Rate Limiting**: Maximum 3 requests per hour per IP address

**Example Request**:
```bash
curl -X POST "http://localhost:3001/api/auth/send-verification-code" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "5551234567"}'
```

#### `POST /api/auth/verify-code`

**Purpose**: Validate SMS verification code

**Authentication**: None required

**Request Body**:
```typescript
{
  phoneNumber: string; // Required: Phone number used for verification
  code: string;       // Required: 6-digit verification code
}
```

**Success Response (200)**:
```typescript
{
  message: "Phone number verified successfully"
}
```

**Error Responses**:
```typescript
// 400 Bad Request
{
  error: "Phone number and code are required" |
         "No verification code found. Please request a new one." |
         "Verification code has expired. Please request a new one." |
         "Invalid verification code"
}

// 500 Internal Server Error
{
  error: "Verification failed"
}
```

**Code Expiration**: 10 minutes from creation

**Example Request**:
```bash
curl -X POST "http://localhost:3001/api/auth/verify-code" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "5551234567", "code": "123456"}'
```

#### `POST /api/auth/setup-profile`

**Purpose**: Create user profile after successful verification

**Authentication**: None required (verification handled separately)

**Request Body**:
```typescript
{
  phoneNumber: string;   // Required: Verified phone number
  name: string;         // Required: User's display name
  schoolId: string;     // Required: Selected school ID
  grade?: number;       // Optional: Grade 9-12
  gradYear?: number;    // Optional: Graduation year
  profileImage?: string; // Optional: Profile image URL
}
```

**Success Response (200)**:
```typescript
{
  id: string;
  phoneNumber: string;
  name: string;
  schoolId: string;
  grade: number | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  school: {
    id: string;
    name: string;
    domain: string;
    city?: string;
    state?: string;
  };
}
```

**Error Responses**:
```typescript
// 400 Bad Request
{
  error: "Phone number, name, and school ID are required" |
         "School not found" |
         "Phone number already registered"
}

// 500 Internal Server Error
{
  error: "Failed to create profile"
}
```

**Example Request**:
```bash
curl -X POST "http://localhost:3001/api/auth/setup-profile" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5551234567",
    "name": "John D.",
    "schoolId": "school_123",
    "grade": 11,
    "profileImage": ""
  }'
```

### API Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request parameters |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

### API Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/schools-by-zip` | 100 requests | Per hour per IP |
| `/send-verification-code` | 3 requests | Per hour per IP |
| `/verify-code` | 10 requests | Per hour per IP |
| `/setup-profile` | 5 requests | Per hour per IP |

### Error Handling Strategy

#### Client-Side Error Handling
```typescript
// Example error handling in frontend
try {
  const response = await fetch('/api/auth/schools-by-zip?zip=75013');

  if (!response.ok) {
    const errorData = await response.json();

    switch (response.status) {
      case 400:
        // Handle validation errors
        showValidationError(errorData.error);
        break;
      case 429:
        // Handle rate limiting
        showRateLimitError();
        break;
      case 500:
        // Handle server errors
        showServerError();
        break;
      default:
        showGenericError();
    }
  } else {
    const data = await response.json();
    // Process successful response
  }
} catch (error) {
  // Handle network errors
  showNetworkError();
}
```

#### Server-Side Error Logging
```typescript
// Example server error logging
app.use((error, req, res, next) => {
  console.error('API Error:', {
    method: req.method,
    url: req.url,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ip: req.ip
  });

  res.status(500).json({
    error: 'Internal server error',
    requestId: req.requestId // For tracking
  });
});
```

---

## Integration & Deployment

### Environment Configuration

#### Required Environment Variables

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/campuscheers"

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="+15551234567"

# Google Maps API Configuration
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# Application Configuration
NEXT_PUBLIC_APP_URL="https://yourapp.com"
JWT_SECRET="your_jwt_secret_key"
NODE_ENV="production"

# Security Configuration
ENCRYPTION_KEY="your_32_character_encryption_key"
RATE_LIMIT_WINDOW="900000"  # 15 minutes in milliseconds
RATE_LIMIT_MAX="100"       # Max requests per window
```

#### Environment Validation

```typescript
// server/src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_PHONE_NUMBER: z.string().regex(/^\+1\d{10}$/),
  GOOGLE_MAPS_API_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  ENCRYPTION_KEY: z.string().length(32),
});

export const env = envSchema.parse(process.env);
```

### Database Setup

#### Prisma Migration Strategy

```bash
# Development migration
npx prisma migrate dev --name add_phone_verification_and_geographic_data

# Production migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

#### Database Indexes for Performance

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_user_phone_number ON "User"("phoneNumber");
CREATE INDEX idx_user_school_id ON "User"("schoolId");
CREATE INDEX idx_user_grade ON "User"("grade");
CREATE INDEX idx_school_zip_code ON "School"("zipCode");
CREATE INDEX idx_school_domain ON "School"("domain");

-- Composite index for school searches
CREATE INDEX idx_school_location ON "School"("latitude", "longitude")
WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;
```

### Deployment Checklist

#### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Twilio account verified and funded
- [ ] Google Maps API key with proper restrictions
- [ ] SSL certificate installed
- [ ] Domain DNS configured

#### Deployment Steps
```bash
# 1. Install dependencies
npm ci --production

# 2. Build application
npm run build

# 3. Run database migrations
npx prisma migrate deploy

# 4. Generate Prisma client
npx prisma generate

# 5. Start application
npm start
```

#### Post-Deployment
- [ ] Health check endpoints responding
- [ ] SMS verification working
- [ ] School search functional
- [ ] Error logging configured
- [ ] Monitoring alerts set up

### Monitoring & Observability

#### Key Metrics to Monitor

```typescript
// Application metrics
const metrics = {
  // Authentication metrics
  verificationAttempts: 'counter',
  verificationSuccess: 'counter',
  verificationFailure: 'counter',
  smsDeliverySuccess: 'counter',
  smsDeliveryFailure: 'counter',

  // Performance metrics
  apiResponseTime: 'histogram',
  schoolSearchTime: 'histogram',
  profileCreationTime: 'histogram',

  // Error metrics
  apiErrors: 'counter',
  validationErrors: 'counter',
  rateLimitHits: 'counter',

  // Business metrics
  userRegistrations: 'counter',
  schoolCoverage: 'gauge',
  geographicDistribution: 'histogram'
};
```

#### Health Check Endpoints

```typescript
// GET /api/health
export default async function handler(req, res) {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    // Check external services
    const twilioStatus = await checkTwilioStatus();
    const googleMapsStatus = await checkGoogleMapsStatus();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        twilio: twilioStatus,
        googleMaps: googleMapsStatus
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
```

### Security Considerations

#### API Security
- **HTTPS Only**: All API endpoints require HTTPS in production
- **Rate Limiting**: Implemented at application and infrastructure levels
- **Input Validation**: Comprehensive validation using Zod schemas
- **CORS Configuration**: Properly configured for allowed origins

#### Data Security
- **Encryption at Rest**: Sensitive data encrypted using AES-256
- **Secure Transmission**: TLS 1.3 for all data transmission
- **Data Minimization**: Only collect necessary user data
- **Retention Policies**: Automatic data deletion for inactive accounts

#### Infrastructure Security
- **Container Security**: Minimal base images with security updates
- **Secret Management**: Environment variables for sensitive configuration
- **Network Security**: VPC configuration with security groups
- **Access Control**: Principle of least privilege for all services

---

## Troubleshooting & Support

### Common Issues & Solutions

#### SMS Delivery Issues

**Problem**: Users not receiving verification codes
```typescript
// Diagnostic steps
const troubleshootSms = async (phoneNumber: string) => {
  // 1. Check phone number format
  const isValid = SMSService.validatePhoneNumber(phoneNumber);
  console.log('Phone number valid:', isValid);

  // 2. Check Twilio account status
  const accountStatus = await checkTwilioAccount();
  console.log('Twilio account status:', accountStatus);

  // 3. Verify rate limits
  const rateLimitStatus = await checkRateLimits(phoneNumber);
  console.log('Rate limit status:', rateLimitStatus);

  // 4. Test SMS delivery
  const testResult = await SMSService.sendVerificationCode(phoneNumber, '123456');
  console.log('Test SMS result:', testResult);
};
```

**Solutions**:
1. **Invalid Phone Number**: Ensure 10-digit US number without formatting
2. **Twilio Issues**: Check account balance and phone number verification
3. **Rate Limiting**: Wait for cooldown period or contact support
4. **Carrier Filtering**: Some carriers block SMS from unknown numbers

#### School Search Issues

**Problem**: No schools found for valid zip code
```typescript
// Diagnostic steps
const troubleshootSchoolSearch = async (zipCode: string) => {
  // 1. Validate zip code
  const isValidZip = /^\d{5}(-\d{4})?$/.test(zipCode);
  console.log('Zip code valid:', isValidZip);

  // 2. Check Google Maps API
  const apiStatus = await checkGoogleMapsAPI();
  console.log('Google Maps API status:', apiStatus);

  // 3. Test school search
  const schools = await GoogleMapsService.findSchoolsNearZipCode(zipCode);
  console.log('Schools found:', schools.length);

  // 4. Check database fallback
  const dbSchools = await prisma.school.findMany({
    where: { zipCode: zipCode.substring(0, 5) }
  });
  console.log('Database schools:', dbSchools.length);
};
```

**Solutions**:
1. **API Key Issues**: Verify Google Maps API key and billing
2. **Geographic Coverage**: Some rural areas have limited school data
3. **Zip Code Accuracy**: Ensure correct zip code format
4. **Database Fallback**: Manual school entry for missing areas

#### Verification Code Issues

**Problem**: Codes not validating correctly
```typescript
// Diagnostic steps
const troubleshootVerification = async (phoneNumber: string, code: string) => {
  // 1. Check code format
  const isValidCode = /^\d{6}$/.test(code);
  console.log('Code format valid:', isValidCode);

  // 2. Check stored codes
  const storedCodes = global.verificationCodes?.get(phoneNumber);
  console.log('Stored code exists:', !!storedCodes);

  // 3. Check expiration
  if (storedCodes) {
    const isExpired = new Date() > storedCodes.expiry;
    console.log('Code expired:', isExpired);
    console.log('Expires at:', storedCodes.expiry);
  }

  // 4. Verify code match
  if (storedCodes) {
    const codeMatches = storedCodes.code === code;
    console.log('Code matches:', codeMatches);
  }
};
```

**Solutions**:
1. **Code Expiration**: Request new code after 10 minutes
2. **Case Sensitivity**: Ensure codes are entered exactly as received
3. **Storage Issues**: Check server memory and restart if necessary
4. **Timing Issues**: Account for SMS delivery delays

### Support Escalation Matrix

#### Level 1: User Self-Service
- **Documentation**: Comprehensive troubleshooting guides
- **FAQs**: Common questions and answers
- **Status Page**: Real-time system status
- **Community Forums**: Peer-to-peer support

#### Level 2: Customer Support
- **Email Support**: support@campuscheers.com
- **Response Time**: < 24 hours
- **Resolution Rate**: 80% of issues
- **Escalation Criteria**: Complex technical issues

#### Level 3: Engineering Support
- **Slack Channel**: #engineering-support
- **Response Time**: < 4 hours
- **System Issues**: Database, API, infrastructure problems
- **Security Issues**: Immediate response required

### User Communication Templates

#### SMS Delivery Issues
```
Subject: SMS Verification Code Not Received

Dear [User Name],

We're sorry you're having trouble receiving your verification code. Here are some troubleshooting steps:

1. Check your spam/junk folder
2. Ensure your phone number is entered correctly: [Phone Number]
3. Wait 60 seconds and request a new code
4. Try using a different device if possible

If these steps don't resolve the issue, please reply to this email with:
- Your phone number (last 4 digits only)
- The time you requested the code
- Your device type and carrier

We'll investigate and get back to you within 24 hours.

Best regards,
CampusCheers Support Team
```

#### School Not Found
```
Subject: School Not Found - Manual Entry Required

Dear [User Name],

We couldn't find your school in our database for zip code [Zip Code]. This can happen for newer schools or those in rural areas.

To complete your verification, please provide:
- School name
- School address
- School website (if available)
- School district

You can reply to this email or visit our support page at [Support URL].

Once we verify the information, we'll add your school to our database and complete your account setup.

Thank you for your patience!

Best regards,
CampusCheers Support Team
```

---

## Future Enhancements

### Phase 3: Advanced Features

#### Biometric Verification
```typescript
// Future biometric integration
interface BiometricVerification {
  faceId: boolean;
  touchId: boolean;
  deviceBiometrics: boolean;
  verificationScore: number;
}

// Enhanced verification flow
const enhancedVerification = async (userData: UserData) => {
  // 1. Phone verification (current)
  await verifyPhoneNumber(userData.phoneNumber);

  // 2. Biometric verification (future)
  const biometricScore = await verifyBiometrics(userData.deviceId);

  // 3. Device fingerprinting (future)
  const deviceTrust = await analyzeDeviceFingerprint(userData.deviceFingerprint);

  // 4. Risk assessment
  const riskScore = calculateRiskScore({
    phoneVerified: true,
    biometricScore,
    deviceTrust,
    locationHistory: userData.locationHistory
  });

  return riskScore < 0.3; // Low risk threshold
};
```

#### School Email Integration
```typescript
// Future school email verification
interface SchoolEmailVerification {
  email: string;
  domain: string;
  verificationToken: string;
  expiresAt: Date;
}

// Dual verification flow
const dualVerification = async (phoneNumber: string, schoolEmail: string) => {
  // Parallel verification processes
  const [phoneResult, emailResult] = await Promise.allSettled([
    verifyPhoneNumber(phoneNumber),
    verifySchoolEmail(schoolEmail)
  ]);

  // Require at least one successful verification
  const phoneVerified = phoneResult.status === 'fulfilled' && phoneResult.value;
  const emailVerified = emailResult.status === 'fulfilled' && emailResult.value;

  return phoneVerified || emailVerified;
};
```

### Phase 4: Scalability Improvements

#### Geographic Data Optimization
```typescript
// Future geographic optimization
interface GeographicOptimization {
  // Pre-computed school clusters
  schoolClusters: Map<string, SchoolCluster>;

  // Cached search results
  searchCache: Map<string, CachedSearchResult>;

  // Geographic indexing
  spatialIndex: SpatialIndex;
}

// Optimized school search
const optimizedSchoolSearch = async (zipCode: string): Promise<School[]> => {
  // 1. Check cache first
  const cached = searchCache.get(zipCode);
  if (cached && !isExpired(cached.timestamp)) {
    return cached.schools;
  }

  // 2. Use spatial index for fast lookup
  const nearbyClusters = spatialIndex.query(zipCode);

  // 3. Parallel API calls for multiple clusters
  const schools = await Promise.all(
    nearbyClusters.map(cluster => fetchSchoolsForCluster(cluster))
  );

  // 4. Cache results
  searchCache.set(zipCode, {
    schools: schools.flat(),
    timestamp: Date.now()
  });

  return schools.flat();
};
```

#### Performance Monitoring
```typescript
// Future performance monitoring
interface PerformanceMetrics {
  // Response time percentiles
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;

  // Error rates
  apiErrorRate: number;
  smsDeliveryRate: number;
  verificationSuccessRate: number;

  // Geographic coverage
  zipCodeCoverage: number;
  schoolCoverage: number;

  // User experience
  averageVerificationTime: number;
  userDropOffRate: number;
}

// Real-time monitoring dashboard
const monitoringDashboard = {
  alerts: {
    highErrorRate: (metrics: PerformanceMetrics) => metrics.apiErrorRate > 0.05,
    slowResponseTime: (metrics: PerformanceMetrics) => metrics.p95ResponseTime > 5000,
    lowVerificationRate: (metrics: PerformanceMetrics) => metrics.verificationSuccessRate < 0.95
  },

  reports: {
    dailyPerformance: generateDailyReport,
    weeklyGeographic: generateGeographicReport,
    monthlyUserExperience: generateUserExperienceReport
  }
};
```

### Phase 5: Advanced Analytics

#### User Behavior Analytics
```typescript
// Future user behavior tracking
interface UserBehaviorAnalytics {
  // Verification funnel analysis
  funnelSteps: {
    zipCodeEntry: number;
    schoolSelection: number;
    phoneEntry: number;
    codeVerification: number;
    gradeSelection: number;
    profileCompletion: number;
  };

  // Geographic insights
  popularZipCodes: Array<{zip: string, count: number}>;
  schoolPopularity: Array<{schoolId: string, registrations: number}>;

  // Performance insights
  averageTimePerStep: Record<string, number>;
  commonDropOffPoints: Array<{step: string, dropOffRate: number}>;

  // Success predictors
  successFactors: {
    autoDetectionUsage: number;
    schoolDistance: number;
    verificationSpeed: number;
  };
}
```

#### Predictive Optimization
```typescript
// Future predictive features
interface PredictiveOptimization {
  // Dynamic school suggestions
  predictSchoolChoice: (userData: Partial<UserData>) => School[];

  // Optimal verification timing
  predictBestVerificationTime: (userLocation: Location) => Date;

  // Fraud detection
  detectFraudulentActivity: (userPattern: UserPattern) => FraudScore;

  // Performance optimization
  optimizeApiResponse: (loadPattern: LoadPattern) => OptimizationStrategy;
}
```

### Implementation Roadmap

#### Q1 2025: Enhanced Verification
- [ ] Biometric verification integration
- [ ] School email verification
- [ ] Enhanced fraud detection
- [ ] Improved error recovery

#### Q2 2025: Performance & Scale
- [ ] Geographic data optimization
- [ ] Advanced caching strategies
- [ ] Multi-region deployment
- [ ] Real-time performance monitoring

#### Q3 2025: Analytics & Insights
- [ ] User behavior analytics
- [ ] Predictive optimization
- [ ] A/B testing framework
- [ ] Advanced reporting dashboard

#### Q4 2025: Advanced Features
- [ ] Multi-language support
- [ ] Advanced accessibility features
- [ ] Integration APIs for partners
- [ ] Mobile app optimization

---

## Appendices

### Appendix A: API Error Codes

| Error Code | HTTP Status | Description | User Message |
|------------|-------------|-------------|--------------|
| `INVALID_ZIP` | 400 | Invalid zip code format | Please enter a valid US zip code |
| `ZIP_NOT_FOUND` | 400 | Zip code not in service area | This zip code is not currently supported |
| `SCHOOLS_NOT_FOUND` | 404 | No schools found | No schools found near this location |
| `INVALID_PHONE` | 400 | Invalid phone number | Please enter a valid 10-digit phone number |
| `SMS_FAILED` | 500 | SMS delivery failed | Unable to send verification code |
| `CODE_EXPIRED` | 400 | Verification code expired | Code has expired, please request a new one |
| `CODE_INVALID` | 400 | Invalid verification code | Incorrect code, please try again |
| `PHONE_REGISTERED` | 409 | Phone already registered | This phone number is already registered |
| `SCHOOL_INVALID` | 400 | Invalid school selection | Please select a valid school |
| `RATE_LIMITED` | 429 | Too many requests | Too many attempts, please wait |

### Appendix B: Environment Setup

#### Development Environment
```bash
# Clone repository
git clone https://github.com/campuscheers/app.git
cd campuscheers

# Install dependencies
npm install
cd server && npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma migrate dev
npx prisma db seed

# Start development servers
npm run dev          # Frontend on :3000
cd server && npm start # Backend on :3001
```

#### Production Environment
```bash
# Build application
npm run build

# Set production environment variables
export NODE_ENV=production
export DATABASE_URL="postgresql://..."
export TWILIO_ACCOUNT_SID="..."
# ... other variables

# Run migrations
npx prisma migrate deploy

# Start production server
npm start
```

### Appendix C: Testing Procedures

#### Unit Tests
```typescript
// SMS Service Tests
describe('SMSService', () => {
  test('validates phone numbers correctly', () => {
    expect(SMSService.validatePhoneNumber('5551234567')).toBe(true);
    expect(SMSService.validatePhoneNumber('555-123-4567')).toBe(true);
    expect(SMSService.validatePhoneNumber('555123456')).toBe(false);
  });

  test('generates valid verification codes', () => {
    const code = SMSService.generateVerificationCode();
    expect(code).toMatch(/^\d{6}$/);
    expect(parseInt(code)).toBeGreaterThanOrEqual(100000);
    expect(parseInt(code)).toBeLessThanOrEqual(999999);
  });
});

// Authentication API Tests
describe('Authentication API', () => {
  test('validates zip codes', async () => {
    const response = await request(app)
      .get('/api/auth/schools-by-zip?zip=invalid')
      .expect(400);

    expect(response.body.error).toContain('zip code');
  });

  test('returns schools for valid zip', async () => {
    const response = await request(app)
      .get('/api/auth/schools-by-zip?zip=75013')
      .expect(200);

    expect(Array.isArray(response.body.schools)).toBe(true);
  });
});
```

#### Integration Tests
```typescript
// Complete verification flow test
describe('Verification Flow', () => {
  test('complete user registration', async () => {
    // 1. Get schools by zip
    const schoolsResponse = await request(app)
      .get('/api/auth/schools-by-zip?zip=75013')
      .expect(200);

    const schoolId = schoolsResponse.body.schools[0].id;

    // 2. Send verification code
    await request(app)
      .post('/api/auth/send-verification-code')
      .send({ phoneNumber: '5551234567' })
      .expect(200);

    // 3. Verify code (mock the stored code)
    global.verificationCodes?.set('5551234567', {
      code: '123456',
      expiry: new Date(Date.now() + 600000)
    });

    await request(app)
      .post('/api/auth/verify-code')
      .send({ phoneNumber: '5551234567', code: '123456' })
      .expect(200);

    // 4. Create profile
    const profileResponse = await request(app)
      .post('/api/auth/setup-profile')
      .send({
        phoneNumber: '5551234567',
        name: 'John Doe',
        schoolId,
        grade: 11
      })
      .expect(200);

    expect(profileResponse.body.name).toBe('John Doe');
    expect(profileResponse.body.grade).toBe(11);
  });
});
```

### Appendix D: Compliance Checklist

#### COPPA Compliance
- [ ] Age verification strategy documented
- [ ] Parental consent framework implemented
- [ ] Data collection minimization verified
- [ ] Data retention policies defined
- [ ] User data access controls in place
- [ ] Data deletion procedures documented

#### Data Protection
- [ ] Data encryption at rest implemented
- [ ] Secure data transmission (HTTPS/TLS)
- [ ] Access controls and authentication
- [ ] Audit logging and monitoring
- [ ] Incident response procedures
- [ ] Data backup and recovery

#### Privacy Rights
- [ ] Privacy policy published and accessible
- [ ] User data export functionality
- [ ] Account deletion with data removal
- [ ] Consent management system
- [ ] Data processing transparency
- [ ] Third-party data sharing controls

---

*CampusCheers Student Verification Guide*
*Version: 1.0.0*
*Last Updated: 2025-08-29*
*Authors: CampusCheers Team*
*Reviewers: Product Team, Security Team, Legal Team*
*Status: Complete*