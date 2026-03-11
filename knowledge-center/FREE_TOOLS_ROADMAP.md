# Free Tools Roadmap — ParseDocu

> Objectif : maximiser le nombre de free tools pour le SEO, attirer du trafic organique, et convertir vers l'API payante.
> Chaque tool = 1 page `/tools/{slug}` indexable par Google.
> On ne garde QUE ce qui est du parsing/extraction. Pas d'utilitaires PDF (merge, split, compress...) ni de conversion générique (image-to-pdf, markdown-to-pdf...) — trop concurrentiel, mauvais fit avec la niche.

### Légende

- `[CLIENT]` — Faisable 100% dans le navigateur (zéro backend). Lib JS indiquée entre parenthèses.
- `[BACKEND]` — Nécessite le backend FastAPI (CORS, OCR, conversion Office, AI/ML...).

---

## Table des matières

1. [Outils principaux (Core PDF Parsing)](#1-outils-principaux-core-pdf-parsing)
2. [Conversion de documents → Markdown/Text](#2-conversion-de-documents--markdowntext)
3. [Extraction de données structurées (PDF)](#3-extraction-de-données-structurées-pdf)
4. [Outils URL / Web (Scraping → Parsing)](#4-outils-url--web-scraping--parsing)
5. [Outils financiers (Invoices, Bank Statements)](#5-outils-financiers)
6. [OCR / Images → Texte](#6-ocr--images--texte)
7. [Data format (dev tools)](#7-data-format-dev-tools)
8. [Programmatic SEO — Longue traîne](#8-programmatic-seo--longue-traîne)
9. [Résumé & priorisation](#9-résumé--priorisation)

---

## 1. Outils principaux (Core PDF Parsing)

Ce sont les outils phares, directement liés au produit.

- [ ] `pdf-to-markdown` — **PDF to Markdown** — Convertir un PDF en Markdown propre — `[CLIENT]` (pdf.js + heuristiques taille police → headings, listes, etc.)
- [ ] `pdf-to-text` — **PDF to Text** — Extraire le texte brut d'un PDF — `[CLIENT]` (pdf.js)
- [ ] `pdf-to-html` — **PDF to HTML** — Convertir un PDF en HTML structuré — `[CLIENT]` (pdf.js + heuristiques) / `[BACKEND]` pour qualité pro
- [ ] `pdf-to-json` — **PDF to JSON** — Extraire le contenu d'un PDF en JSON structuré — `[CLIENT]` (pdf.js)
- [ ] `pdf-to-csv` — **PDF to CSV** — Extraire les tableaux d'un PDF en CSV — `[BACKEND]`
- [ ] `extract-tables-from-pdf` — **Extract Tables from PDF** — Détecter et extraire tous les tableaux d'un PDF — `[BACKEND]`
- [ ] `extract-text-from-pdf` — **Extract Text from PDF** — Extraction de texte avec préservation de la mise en page — `[CLIENT]` (pdf.js)
- [ ] `pdf-to-xml` — **PDF to XML** — Convertir un PDF en XML structuré — `[CLIENT]` (pdf.js)

---

## 2. Conversion de documents → Markdown/Text

Parsing/extraction depuis d'autres formats que le PDF.

### Word

- [ ] `docx-to-markdown` — **DOCX to Markdown** — Convertir Word (.docx) en Markdown — `[BACKEND]`
- [ ] `docx-to-html` — **DOCX to HTML** — Extraire le contenu Word en HTML — `[BACKEND]`
- [ ] `docx-to-text` — **DOCX to Text** — Extraire le texte d'un fichier Word — `[BACKEND]`
- [ ] `doc-to-markdown` — **DOC to Markdown** — Convertir ancien format Word (.doc) en Markdown — `[BACKEND]`

### PowerPoint

- [ ] `pptx-to-markdown` — **PPTX to Markdown** — Convertir PowerPoint en Markdown — `[BACKEND]`
- [ ] `pptx-to-text` — **PPTX to Text** — Extraire le texte d'un PowerPoint — `[BACKEND]`

### Excel

- [ ] `xlsx-to-csv` — **XLSX to CSV** — Extraire les données Excel en CSV — `[CLIENT]` (SheetJS)
- [ ] `xlsx-to-json` — **XLSX to JSON** — Extraire les données Excel en JSON — `[CLIENT]` (SheetJS)
- [ ] `xlsx-to-markdown` — **XLSX to Markdown** — Extraire les tableaux Excel en Markdown — `[CLIENT]` (SheetJS)

### HTML

- [ ] `html-to-markdown` — **HTML to Markdown** — Convertir HTML en Markdown propre — `[CLIENT]` (turndown)
- [ ] `html-to-text` — **HTML to Text** — Extraire le texte propre d'un HTML — `[CLIENT]` (DOM parsing)

### Autres formats

- [ ] `rtf-to-markdown` — **RTF to Markdown** — Convertir Rich Text Format en Markdown — `[BACKEND]`
- [ ] `odt-to-markdown` — **ODT to Markdown** — Convertir LibreOffice Writer en Markdown — `[BACKEND]`
- [ ] `epub-to-markdown` — **EPUB to Markdown** — Convertir eBook en Markdown — `[BACKEND]`

---

## 3. Extraction de données structurées (PDF)

Outils spécialisés dans l'extraction d'éléments spécifiques des documents.

- [ ] `extract-metadata-from-pdf` — **Extract PDF Metadata** — Extraire auteur, date, titre, etc. d'un PDF — `[CLIENT]` (pdf.js)
- [ ] `extract-links-from-pdf` — **Extract Links from PDF** — Extraire tous les hyperliens d'un PDF — `[CLIENT]` (pdf.js annotations)
- [ ] `extract-fonts-from-pdf` — **Extract Fonts from PDF** — Lister les polices utilisées dans un PDF — `[CLIENT]` (pdf.js)
- [ ] `extract-headings-from-pdf` — **Extract Headings from PDF** — Extraire la structure des titres (TOC) d'un PDF — `[CLIENT]` (pdf.js)
- [ ] `pdf-page-count` — **PDF Page Counter** — Compter le nombre de pages d'un PDF — `[CLIENT]` (pdf.js)
- [ ] `pdf-word-count` — **PDF Word Counter** — Compter les mots d'un PDF — `[CLIENT]` (pdf.js)
- [ ] `extract-emails-from-pdf` — **Extract Emails from PDF** — Trouver toutes les adresses email dans un PDF — `[CLIENT]` (pdf.js + regex)
- [ ] `extract-phone-numbers-from-pdf` — **Extract Phone Numbers from PDF** — Trouver tous les numéros de téléphone dans un PDF — `[CLIENT]` (pdf.js + regex)
- [ ] `extract-dates-from-pdf` — **Extract Dates from PDF** — Trouver toutes les dates dans un PDF — `[CLIENT]` (pdf.js + regex)

---

## 4. Outils URL / Web (Scraping → Parsing)

Extraction de contenu depuis des pages web. Tous backend (CORS).

- [ ] `url-to-markdown` — **URL to Markdown** — Extraire le contenu d'une page web en Markdown — `[BACKEND]` (CORS)
- [ ] `url-to-text` — **URL to Text** — Extraire le texte propre d'une URL — `[BACKEND]` (CORS)
- [ ] `url-to-html` — **URL to HTML** — Récupérer le HTML propre d'une URL — `[BACKEND]` (CORS)
- [ ] `url-to-json` — **URL to JSON** — Extraire le contenu structuré d'une URL en JSON — `[BACKEND]` (CORS)
- [ ] `sitemap-extractor` — **Sitemap Extractor** — Extraire toutes les URLs d'un sitemap — `[BACKEND]` (CORS)
- [ ] `website-to-markdown` — **Website to Markdown** — Convertir un site entier en Markdown (crawl) — `[BACKEND]` (CORS)
- [ ] `rss-to-json` — **RSS to JSON** — Convertir un flux RSS en JSON — `[BACKEND]` (CORS)
- [ ] `extract-links-from-url` — **Extract Links from URL** — Extraire tous les liens d'une page web — `[BACKEND]` (CORS)
- [ ] `extract-metadata-from-url` — **Extract Metadata from URL** — Extraire les meta tags, OG tags, etc. — `[BACKEND]` (CORS)

---

## 5. Outils financiers

Parsing intelligent de documents financiers — fort potentiel longue traîne. Tous `[BACKEND]` (AI/ML).

### 5a. Outils génériques

- [ ] `invoice-to-csv` — **Invoice to CSV** — Extraire les données d'une facture en CSV
- [ ] `invoice-to-json` — **Invoice to JSON** — Extraire les données d'une facture en JSON
- [ ] `invoice-parser` — **Invoice Parser** — Parser intelligent de factures (montants, lignes, TVA)
- [ ] `receipt-to-csv` — **Receipt to CSV** — Extraire les données d'un reçu/ticket en CSV
- [ ] `receipt-parser` — **Receipt Parser** — Parser de reçus/tickets de caisse
- [ ] `bank-statement-to-csv` — **Bank Statement to CSV** — Extraire les transactions d'un relevé bancaire en CSV
- [ ] `bank-statement-to-json` — **Bank Statement to JSON** — Extraire les transactions d'un relevé bancaire en JSON
- [ ] `bank-statement-parser` — **Bank Statement Parser** — Parser intelligent de relevés bancaires
- [ ] `payslip-parser` — **Payslip Parser** — Extraire les données d'une fiche de paie
- [ ] `payslip-to-csv` — **Payslip to CSV** — Extraire les données d'une fiche de paie en CSV
- [ ] `tax-form-parser` — **Tax Form Parser** — Parser de formulaires fiscaux
- [ ] `w2-parser` — **W-2 Parser** — Parser de formulaire W-2 (US)
- [ ] `1099-parser` — **1099 Parser** — Parser de formulaire 1099 (US)
- [ ] `purchase-order-parser` — **Purchase Order Parser** — Parser de bons de commande
- [ ] `expense-report-to-csv` — **Expense Report to CSV** — Extraire les données d'une note de frais en CSV

### 5b. Programmatic SEO — Par banque (Bank Statement to CSV)

> Pattern URL : `/tools/bank-statement-to-csv/{bank-slug}`
> Chaque page cible "[Bank Name] bank statement to CSV"
> Toutes `[BACKEND]`

**US — Haut volume :**
- [ ] `chase-bank-statement-to-csv` — Chase
- [ ] `bank-of-america-statement-to-csv` — Bank of America
- [ ] `wells-fargo-statement-to-csv` — Wells Fargo

**US — Moyen volume :**
- [ ] `citi-bank-statement-to-csv` — Citi
- [ ] `capital-one-statement-to-csv` — Capital One
- [ ] `td-bank-statement-to-csv` — TD Bank
- [ ] `pnc-bank-statement-to-csv` — PNC Bank
- [ ] `us-bank-statement-to-csv` — US Bank
- [ ] `discover-statement-to-csv` — Discover
- [ ] `american-express-statement-to-csv` — American Express

**International — Moyen volume :**
- [ ] `hsbc-statement-to-csv` — HSBC
- [ ] `barclays-statement-to-csv` — Barclays
- [ ] `revolut-statement-to-csv` — Revolut

**International — Bas volume :**
- [ ] `n26-statement-to-csv` — N26
- [ ] `bnp-paribas-statement-to-csv` — BNP Paribas
- [ ] `societe-generale-statement-to-csv` — Société Générale
- [ ] `credit-agricole-statement-to-csv` — Crédit Agricole
- [ ] `deutsche-bank-statement-to-csv` — Deutsche Bank
- [ ] `ing-statement-to-csv` — ING
- [ ] `santander-statement-to-csv` — Santander
- [ ] `lloyds-statement-to-csv` — Lloyds
- [ ] `natwest-statement-to-csv` — NatWest
- [ ] `rbc-statement-to-csv` — RBC (Canada)
- [ ] `scotiabank-statement-to-csv` — Scotiabank
- [ ] `commonwealth-bank-statement-to-csv` — Commonwealth Bank (AU)
- [ ] `anz-statement-to-csv` — ANZ (AU)
- [ ] `westpac-statement-to-csv` — Westpac (AU)

### 5c. Programmatic SEO — Par banque (Statement to JSON)

> Même pattern en JSON : `/tools/bank-statement-to-json/{bank-slug}`
> Double les pages indexables avec un intent légèrement différent. Toutes `[BACKEND]`.

_(Même liste de banques que 5b, en variante `-to-json` au lieu de `-to-csv`)_

---

## 6. OCR / Images → Texte

Extraction de texte depuis des images et PDFs scannés.

- [ ] `ocr-pdf` — **OCR PDF** — Rendre un PDF scanné cherchable via OCR — `[BACKEND]`
- [ ] `image-to-text` — **Image to Text (OCR)** — Extraire le texte d'une image via OCR — `[BACKEND]`
- [ ] `image-to-markdown` — **Image to Markdown** — Convertir une image de document en Markdown — `[BACKEND]`
- [ ] `screenshot-to-markdown` — **Screenshot to Markdown** — Extraire le contenu d'un screenshot en Markdown — `[BACKEND]`
- [ ] `handwriting-to-text` — **Handwriting to Text** — Convertir l'écriture manuscrite en texte — `[BACKEND]`
- [ ] `table-image-to-csv` — **Table Image to CSV** — Extraire un tableau depuis une image en CSV — `[BACKEND]`
- [ ] `business-card-parser` — **Business Card Parser** — Extraire les infos d'une carte de visite — `[BACKEND]`
- [ ] `image-to-json` — **Image to JSON** — Extraire des données structurées d'une image — `[BACKEND]`

---

## 7. Data format (dev tools)

Conversions de formats de données, simples et client-only. Utiles pour les devs dans le pipeline post-extraction.

- [ ] `csv-to-json` — **CSV to JSON** — `[CLIENT]` (pur JS)
- [ ] `csv-to-markdown` — **CSV to Markdown** — `[CLIENT]` (pur JS)
- [ ] `json-to-csv` — **JSON to CSV** — `[CLIENT]` (pur JS)
- [ ] `json-to-markdown` — **JSON to Markdown** — `[CLIENT]` (pur JS)
- [ ] `xml-to-json` — **XML to JSON** — `[CLIENT]` (DOMParser)
- [ ] `xml-to-csv` — **XML to CSV** — `[CLIENT]` (DOMParser)
- [ ] `yaml-to-json` — **YAML to JSON** — `[CLIENT]` (js-yaml)
- [ ] `json-to-yaml` — **JSON to YAML** — `[CLIENT]` (js-yaml)

---

## 8. Programmatic SEO — Longue traîne

### 8a. Par type de document (Invoice Parser)

> Pattern : `/tools/invoice-parser/{document-type}`
> Toutes `[BACKEND]`

- [ ] `parse-amazon-invoice` — Amazon Invoice Parser
- [ ] `parse-stripe-invoice` — Stripe Invoice Parser
- [ ] `parse-paypal-invoice` — PayPal Invoice Parser
- [ ] `parse-shopify-invoice` — Shopify Invoice Parser
- [ ] `parse-quickbooks-invoice` — QuickBooks Invoice Parser
- [ ] `parse-xero-invoice` — Xero Invoice Parser
- [ ] `parse-freshbooks-invoice` — FreshBooks Invoice Parser
- [ ] `parse-square-invoice` — Square Invoice Parser
- [ ] `parse-uber-receipt` — Uber Receipt Parser
- [ ] `parse-lyft-receipt` — Lyft Receipt Parser
- [ ] `parse-airbnb-receipt` — Airbnb Receipt Parser
- [ ] `parse-google-invoice` — Google Cloud/Workspace Invoice Parser
- [ ] `parse-aws-invoice` — AWS Invoice Parser
- [ ] `parse-azure-invoice` — Azure Invoice Parser
- [ ] `parse-heroku-invoice` — Heroku Invoice Parser

### 8b. Par pays/langue (Tax Forms)

> Pattern : `/tools/tax-form-parser/{country}`
> Toutes `[BACKEND]`

- [ ] `us-tax-form-parser` — US Tax Forms (W-2, 1099, 1040)
- [ ] `uk-tax-form-parser` — UK Tax Forms (P60, P45, SA100)
- [ ] `france-tax-form-parser` — French Tax Forms (2042, 2044)
- [ ] `germany-tax-form-parser` — German Tax Forms (Steuererklärung)
- [ ] `canada-tax-form-parser` — Canadian Tax Forms (T4, T1)
- [ ] `australia-tax-form-parser` — Australian Tax Forms (PAYG, BAS)

### 8c. Par use case / industrie

> Pattern : `/tools/{industry}-document-parser`
> Toutes `[BACKEND]`

- [ ] `medical-records-parser` — Parser de dossiers médicaux
- [ ] `legal-document-parser` — Parser de documents juridiques
- [ ] `contract-parser` — Parser de contrats
- [ ] `insurance-document-parser` — Parser de documents d'assurance
- [ ] `real-estate-document-parser` — Parser de documents immobiliers
- [ ] `shipping-document-parser` — Parser de documents d'expédition (BOL, etc.)
- [ ] `academic-paper-parser` — Parser d'articles scientifiques
- [ ] `resume-parser` — Parser de CV
- [ ] `id-document-parser` — Parser de pièces d'identité
- [ ] `utility-bill-parser` — Parser de factures d'énergie/eau

### 8d. Par logiciel comptable (Export → CSV)

> Pattern : `/tools/{software}-export-to-csv`
> Toutes `[BACKEND]`

- [ ] `quickbooks-pdf-to-csv` — QuickBooks PDF to CSV
- [ ] `xero-pdf-to-csv` — Xero PDF to CSV
- [ ] `sage-pdf-to-csv` — Sage PDF to CSV
- [ ] `freshbooks-pdf-to-csv` — FreshBooks PDF to CSV
- [ ] `wave-pdf-to-csv` — Wave PDF to CSV
- [ ] `zoho-books-pdf-to-csv` — Zoho Books PDF to CSV

---

## 9. Résumé & priorisation

### Phase 1 — Client-only (zéro backend, ship ultra vite)

> Libs JS : `pdf.js`, `SheetJS`, `turndown`, `js-yaml`
> Objectif : max de pages indexables rapidement, zéro coût infra.

**PDF parsing (pdf.js) :**
- [ ] PDF to Markdown (heuristiques taille police → headings)
- [ ] PDF to Text
- [ ] PDF to JSON
- [ ] PDF to HTML (basique)
- [ ] Extract Text from PDF
- [ ] PDF to XML
- [ ] Extract PDF Metadata
- [ ] Extract Links from PDF
- [ ] Extract Fonts from PDF
- [ ] Extract Headings from PDF
- [ ] PDF Page Counter
- [ ] PDF Word Counter
- [ ] Extract Emails from PDF
- [ ] Extract Phone Numbers from PDF
- [ ] Extract Dates from PDF

**Extraction depuis autres formats :**
- [ ] XLSX to CSV (SheetJS)
- [ ] XLSX to JSON (SheetJS)
- [ ] XLSX to Markdown (SheetJS)
- [ ] HTML to Markdown (turndown)
- [ ] HTML to Text (DOM)

**Data format (dev tools) :**
- [ ] CSV to JSON
- [ ] CSV to Markdown
- [ ] JSON to CSV
- [ ] JSON to Markdown
- [ ] XML to JSON
- [ ] XML to CSV
- [ ] YAML to JSON
- [ ] JSON to YAML

**Total Phase 1 : ~28 outils client-only**

### Phase 2 — Backend (nécessite FastAPI)

**Parsing avancé :**
- [ ] PDF to CSV / Extract Tables (détection de tableaux)
- [ ] PDF to Markdown PRO (upgrade qualité via backend/AI)
- [ ] PDF to HTML PRO

**Conversion Office → Markdown/Text :**
- [ ] DOCX to Markdown / HTML / Text
- [ ] DOC to Markdown
- [ ] PPTX to Markdown / Text
- [ ] RTF / ODT / EPUB to Markdown

**URL / Web (CORS) :**
- [ ] URL to Markdown / Text / HTML / JSON
- [ ] Website to Markdown
- [ ] Sitemap Extractor / RSS to JSON
- [ ] Extract Links / Metadata from URL

**OCR :**
- [ ] OCR PDF
- [ ] Image to Text / Markdown / JSON
- [ ] Screenshot to Markdown
- [ ] Handwriting to Text
- [ ] Table Image to CSV
- [ ] Business Card Parser

**Financiers :**
- [ ] Invoice Parser / to CSV / to JSON
- [ ] Receipt Parser / to CSV
- [ ] Bank Statement Parser / to CSV / to JSON
- [ ] Payslip Parser / to CSV
- [ ] Tax Form Parser / W-2 / 1099
- [ ] Purchase Order Parser
- [ ] Expense Report to CSV

**Total Phase 2 : ~43 outils backend**

### Phase 3 — Programmatic SEO (longue traîne, backend)

> Pages programmatiques générées à partir de templates. Même outil, contenu personnalisé par entité.

- [ ] Bank Statement to CSV x 25+ banques (x2 pour JSON) — ~50 pages
- [ ] Invoice Parser x 15+ providers — ~15 pages
- [ ] Tax Forms x 6 pays — ~6 pages
- [ ] Parsers x 10 industries — ~10 pages
- [ ] Logiciels comptables x 6 — ~6 pages

**Total Phase 3 : ~87 pages programmatiques**

### Compteur total

| Catégorie | CLIENT | BACKEND | Total |
|-----------|--------|---------|-------|
| Core PDF Parsing | 6 | 2 | 8 |
| Conversion docs → MD/Text | 5 | 9 | 14 |
| Extraction données (PDF) | 9 | 0 | 9 |
| URL / Web | 0 | 9 | 9 |
| Financiers (générique) | 0 | 15 | 15 |
| OCR / Images | 0 | 8 | 8 |
| Data format (dev tools) | 8 | 0 | 8 |
| **Sous-total outils uniques** | **28** | **43** | **71** |
| Programmatic SEO | — | ~87 | ~87 |
| **TOTAL** | **28** | **~130** | **~158** |

---

## Notes techniques

### Libs JS client-only

| Lib | Usage | Taille |
|-----|-------|--------|
| `pdfjs-dist` | Lecture PDF, extraction texte/metadata/annotations | ~400KB |
| `sheetjs` (xlsx) | Lecture Excel | ~300KB |
| `turndown` | HTML → Markdown | ~30KB |
| `js-yaml` | YAML ↔ JSON | ~50KB |

### Architecture suggérée

```
frontend/app/tools/
├── page.tsx                          # Gallery / listing de tous les tools
├── [slug]/
│   └── page.tsx                      # Template générique d'un tool
├── bank-statement-to-csv/
│   ├── page.tsx                      # Page générique
│   └── [bank]/
│       └── page.tsx                  # Pages programmatiques par banque
├── invoice-parser/
│   └── [provider]/
│       └── page.tsx                  # Pages programmatiques par provider
└── tax-form-parser/
    └── [country]/
        └── page.tsx                  # Pages programmatiques par pays
```

### Stratégie SEO par page

Chaque page de tool doit avoir :
- **H1** : `{Tool Name} — Free Online Tool`
- **Meta title** : `{Tool Name} Online Free | ParseDocu`
- **Meta description** : Description unique orientée bénéfice utilisateur
- **Structured data** : `SoftwareApplication` schema
- **Internal linking** : Liens vers outils similaires
- **CTA** : "Need this at scale? Use our API" → pricing/API docs

### Monétisation

- Limite gratuite : ex. 5 fichiers/jour, 10 pages max par fichier
- Au-delà : redirection vers signup / pricing
- Badge "Powered by ParseDocu API" sur les résultats
