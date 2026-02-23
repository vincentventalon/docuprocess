#!/usr/bin/env node
/**
 * Generate sitemap dates from git history
 *
 * This script scans the codebase and generates a JSON file with lastmod dates
 * for all pages. The generated file is committed to git so that Vercel
 * (which uses shallow clones) can access accurate dates.
 *
 * Run: node scripts/generate-sitemap-dates.js
 */

const { execSync } = require("child_process");
const fg = require("fast-glob");
const fs = require("fs");
const path = require("path");

const OUTPUT_FILE = path.join(__dirname, "../generated/sitemap-dates.json");

/**
 * Get git last modified date for a file
 */
function getGitDate(filePath) {
  try {
    const result = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      encoding: "utf-8",
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    return result ? new Date(result).toISOString() : null;
  } catch {
    return null;
  }
}

/**
 * Convert frontend/app/ page.tsx path to URL
 */
function appPageToUrl(filePath) {
  let urlPath = filePath
    .replace(/^frontend\/app\//, "")
    .replace(/\/?page\.tsx$/, "");

  // Handle route groups like (docs)
  urlPath = urlPath.replace(/\([^)]+\)\//g, "");

  // Skip patterns
  const skipPatterns = [
    /^\[/,
    /\/\[/,
    /^dashboard/,
    /^signin/,
    /^onboarding/,
    /^api/,
    /^docs\/\[\[/,
  ];

  for (const pattern of skipPatterns) {
    if (pattern.test(urlPath)) {
      return null;
    }
  }

  return urlPath === "" ? "/" : "/" + urlPath;
}

/**
 * Convert frontend/content/ MDX path to URL
 */
function mdxToUrl(filePath) {
  let urlPath = filePath
    .replace(/^frontend\/content\//, "")
    .replace(/\.mdx$/, "");

  if (urlPath.endsWith("_meta") || urlPath.includes("_meta.")) {
    return null;
  }

  return urlPath === "index" ? "/docs" : "/docs/" + urlPath;
}

/**
 * Main function
 */
function main() {
  console.log("Generating sitemap dates from git history...\n");

  const dates = {};
  let count = 0;

  // Discover and process app pages
  const appPages = fg.sync("frontend/app/**/page.tsx", { cwd: process.cwd() });
  for (const filePath of appPages) {
    const url = appPageToUrl(filePath);
    if (url) {
      const date = getGitDate(filePath);
      if (date) {
        dates[url] = date;
        count++;
      }
    }
  }

  // Discover and process MDX docs
  const mdxDocs = fg.sync("frontend/content/**/*.mdx", { cwd: process.cwd() });
  for (const filePath of mdxDocs) {
    const url = mdxToUrl(filePath);
    if (url) {
      const date = getGitDate(filePath);
      if (date) {
        dates[url] = date;
        count++;
      }
    }
  }

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dates, null, 2) + "\n");

  console.log(`Generated ${count} URL dates`);
  console.log(`Output: ${OUTPUT_FILE}\n`);

  // Show sample
  const sampleUrls = ["/", "/pricing", "/docs", "/docs/get-started"];
  console.log("Sample dates:");
  for (const url of sampleUrls) {
    console.log(`  ${url}: ${dates[url] || "not found"}`);
  }
}

main();
