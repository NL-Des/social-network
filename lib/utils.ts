export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5090'

// Les images (avatars, posts, commentaires) sont servies par le backend Go
// (../public/images/...) et non par le dossier public/ de Next.js, qui fige
// la liste des fichiers statiques au démarrage du conteneur et ne voit donc
// jamais les fichiers uploadés après coup.
export function resolveImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path
  }
  return `${BACKEND_URL}${path}`
}
