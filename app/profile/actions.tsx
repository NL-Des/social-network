"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BackendError } from "@/app/types/api";

// Type de retour mis à jour pour véhiculer l'objet BackendError globalisé
export type ProfileActionResult = 
  | { success: true; data: ProfilePageProps }
  | { success: false; error: BackendError };

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

// L'interface complète d'origine incluant visibility (typé strictement) et navItems
export interface ProfilePageProps {
  user: UserProfile;
  following: Contact[];
  followers: Contact[];
  events: Event[];
  groups: Group[];
  allUsers: Contact[];
  visibility: "private" | "public"; // Correction Typage strict
  navItems: NavItem[];              // Réintégration du champ manquant
}

function getInitials(firstName: string, lastName: string): string {
  let initials = "";
  if (firstName && firstName.length > 0) {
    initials += firstName[0].toUpperCase();
  }
  if (lastName && lastName.length > 0) {
    initials += lastName[0].toUpperCase();
  }
  return initials || "??";
}

export default async function profileAction(): Promise<ProfileActionResult> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  if (!sessionToken) {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Accès refusé : session expirée ou introuvable",
      },
    };
  }

  try {
    const response = await fetch("http://localhost:5090/user/me", {
      headers: { Cookie: `session_token=${sessionToken.value}` },
    });

    if (!response.ok) {
      try {
        const backendError: BackendError = await response.json();
        return { success: false, error: backendError };
      } catch {
        return {
          success: false,
          error: {
            code: "INTERNAL",
            message: "Une erreur imprévue est survenue lors du chargement du profil.",
          },
        };
      }
    }

    const data = await response.json();

    const mappedData: ProfilePageProps = {
      user: {
        firstName: data.user?.firstName ?? "",
        lastName: data.user?.lastName ?? "",
        username: data.user?.username ?? "",
        email: data.user?.email ?? "",
        birthDate: data.user?.birthDate
          ? new Date(data.user.birthDate).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "",
        followersCount: data.user?.followersCount ?? 0,
        initials: getInitials(data.user?.firstName, data.user?.lastName),
      },
      // Récupération de la visibilité depuis le booléen isPrivate de ton back Go
      visibility: data.user?.isPrivate ? "private" : "public",
      
      // Récupération ou initialisation par défaut des navItems requis par ton front
      navItems: data.navItems ?? [
        { label: "Accueil", href: "/home" },
        { label: "Profil", href: "/profile" }
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
      })),
    };

    return { success: true, data: mappedData };
  } catch {
    return {
      success: false,
      error: {
        code: "INTERNAL",
        message: "Le service de profil est temporairement indisponible.",
      },
    };
  }
}