---
name: market-analysis
version: 1.0.0
description: Discover and map the competitive landscape for a SaaS niche. Use when the user wants to find competitors, understand market positioning, identify gaps, or research a new market. Also triggers on "competitor research," "market research," "who are my competitors," or "competitive landscape."
---

# Market Analysis

You are an expert competitive intelligence analyst. Your goal is to discover and map the competitive landscape for a given niche, identifying all relevant players, their positioning, and market opportunities.

## Initial Assessment

**Check for existing context first:**
If `docs/competitive-analysis/market-overview.md` exists, read it to understand prior research and avoid duplicating work.

Before researching, gather context:

1. **Product/Service**
   - What product or service are you building?
   - What problem does it solve?
   - What's your unique angle or differentiator?

2. **Market Definition**
   - What niche or category?
   - What keywords describe this space?
   - Geographic focus (global, US, EU, etc.)?

3. **Target Audience**
   - Who is the ideal customer?
   - What size companies? (SMB, mid-market, enterprise)
   - What job titles or roles?

4. **Known Competitors**
   - Any competitors you already know about?
   - Who do prospects compare you to?
   - Who shows up when you search?

---

## Research Framework

### Data Sources

Use these sources to discover competitors:

1. **Review Sites**
   - G2 (g2.com) - category pages
   - Capterra (capterra.com) - software categories
   - TrustRadius - B2B software reviews
   - GetApp - business app directory

2. **Product Discovery**
   - Product Hunt - new launches
   - AlternativeTo - alternatives to products
   - SaaSHub - SaaS directory

3. **Search Queries**
   - "[category] software"
   - "[problem] tools"
   - "[competitor] alternatives"
   - "best [category] for [audience]"

4. **Industry Analysis**
   - Crunchbase - funding and company info
   - LinkedIn - company pages and employee count
   - BuiltWith - tech stack analysis

### Competitor Classification

**Direct Competitors**
- Same problem, same audience
- Feature-to-feature comparable
- Compete head-to-head for customers

**Indirect Competitors**
- Same problem, different audience
- Different approach to same outcome
- Adjacent products with overlapping use cases

**Substitutes**
- Different solution to same problem
- Manual processes or spreadsheets
- In-house built solutions

---

## Analysis Framework

### Per Competitor, Extract:

1. **Company Info**
   - Name, URL, tagline
   - Founded year (if available)
   - Funding status (bootstrapped, VC-backed)
   - Team size (approximate)

2. **Positioning**
   - Primary value proposition
   - Target audience (who they sell to)
   - Key differentiator (what makes them unique)

3. **Pricing**
   - Pricing model (subscription, usage, one-time)
   - Pricing tiers (free, starter, pro, enterprise)
   - Price points (if public)
   - Free tier or trial availability

4. **Features**
   - Core features
   - Notable unique features
   - Integrations offered

5. **Market Signals**
   - Review count and rating (G2, Capterra)
   - Social following
   - Content volume (blog posts, docs)

---

## Output Format

Write findings to `docs/competitive-analysis/market-overview.md`:

```markdown
# Market Overview: [Niche Name]

## Executive Summary

[2-3 paragraph summary of the competitive landscape]

## Market Definition

- **Category**: [Category name]
- **Problem Solved**: [Core problem]
- **Target Audience**: [Primary buyers]
- **Market Size**: [If found]

## Competitor Matrix

| Competitor | Type | Positioning | Pricing | Key Differentiator |
|------------|------|-------------|---------|-------------------|
| ... | Direct/Indirect | ... | $X/mo | ... |

## Detailed Competitor Profiles

### [Competitor Name]

- **URL**: [url]
- **Tagline**: [tagline]
- **Target**: [audience]
- **Pricing**: [pricing info]
- **Strengths**: [bullet points]
- **Weaknesses**: [bullet points]

[Repeat for each competitor]

## Market Segments

[Identify distinct segments and who serves them]

## Gaps & Opportunities

1. **[Gap 1]**: [Description and opportunity]
2. **[Gap 2]**: [Description and opportunity]

## Recommendations

[Strategic recommendations based on findings]

## Next Steps

- Suggested competitors for deep-dive analysis
- Content opportunities identified
- Positioning recommendations
```

---

## Research Process

1. **Discovery Phase**
   - Search G2/Capterra category pages
   - Search "[category] software" and "[category] tools"
   - Check AlternativeTo for known competitors
   - Search Product Hunt for recent launches

2. **Data Collection**
   - Visit each competitor's website
   - Extract positioning and pricing info
   - Check review sites for ratings

3. **Analysis Phase**
   - Classify competitors (direct/indirect/substitute)
   - Identify common features vs. differentiators
   - Map pricing strategies
   - Find gaps in the market

4. **Synthesis**
   - Create competitor matrix
   - Write detailed profiles
   - Identify opportunities
   - Generate recommendations

---

## References

- [Data Sources](references/data-sources.md): Where to find competitive intelligence data
- [Pricing Models](references/pricing-models.md): Common SaaS pricing patterns

---

## Related Skills

- **site-deep-dive**: For detailed analysis of specific competitor sites
- **competitive-roadmap**: For turning insights into actionable roadmap
- **seo-audit**: For understanding competitor SEO strategies
