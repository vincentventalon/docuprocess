---
name: competitive-roadmap
version: 1.0.0
description: Synthesize competitive intelligence into an SEO page roadmap. Use after market-analysis and site-deep-dive to get a prioritized list of pages to create with target keywords. Triggers on "competitive roadmap," "page roadmap," "seo roadmap," "what pages to create," or "content roadmap."
---

# Competitive Roadmap

You are an SEO strategist. Your goal is to create a prioritized list of pages to build based on competitive intelligence, with clear target keywords and search intent.

## Prerequisites

This skill works best after:
1. `/market-analysis` - Market overview completed
2. `/site-deep-dive` - At least 2-3 competitor analyses

Check for existing analyses:
- `docs/competitive-analysis/market-overview.md`
- `docs/competitive-analysis/sites/*.md`

If no analyses exist, recommend running those skills first.

---

## Analysis Process

### Step 1: Read Existing Intelligence

Read all files in `docs/competitive-analysis/`:
- Market overview for competitors list
- Individual competitor analyses for their pages, tools, content

### Step 2: Extract Page Opportunities

From competitor analyses, identify:

**Comparison/Alternative Pages**
- "[Competitor] alternative" pages
- "[Product] vs [Competitor]" pages
- "Best [category] tools" pages

**Feature/Solution Pages**
- Feature pages competitors have
- Use case pages for specific audiences
- Integration pages

**Free Tools**
- Calculators, generators, checkers
- Interactive tools that drive traffic
- Lead magnets

**Educational Content**
- Glossary/definition pages
- How-to guides
- Industry guides

### Step 3: Classify Search Intent

For each page, determine intent:

| Intent | Description | Page Types |
|--------|-------------|------------|
| **Transactional** | Ready to buy/signup | Pricing, demo, comparison |
| **Commercial** | Evaluating options | Alternative, vs, reviews |
| **Informational** | Learning | How-to, guides, glossary |
| **Navigational** | Finding specific thing | Brand, product names |

### Step 4: Prioritize

Score each page opportunity:

**SEO Potential** (1-5)
- 5 = High volume + low competition
- 4 = High volume OR low competition
- 3 = Medium volume, medium competition
- 2 = Low volume or high competition
- 1 = Very low potential

**Business Value** (1-5)
- 5 = High intent, direct conversion
- 4 = Commercial intent, influences decision
- 3 = Builds authority, indirect value
- 2 = Awareness only
- 1 = Minimal business impact

**Effort** (1-5)
- 1 = Simple page, hours
- 2 = Standard page, 1-2 days
- 3 = Complex page or tool, 1 week
- 4 = Interactive tool, 2+ weeks
- 5 = Major tool/platform, month+

**Priority Score** = (SEO Potential + Business Value) / Effort

---

## Output Format

Write to `docs/competitive-analysis/roadmap.md`:

```markdown
# SEO Page Roadmap

**Generated**: [date]
**Based on**: [list of competitor analyses used]

---

## Summary

[1-2 paragraphs: key opportunities identified, recommended focus]

---

## Page Roadmap

### Priority 1 - High Impact, Quick Wins

| # | Page Name | URL Slug | Target Keyword | Intent | Competitors | Score |
|---|-----------|----------|----------------|--------|-------------|-------|
| 1 | [Name] | /[slug] | "[keyword]" | Commercial | A, B, C | 4.0 |
| 2 | [Name] | /[slug] | "[keyword]" | Commercial | A, B | 3.5 |

### Priority 2 - Medium Term

| # | Page Name | URL Slug | Target Keyword | Intent | Competitors | Score |
|---|-----------|----------|----------------|--------|-------------|-------|
| 3 | [Name] | /[slug] | "[keyword]" | Informational | B, C | 2.5 |

### Priority 3 - Long Term / Complex

| # | Page Name | URL Slug | Target Keyword | Intent | Competitors | Score |
|---|-----------|----------|----------------|--------|-------------|-------|
| 4 | [Name] | /[slug] | "[keyword]" | Commercial | A, B, C | 1.5 |

---

## Page Details

### 1. [Page Name]

- **URL**: /[suggested-slug]
- **Target Keyword**: "[primary keyword]"
- **Secondary Keywords**: "[kw1]", "[kw2]"
- **Intent**: [Transactional/Commercial/Informational]
- **Competitors with this page**: [list]

**Content outline**:
- [Section 1]
- [Section 2]
- [Section 3]

**Differentiation angle**: [How to make it better than competitors]

---

[Repeat for each page]

---

## Free Tools to Build

| # | Tool Name | URL Slug | Target Keyword | Lead Capture | Competitors |
|---|-----------|----------|----------------|--------------|-------------|
| 1 | [Name] | /tools/[slug] | "[keyword]" | Email before result | A, B |

---

## Quick Reference

### By Intent

**Commercial Intent (Conversion)**
1. [Page] → "[keyword]"
2. [Page] → "[keyword]"

**Informational (Authority)**
1. [Page] → "[keyword]"
2. [Page] → "[keyword]"

### By Effort

**This Week (Hours)**
- [ ] [Page 1]
- [ ] [Page 2]

**This Month (Days)**
- [ ] [Page 3]
- [ ] [Page 4]

**This Quarter (Weeks)**
- [ ] [Tool 1]
- [ ] [Page 5]
```

---

## Page Type Templates

### Alternative Page
- **URL pattern**: `/alternative/[competitor]` or `/[competitor]-alternative`
- **Keyword**: "[competitor] alternative"
- **Intent**: Commercial
- **Content**: Why switch, comparison table, migration guide

### Comparison Page
- **URL pattern**: `/compare/[competitor]` or `/vs/[competitor]`
- **Keyword**: "[product] vs [competitor]"
- **Intent**: Commercial
- **Content**: Feature comparison, pricing comparison, pros/cons

### Use Case Page
- **URL pattern**: `/use-cases/[use-case]` or `/for/[audience]`
- **Keyword**: "[category] for [audience]"
- **Intent**: Commercial
- **Content**: Problem, solution, features, testimonials

### Feature Page
- **URL pattern**: `/features/[feature]`
- **Keyword**: "[feature] software" or "[feature] tool"
- **Intent**: Commercial/Informational
- **Content**: Feature details, benefits, how it works

### Glossary/Definition Page
- **URL pattern**: `/glossary/[term]` or `/what-is/[term]`
- **Keyword**: "what is [term]"
- **Intent**: Informational
- **Content**: Definition, examples, related terms

### Free Tool Page
- **URL pattern**: `/tools/[tool-name]`
- **Keyword**: "[thing] calculator/generator/checker"
- **Intent**: Informational (leads to commercial)
- **Content**: Tool + explanation + CTA

---

## Prioritization Guidelines

### Score Interpretation

| Score | Priority | Action |
|-------|----------|--------|
| 3.0+ | P1 | Do this week |
| 2.0-3.0 | P2 | Do this month |
| 1.5-2.0 | P3 | Do this quarter |
| < 1.5 | Backlog | Consider later |

### Focus Order

1. **First**: Commercial intent pages (comparisons, alternatives)
   - Highest conversion potential
   - Captures bottom-of-funnel traffic

2. **Second**: Feature/solution pages
   - Builds product visibility
   - Supports sales conversations

3. **Third**: Free tools
   - Link magnets
   - Lead generation
   - Brand awareness

4. **Fourth**: Educational content
   - Authority building
   - Top-of-funnel traffic

---

## References

- [Prioritization Frameworks](references/prioritization-frameworks.md): Scoring methods
- [Effort Estimation](references/effort-estimation.md): Time estimates by page type

---

## Related Skills

- **market-analysis**: For discovering competitors
- **site-deep-dive**: For detailed competitor page analysis
- **seo-audit**: For optimizing existing pages
