"use server";

import { cookies } from "next/headers";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActionResult {
  error?: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  privacy: "public" | "private" | "almost-private";
  tags?: string[];
}

export interface EditPostInput extends CreatePostInput {
  postID: number;
}

export interface AddCommentInput {
  postID: number;
  content: string;
}

export interface EditCommentInput {
  postID: number;
  commentID: number;
  content: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function fetchPost(
  params: Record<string, string>,
): Promise<ActionResult> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  if (!sessionToken) {
    return { error: "Non authentifié" };
  }

  const body = new URLSearchParams(params);

  const response = await fetch("http://localhost:5090/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: `session_token=${sessionToken.value}`,
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const message = await response.text();
    return { error: message || `Erreur ${response.status}` };
  }

  return {};
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createPost(
  input: CreatePostInput,
): Promise<ActionResult> {
  return fetchPost({
    mode: "newpost",
    title: input.title,
    content: input.content,
    privacy: input.privacy,
    ...(input.tags && input.tags.length > 0
      ? { tags: input.tags.join(" ") }
      : {}),
  });
}

export async function editPost(input: EditPostInput): Promise<ActionResult> {
  return fetchPost({
    mode: "editpost",
    postID: String(input.postID),
    title: input.title,
    content: input.content,
    privacy: input.privacy,
    ...(input.tags && input.tags.length > 0
      ? { tags: input.tags.join(" ") }
      : {}),
  });
}

export async function addComment(
  input: AddCommentInput,
): Promise<ActionResult> {
  return fetchPost({
    mode: "newcomment",
    postID: String(input.postID),
    content: input.content,
  });
}

export async function editComment(
  input: EditCommentInput,
): Promise<ActionResult> {
  return fetchPost({
    mode: "editcomment",
    postID: String(input.postID),
    commentID: String(input.commentID),
    content: input.content,
  });
}
