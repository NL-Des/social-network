'use client';
import {useState, useRef} from 'react';
import Button from '@/app/components/ui/button';
import InputStd from '@/app/components/ui/inputStd';
import registerAction from './actions';
import {useFormState} from 'react-dom';

export default function RegisterPage() {
  // preview permet d'afficher quand l'image est selectionnée dans le formulaire
  const [preview, setPreview] = useState<string | null>(null);
  // fileInputRef permet de detecter quand l'utilisateur selectionne un fichier
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const initialState = {error: null as string | null};
  const [state, formAction] = useFormState(registerAction, initialState);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function handleRemoveImage() {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
  return (
    <div className="w-full min-h-screen bg-background p-6 flex flex-col items-center justify-center gap-16 ">
      {/* animation(keyframe) répétition du transform scale de 1 a 1.02 de manière douce et infinie */}
      <div className="animate-[pulseZoom_2.5s_ease-in-out_infinite]">
        <h1 className="font-retro text-brand-text text-center text-2xl md:text-4xl mb-8">
          Welcome to our Social Network
        </h1>
      </div>
      <form
        action={formAction}
        encType="multipart/form-data"
        className="bg-brand-card w-full max-w-6xl p-10 rounded-2xl border-1 border-brand-border shadow-neon py-20"
      >
        <div className="grid grid-cols-3  gap-10">
          <div className="col-span-2 grid grid-cols-2 gap-10">
            <InputStd
              type="text"
              placeholder="Nom"
              name="name"
              className="rounded-full text-center h-17"
            />
            <InputStd
              type="text"
              placeholder="Prénom"
              name="firstName"
              className="rounded-full text-center h-17"
            />
            <InputStd
              type="text"
              placeholder="Date de naissance"
              name="birthday"
              className="rounded-full text-center h-17"
            />
            <InputStd
              type="text"
              placeholder="e-mail"
              name="email"
              className="rounded-full text-center h-17"
            />
          </div>

          <label className="relative border-1 border-brand-border shadow-neon rounded-full aspect-square w-52 h-52 flex items-center justify-center overflow-hidden">
            {' '}
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                <span>📷</span>
                <span className="text-sm text-brand-text ml-1">
                  Photo de profil
                </span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              name="profilePicture"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <InputStd
            type="password"
            placeholder="Mot de passe"
            name="password"
            className="rounded-full text-center"
          ></InputStd>
          <InputStd
            type="password"
            placeholder="Confirmation mot de passe"
            name="confirmPassword"
            className="rounded-full text-center"
          ></InputStd>
          <InputStd
            type="text"
            placeholder="Pseudo"
            name="userName"
            className="rounded-full text-center"
          ></InputStd>
          <textarea
            placeholder="Description"
            name="description"
            className="  col-span-3 row-span-5 h-full border-1 border-brand-border shadow-neon p-5 rounded-2xl text-brand-text"
          ></textarea>
          <div className="col-span-3 flex flex-col items-center gap-4">
            {state?.error && (
              <p className="text-red-500 font-semibold">{state.error}</p>
            )}
            <Button className="w-50 text-brand-text">Inscription</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
