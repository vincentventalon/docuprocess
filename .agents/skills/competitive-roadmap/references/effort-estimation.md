# Effort Estimation Guide

## Effort Scale Reference

Standard 1-5 scale for competitive roadmap prioritization.

| Score | Label | Time | Team Size | Examples |
|-------|-------|------|-----------|----------|
| 1 | Trivial | 1-4 hours | 1 person | Copy change, config update |
| 2 | Easy | 1-3 days | 1 person | Landing page, blog post |
| 3 | Medium | 1-2 weeks | 1-2 people | Feature, integration, tool |
| 4 | Hard | 1-2 months | 2-4 people | Major feature, content series |
| 5 | Major | Quarter+ | Cross-functional | New product area, platform |

---

## Estimation by Initiative Type

### Content Initiatives

| Initiative | Typical Effort | Score |
|------------|----------------|-------|
| Blog post (standard) | 4-8 hours | 1-2 |
| Blog post (in-depth) | 2-3 days | 2 |
| Comparison page | 1-2 days | 2 |
| "Alternative to X" page | 1-2 days | 2 |
| Landing page (simple) | 1-2 days | 2 |
| Landing page (complex) | 3-5 days | 2-3 |
| Case study | 1-2 weeks | 3 |
| Ebook/whitepaper | 2-4 weeks | 3-4 |
| Documentation section | 1-2 weeks | 3 |
| Full docs overhaul | 1-2 months | 4 |

### Free Tools

| Tool Type | Typical Effort | Score |
|-----------|----------------|-------|
| Calculator (simple) | 1-2 days | 2 |
| Calculator (complex) | 1 week | 3 |
| Generator tool | 1-2 weeks | 3 |
| Checker/analyzer | 1-2 weeks | 3 |
| Interactive tool | 2-4 weeks | 3-4 |
| Full-featured tool | 1-2 months | 4 |

### Features

| Feature Type | Typical Effort | Score |
|--------------|----------------|-------|
| UI enhancement | 1-3 days | 2 |
| Small feature | 1-2 weeks | 3 |
| Medium feature | 2-4 weeks | 3-4 |
| Major feature | 1-2 months | 4 |
| New module/area | 2-4 months | 5 |
| Platform capability | 6+ months | 5 |

### Integrations

| Integration Type | Typical Effort | Score |
|------------------|----------------|-------|
| Webhook (basic) | 1-3 days | 2 |
| API integration (simple) | 1-2 weeks | 3 |
| API integration (complex) | 2-4 weeks | 3-4 |
| OAuth integration | 2-4 weeks | 3-4 |
| Native integration | 1-2 months | 4 |
| Platform/marketplace | 2-4 months | 4-5 |

---

## Factors That Increase Effort

### Technical Factors

| Factor | Effort Multiplier |
|--------|------------------|
| New technology/stack | +50-100% |
| Database changes | +25-50% |
| API changes | +25-50% |
| Security considerations | +25-50% |
| Performance requirements | +25-50% |
| Third-party dependencies | +25-50% |
| Mobile considerations | +50% |
| Offline support | +100% |

### Process Factors

| Factor | Effort Multiplier |
|--------|------------------|
| Design required | +50-100% |
| Legal/compliance review | +1-2 weeks |
| External stakeholders | +50% |
| Documentation required | +25% |
| Localization | +50-100% |
| Testing/QA | +25-50% |

### Team Factors

| Factor | Effect |
|--------|--------|
| New team member | -30% velocity initially |
| Subject matter expertise | -25% if available |
| Clear requirements | -25% |
| Unclear requirements | +50-100% |

---

## Quick Effort Estimation

### The T-Shirt Method

| Size | Score | Typical Range |
|------|-------|---------------|
| XS | 1 | Hours |
| S | 2 | 1-3 days |
| M | 3 | 1-2 weeks |
| L | 4 | 1-2 months |
| XL | 5 | Quarter+ |

### The Question Method

Answer these questions:

1. **Is the solution obvious?**
   - Yes → Score 1-2
   - Mostly → Score 2-3
   - No → Score 4-5

2. **Have we done this before?**
   - Many times → -1 to score
   - Once → No change
   - Never → +1 to score

3. **Does it require design?**
   - No → No change
   - Minor → +0.5 to score
   - Significant → +1 to score

4. **How many systems touched?**
   - 1 → No change
   - 2-3 → +0.5 to score
   - 4+ → +1 to score

---

## Estimation Tips

### Avoiding Common Mistakes

1. **Don't forget overhead**
   - Testing: 25-50% of dev time
   - Code review: 10-20% of dev time
   - Deployment: 1-4 hours
   - Documentation: 10-25% of dev time

2. **Account for unknowns**
   - Add 25-50% buffer for uncertainty
   - More buffer for new technologies

3. **Consider the full scope**
   - Edge cases
   - Error handling
   - Admin features
   - Analytics/tracking

4. **Remember dependencies**
   - Waiting time for others
   - External API limitations
   - Approval processes

### Sanity Checks

- **Too low?** If everything is 1-2, you're underestimating
- **Too high?** If everything is 4-5, consider breaking into smaller pieces
- **Good distribution**: Most items should be 2-3, few 1s and 5s

### When Uncertain

- Default to higher estimate
- Break into smaller pieces for better accuracy
- Spike/prototype first if very uncertain
- Get second opinion from domain expert

---

## Using Estimates in Prioritization

### Score Calculation

```
Priority Score = Impact / Effort
```

### Interpretation

| Score | Meaning |
|-------|---------|
| 4.0+ | Exceptional ROI, do immediately |
| 2.5-4.0 | Great ROI, high priority |
| 1.5-2.5 | Good ROI, medium priority |
| 1.0-1.5 | Acceptable ROI, lower priority |
| < 1.0 | Poor ROI, deprioritize or drop |

### Example

| Initiative | Impact | Effort | Score | Priority |
|------------|--------|--------|-------|----------|
| Comparison page | 4 | 2 | 2.0 | High |
| New feature | 5 | 4 | 1.25 | Medium |
| Platform rebuild | 5 | 5 | 1.0 | Low (for now) |
| Simple tool | 3 | 2 | 1.5 | Medium |
| Blog post | 2 | 1 | 2.0 | High (quick win) |

---

## Capacity Planning

### Rule of Thumb

- Junior dev: 3-4 effective hours/day
- Senior dev: 4-5 effective hours/day
- Meetings, context switching reduce by 25-50%

### Weekly Capacity (5-day week)

| Role | Effective Hours |
|------|-----------------|
| IC (low meetings) | 25-30 hours |
| IC (medium meetings) | 20-25 hours |
| IC (high meetings) | 15-20 hours |
| Lead/manager | 10-15 hours |

### Planning Multiplier

For planning purposes, multiply estimates by:
- 1.5x for normal risk
- 2x for high uncertainty
- 3x for new technology/team
