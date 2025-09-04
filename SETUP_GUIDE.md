# AI Tech News Generator - Setup Guide

## Quick Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   - Create a `.env` file in the root directory
   - Add your API keys:
   ```
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
   VITE_ACCESS_TOKEN=your_actual_linkedin_access_token_here
   VITE_BACKEND_URL=http://localhost:3001/api/linkedin
   ```

3. **Get Your API Keys**

   **Gemini API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy the key to your `.env` file

   **LinkedIn Access Token:**
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Create a new app or use existing one
   - Request access to: `r_liteprofile` and `w_member_social`
   - Generate an access token
   - Copy the token to your `.env` file

4. **Start Both Services**
   ```bash
   npm run dev:full
   ```
   This will start both the backend server (port 3001) and frontend (port 5173)

   **Or start them separately:**
   ```bash
   # Terminal 1: Start backend server
   npm run server
   
   # Terminal 2: Start frontend
   npm run dev
   ```

5. **Open in Browser**
   - Navigate to `http://localhost:5173`
   - Click "Generate Tech News Post" to create AI-powered content
   - Edit and customize the generated content
   - Click "Post on LinkedIn" to automatically share to LinkedIn

## Features

- 🤖 **AI-Powered Content Generation**: Uses Gemini AI to create professional LinkedIn posts
- ✏️ **Rich Text Editor**: Advanced editing with formatting tools (bold, italic, hashtags, links)
- 📋 **One-Click Copy**: Copy the final content to your clipboard
- 🚀 **Direct LinkedIn Posting**: Automatically post to LinkedIn with one click
- 🔗 **Source Link Integration**: Add source URLs to your posts
- 🎨 **Beautiful UI**: Clean, modern interface with smooth animations
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- 🔒 **CORS-Free**: Backend proxy eliminates CORS issues
- 📝 **Smart Formatting**: Automatic content cleanup and LinkedIn-optimized formatting

## Usage Tips

- The AI generates content about the latest tech industry updates
- Content is optimized for LinkedIn with proper structure and hashtags
- You can edit any part of the generated content before copying
- The character count helps you stay within LinkedIn's limits

## Troubleshooting

- **"Error fetching news data"**: Check your Gemini API key in the `.env` file
- **"Backend server is not running"**: Start the backend server with `npm run server`
- **"LinkedIn access token expired"**: Get a new token from LinkedIn Developers
- **"Insufficient permissions"**: Ensure your LinkedIn app has `w_member_social` permission
- **CORS errors**: Make sure both frontend and backend servers are running
- **Content not generating**: Check your internet connection and try again

## Architecture

- **Frontend**: React app on port 5173
- **Backend**: Express proxy server on port 3001
- **API Integration**: Gemini AI for content generation, LinkedIn API for posting
- **CORS Solution**: Backend proxy handles all external API calls

Enjoy creating and posting professional LinkedIn content with AI! 🚀
