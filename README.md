# Carrosserie Jeanne d'Arc — site vitrine

Site statique HTML / CSS / JavaScript, sans dépendance ni build. Hébergé sur Cloudflare : https://carrosserie-jeanne-darc.sitedave.workers.dev

## Structure
- `index.html` — la page d'accueil
- `mentions-legales.html` — mentions légales (champs `[À COMPLÉTER]`)
- `css/style.css` — tout le style (couleurs en haut du fichier, vitesse du carrousel : `--marquee-duration`)
- `js/main.js` — effets : fondus au scroll, badge ouvert/fermé, compteurs, carrousel, agrandissement photo, formulaire WhatsApp
- `images/` — photos

## Remplacer les images (garder exactement le même nom)
- `hero1.jpg` — fond du hero (paysage, 1920×1080 min.)
- `galerie1.jpg` … `galerie10.jpg` — carrousel des réalisations (portrait 3:4 conseillé)
- `hero2.jpg`, `hero3.jpg` — réserves

## Mettre à jour le site en ligne
    npx wrangler deploy

Puis sauvegarder le code sur GitHub :
    git add -A && git commit -m "Mise à jour" && git push

## Tester en local
    python3 -m http.server 8000
puis ouvrir http://localhost:8000
