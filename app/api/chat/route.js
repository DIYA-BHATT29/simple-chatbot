import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Financial-related keywords for validation
const FINANCIAL_KEYWORDS = [
  // Core financial terms
  'finance', 'financial', 'money', 'investment', 'invest', 'stock', 'bond',
  'portfolio', 'retirement', '401k', 'ira', 'roth', 'savings', 'budget',
  'debt', 'loan', 'mortgage', 'interest', 'rate', 'credit', 'score',
  'tax', 'insurance', 'estate', 'planning', 'wealth', 'income', 'expense',
  
  // Investment types
  'mutual fund', 'etf', 'index fund', 'dividend', 'capital', 'asset',
  'real estate', 'crypto', 'bitcoin', 'ethereum', 'commodities',
  
  // Financial concepts
  'diversification', 'risk', 'return', 'inflation', 'compound',
  'liquidity', 'volatility', 'market', 'economy', 'recession',
  
  // Planning terms
  'retirement planning', 'college fund', 'emergency fund', 'net worth',
  'financial planning', 'goal setting', 'debt management'
];

// System prompt to enforce financial-only responses
const SYSTEM_PROMPT = `You are a professional financial advisor chatbot. Your role is strictly limited to providing financial advice and information.

CRITICAL RULES:
1. ONLY respond to queries related to personal finance, investments, budgeting, retirement planning, taxes, insurance, debt management, and other financial matters.
2. If a user asks about non-financial topics, politely decline and redirect them to financial questions.
3. Do not provide medical, legal, relationship, or any other non-financial advice.
4. Always include appropriate disclaimers that your advice is informational and users should consult licensed professionals.
5. Be clear, accurate, and conservative in your financial guidance.

Example responses for non-financial queries:
- "I specialize only in financial advice. Could you ask about investments, budgeting, or other financial matters?"
- "As a financial advisor chatbot, I can only discuss financial topics. Please ask about money management, investments, or related subjects."
- "I'm not qualified to answer that. I can only provide financial guidance on topics like retirement planning, debt management, or investment strategies."`;

export async function POST(req) {
  try {
    console.log("API KEY EXISTS:", !!process.env.OPENAI_API_KEY);

    const body = await req.json();
    console.log("REQUEST BODY:", body);

    const { message } = body;

    // Validate message is provided
    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: "Please provide a message",
          suggestion: "Ask about investments, budgeting, retirement, or other financial topics"
        }),
        { status: 400 }
      );
    }

    // Check if message is financial-related (basic validation)
    const messageLower = message.toLowerCase();
    const isFinancial = FINANCIAL_KEYWORDS.some(keyword => 
      messageLower.includes(keyword.toLowerCase())
    );

    if (!isFinancial) {
      // Still send to OpenAI but with strict system prompt
      console.log("Non-financial query detected:", message);
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Updated to current model
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      temperature: 0.3, // Lower temperature for more consistent, conservative responses
      max_tokens: 500,
      presence_penalty: 0.5, // Discourage going off-topic
    });

    const reply = completion.choices[0].message.content;

    // Additional check for non-financial responses
    const replyLower = reply.toLowerCase();
    const seemsFinancial = FINANCIAL_KEYWORDS.some(keyword => 
      replyLower.includes(keyword.toLowerCase())
    );

    // If reply doesn't seem financial despite system prompt, add warning
    let finalReply = reply;
    if (!seemsFinancial && !replyLower.includes('financial') && !replyLower.includes('finance')) {
      finalReply = `${reply}\n\n*Note: Remember I'm a financial advisor chatbot. For non-financial questions, please consult appropriate professionals.*`;
    }

    return new Response(
      JSON.stringify({
        reply: finalReply,
        isFinancialQuery: isFinancial,
        disclaimer: "This is informational advice only. Consult a licensed financial advisor for personal guidance."
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error("FULL ERROR OBJECT:", error);
    console.error("ERROR MESSAGE:", error.message);
    console.error("ERROR CODE:", error.code);

    return new Response(
      JSON.stringify({
        error: error.message || "Unknown server error",
        suggestion: "Please ensure your query is about financial topics"
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}
