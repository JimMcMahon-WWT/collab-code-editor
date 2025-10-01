import OpenAI from 'openai';

export interface RuntimeError {
  message: string;
  stack?: string;
  line?: number;
  column?: number;
  fileName?: string;
  timestamp: string;
}

export interface DebugAnalysis {
  errorType: string;
  rootCause: string;
  explanation: string;
  fixSuggestions: FixSuggestion[];
  relatedCode?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface FixSuggestion {
  description: string;
  code?: string;
  line?: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function analyzeRuntimeError(
  error: RuntimeError,
  code: string,
  language: string,
  errorHistory?: RuntimeError[]
): Promise<DebugAnalysis> {
  const openai = getOpenAIClient();

  try {
    const historyContext = errorHistory && errorHistory.length > 0
      ? `\n\nRecent error history (for pattern detection):\n${errorHistory.slice(-3).map(e => `- ${e.message}`).join('\n')}`
      : '';

    const prompt = `You are an expert debugging assistant. Analyze this JavaScript runtime error and provide actionable help.

ERROR DETAILS:
Message: ${error.message}
Stack Trace: ${error.stack || 'Not available'}
Line: ${error.line || 'Unknown'}
Column: ${error.column || 'Unknown'}
${historyContext}

CODE CONTEXT:
\`\`\`${language}
${code}
\`\`\`

Analyze this error and return a JSON object with this structure:
{
  "errorType": "<classify error: ReferenceError, TypeError, SyntaxError, etc>",
  "rootCause": "<one sentence root cause>",
  "explanation": "<2-3 sentences explaining what went wrong and why>",
  "fixSuggestions": [
    {
      "description": "<what to do>",
      "code": "<optional: corrected code snippet>",
      "line": <optional: line number to fix>,
      "priority": "critical|high|medium|low"
    }
  ],
  "relatedCode": "<optional: relevant code section causing issue>",
  "confidence": "high|medium|low"
}

Rules:
- Provide 1-3 fix suggestions, prioritized by importance
- Be specific and actionable
- Include code examples when helpful
- Consider the error history for pattern detection
- Return ONLY valid JSON, no markdown formatting

Return ONLY the JSON object, no other text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert JavaScript debugger. Return only valid JSON objects with detailed error analysis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : '{}';
    
    const analysis: DebugAnalysis = JSON.parse(jsonStr);
    
    // Validate response
    if (!analysis.errorType || !analysis.rootCause || !analysis.explanation) {
      throw new Error('Invalid analysis response');
    }

    return analysis;

  } catch (error) {
    console.error('Debug analysis error:', error);
    throw new Error('Failed to analyze runtime error');
  }
}

export async function suggestDebugSteps(
  error: RuntimeError,
  code: string,
  language: string
): Promise<string[]> {
  const openai = getOpenAIClient();

  try {
    const prompt = `Given this JavaScript error:
${error.message}

In this code:
\`\`\`${language}
${code}
\`\`\`

Suggest 3-5 step-by-step debugging actions the user can take to investigate and fix this issue.
Return as a JSON array of strings: ["step 1", "step 2", ...]

Return ONLY the JSON array, no other text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a debugging mentor. Provide clear, actionable debugging steps.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : '[]';
    
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error('Debug steps generation error:', error);
    throw new Error('Failed to generate debug steps');
  }
}
