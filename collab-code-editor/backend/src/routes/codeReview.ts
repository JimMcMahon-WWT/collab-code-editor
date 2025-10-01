import express from 'express';
import rateLimit from 'express-rate-limit';
import { analyzeCode } from '../services/codeReviewService';

const router = express.Router();

// Rate limiting: 10 requests per 15 minutes per IP
const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many review requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Analyze code endpoint
router.post('/analyze', reviewLimiter, async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ 
        error: 'Missing required fields: code and language' 
      });
    }

    if (code.length > 10000) {
      return res.status(400).json({ 
        error: 'Code too large. Maximum 10,000 characters.' 
      });
    }

    const issues = await analyzeCode(code, language);

    res.json({ 
      success: true, 
      issues,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Code review error:', error);
    
    if (error.message === 'OpenAI API key not configured') {
      return res.status(503).json({ 
        error: 'AI service not configured. Please contact administrator.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to analyze code. Please try again.' 
    });
  }
});

export default router;
