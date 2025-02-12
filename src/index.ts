import express, { Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";

// Types
interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

interface ApiError {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

// Configuration
dotenv.config();

const config = {
  accessToken: process.env.META_ACCESS_TOKEN,
  phoneNumberId: process.env.META_PHONE_NUMBER_ID,
  apiVersion: "v21.0",
  baseUrl: "https://graph.facebook.com",
} as const;

// Validation
const validateConfig = () => {
  const missingVars = Object.entries(config)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required configuration: ${missingVars.join(", ")}`
    );
  }
};

try {
  validateConfig();
} catch (error) {
  console.error(error instanceof Error ? error.message : "Configuration error");
  process.exit(1);
}

const app = express();

// Middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "healthy" });
});


app.post("/send", async (req: Request, res: Response): Promise<any> => {
  try {
    const response = await fetch(
      `${config.baseUrl}/${config.apiVersion}/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: "919359301387",
          type: "template",
          template: {
            name: "hello_world",
            language: { code: "en_US" },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error.message);
    }

    const data: WhatsAppResponse = await response.json();

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("WhatsApp API Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

export default app;
