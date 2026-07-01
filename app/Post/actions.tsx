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
  image?: File;
}

export interface EditPostInput extends CreatePostInput {
  postID: number;
}

export interface AddCommentInput {
  postID: number;
  content: string;
  image?: File;
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

async function fetchPostForm(formData: FormData): Promise<ActionResult> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  if (!sessionToken) {
    return { error: "Non authentifié" };
  }

  const response = await fetch("http://localhost:5090/posts", {
    method: "POST",
    headers: {
      Cookie: `session_token=${sessionToken.value}`,
    },
    body: formData,
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
  const formData = new FormData();
  formData.set("mode", "newpost");
  formData.set("title", input.title);
  formData.set("content", input.content);
  formData.set("privacy", input.privacy);
  if (input.tags && input.tags.length > 0) {
    formData.set("tags", input.tags.join(" "));
  }
  if (input.image) {
    formData.set("image", input.image);
  }
  return fetchPostForm(formData);
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
  const formData = new FormData();
  formData.set("mode", "newcomment");
  formData.set("postID", String(input.postID));
  formData.set("content", input.content);
  if (input.image) {
    formData.set("image", input.image);
  }
  return fetchPostForm(formData);
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
