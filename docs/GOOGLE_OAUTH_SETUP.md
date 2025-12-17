# Google OAuth Setup Guide

## Step-by-Step Setup

### 1. Create a Google Cloud Project
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Click on the project dropdown and select "New Project"
- Name it "Promptopia" and click "Create"
- Wait for the project to be created

### 2. Enable Google+ API
- In the Console, go to "APIs & Services" → "Library"
- Search for "Google+ API"
- Click on it and select "Enable"

### 3. Create OAuth 2.0 Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client IDs"
- If prompted, configure the OAuth consent screen first:
  - Select "External" for User Type
  - Fill in required fields (App name, Support email, etc.)
  - Add these scopes: `email`, `profile`
  - Click Save
  
### 4. Create OAuth Client ID
- After OAuth consent is configured, go back to "Create Credentials" → "OAuth 2.0 Client IDs"
- Choose "Web application"
- Name it "Promptopia Web"
- Under "Authorized JavaScript origins", add:
  - `http://localhost:9002` (for development)
  - `https://yourdomain.com` (for production)
- Under "Authorized redirect URIs", add:
  - `http://localhost:9002/api/auth/callback/google`
  - `https://yourdomain.com/api/auth/callback/google`
- Click "Create"

### 5. Copy Your Credentials
- Copy the Client ID and Client Secret from the popup
- Add them to your `.env.local` file:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### 6. Generate NEXTAUTH_SECRET
Run this command in your project directory:
```bash
openssl rand -base64 32
```
Copy the output and add it to `.env.local`:
```env
NEXTAUTH_SECRET=your_generated_secret_here
```

### 7. Update .env.local
Make sure your `.env.local` file has all required variables:
```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# NextAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:9002
NEXTAUTH_SECRET=your_generated_secret
```

### 8. Test It Out
- Run `npm run dev`
- Navigate to http://localhost:9002
- Click "Sign in"
- Click "Sign in with Google"
- Complete your profile with name and profile picture
- You're now able to upload prompts!

## Deployment Notes

For production (Vercel, etc.):
- Update `NEXTAUTH_URL` to your production domain
- Add your production URL to Google OAuth authorized origins and redirect URIs
- Set all environment variables in your deployment platform's settings

## Troubleshooting

**"Invalid client" error:**
- Check that your Client ID and Client Secret are correct
- Verify NEXTAUTH_URL matches exactly

**"Redirect URI mismatch" error:**
- Add your current URL to Google OAuth redirect URIs
- Check that the URL in NEXTAUTH_URL matches exactly

**Profile not saving:**
- Check MongoDB connection is working
- Check that CLOUDINARY credentials are correct if uploading profile image
