# Page Type URL Patterns

## Identifying Page Types from URLs

Use these patterns to classify pages discovered in sitemaps or through crawling.

---

## Product Pages

### Feature Pages
```
/features
/features/*
/product
/product/*
/platform
/platform/*
/capabilities
/capabilities/*
```

### Solution/Use Case Pages
```
/solutions
/solutions/*
/use-cases
/use-cases/*
/for/*
/industries/*
/teams/*
```

### Integration Pages
```
/integrations
/integrations/*
/apps
/apps/*
/connect/*
/marketplace
```

### Comparison Pages
```
/compare/*
/vs/*
/alternative/*
/alternatives/*
/vs-*
/*-vs-*
/*-alternative
```

---

## Marketing Pages

### Homepage
```
/
/home
```

### Pricing
```
/pricing
/plans
/packages
/pricing-*
```

### Demo/Trial
```
/demo
/request-demo
/book-demo
/trial
/free-trial
/get-started
/start
/signup
/sign-up
```

### About/Company
```
/about
/about-us
/company
/team
/our-team
/leadership
/story
/our-story
/mission
```

### Careers
```
/careers
/jobs
/hiring
/join-us
/work-with-us
```

### Contact
```
/contact
/contact-us
/support
/help
```

---

## Content Pages

### Blog
```
/blog
/blog/*
/articles
/articles/*
/news
/news/*
/posts
/posts/*
/insights
/insights/*
```

### Resources
```
/resources
/resources/*
/guides
/guides/*
/ebooks
/ebooks/*
/whitepapers
/whitepapers/*
/templates
/templates/*
/webinars
/webinars/*
/library
```

### Case Studies
```
/case-studies
/case-studies/*
/customers
/customers/*
/success-stories
/success-stories/*
```

### Glossary/Educational
```
/glossary
/glossary/*
/learn
/learn/*
/education
/academy
/academy/*
/university
```

---

## Documentation

### Help/Docs
```
/docs
/docs/*
/documentation
/documentation/*
/help
/help/*
/support/*
/knowledge-base
/kb
/kb/*
```

### API Docs
```
/api
/api/*
/developers
/developers/*
/api-reference
/api-docs
```

### Changelog
```
/changelog
/releases
/release-notes
/updates
/whats-new
```

---

## Tools & Utilities

### Free Tools
```
/tools
/tools/*
/free-tools
/free-*
/calculator
/calculator/*
*-calculator
*-generator
*-checker
*-analyzer
*-converter
```

### Landing Pages
```
/lp/*
/landing/*
/campaign/*
/promo/*
/offer/*
```

---

## Legal Pages

```
/privacy
/privacy-policy
/terms
/terms-of-service
/tos
/legal
/legal/*
/security
/gdpr
/dpa
/cookies
/cookie-policy
/acceptable-use
/sla
```

---

## App/Product Pages

```
/app
/app/*
/dashboard
/login
/signin
/sign-in
/logout
/register
/account
/settings
```

---

## Classification Tips

### Priority Pages to Analyze

1. **Must analyze**:
   - Homepage
   - Pricing
   - Main features page
   - Blog index

2. **Should analyze**:
   - Top 3-5 feature pages
   - Solution pages for your target audience
   - Free tools
   - Popular blog posts

3. **Nice to have**:
   - Documentation structure
   - Case studies
   - Integration pages

### Red Flags (Skip These)

- `/cdn-cgi/*` - Cloudflare
- `/wp-admin/*` - WordPress admin
- `/*?*` - Query parameters (usually duplicates)
- `/tag/*`, `/category/*` - Taxonomy pages
- `/page/*` - Pagination
- `/author/*` - Author archives
- `/*feed*` - RSS feeds
- `/amp/*` - AMP versions

### Identifying Important Pages

Look for pages that are:
- Linked from main navigation
- Linked from homepage
- Have multiple internal links
- Appear in sitemap priority
