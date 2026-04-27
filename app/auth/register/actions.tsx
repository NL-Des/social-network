'use server';

import {redirect} from 'next/navigation';

type State = {
  error: string | null;
};

export default async function registerAction(
  prevState: any,
  formData: FormData
) {
  const reponse = await fetch('http://localhost:5090/auth/register', {
    method: 'POST',
    body: formData
  });

  if (reponse.ok) {
    redirect('/auth/login');
  } else {
    // Le backend renvoie l'erreur en texte (http.Error)
    const errorText = await reponse.text();
    return { error: errorText.trim() || "Erreur lors de l'inscription" };
  }
}
