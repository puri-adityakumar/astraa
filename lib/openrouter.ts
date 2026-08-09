"use server";

import { headers } from "next/headers";

import { createRateLimitIdentity, getTextGenerationRateLimitStore } from "@/lib/rate-limit";
import { requestGeneratedText, validateTextGenerationRequest } from "@/lib/text-generation";

const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_SECONDS = 10 * 60;

export type GenerateTextResult =
  | { success: true; text: string }
  | {
      success: false;
      code: "INVALID_INPUT" | "RATE_LIMITED" | "SERVICE_UNAVAILABLE" | "UPSTREAM_TIMEOUT";
      error: string;
      retryAfterSeconds?: number;
    };

export async function generateText(topic: string, wordCount: number): Promise<GenerateTextResult> {
  const validation = validateTextGenerationRequest(topic, wordCount);
  if (!validation.ok) {
    return {
      success: false,
      code: "INVALID_INPUT",
      error: validation.message,
    };
  }

  if (process.env.ASTRAA_E2E_FIXTURES === "true") {
    return getE2ETextResult(validation.topic);
  }

  const requestHeaders = await headers();
  const forwardedFor =
    requestHeaders.get("x-vercel-forwarded-for") ??
    requestHeaders.get("x-forwarded-for") ??
    "anonymous";
  const requestIdentity = forwardedFor.split(",")[0]?.trim() || "anonymous";
  const salt = process.env.RATE_LIMIT_SALT;
  const store = getTextGenerationRateLimitStore();

  if ((!salt && process.env.NODE_ENV === "production") || !store) {
    return unavailableResult();
  }

  try {
    const decision = await store.consume(
      createRateLimitIdentity(requestIdentity, salt ?? "astraa-local-development"),
      RATE_LIMIT,
      RATE_LIMIT_WINDOW_SECONDS,
    );

    if (!decision.allowed) {
      return {
        success: false,
        code: "RATE_LIMITED",
        error: "Too many requests. Please wait before trying again.",
        retryAfterSeconds: decision.retryAfterSeconds,
      };
    }
  } catch {
    return unavailableResult();
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return unavailableResult();

  try {
    const text = await requestGeneratedText(
      validation.topic,
      validation.wordCount,
      apiKey,
      AbortSignal.timeout(20_000),
    );
    return { success: true, text };
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    return {
      success: false,
      code: isTimeout ? "UPSTREAM_TIMEOUT" : "SERVICE_UNAVAILABLE",
      error: isTimeout
        ? "Text generation took too long. Please try again."
        : "Text generation is temporarily unavailable.",
    };
  }
}

function getE2ETextResult(topic: string): GenerateTextResult {
  if (topic === "__ASTRAA_E2E_SUCCESS__") {
    return {
      success: true,
      text: "Deterministic browser-test prose generated without contacting an external provider.",
    };
  }

  if (topic === "__ASTRAA_E2E_RATE_LIMIT__") {
    return {
      success: false,
      code: "RATE_LIMITED",
      error: "Too many requests. Please wait before trying again.",
      retryAfterSeconds: 60,
    };
  }

  if (topic === "__ASTRAA_E2E_TIMEOUT__") {
    return {
      success: false,
      code: "UPSTREAM_TIMEOUT",
      error: "Text generation took too long. Please try again.",
    };
  }

  return unavailableResult();
}

function unavailableResult(): GenerateTextResult {
  return {
    success: false,
    code: "SERVICE_UNAVAILABLE",
    error: "Text generation is temporarily unavailable.",
  };
}
