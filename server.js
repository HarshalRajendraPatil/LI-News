import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend
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

    const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
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

    const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
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
  console.log(`📱 Frontend should connect to: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
