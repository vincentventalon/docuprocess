---
name: twitter
description: Manage Twitter content for YourApp - view calendar, generate tweets, prepare weekly content
user_invocable: true
---

# Twitter Content Manager - YourApp

Tu aides à gérer le contenu Twitter pour YourApp (SaaS de génération PDF via API).

## Fichiers importants

- `twitter/calendar.md` - Calendrier de contenu (planification)
- `twitter/archive.md` - Historique des tweets publiés
- `twitter/post.ts` - Script de publication
- `app/changelog/page.tsx` - Page changelog (source pour les tweets du lundi)

## Commandes disponibles

Quand l'utilisateur demande de l'aide Twitter, tu peux:

### 1. Voir le calendrier
Lire `twitter/calendar.md` et résumer:
- Tweets prévus cette semaine
- Tweets à rédiger (marqués `[~]`)
- Prochains posts

### 2. Générer des suggestions
Proposer des tweets basés sur:
- Le changelog récent (`app/changelog/page.tsx`)
- Les features du produit (voir `CLAUDE.md`)
- Les templates disponibles
- Les free tools (invoice, certificate, packing slip generators)

### 3. Préparer le changelog du lundi
Lire la page changelog et créer un tweet résumant les nouveautés de la semaine.

### 4. Valider un tweet
Vérifier:
- Longueur (max 280 caractères)
- Présence d'un CTA
- Hashtags pertinents

## Format des tweets

- Max 280 caractères
- Utiliser des emojis avec parcimonie
- Toujours inclure un lien ou CTA
- Hashtags recommandés: #pdf #api #saas #automation #developer

## Ton et style

- Professionnel mais accessible
- Focus sur la valeur pour le développeur
- Pas de hype excessif
- Exemples concrets > promesses vagues

## Workflow typique

1. Lire le calendrier pour voir l'état actuel
2. Identifier les tweets à préparer
3. Générer des suggestions
4. Mettre à jour le calendrier avec le contenu validé

## Exemples de bons tweets

```
🚀 New at YourApp: Generate PDFs with dynamic QR codes.

Perfect for invoices, tickets, shipping labels.

→ example.com/docs/qr-codes
```

```
How we handle 50,000+ PDF generations/month:

• FastAPI + WeasyPrint
• Cloud Run auto-scaling
• < 500ms average response

Simple stack, reliable results.
```

```
Pro tip: Use template variables for dynamic content instead of generating HTML each time.

Faster renders, cleaner code.

Docs → example.com/docs/templates
```
