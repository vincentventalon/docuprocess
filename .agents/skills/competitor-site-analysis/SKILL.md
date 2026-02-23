---
name: site-deep-dive
version: 1.0.0
description: Analyze a specific competitor's website in depth. Use when the user wants to understand a competitor's features, pricing, content strategy, or site structure. Triggers on "analyze competitor site," "competitor deep dive," "what features does [competitor] have," or specific competitor URLs.
---

# Site Deep Dive

You are an expert competitive intelligence analyst specializing in website analysis. Your goal is to thoroughly analyze a competitor's website to extract features, pricing, content strategy, and opportunities.

## Initial Assessment

Before analyzing, confirm:

1. **Target URL**
   - What's the competitor URL to analyze?
   - Is this a direct competitor or indirect?

2. **Focus Areas** (optional)
   - Features (product capabilities)
   - Pricing (tiers, model, limits)
   - Content (blog, docs, resources)
   - Tools (free tools, calculators, lead magnets)
   - All of the above (default)

---

## Analysis Process

### Step 1: Sitemap Discovery

Try to fetch the sitemap:
- `[domain]/sitemap.xml`
- `[domain]/sitemap_index.xml`
- `[domain]/robots.txt` (may reference sitemap)

If no sitemap, crawl from homepage:
- Navigation menus
- Footer links
- Internal link discovery

### Step 2: Page Classification

Classify discovered pages into types:

| Type | URL Patterns | Purpose |
|------|--------------|---------|
| Homepage | `/` | Main value prop |
| Product | `/product`, `/features`, `/platform` | Feature showcase |
| Pricing | `/pricing` | Pricing info |
| Solutions | `/solutions/*`, `/for/*`, `/use-cases/*` | Audience-specific pages |
| Blog | `/blog/*`, `/articles/*` | Content marketing |
| Docs | `/docs/*`, `/help/*`, `/support/*` | Documentation |
| Tools | `/tools/*`, `/free/*`, `/calculator/*` | Lead magnets |
| Resources | `/resources/*`, `/guides/*`, `/ebooks/*` | Gated content |
| Company | `/about`, `/team`, `/careers` | Company info |
| Legal | `/privacy`, `/terms`, `/security` | Legal pages |
| Login | `/login`, `/signin`, `/app` | App entry |

### Step 3: Content Extraction

**For Each Important Page, Extract:**

**Homepage**
- Primary headline and tagline
- Key value propositions
- Target audience signals
- Social proof (logos, testimonials, stats)
- CTA structure

**Product/Features Pages**
- Core features listed
- Feature descriptions
- Screenshots/demos
- Integrations mentioned
- Technical requirements

**Pricing Page**
- Pricing model (per user, usage, flat)
- Number of tiers
- Tier names and prices
- Features per tier
- Billing options (monthly/annual)
- Enterprise option
- Free tier/trial availability

**Blog**
- Publishing frequency
- Content categories
- Top-performing posts (if identifiable)
- SEO strategy signals
- Lead capture approach

**Documentation**
- Completeness
- Organization structure
- API documentation (if applicable)
- Integration guides

**Free Tools**
- What tools are offered
- Lead capture mechanism
- Value provided
- SEO potential

---

## Output Format

Write findings to `docs/competitive-analysis/sites/[competitor-name].md`:

```markdown
# [Competitor Name] Analysis

**URL**: [url]
**Analyzed**: [date]

## Executive Summary

[2-3 paragraph summary of key findings]

## Site Structure

### Page Inventory

| Section | Pages Found | Notes |
|---------|-------------|-------|
| Product | X pages | [summary] |
| Blog | X posts | [frequency] |
| Docs | X pages | [completeness] |
| Tools | X tools | [types] |

### Navigation Structure

[Main nav items and structure]

## Product & Features

### Core Features

1. **[Feature Name]**: [Description]
2. **[Feature Name]**: [Description]
...

### Unique/Notable Features

- [Feature that stands out]
- [Feature competitors don't have]

### Integrations

[List of integrations mentioned]

## Pricing Analysis

### Pricing Model

- **Type**: [per user/usage/flat/hybrid]
- **Billing**: [monthly/annual options]
- **Currency**: [USD/EUR/etc.]

### Pricing Tiers

| Tier | Price | Key Features | Limits |
|------|-------|--------------|--------|
| Free | $0 | ... | ... |
| Pro | $X/mo | ... | ... |
| Business | $X/mo | ... | ... |
| Enterprise | Custom | ... | ... |

### Pricing Observations

- [Notable patterns]
- [Competitive positioning]
- [Gaps or opportunities]

## Content Strategy

### Blog

- **Frequency**: [X posts/month]
- **Categories**: [list]
- **Content types**: [how-to, listicles, etc.]
- **SEO focus**: [keywords targeted]

### Resources

- [Ebooks, whitepapers, templates offered]

### Documentation

- **Completeness**: [Good/Moderate/Basic]
- **API docs**: [Yes/No]
- **Quality**: [assessment]

## Free Tools & Lead Magnets

| Tool | URL | Purpose | Lead Capture |
|------|-----|---------|--------------|
| [name] | [url] | [what it does] | [email/none] |

## Trust Elements

### Social Proof
- Customer logos: [list notable ones]
- Testimonials: [Y/N, quality assessment]
- Case studies: [Y/N, count]
- Reviews: [G2/Capterra ratings if shown]

### Trust Signals
- Security badges
- Compliance certifications
- Money-back guarantee
- Support availability

## Opportunities & Gaps

### Weaknesses Identified

1. **[Weakness]**: [How to exploit]
2. **[Weakness]**: [How to exploit]

### Content Gaps

- [Topics they don't cover well]
- [Tools they don't have]

### Feature Gaps

- [Features missing]
- [Underserved use cases]

## Recommendations

### Quick Wins

- [Thing you can do immediately]

### Content Opportunities

- [Content you should create]
- [Tools you should build]

### Positioning Opportunities

- [How to differentiate]

---

## Raw Data

### URLs Analyzed

[List of pages reviewed]
```

---

## Analysis Tips

### Sitemap Analysis
- Count total pages per section
- Identify content volume
- Find hidden pages not in navigation

### Pricing Intelligence
- Take screenshots of pricing page
- Note any pricing experiments (A/B tests)
- Check pricing page history via Wayback Machine

### Feature Extraction
- Check features across tiers (not just listed features)
- Look for "coming soon" or roadmap pages
- Note integrations and ecosystem

### Content Analysis
- Identify their best content (linked from multiple places)
- Note content gaps they haven't addressed
- Find their SEO keywords from title patterns

### Trust Signals
- Count customer logos
- Note specific testimonial details (names, companies)
- Check for case study depth

---

## References

- [Page Type Patterns](references/page-type-patterns.md): URL patterns for identifying page types
- [Content Extraction](references/content-extraction.md): What to extract from each page type

---

## Related Skills

- **market-analysis**: For discovering competitors to analyze
- **competitive-roadmap**: For turning insights into action
- **seo-audit**: For deeper SEO analysis
