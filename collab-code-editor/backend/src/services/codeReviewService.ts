import OpenAI from 'openai';

export interface CodeIssue {
  line: number;
  column?: number;
  endLine?: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  category: 'syntax' | 'quality' | 'performance' | 'security';
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function analyzeCode(
  code: string,
  language: string
): Promise<CodeIssue[]> {
  const openai = getOpenAIClient();

  try {
    const prompt = `You are a code review assistant. Analyze the following ${language} code and identify issues.

Return a JSON array of issues with this exact structure:
[
  {
    "line": <line_number>,
    "severity": "error|warning|info",
    "message": "<short description>",
    "suggestion": "<how to fix it>",
    "category": "syntax|quality|performance|security"
  }
]

Rules:
- Line numbers start at 1
- Be specific and actionable
- Focus on real issues, not style preferences
- Limit to top 10 most important issues
- Return empty array [] if no issues found

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the JSON array, no other text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cheaper and faster than gpt-4
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer. Return only valid JSON arrays.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '[]';
    
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : '[]';
    
    const issues: CodeIssue[] = JSON.parse(jsonStr);
    
    // Validate and sanitize the response
    return issues.filter((issue) => 
      issue.line && 
      issue.severity && 
      issue.message && 
      issue.category
    ).slice(0, 10); // Limit to 10 issues

  } catch (error) {
    console.error('Code analysis error:', error);
    throw new Error('Failed to analyze code');
  }
}

export async function getSuggestion(
  code: string,
  language: string,
  issue: string
): Promise<string> {
  const openai = getOpenAIClient();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful code assistant. Provide concise, actionable suggestions.',
        },
        {
          role: 'user',
          content: `Given this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nIssue: ${issue}\n\nProvide a brief suggestion on how to fix it.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || 'No suggestion available';
  } catch (error) {
    console.error('Suggestion generation error:', error);
    throw new Error('Failed to generate suggestion');
  }
}
