import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not defined in environment variables" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000", // Required for OpenRouter rankings
        "X-Title": "Simple Chatbot", // Optional
      },
    });

    const completion = await openai.chat.completions.create({
      // You can change this to any model supported by OpenRouter
      // e.g., "openai/gpt-3.5-turbo", "meta-llama/llama-3-8b-instruct", etc.
      model: "google/gemini-2.0-flash-001", 
      messages: messages,
    });

    const text = completion.choices[0].message.content;

    return NextResponse.json({ text });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
