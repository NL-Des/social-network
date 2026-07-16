"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header, { CurrentUser } from "@/app/components/home/Header";
import { fetchMe } from "@/lib/fetchMe";
import RightSidebar from "@/app/components/home/RightSidebar";
import PostCard, { Post } from "@/app/components/home/PostCard";
import type { ProfilePageProps, Contact } from "@/app/profile/actions";
import { resolveImageUrl } from "@/lib/utils";

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

async function fetchPublicProfile(id: string): Promise<ProfilePageProps & { isAccessible: boolean; followStatus: string; description: string }> {
  const response = await fetch(`/api/profile/${id}`);

  if (response.status === 404) throw new Error("Utilisateur introuvable");
  if (!response.ok) throw new Error("Impossible de charger le profil");

  const data = await response.json();

  return {
    user: {
      id: data.id ?? 0,
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.pseudo,
      email: "",
      birthDate: data.dateOfBirth ?? "",
      followersCount: data.followers?.length ?? 0,
      initials: getInitials(data.firstName, data.lastName),
      avatar: data.avatar ?? "",
      description: data.aboutMe ?? "",
    },
    following: (data.following ?? []).map((c: { id: number; username: string }) => ({
      id: String(c.id),
      name: c.username,
      initials: c.username?.slice(0, 2).toUpperCase() ?? "??",
    })),
    followers: (data.followers ?? []).map((c: { id: number; username: string }) => ({
      id: String(c.id),
      name: c.username,
      initials: c.username?.slice(0, 2).toUpperCase() ?? "??",
      isOnline: false,
    })),
    events: [],
    groups: [],
    allUsers: [],
    navItems: [],
    visibility: data.isPrivate ? "private" : "public",
    isOwner: data.canEdit,
    isFollowing: data.isFollowing,
    isAccessible: data.isAccessible,
    followStatus: data.followStatus ?? "none",
    description: data.aboutMe ?? "",
  };
}

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

// Vue profil privé non abonné — juste pseudo + bouton
function PrivateProfileView({
  data,
  headerUser,
  id,
}: {
  data: ProfilePageProps & { followStatus: string };
  headerUser: CurrentUser;
  id: string;
}) {
  const [followStatus, setFollowStatus] = useState<string>(data.followStatus);

  async function handleFollow() {
    const response = await fetch(`/api/users/${id}/follow`, { method: "POST" });
    if (response.ok) setFollowStatus("pending");
  }

  return (
    <div className="bg-background min-h-screen md:h-screen flex flex-col md:overflow-hidden">
      <Header user={headerUser} />

      <div className="pt-[104px] flex-1 overflow-y-auto md:overflow-hidden px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_264px] gap-5 pt-4 md:h-full">
          <div className="flex flex-col gap-5 md:h-full">
            <div className="shrink-0 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 items-stretch">

              {/* Avatar */}
              <div className="flex items-center justify-center px-2">
                <div className="w-44 h-44 rounded-full bg-gray-600 flex items-center justify-center shadow-neon ring-4 ring-brand-border/30 overflow-hidden">
                  {data.user.avatar ? (
                    <img
                      src={resolveImageUrl(data.user.avatar)}
                      alt={data.user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-extrabold text-white tracking-tight">
                      {data.user.initials}
                    </span>
                  )}
                </div>
              </div>

              {/* Infos minimales */}
              <div className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h2 className="font-retro text-brand-border text-base mb-5 text-center">
                    Informations personnelles
                  </h2>
                  <dl className="space-y-2 text-base">
                    {data.user.username ? (
                      <div className="flex gap-2">
                        <dt className="text-brand-border">Pseudo:</dt>
                        <dd className="text-brand-text">{data.user.username}</dd>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <dt className="text-brand-border">Nom:</dt>
                          <dd className="text-brand-text">{data.user.lastName}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-brand-border">Prénom:</dt>
                          <dd className="text-brand-text">{data.user.firstName}</dd>
                        </div>
                      </>
                    )}
                  </dl>
                  <p className="text-brand-text/50 text-sm mt-4">Ce profil est privé.</p>
                </div>

                <div className="mt-5">
                  {followStatus === "pending" ? (
                    <button
                      disabled
                      className="w-full py-2 px-4 rounded-lg border border-brand-border/40 text-brand-text/50 text-base cursor-not-allowed"
                    >
                      Demande en attente
                    </button>
                  ) : (
                    <button
                      onClick={handleFollow}
                      className="w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95"
                    >
                      Demander à suivre
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="md:h-full">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

// Vue profil public ou privé abonné — tout afficher
function PublicProfileContent({
  data,
  headerUser,
}: {
  data: ProfilePageProps & { description: string };
  headerUser: CurrentUser;
}) {
  const { id } = useParams<{ id: string }>();
  const [followStatus, setFollowStatus] = useState<string>(
    data.isFollowing ? "accepted" : ""
  );
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (data.isOwner) return;
    fetch(`/api/users/${id}/follow/status`)
      .then((r) => r.ok ? r.json() : { status: "" })
      .then((d: { status: string }) => setFollowStatus(d.status ?? ""))
      .catch(() => {});
  }, [id, data.isOwner]);

  useEffect(() => {
    fetch(`/api/profile/${id}/posts`)
      .then((r) => r.ok ? r.json() : [])
      .then((raw: Array<{ id: number; title: string; content: string; image: string }>) => {
        setPosts(
          raw.map((p) => ({
            id: String(p.id),
            author: {
              name: data.user.username || `${data.user.firstName} ${data.user.lastName}`,
              initials: data.user.initials,
            },
            title: p.title,
            content: p.content,
            image: p.image || undefined,
          }))
        );
      })
      .catch(() => {});
  }, [id, data.user]);

  async function handleFollow() {
    const response = await fetch(`/api/users/${id}/follow`, { method: "POST" });
    if (response.ok) {
      setFollowStatus(data.visibility === "private" ? "pending" : "accepted");
    }
  }

  async function handleUnfollow() {
    const response = await fetch(`/api/users/${id}/follow`, { method: "DELETE" });
    if (response.ok) setFollowStatus("");
  }

  return (
    <div className="bg-background min-h-screen md:h-screen flex flex-col md:overflow-hidden">
      <Header user={headerUser} />

      <div className="pt-[104px] flex-1 overflow-y-auto md:overflow-hidden px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_264px] gap-5 pt-4 md:h-full">
          <div className="flex flex-col gap-5 md:h-full md:overflow-hidden">

            {/* Ligne haute : avatar + infos */}
            <div className="shrink-0 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 items-stretch">
              {/* Avatar */}
              <div className="flex items-center justify-center px-2">
                <div className="w-44 h-44 rounded-full bg-gray-600 flex items-center justify-center shadow-neon ring-4 ring-brand-border/30 overflow-hidden">
                  {data.user.avatar ? (
                    <img
                      src={resolveImageUrl(data.user.avatar)}
                      alt={data.user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-extrabold text-white tracking-tight">
                      {data.user.initials}
                    </span>
                  )}
                </div>
              </div>

              {/* Informations */}
              <div className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h2 className="font-retro text-brand-border text-base mb-5 text-center">
                    Informations personnelles
                  </h2>
                  <dl className="space-y-2 text-base">
                    {/* Pseudo ou Nom + Prénom */}
                    {data.user.username ? (
                      <div className="flex gap-2">
                        <dt className="text-brand-border">Pseudo:</dt>
                        <dd className="text-brand-text">{data.user.username}</dd>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <dt className="text-brand-border">Nom:</dt>
                          <dd className="text-brand-text">{data.user.lastName}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-brand-border">Prénom:</dt>
                          <dd className="text-brand-text">{data.user.firstName}</dd>
                        </div>
                      </>
                    )}
                    {/* Date de naissance */}
                    {data.user.birthDate && (
                      <div className="flex gap-2">
                        <dt className="text-brand-border">Date de naissance:</dt>
                        <dd className="text-brand-text">{(() => { const d = data.user.birthDate?.split('T')[0]?.split('-'); return d?.length === 3 ? `${d[2]}/${d[1]}/${d[0]}` : data.user.birthDate })()}</dd>
                      </div>
                    )}
                    {/* À propos */}
                    {data.description && (
                      <div className="flex gap-2">
                        <dt className="text-brand-border">À propos:</dt>
                        <dd className="text-brand-text">{data.description}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Boutons follow */}
                {!data.isOwner && (
                  <div className="mt-5">
                    {followStatus === "accepted" ? (
                      <button
                        onClick={handleUnfollow}
                        className="w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95"
                      >
                        Se désabonner
                      </button>
                    ) : followStatus === "pending" ? (
                      <button
                        disabled
                        className="w-full py-2 px-4 rounded-lg border border-brand-border/40 text-brand-text/50 text-base cursor-not-allowed"
                      >
                        Demande en attente
                      </button>
                    ) : (
                      <button
                        onClick={handleFollow}
                        className="w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95"
                      >
                        {data.visibility === "private" ? "Demander à suivre" : "S'abonner"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Ligne basse : suivi(e)s + abonnés + posts */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 md:min-h-0">
              <div className="bg-brand-card border border-brand-border rounded-2xl p-5 overflow-y-auto">
                <h2 className="font-retro text-brand-border text-base mb-4 text-center">
                  Suivi(e)s
                </h2>
                <div className="flex flex-col gap-1">
                  {data.following.map((c: Contact) => (
                    <ContactRow key={c.id} contact={c} />
                  ))}
                </div>
              </div>

              <div className="bg-brand-card border border-brand-border rounded-2xl p-5 overflow-y-auto">
                <h2 className="font-retro text-brand-border text-base mb-4 text-center">
                  Abonnés
                </h2>
                <div className="flex flex-col gap-1">
                  {data.followers.map((c: Contact) => (
                    <ContactRow key={c.id} contact={c} />
                  ))}
                </div>
              </div>

              {/* Posts */}
              <div className="bg-brand-card border border-brand-border rounded-2xl p-5 overflow-hidden flex flex-col">
                <h2 className="font-retro text-brand-border text-base mb-4 text-center shrink-0">
                  Posts
                </h2>
                <div className="overflow-y-auto flex flex-col gap-4 flex-1">
                  {posts.length === 0 ? (
                    <p className="text-brand-text/40 text-sm text-center mt-4">Aucun post</p>
                  ) : (
                    posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="md:h-full">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<(ProfilePageProps & { isAccessible: boolean; followStatus: string; description: string }) | null>(null);
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMe().then((meData) => {
      if (!meData) { router.replace("/auth/login"); return; }
      setMe(meData);

      fetchPublicProfile(id)
        .then((profileData) => {
          setData(profileData);
          setLoading(false);
        })
        .catch((err: Error) => {
          setError(err.message ?? "Impossible de charger le profil.");
          setLoading(false);
        });
    }).catch(() => {
      router.replace("/auth/login");
    });
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-brand-text font-retro text-sm animate-pulse">
          Chargement...
        </p>
      </div>
    );
  }

  if (error || !data || !me) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-400">{error ?? "Données introuvables."}</p>
      </div>
    );
  }

  // Profil privé non accessible
  if (!data.isAccessible) {
    return <PrivateProfileView data={data} headerUser={me} id={id} />;
  }

  return <PublicProfileContent data={data} headerUser={me} />;
}