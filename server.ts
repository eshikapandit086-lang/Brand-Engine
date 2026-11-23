import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());

  // Secure API endpoint to generate the launch kit via Gemini
  app.post("/api/generate", async (req, res) => {
    try {
      const { businessIdea, targetAudience } = req.body;

      if (!businessIdea || !targetAudience) {
        return res.status(400).json({ error: "Please provide both the Business Idea and Target Audience." });
      }

      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY environment variable is not defined. Please configure it in your Settings > Secrets panel." 
        });
      }

      // Initialize GoogleGenAI securely on the server
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Query Gemini 3.5 Flash for high quality structured content
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate a Startup Launch Kit including a Landing Page Hook, a Product Launch Email, and a Viral LinkedIn Post.
Business Idea: ${businessIdea}
Target Audience: ${targetAudience}`,
        config: {
          systemInstruction: "You are a professional brand strategy and marketing copywriter. Create a premium, clean Launch Kit. Ensure it contains a polished landing page hook, a high-converting email, and an engaging LinkedIn post formatted with spaces.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              landingPageHook: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING, description: "A brilliant, punchy, high-impact headline" },
                  subheadline: { type: Type.STRING, description: "A supportive, descriptive subtitle showcasing the primary benefit" },
                  ctaText: { type: Type.STRING, description: "A strong, call-to-action button text" }
                },
                required: ["headline", "subheadline", "ctaText"]
              },
              productLaunchEmail: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING, description: "A high open-rate email subject line" },
                  body: { type: Type.STRING, description: "A highly engaging product launch email body with proper paragraphs, greetings, and bullet points" },
                  cta: { type: Type.STRING, description: "A styled button/link action text" }
                },
                required: ["subject", "body", "cta"]
              },
              viralLinkedInPost: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "A highly-sharable viral LinkedIn outline with a bold hook, spaced points with emojis, and 3 hashtags" }
                },
                required: ["text"]
              }
            },
            required: ["landingPageHook", "productLaunchEmail", "viralLinkedInPost"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response returned from the AI model.");
      }

      const launchKit = JSON.parse(responseText.trim());
      return res.json(launchKit);
    } catch (error: any) {
      console.error("Gemini SDK Generation Error:", error);
      return res.status(500).json({ error: error?.message || "An error occurred while generating your launch kit." });
    }
  });

  // Vite development middleware vs Static Production files serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
