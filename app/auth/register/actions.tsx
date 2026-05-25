'use server';

import { redirect } from 'next/navigation';
import { BackendError } from '@/app/types/api';

export default async function registerAction(prevState: any, formData: FormData) {
  let isSuccess = false;

  try {
    const reponse = await fetch('http://localhost:5090/auth/register', {
      method: 'POST',
      body: formData // Le format FormData gère nativement le fichier de l'avatar
    });

    // SI erreur interne, on renvoie une erreur compréhensible pour l'utilisateur
    if (reponse.status === 500) {
      return { error: "Le serveur ne répond pas. Veuillez réessayer plus tard." };
    }

    if (!reponse.ok) {
      // Extraction du JSON structuré de ton middleware Go
      const errorData: BackendError = await reponse.json();
      return { error: errorData.message };
    }

    isSuccess = true;
  } catch (err) {
    // Cas où le serveur Go ne répond pas (crash, réseau...)
    return { error: "Le serveur d'inscription est injoignable. Veuillez réessayer." };
  }

  // Dans Next.js, les redirections doivent être exécutées en dehors des blocs try/catch
  if (isSuccess) {
    redirect('/auth/login');
  }
}