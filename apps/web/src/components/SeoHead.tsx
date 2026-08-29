import React, { useEffect } from "react";

export interface SeoHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  robots?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_ORIGIN = "https://nexteduwise.com";
const DEFAULT_IMAGE = "https://nexteduwise.com/og-default.jpg";

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalUrl,
  robots = "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Update Title
    const trimmedTitle = title.length > 70 ? `${title.slice(0, 67)}...` : title;
    document.title = trimmedTitle;

    // Helper to set or create <meta> tags
    const setMetaTag = (selector: string, attrName: string, attrVal: string, contentVal: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute("content", contentVal);
    };

    // Helper to set or create <link rel="canonical">
    const setCanonicalTag = (url: string) => {
      let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
      }
      el.setAttribute("href", url);
    };

    // 2. Set Core Meta Tags
    setMetaTag('meta[name="description"]', "name", "description", description);
    setMetaTag('meta[name="robots"]', "name", "robots", robots);

    // 3. Set Canonical URL
    const fullCanonical = canonicalUrl
      ? canonicalUrl.startsWith("http")
        ? canonicalUrl
        : `${DEFAULT_ORIGIN}${canonicalUrl.startsWith("/") ? "" : "/"}${canonicalUrl}`
      : window.location.href.split("?")[0];
    setCanonicalTag(fullCanonical);

    // 4. OpenGraph Tags
    setMetaTag('meta[property="og:title"]', "property", "og:title", trimmedTitle);
    setMetaTag('meta[property="og:description"]', "property", "og:description", description);
    setMetaTag('meta[property="og:type"]', "property", "og:type", ogType);
    setMetaTag('meta[property="og:url"]', "property", "og:url", fullCanonical);
    setMetaTag('meta[property="og:image"]', "property", "og:image", ogImage);
    setMetaTag('meta[property="og:site_name"]', "property", "og:site_name", "NextEduWise");

    // 5. Twitter Tags
    setMetaTag('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", trimmedTitle);
    setMetaTag('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMetaTag('meta[name="twitter:image"]', "name", "twitter:image", ogImage);

    // 6. Inject JSON-LD Schema
    const scriptId = "seo-json-ld-script";
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = scriptId;
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }

    if (jsonLd) {
      const jsonContent = Array.isArray(jsonLd) ? JSON.stringify(jsonLd) : JSON.stringify(jsonLd);
      scriptEl.textContent = jsonContent;
    } else {
      scriptEl.textContent = "";
    }

    return () => {
      // Clean up script on unmount if needed
    };
  }, [title, description, canonicalUrl, robots, ogImage, ogType, jsonLd]);

  return null;
};
