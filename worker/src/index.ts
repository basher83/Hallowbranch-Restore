interface Env {
  GEMINI_API_KEY: string;
}

interface ImagePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

interface TextPart {
  text: string;
}

type Part = ImagePart | TextPart;

interface Message {
  role: "user" | "model";
  parts: Part[];
}

interface RestoreRequest {
  action: "restore" | "refine";
  systemInstruction: string;
  history: Message[];
  imageParts: ImagePart[];
  prompt: string;
}

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      const body = (await request.json()) as RestoreRequest;

      // Build the request to Gemini API
      const contents: Message[] = [
        ...body.history,
        {
          role: "user",
          parts: [...body.imageParts, { text: body.prompt }],
        },
      ];

      const geminiRequest = {
        contents,
        systemInstruction: {
          parts: [{ text: body.systemInstruction }],
        },
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
          responseMimeType: "text/plain",
        },
      };

      const response = await fetch(
        `${GEMINI_API_URL}?key=${env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(geminiRequest),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", errorText);
        return new Response(
          JSON.stringify({ error: "Gemini API error", details: errorText }),
          {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const geminiResponse = await response.json();

      // Extract the image from response
      const candidates = geminiResponse.candidates;
      if (!candidates || candidates.length === 0) {
        return new Response(JSON.stringify({ error: "No response from AI" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const parts = candidates[0].content?.parts || [];
      let imageData: string | null = null;
      let textResponse: string | null = null;

      for (const part of parts) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
        }
        if (part.text) {
          textResponse = part.text;
        }
      }

      if (!imageData) {
        return new Response(
          JSON.stringify({
            error: "No image generated",
            text: textResponse,
          }),
          {
            status: 422,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({
          imageData,
          text: textResponse,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(
        JSON.stringify({
          error: "Internal error",
          message: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  },
};
