# CareConnect — Full-Stack Healthcare Caregiving Platform

**Tagline:** *"Care with compassion, anytime, anywhere."*

A production-quality, full-stack healthcare caregiving SaaS platform connecting Vitals (Patients/Care Seekers) with Guardians (Caretakers/Care Providers).

## 🚀 Features

- **Dual Role System**: Separate workflows for Vitals and Guardians with strict RBAC
- **Profile Management**: Comprehensive profile creation and management for both roles
- **Booking System**: Complete booking workflow with status pipeline (Pending → Accepted → Ongoing → Completed)
- **Notification System**: Real-time notifications with bell icon and slide-in panel
- **Review System**: Rating and review system for Guardians
- **File Uploads**: Cloudinary integration for profile photos and certifications
- **Email Notifications**: Transactional emails via Nodemailer
- **Internationalization**: English/Hindi language support with instant toggle
- **Feature Flags**: Future-ready feature flag system (SOS Emergency, AI Matching)
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Modern UI**: Teal/Sage color scheme (NO BLUE), empathetic design, Framer Motion animations

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (custom theme tokens)
- Shadcn/UI components
- Framer Motion
- React Hook Form + Zod validation
- React i18next (English ↔ Hindi)

### Backend
- Next.js API Routes + Server Actions
- NextAuth.js (JWT Authentication)
- Strict RBAC middleware
- MongoDB + Mongoose
- Cloudinary (file uploads)
- Nodemailer (SMTP emails)

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Cloudinary account
- SMTP email service (Gmail, SendGrid, etc.)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CareConnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.local.example .env.local
   ```

   Required environment variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/careconnect

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # SMTP
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM=noreply@careconnect.com

   # Feature Flags
   NEXT_PUBLIC_FEATURE_SOS_EMERGENCY=false
   NEXT_PUBLIC_FEATURE_AI_MATCHING=false
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
CareConnect/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── vital/             # Vital (patient) pages
│   ├── guardian/          # Guardian (caretaker) pages
│   ├── about/             # About page
│   └── layout.tsx          # Root layout
├── components/            # React components
│   ├── ui/               # Shadcn/UI components
│   ├── Navbar.tsx        # Navigation bar
│   ├── NotificationBell.tsx
│   └── LanguageToggle.tsx
├── lib/                   # Utilities and configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # MongoDB connection
│   ├── rbac.ts           # RBAC middleware
│   ├── email.ts          # Email templates
│   ├── cloudinary.ts     # Cloudinary integration
│   ├── i18n.ts           # i18n configuration
│   └── utils.ts          # Utility functions
├── models/                # Mongoose schemas
│   ├── User.ts
│   ├── VitalProfile.ts
│   ├── GuardianProfile.ts
│   ├── Booking.ts
│   ├── Notification.ts
│   └── Review.ts
└── types/                 # TypeScript type definitions
```

## 🎨 Design System

### Color Palette
- **Primary**: Teal (#14b8a6) - Trust, calm, health
- **Secondary**: Warm Coral/Orange (#fb923c) - Compassion, action
- **Sage**: Sage Green (#87a96b) - Natural, calming
- **Background**: Off-white/Warm beige (#fefbf6)
- **Text**: Charcoal gray (#2d3748)
- **NO BLUE** - Strictly avoided throughout the platform

### Typography
- Large, readable fonts
- Elderly-friendly line-height
- System font stack for performance

## 👥 User Roles & Permissions

### Vital (Patient/Care Seeker)
- ✅ Create, update, delete own profile
- ✅ Browse all Guardians
- ✅ View Guardian details
- ✅ Book Guardian
- ✅ Leave reviews
- ✅ Receive notifications
- ❌ Cannot view other Vitals
- ❌ Cannot edit Guardian data

### Guardian (Caretaker/Provider)
- ✅ Create one Guardian profile
- ✅ View own profile only
- ✅ Edit/update/delete own profile
- ✅ View only Vitals who booked them
- ✅ Accept/reject bookings
- ✅ Track service status
- ❌ Cannot view other Guardians (hard-blocked at API level)

## 🔐 Authentication & Authorization

- **NextAuth.js** with JWT strategy
- **Strict RBAC** enforced at API route level
- Role-based route protection
- Session management

## 📧 Email System

Transactional emails sent via Nodemailer:
- Vital profile creation confirmation
- Guardian profile activation
- Booking accepted/rejected notifications

## ☁️ File Uploads

- **Cloudinary** integration for secure file storage
- Profile photos
- Guardian certifications
- Client-side previews

## 🌐 Internationalization

- **English** (default)
- **Hindi** (हिंदी)
- Instant language toggle
- ARIA labels for screen readers

## 🚨 Feature Flags

Future-ready feature flag system:
- `SOS_EMERGENCY`: Emergency support button (currently disabled)
- `AI_MATCHING`: AI-powered Guardian matching (currently disabled)

Control via environment variables.

## 🧪 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Vital
- `GET/POST/PUT/DELETE /api/vital/profile` - Vital profile management

### Guardian
- `GET/POST/PUT/DELETE /api/guardian/profile` - Guardian profile management
- `GET /api/guardians` - List all Guardians (Vital only)
- `GET /api/guardians/[id]` - Get Guardian details
- `GET /api/guardians/[id]/reviews` - Get Guardian reviews

### Bookings
- `GET/POST /api/bookings` - Booking management (Vital)
- `GET /api/guardian/bookings` - Guardian bookings
- `PATCH /api/guardian/bookings/[id]` - Accept/reject booking

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]` - Mark as read

### Uploads
- `POST /api/upload` - Upload file to Cloudinary

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
- Ensure Node.js 18+ is available
- Set all environment variables
- Build: `npm run build`
- Start: `npm start`

## 📝 Database Models

### User
- Email, password (hashed), role (VITAL/GUARDIAN)

### VitalProfile
- User reference, personal info, health needs, location, profile photo

### GuardianProfile
- User reference, specialization, experience, availability, service radius, certifications, verification status

### Booking
- Vital reference, Guardian reference, status, timestamps

### Notification
- User reference, type, message, read status

### Review
- Booking reference, rating (1-5), comment

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- RBAC at API level
- Input validation with Zod
- Secure file uploads via Cloudinary
- Environment variable protection

## ♿ Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast text
- Large clickable areas

## 📄 License

This project is proprietary software.

## 🤝 Contributing

This is a private project. For questions or issues, please contact the development team.

## 📞 Support

For support, email support@careconnect.com or create an issue in the repository.

---

**Built with ❤️ for compassionate healthcare**

