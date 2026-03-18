/**
 * Blog service — fetches blog posts from the WordPress REST API.
 * Matches legacy: posts are stored on postsapi.ezcheck.me (WordPress).
 */

const WP_API_URL = "https://postsapi.ezcheck.me/wp-json/wp/v2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  publishedAt: string;
  tags: string[];
}

// WordPress API response types
interface WPPost {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  _embedded?: {
    author?: Array<{ name: string }>;
    "wp:featuredmedia"?: Array<{
      media_details?: {
        sizes?: {
          medium?: { source_url: string };
          full?: { source_url: string };
        };
      };
      source_url?: string;
    }>;
    "wp:term"?: Array<Array<{ name: string }>>;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function decodeHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || html;
}

function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
}

function parseWPPost(wp: WPPost): BlogPost {
  let coverImage = "";
  if (wp._embedded?.["wp:featuredmedia"]?.[0]) {
    const media = wp._embedded["wp:featuredmedia"][0];
    coverImage =
      media.media_details?.sizes?.medium?.source_url ||
      media.media_details?.sizes?.full?.source_url ||
      media.source_url ||
      "";
  }

  const author = wp._embedded?.author?.[0]?.name || "EZCheck.me";
  const tags =
    wp._embedded?.["wp:term"]?.[0]?.map((t) => t.name).filter(Boolean) || [];

  return {
    id: String(wp.id),
    slug: wp.slug,
    title: decodeHtml(wp.title.rendered),
    excerpt: stripHtml(wp.excerpt.rendered).trim(),
    content: wp.content.rendered,
    coverImage,
    author,
    publishedAt: wp.date,
    tags,
  };
}

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

/** Get all published blog posts */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${WP_API_URL}/posts?per_page=20&_embed`);
  if (!res.ok) return [];
  const data: WPPost[] = await res.json();
  return data.map(parseWPPost);
}

/** Get a single blog post by slug */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const res = await fetch(
    `${WP_API_URL}/posts?slug=${encodeURIComponent(slug)}&_embed`,
  );
  if (!res.ok) return null;
  const data: WPPost[] = await res.json();
  if (!data || data.length === 0) return null;
  return parseWPPost(data[0]);
}
