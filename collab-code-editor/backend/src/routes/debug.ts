import express from 'express';
import rateLimit from 'express-rate-limit';
import { analyzeRuntimeError, suggestDebugSteps, RuntimeError } from '../services/debugService';

const router = express.Router();

// Rate limiting: 20 requests per 15 minutes per IP (slightly more than code review)
const debugLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many debug requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Analyze runtime error endpoint
router.post('/analyze', debugLimiter, async (req, res) => {
  try {
    const { error, code, language, errorHistory } = req.body;

    if (!error || !code || !language) {
      return res.status(400).json({ 
        error: 'Missing required fields: error, code, and language' 
      });
    }

    if (!error.message) {
      return res.status(400).json({ 
        error: 'Error object must have a message property' 
      });
    }

    if (code.length > 10000) {
      return res.status(400).json({ 
        error: 'Code too large. Maximum 10,000 characters.' 
      });
    }

    const runtimeError: RuntimeError = {
      message: error.message,
      stack: error.stack,
      line: error.line,
      column: error.column,
      fileName: error.fileName,
      timestamp: error.timestamp || new Date().toISOString(),
    };

    const analysis = await analyzeRuntimeError(
      runtimeError,
      code,
      language,
      errorHistory
    );

    res.json({ 
      success: true, 
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Debug analysis error:', error);
    
    if (error.message === 'OpenAI API key not configured') {
      return res.status(503).json({ 
        error: 'AI debugging service not configured. Please contact administrator.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to analyze error. Please try again.' 
    });
  }
});

// Get debugging steps endpoint
router.post('/steps', debugLimiter, async (req, res) => {
  try {
    const { error, code, language } = req.body;

    if (!error || !code || !language) {
      return res.status(400).json({ 
        error: 'Missing required fields: error, code, and language' 
      });
    }

    const runtimeError: RuntimeError = {
      message: error.message,
      stack: error.stack,
      timestamp: error.timestamp || new Date().toISOString(),
    };

    const steps = await suggestDebugSteps(runtimeError, code, language);

    res.json({ 
      success: true, 
      steps,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Debug steps error:', error);
    
    res.status(500).json({ 
      error: 'Failed to generate debug steps. Please try again.' 
    });
  }
});

export default router;
