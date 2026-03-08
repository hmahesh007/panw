import { NextResponse } from "next/server";

export function badRequest(message: string, details?: Record<string, unknown>) {
  return NextResponse.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    { status: 400 },
  );
}
