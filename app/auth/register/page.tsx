import Button from '@/app/components/ui/button'
import InputStd from '@/app/components/ui/inputStd'
import registerAction from './actions'

export default function RegisterPage() {
  return (
    <div className="w-full min-h-screen bg-background p-6 flex flex-col items-center justify-center gap-16 ">
      {/* animation(keyframe) répétition du transform scale de 1 a 1.02 de manière douce et infinie */}
      <div className="animate-[pulseZoom_2.5s_ease-in-out_infinite]">
        <h1 className="font-retro text-brand-text text-center text-2xl md:text-4xl mb-8">
          Welcome to our Social Network
        </h1>
      </div>
      <form
        action={registerAction}
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

          <label className="border-1 border-brand-border shadow-neon rounded-full aspect-square w-52 h-52 justify-self-center flex flex-col items-center justify-center cursor-pointer gap-2 text-brand-text hover:opacity-80">
            <span>📷</span>
            <span className="text-sm">Photo de profil</span>
            <input
              type="file"
              name="profilePicture"
              accept="image/*"
              className="hidden"
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
          <div className="col-span-3 flex justify-center">
            <Button className="w-50">Inscription</Button>
          </div>
        </div>
      </form>
    </div>
  )
}
