# Quick Start Checklist

## ✅ Before Running `npm run dev`

### 1. Create `.env.local` file in root directory
```bash
# Copy this template and fill in your values:
MONGODB_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:9002
NEXTAUTH_SECRET=your_generated_secret
```

### 2. Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Paste the output into `.env.local` for NEXTAUTH_SECRET

### 3. Get Google OAuth Credentials
**Quick version:**
1. Go to https://console.cloud.google.com/
2. Create new project → "Promptopia"
3. Enable Google+ API
4. Create OAuth 2.0 Client ID (Web application)
5. Add redirect URI: `http://localhost:9002/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

**Detailed guide:** See `docs/GOOGLE_OAUTH_SETUP.md`

### 4. Verify All Required Env Vars
Run this to check:
```bash
# Windows PowerShell
$env:MONGODB_URI; $env:GOOGLE_CLIENT_ID; $env:NEXTAUTH_SECRET
```

All three should return values. If any are blank, add them to `.env.local`

---

## 🚀 Start Development Server

```bash
npm run dev
```

Visit: http://localhost:9002

---

## 📝 What You Can Do Now

✅ Sign in with Google  
✅ Create user profile with picture  
✅ Upload AI prompts  
✅ Like prompts  
✅ See who created each prompt  
✅ View creator profiles  

---

## 🔗 Important URLs

- **Home**: http://localhost:9002
- **Sign In**: http://localhost:9002/auth/signin
- **Profile**: http://localhost:9002/auth/profile
- **Upload**: http://localhost:9002/user/upload
- **API Docs**: http://localhost:9002/api/auth/callback/google (auto-redirect)

---

## 📞 Common Issues

### Issue: "GOOGLE_CLIENT_ID is not defined"
**Solution**: Check `.env.local` file exists in root and has all variables

### Issue: "Invalid redirect_uri"
**Solution**: Add `http://localhost:9002/api/auth/callback/google` to Google OAuth settings

### Issue: "Cannot connect to MongoDB"
**Solution**: Verify MONGODB_URI is correct and database is running

### Issue: Profile picture not uploading
**Solution**: Check Cloudinary credentials and that you have upload credits

---

## 💡 Pro Tips

- **First time?** Use test Google account
- **Want to test locally?** Use local MongoDB or MongoDB Atlas free tier
- **Ready to deploy?** Update NEXTAUTH_URL to your domain in production
- **Need help?** Check `docs/AUTH_IMPLEMENTATION.md` for full guide

---

Ready to start? Run: `npm run dev` ✨
