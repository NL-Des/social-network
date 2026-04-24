'use server';

export default async function loginAction(formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  // on envoi les données a l'api go
  const response = await fetch('http://localhost:5090/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password})
  });
  const data = await response.json();
  console.log(data.success);
  return data;
}
