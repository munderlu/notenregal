# Relationen-Modell der Datenbank

Songs (**song_id**, title, composer)
Noten (**noten_id**, instrument, pdf_link, *song_id*)
Sammlungen (**sammlung_id**, name)
Setlisten (**setlist_id**, name, datum)
Freigaben (**freigabe_id**, title, passwort, link)

Song_Sammlung (**song_id, sammlung_id**)
Noten_Setlist (**noten_id, setlist_id, position**)
Freigabe_Song (**freigabe_id, song_id**)
Freigabe_Noten (**freigabe_id, noten_id**)
Freigabe_Sammlung (**freigabe_id, sammlung_id**)
Freigabe_Setlist (**freigabe_id, setlist_id**)
