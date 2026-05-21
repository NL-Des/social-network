"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header, { CurrentUser } from "@/app/components/home/Header";
import RightSidebar, { Group, SidebarUser } from "@/app/components/home/RightSidebar";
import type { ProfilePageProps, Contact } from "@/app/profile/actions";

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

async function fetchPublicProfile(id: string): Promise<ProfilePageProps> {
  const response = await fetch(`http://localhost:3000/api/profile/${id}`);

  if (response.status === 403) throw new Error("Profil privé");
  if (response.status === 404) throw new Error("Utilisateur introuvable");
  if (!response.ok) throw new Error("Impossible de charger le profil");

  const data = await response.json();

  return {
    user: {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.pseudo,
      email: "",
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
  };
}

const mockGroups: Group[] = [
  { id: "1", name: "Photo Urbaine", membersCount: "890" },
  { id: "2", name: "Dev Frontend", membersCount: "3,4k" },
  { id: "3", name: "Design & UX", membersCount: "1,2k" },
];

const mockSidebarUsers: SidebarUser[] = [
  { id: "1", name: "Audrey D", initials: "AD", online: true },
  { id: "2", name: "Jade C", initials: "JC", online: true },
  { id: "3", name: "Mathis P", initials: "MP", online: false },
  { id: "4", name: "Nathan L", initials: "NL", online: false },
  { id: "5", name: "Nathan P", initials: "NP", online: false },
  { id: "6", name: "Valentine L", initials: "VL", online: false },
];

function ContactRow({ contact }: { contact: Contact }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {contact.initials}
      </div>
      <span className="text-brand-text text-base flex-1">{contact.name}</span>
    </div>
  );
}

function PublicProfileContent({
  data,
  headerUser,
}: {
  data: ProfilePageProps;
  headerUser: CurrentUser;
}) {
  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <Header user={headerUser} />

      <div className="pt-[104px] flex-1 overflow-hidden px-4 pb-4">
        <div className="grid grid-cols-[1fr_264px] gap-15 pt-4 h-full">
          <div className="flex flex-col gap-15 h-full">
            <div className="flex-1 grid grid-cols-[auto_1fr] gap-15 items-stretch">
              <div className="flex items-center justify-center px-4">
                <div className="w-100 h-100 rounded-full bg-gray-600 flex items-center justify-center shadow-neon ring-4 ring-brand-border/30">
                  <span className="text-5xl font-extrabold text-white tracking-tight">
                    {data.user.initials}
                  </span>
                </div>
              </div>

              <div className="bg-brand-card border border-brand-border rounded-2xl p-12 flex flex-col justify-between">
                <div>
                  <h2 className="font-retro text-brand-border text-base mb-5 text-center">
                    Informations personnelles
                  </h2>
                  <dl className="space-y-2 text-base">
                    {[
                      { label: "Nom", value: data.user.lastName },
                      { label: "Prénom", value: data.user.firstName },
                      { label: "Pseudo", value: data.user.username },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex gap-2">
                        <dt className="text-brand-border">{label}:</dt>
                        <dd className="text-brand-text">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-15">
              <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
                <h2 className="font-retro text-brand-border text-base mb-4 text-center">
                  Suivi(e)s
                </h2>
                <div className="flex flex-col gap-1">
                  {data.following.map((c: Contact) => (
                    <ContactRow key={c.id} contact={c} />
                  ))}
                </div>
              </div>

              <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
                <h2 className="font-retro text-brand-border text-base mb-4 text-center">
                  Abonnés
                </h2>
                <div className="flex flex-col gap-1">
                  {data.followers.map((c: Contact) => (
                    <ContactRow key={c.id} contact={c} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="h-full">
            <RightSidebar groups={mockGroups} users={mockSidebarUsers} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ProfilePageProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicProfile(id)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message ?? "Impossible de charger le profil.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-brand-text font-retro text-sm animate-pulse">
          Chargement...
        </p>
      </div>
    );
  }

  if (error === "Profil privé") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-brand-text">Ce profil est privé.</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-400">{error ?? "Données introuvables."}</p>
      </div>
    );
  }

  const headerUser: CurrentUser = {
    name: `${data.user.firstName} ${data.user.lastName[0]}.`,
    username: data.user.username,
    followers: data.user.followersCount,
    initials: data.user.initials,
  };

  return <PublicProfileContent data={data} headerUser={headerUser} />;
}