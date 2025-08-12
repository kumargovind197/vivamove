
"use client";

/**
 * Ensures that a given URL is an absolute path by prepending "https://".
 * If the URL already starts with "http://" or "https://", it's returned as is.
 * @param url The URL to process.
 * @returns An absolute URL.
 */
export function ensureAbsoluteUrl(url: string): string {
  if (!url) {
    return '#'; // Return a safe, non-navigating link if URL is empty
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}
