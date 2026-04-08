'use server'

export default async function registerAction(formData) {
  const reponse = await fetch('http://localhost:5090/auth/register', {
    method: 'POST',
    body: formData
  })
  // On attend que le JSON soit extrait
  if (reponse.ok) {
    const data = await reponse.json()
    console.log(data)
    return data
  } else {
    console.error("Erreur lors de l'inscription:", reponse.statusText)
  }
}
