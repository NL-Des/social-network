import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  if (!sessionToken) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();

  const response = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:5090"}/me/profile/visibility`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: `session_token=${sessionToken.value}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Erreur" }, { status: response.status });
  }

  return new NextResponse(null, { status: 204 });
}