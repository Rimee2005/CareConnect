# Deployment Checklist - Login Issues

## 🔐 Critical Environment Variables for Vercel

Make sure these are set in your **Vercel Dashboard → Settings → Environment Variables**:

### Required Variables:

1. **`NEXTAUTH_SECRET`** ⚠️ **CRITICAL**
   - Generate a random secret: `openssl rand -base64 32`
   - Or use: https://generate-secret.vercel.app/32
   - **Without this, login will NOT work!**

2. **`NEXTAUTH_URL`** ⚠️ **CRITICAL**
   - Must be your exact Vercel deployment URL
   - Example: `https://your-app.vercel.app`
   - **Must match exactly** (no trailing slash, use https)

3. **`MONGODB_URI`**
   - Your MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/careconnect`

4. **`NEXT_PUBLIC_SOCKET_URL`**
   - Your Render/Railway socket server URL
   - Example: `https://careconnect-socket.onrender.com`

### Optional but Recommended:

5. **`NEXT_PUBLIC_URL`**
   - Same as `NEXTAUTH_URL` (your Vercel URL)

6. **Cloudinary Variables** (if using image uploads):
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

7. **SMTP Variables** (if using email):
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `SMTP_FROM`

## 🔍 Troubleshooting Login Issues

### 1. Check Browser Console
Open browser DevTools (F12) → Console tab and look for:
- `401 Unauthorized` errors
- `NEXTAUTH_SECRET` missing errors
- CORS errors
- Network errors to `/api/auth/*`

### 2. Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check "Functions" tab for errors
4. Look for `/api/auth/[...nextauth]` errors

### 3. Common Issues:

#### Issue: "Invalid credentials" but password is correct
**Solution:**
- Check `MONGODB_URI` is correct
- Verify database connection in Vercel logs
- Ensure user exists in database

#### Issue: Login redirects back to login page
**Solution:**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your Vercel URL exactly
- Clear browser cookies and try again

#### Issue: "NEXTAUTH_SECRET is missing"
**Solution:**
- Add `NEXTAUTH_SECRET` in Vercel environment variables
- Redeploy after adding

#### Issue: Session not persisting
**Solution:**
- Check cookie settings in `lib/auth.ts`
- Verify `NEXTAUTH_URL` is correct
- Check browser allows cookies

## 🛠️ Quick Fix Steps

1. **Verify Environment Variables:**
   ```bash
   # In Vercel Dashboard, check all required vars are set
   ```

2. **Generate New NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and add it to Vercel as `NEXTAUTH_SECRET`

3. **Redeploy:**
   - After adding/updating environment variables
   - Trigger a new deployment in Vercel

4. **Test Login:**
   - Clear browser cache and cookies
   - Try logging in again
   - Check browser console for errors

## 📝 Environment Variable Template for Vercel

Copy these to Vercel Dashboard → Settings → Environment Variables:

```env
# Critical - Required for login
NEXTAUTH_SECRET=your-generated-secret-here-min-32-chars
NEXTAUTH_URL=https://your-app.vercel.app

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/careconnect

# Socket Server
NEXT_PUBLIC_SOCKET_URL=https://careconnect-socket.onrender.com
NEXT_PUBLIC_URL=https://your-app.vercel.app

# Optional - Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional - SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@careconnect.com
```

## ✅ Verification Checklist

- [ ] `NEXTAUTH_SECRET` is set in Vercel (32+ characters)
- [ ] `NEXTAUTH_URL` matches your Vercel URL exactly
- [ ] `MONGODB_URI` is correct and accessible
- [ ] All environment variables are set in Vercel
- [ ] Redeployed after adding environment variables
- [ ] Browser console shows no errors
- [ ] Vercel logs show no errors

