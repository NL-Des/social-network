import { LeftBarSearchFilter, RightBar, UpBar } from "./components/ui/bar";
// Barre d'affichage haute.
export default function Home() {
  return(
    /* Arrière fond de la page et sa couleur. */
  <div className="flex flex-row gap-4 flex-1">
    <LeftBarSearchFilter />
    <UpBar />
    <RightBar />
  </div>

  )
}