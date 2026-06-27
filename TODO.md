- [ ] Rechercher la cause du problème d’accès admin (mismatch mot de passe / ENV)
- [ ] Mettre à jour netlify/functions/admin-login.ts pour corriger l’auth (option B: fallback sur immocongo2025)
- [ ] Corriger le cookie Path (mettre Path=/) pour que le front le reçoive sur admin.html
- [ ] Mettre à jour netlify/functions/admin-logout.ts avec le même Path
- [ ] Vérifier en lançant un build / test local si possible

