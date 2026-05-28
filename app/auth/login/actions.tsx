'use server';

import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';

export default async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch('http://localhost:5090/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password})
  });

  if (!response.ok) {
    return {error: 'Email ou mot de passe incorrect'};
  }

  const data = await response.json();
  if (!data.token) {
    return {error: 'Erreur serveur : token manquant'};
  }

  const cookieStore = await cookies();
  cookieStore.set('session_token', data.token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24
  });

  redirect('/');
}
