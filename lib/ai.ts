interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export class AiRequestError extends Error {
  code:
    | "missing_api_key"
    | "unauthorized"
    | "rate_limited"
    | "network"
    | "request_failed"
    | "invalid_response";

  constructor(
    code: AiRequestError["code"],
    message: string,
  ) {
    super(message);
    this.name = "AiRequestError";
    this.code = code;
  }
}

function getAiConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl =
    process.env.OPENAI_BASE_URL?.replace(/\/$/, "") ?? "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  return { apiKey, baseUrl, model };
}

export function isAiConfigured() {
  return Boolean(getAiConfig().apiKey);
}

export async function requestJsonCompletion(prompt: string) {
  const { apiKey, baseUrl, model } = getAiConfig();

  if (!apiKey) {
    throw new AiRequestError("missing_api_key", "OPENAI_API_KEY is not configured.");
  }

  let response: Response;

  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Return valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });
  } catch {
    throw new AiRequestError(
      "network",
      "The AI provider could not be reached from this environment.",
    );
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AiRequestError(
        "unauthorized",
        "The AI provider rejected the request. Check the API key and provider settings.",
      );
    }

    if (response.status === 429) {
      throw new AiRequestError(
        "rate_limited",
        "The AI provider rate limit was reached. Try again later.",
      );
    }

    throw new AiRequestError(
      "request_failed",
      `The AI provider returned status ${response.status}.`,
    );
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new AiRequestError(
      "invalid_response",
      "The AI provider returned an empty or invalid response.",
    );
  }

  return content;
}

export function formatAiFallbackWarning(feature: string, error: unknown, fallback: string) {
  if (error instanceof AiRequestError) {
    return `AI ${feature} failed: ${error.message} ${fallback}`;
  }

  return `AI ${feature} failed, so ${fallback}`;
}
