import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  if (!sessionToken) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const response = await fetch(`http://localhost:5090/users/${id}/follow`, {
    method: "POST",
    headers: { Cookie: `session_token=${sessionToken.value}` },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Erreur" }, { status: response.status });
  }

  return new NextResponse(null, { status: 204 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  if (!sessionToken) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const response = await fetch(`http://localhost:5090/users/${id}/follow`, {
    method: "DELETE",
    headers: { Cookie: `session_token=${sessionToken.value}` },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Erreur" }, { status: response.status });
  }

  return new NextResponse(null, { status: 204 });
}