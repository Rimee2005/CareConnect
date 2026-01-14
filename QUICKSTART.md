# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database (use MongoDB Atlas or local MongoDB)
MONGODB_URI=mongodb://localhost:27017/careconnect

# NextAuth (generate a random string)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here-min-32-chars

# Cloudinary (sign up at cloudinary.com)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SMTP Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@careconnect.com

# Feature Flags
NEXT_PUBLIC_FEATURE_SOS_EMERGENCY=false
NEXT_PUBLIC_FEATURE_AI_MATCHING=false
```

**Quick Tips:**
- Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- For Gmail, use an App Password (not your regular password)
- MongoDB Atlas offers a free tier

### Step 3: Run the Development Server
```bash
npm run dev
```

### Step 4: Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Test the Application

### Create a Vital Account
1. Click "I am a Vital" on the homepage
2. Register with email and password
3. Create your Vital profile
4. Browse Guardians

### Create a Guardian Account
1. Click "I am a Guardian" on the homepage
2. Register with email and password
3. Create your Guardian profile
4. Wait for booking requests

### Test Booking Flow
1. As a Vital, browse Guardians
2. Click on a Guardian to view details
3. Click "Book Service"
4. As the Guardian, check dashboard for booking request
5. Accept or reject the booking

## 📝 Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running (if local)
- Check `MONGODB_URI` is correct
- For Atlas, whitelist your IP address

### Cloudinary Upload Fails
- Verify API keys in Cloudinary dashboard
- Check file size limits
- Ensure CORS is configured

### Email Not Sending
- For Gmail, enable "Less secure app access" or use App Password
- Check SMTP credentials
- Verify firewall isn't blocking port 587

### NextAuth Errors
- Ensure `NEXTAUTH_SECRET` is set and at least 32 characters
- Check `NEXTAUTH_URL` matches your domain

## 🎨 Customization

### Change Colors
Edit `tailwind.config.ts` to modify the color palette.

### Add More Languages
Edit `lib/i18n.ts` to add translation keys.

### Enable Feature Flags
Set environment variables to `true`:
```env
NEXT_PUBLIC_FEATURE_SOS_EMERGENCY=true
NEXT_PUBLIC_FEATURE_AI_MATCHING=true
```

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Review the API routes in `app/api/`
- Customize the UI components in `components/ui/`
- Add more features as needed

Happy coding! 🎉

