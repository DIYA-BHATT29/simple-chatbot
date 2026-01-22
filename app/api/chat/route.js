import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    console.log("API KEY EXISTS:", !!process.env.OPENAI_API_KEY);

    const body = await req.json();
    console.log("REQUEST BODY:", body);

    const { message } = body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: message }],
    });

    return new Response(
      JSON.stringify({
        reply: completion.choices[0].message.content,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("FULL ERROR OBJECT:", error);
    console.error("ERROR MESSAGE:", error.message);

    return new Response(
      JSON.stringify({
        error: error.message || "Unknown server error",
      }),
      { status: 500 }
    );
  }
}
