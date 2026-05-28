"use server";

import { cookies } from "next/headers";

export interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  birthDate: string;
  followersCount: number;
  initials: string;
}

export interface Contact {
  id: string;
  name: string;
  initials: string;
  isOnline?: boolean;
}

export interface Event {
  id: string;
  title: string;
  subtitle: string;
  initials: string;
  color?: string;
}

export interface Group {
  id: string;
  name: string;
  memberCount: string;
  initials: string;
  iconBg?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface ProfilePageProps {
  user: UserProfile;
  following: Contact[];
  followers: Contact[];
  events: Event[];
  groups: Group[];
  allUsers: Contact[];
  navItems: NavItem[];
  visibility?: "private" | "public";
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export default async function profileAction(): Promise<ProfilePageProps> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  if (!sessionToken) throw new Error("Non authentifié");

  const response = await fetch("http://localhost:5090/user/profile", {
    headers: { Cookie: `session_token=${sessionToken.value}` },
  });

  if (!response.ok) throw new Error("Impossible de charger le profil");

  const data = await response.json();
  const u = data.user;

  return {
    user: {
      firstName: u.firstName,
      lastName: u.lastName,
      username: u.username,
      email: u.email,
      birthDate: u.birthDate,
      followersCount: u.followersCount ?? 0,
      initials: u.initials ?? getInitials(u.firstName, u.lastName),
    },
    navItems: [
      { label: "Accueil", href: "/" },
      { label: "Groupes", href: "/groupes" },
      { label: "Messages", href: "/messages" },
      { label: "Notifications", href: "/notifications" },
    ],
    following: (data.following ?? []).map((c: any) => ({
      id: String(c.id),
      name: `${c.firstName} ${c.lastName[0]}.`,
      initials: getInitials(c.firstName, c.lastName),
    })),
    followers: (data.followers ?? []).map((c: any) => ({
      id: String(c.id),
      name: `${c.firstName} ${c.lastName[0]}.`,
      initials: getInitials(c.firstName, c.lastName),
      isOnline: c.isOnline ?? false,
    })),
    events: (data.events ?? []).map((e: any) => ({
      id: String(e.id),
      title: e.title,
      subtitle: e.subtitle ?? e.description,
      initials: e.title.slice(0, 2).toUpperCase(),
      color: e.color ?? "text-brand-text",
    })),
    groups: (data.groups ?? []).map((g: any) => ({
      id: String(g.id),
      name: g.name,
      memberCount:
        g.memberCount >= 1000
          ? `${(g.memberCount / 1000).toFixed(1)}k`
          : String(g.memberCount),
      initials: g.name.slice(0, 2).toUpperCase(),
      iconBg: g.iconBg ?? "bg-slate-700",
    })),
    allUsers: (data.allUsers ?? []).map((u: any) => ({
      id: String(u.id),
      name: `${u.firstName} ${u.lastName[0]}.`,
      initials: getInitials(u.firstName, u.lastName),
      isOnline: u.isOnline ?? false,
    })),
    visibility: u.visibility ?? "public",
  };
}
