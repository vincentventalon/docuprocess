# Prioritization Frameworks

## Overview

Use these frameworks to prioritize features, content, and initiatives based on competitive intelligence.

---

## Simple Impact/Effort (Default)

The simplest effective framework for competitive roadmapping.

### Formula

```
Score = Impact / Effort
```

### Impact Scale (1-5)

| Score | Label | Description |
|-------|-------|-------------|
| 5 | Critical | Must have for competitive parity or major differentiator |
| 4 | High | Significant advantage or important gap to fill |
| 3 | Medium | Valuable but not urgent |
| 2 | Low | Nice to have, limited competitive impact |
| 1 | Minimal | Unclear value, speculative |

### Effort Scale (1-5)

| Score | Label | Time | Team |
|-------|-------|------|------|
| 1 | Trivial | Hours | Solo |
| 2 | Easy | 1-3 days | Solo |
| 3 | Medium | 1-2 weeks | Small team |
| 4 | Hard | 1-2 months | Team |
| 5 | Major | Quarter+ | Cross-functional |

### Interpretation

| Score | Priority | Action |
|-------|----------|--------|
| 3.0+ | Do immediately | Quick wins, high impact |
| 2.0-3.0 | Do soon | Good ROI, schedule it |
| 1.0-2.0 | Plan for later | Worth doing, needs planning |
| < 1.0 | Deprioritize | Low ROI, consider dropping |

---

## RICE Framework

More detailed framework from Intercom, good for product features.

### Components

**Reach** (R): How many users/customers impacted per quarter
- Number of users, customers, or transactions

**Impact** (I): How much will this move the needle?
- 3 = Massive impact
- 2 = High impact
- 1 = Medium impact
- 0.5 = Low impact
- 0.25 = Minimal impact

**Confidence** (C): How sure are we about these estimates?
- 100% = High confidence (data-backed)
- 80% = Medium confidence (informed estimate)
- 50% = Low confidence (speculation)

**Effort** (E): Person-months of work

### Formula

```
RICE Score = (Reach × Impact × Confidence) / Effort
```

### When to Use

- Product feature prioritization
- When you have usage data
- When reach varies significantly between initiatives

---

## ICE Framework

Simplified version of RICE, faster to apply.

### Components

**Impact** (1-10): Effect on key metric
**Confidence** (1-10): How sure are we
**Ease** (1-10): How easy to implement (inverse of effort)

### Formula

```
ICE Score = (Impact + Confidence + Ease) / 3
```

Or multiplicative:
```
ICE Score = Impact × Confidence × Ease
```

### When to Use

- Quick prioritization
- Growth experiments
- When you need fast decisions

---

## Competitive Priority Matrix

Specific to competitive analysis.

### Dimensions

**Competitive Necessity** (1-5)
- 5 = Competitors all have it, we must have it
- 4 = Most competitors have it, becoming table stakes
- 3 = Some competitors have it, differentiation opportunity
- 2 = Few competitors have it, optional
- 1 = No competitors have it, unknown value

**Strategic Value** (1-5)
- 5 = Core differentiator, builds moat
- 4 = Strong advantage, hard to copy
- 3 = Good value, medium defensibility
- 2 = Temporary advantage, easily copied
- 1 = Commoditized, no differentiation

### Matrix

|                    | Low Strategic Value | High Strategic Value |
|--------------------|--------------------|--------------------|
| **High Necessity** | Table Stakes (must do, low priority) | Strategic Priority (must do, invest well) |
| **Low Necessity**  | Skip | Differentiator (unique advantage) |

### Priority Order

1. **Strategic Priority** (High necessity + High value): Do first, do well
2. **Differentiator** (Low necessity + High value): Unique advantage, do soon
3. **Table Stakes** (High necessity + Low value): Must have, do efficiently
4. **Skip** (Low necessity + Low value): Deprioritize

---

## Quick Decision Framework

For fast, good-enough prioritization.

### Questions

1. **Do we HAVE to do this?** (Competitive necessity)
   - Yes → Must do
   - No → Continue evaluation

2. **Is this a quick win?** (< 1 week effort)
   - Yes + valuable → Do it now
   - No → Continue evaluation

3. **Does this build a moat?** (Strategic value)
   - Yes → Prioritize higher
   - No → Standard priority

4. **What's the opportunity cost?**
   - What are we NOT doing if we do this?

---

## Content Prioritization

Specific framework for content initiatives.

### Factors

**Search Volume** (1-5): Monthly searches for target keyword
- 5 = 10,000+ searches
- 4 = 1,000-10,000
- 3 = 100-1,000
- 2 = 10-100
- 1 = <10

**Competition** (1-5): How hard to rank (inverted)
- 5 = Low competition, easy to rank
- 4 = Medium-low competition
- 3 = Medium competition
- 2 = High competition
- 1 = Very competitive, hard to rank

**Conversion Potential** (1-5): Likelihood to convert
- 5 = High intent, bottom of funnel
- 4 = Medium-high intent
- 3 = Medium intent
- 2 = Low intent, top of funnel
- 1 = Awareness only

**Effort** (1-5): Content creation effort

### Formula

```
Content Score = (Volume × Competition × Conversion) / Effort
```

---

## Tool Selection Guide

| Situation | Framework |
|-----------|-----------|
| Quick decisions | Impact/Effort or Quick Decision |
| Product features | RICE |
| Competitive features | Competitive Priority Matrix |
| Content planning | Content Prioritization |
| Growth experiments | ICE |

---

## Common Mistakes

1. **Over-weighting effort**: Don't skip high-impact items just because they're hard
2. **Ignoring confidence**: Highly uncertain high-impact items may not be worth it
3. **Not considering opportunity cost**: Every "yes" is a "no" to something else
4. **Recency bias**: Latest competitor feature isn't always important
5. **Copying competitors blindly**: They may be wrong too

---

## Tips for Good Prioritization

1. **Use consistent scales**: Same criteria for all items
2. **Get multiple perspectives**: Different people see different impacts
3. **Revisit regularly**: Priorities change as market changes
4. **Document reasoning**: Know why you prioritized something
5. **Accept imperfection**: 80% right is good enough, decide and move
