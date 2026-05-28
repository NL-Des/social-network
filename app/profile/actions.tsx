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
  isOwner: boolean;
  isFollowing: boolean;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export default async function profileAction(): Promise<ProfilePageProps> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  if (!sessionToken) throw new Error("Non authentifié");

  const response = await fetch("http://localhost:5090/me/profile", {
    headers: { Cookie: `session_token=${sessionToken.value}` },
  });

  if (!response.ok) throw new Error("Impossible de charger le profil");

  const data = await response.json();

  return {
    user: {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.pseudo,         
      email: data.email ?? "",
      birthDate: data.dateOfBirth ?? "",
      followersCount: data.followers?.length ?? 0,
      initials: getInitials(data.firstName, data.lastName),
    },
    following: (data.following ?? []).map((c: any) => ({
      id: String(c.id),
      name: c.username,
      initials: c.username?.slice(0, 2).toUpperCase() ?? "??",
    })),
    followers: (data.followers ?? []).map((c: any) => ({
      id: String(c.id),
      name: c.username,
      initials: c.username?.slice(0, 2).toUpperCase() ?? "??",
      isOnline: false,               
    })),
    events: [],                      
    groups: [],                      
    allUsers: [],                    
    navItems: [
      { label: "Accueil", href: "/" },
      { label: "Groupes", href: "/groupes" },
      { label: "Messages", href: "/messages" },
      { label: "Notifications", href: "/notifications" },
    ],
    visibility: data.isPrivate ? "private" : "public",
    isOwner: true,        
    isFollowing: false, 
  };
}
