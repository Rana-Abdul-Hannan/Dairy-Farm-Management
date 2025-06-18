// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

// --- OPTION 1: For Google Gemini (COMMENTED OUT) ---
// import { GoogleGenerativeAI } from "@google/generative-ai";
// const geminiApiKey = process.env.GEMINI_API_KEY;
// const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
// const geminiModel = genAI ? genAI.getGenerativeModel({ model: "gemini-pro" }) : null;
// --- END OPTION 1 ---

// --- OPTION 2: For OpenAI (COMMENTED OUT) ---
// import OpenAI from 'openai';
// import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
// const openaiApiKey = process.env.OPENAI_API_KEY;
// const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;
// --- END OPTION 2 ---

// --- OPTION 3: For Hugging Face (UNCOMMENTED AND CONFIGURED) ---
const hfApiKey = process.env.HUGGING_FACE_API_KEY;
// IMPORTANT: Replace with a specific model ID from Hugging Face, e.g., "distilbert/distilgpt2"
// or a smaller Llama/Mistral model if available on free Inference API.
const HF_MODEL_ID = process.env.HUGGING_FACE_MODEL_ID || "HuggingFaceH4/zephyr-7b-beta"; // Example, choose one that fits your needs and free tier!

export async function POST(req: NextRequest) {
  // Check specifically for the Hugging Face API key
  if (!hfApiKey) {
    console.error("HUGGING_FACE_API_KEY not set. Please set it in your .env.local file.");
    return NextResponse.json({ message: 'AI service (Hugging Face) not configured. API Key is missing.' }, { status: 500 });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ message: 'Message is required' }, { status: 400 });
    }

    let aiResponseText = "Sorry, I'm currently not connected to a live AI. Please check the server configuration."; // Default fallback message

    // --- INTEGRATE YOUR CHOSEN AI MODEL HERE (Hugging Face) ---
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${HF_MODEL_ID}`,
        {
          headers: {
            Authorization: `Bearer ${hfApiKey}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            inputs: `You are an AI assistant specialized in dairy farming. Provide helpful and concise information. If you don't know, say so. User: ${message} Assistant:`,
            parameters: {
              max_new_tokens: 150, // Limit response length
              temperature: 0.7,
              return_full_text: false, // Only return the generated part
              wait_for_model: true, // Wait for the model to load if it's not active
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Hugging Face API error response:', errorData);
        // Handle specific Hugging Face errors if needed, e.g., model not found, rate limit
        let errorMessage = `Hugging Face API responded with status ${response.status}.`;
        if (errorData && errorData.error) {
            errorMessage += ` Error: ${errorData.error}`;
        }
        return NextResponse.json(
          {
            message: 'Failed to get a response from Hugging Face AI. Check server logs.',
            hfApiError: errorMessage
          },
          { status: response.status }
        );
      }

      const hfResult = await response.json();
      // The structure varies by model, but often it's an array with a 'generated_text' field
      if (hfResult && Array.isArray(hfResult) && hfResult[0] && hfResult[0].generated_text) {
        aiResponseText = hfResult[0].generated_text.trim();
        // Post-processing: remove the initial part of the prompt if return_full_text was true or model adds it.
        const promptPrefix = `You are an AI assistant specialized in dairy farming. Provide helpful and concise information. If you don't know, say so. User: ${message} Assistant:`;
        if (aiResponseText.startsWith(promptPrefix)) {
            aiResponseText = aiResponseText.substring(promptPrefix.length).trim();
        }
      } else {
        console.warn('Hugging Face response unexpected format:', hfResult);
        aiResponseText = "No readable response from Hugging Face AI.";
      }

    } catch (hfError: any) {
      console.error('Specific Hugging Face API call error:', hfError);
      return NextResponse.json(
        {
          message: 'Failed to get a response from the Hugging Face AI. Check server logs for specific error.',
          hfApiError: hfError.message || 'Unknown Hugging Face error details'
        },
        { status: 500 }
      );
    }
    // --- END Hugging Face Example ---

    // --- Fallback if no AI is configured/initialized ---
    if (aiResponseText === "Sorry, I'm currently not connected to a live AI. Please check the server configuration." || aiResponseText.includes("Hugging Face AI is not initialized")) {
        if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
            aiResponseText = "Hello! I'm your Dairy Farm Assistant. How can I help you today?";
        } else if (message.toLowerCase().includes('cow') || message.toLowerCase().includes('animal')) {
            aiResponseText = "I can provide information about animals. What would you like to know?";
        } else {
            aiResponseText = "I'm still learning! Could you please rephrase your question or ask about general dairy farm topics?";
        }
    }

    return NextResponse.json({ response: aiResponseText });

  } catch (error: any) {
    console.error('General AI Chat API error (e.g., parsing request body):', error);
    return NextResponse.json(
      {
        message: 'Failed to process request or get AI response due to an unexpected server error.',
        error: error.message
      },
      { status: 500 }
    );
  }
}