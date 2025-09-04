import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log(process.env.VITE_FRONTEND_URL);

// Middleware
app.use(cors({
  origin: process.env.VITE_FRONTEND_URL, // Allow frontend
  credentials: true
}));
app.use(express.json());

/**
 * Proxy endpoint for LinkedIn user info
 */
app.post('/api/linkedin/userinfo', async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ 
        error: 'Access token is required' 
      });
    }

    const response = await axios.get(process.env.LINKEDIN_USER_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('LinkedIn userinfo error:', error);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.message || 'Failed to get user info' 
    });
  }
});

/**
 * Proxy endpoint for LinkedIn post creation
 */
app.post('/api/linkedin/post', async (req, res) => {
  try {
    const { accessToken, postData } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ 
        error: 'Access token is required' 
      });
    }

    if (!postData) {
      return res.status(400).json({ 
        error: 'Post data is required' 
      });
    }

    const response = await axios.post(process.env.LINKEDIN_POST_URL, postData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('LinkedIn post error:', error);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.message || 'Failed to create post' 
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'LinkedIn Proxy Server'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LinkedIn proxy server running on port ${PORT}`);
  console.log(`📱 Frontend should connect to: ${process.env.VITE_FRONTEND_URL}`);
  console.log(`🔗 Health check: ${process.env.VITE_BACKEND_URL}/health`);
});

export default app;
