/**
 * Features/Latest Blog Posts section — matches legacy LatestPosts component.
 * Fetches blog posts directly from the WordPress REST API (same as legacy).
 * Falls back to legacy-matching titles/images if the WP API fails.
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";

const WP_API_URL = "https://postsapi.ezcheck.me/wp-json/wp/v2";

interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      media_details?: {
        sizes?: {
          medium?: { source_url: string };
          full?: { source_url: string };
        };
      };
      source_url?: string;
    }>;
  };
}

interface DisplayPost {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
}

const FALLBACK_POSTS: DisplayPost[] = [
  {
    id: "fallback-1",
    slug: "post-checkin-messages",
    title: "Introducing EZCheck.me's New Feature: Post Check-in Messages!",
    coverImage:
      "https://placehold.co/600x400/e8f5e9/2e7d32?text=Post+Check-in+Messages",
  },
  {
    id: "fallback-2",
    slug: "qwickly-partnership",
    title:
      "Qwickly Leads the Way in Transforming Attendance Tracking with New Partnership with EZCheck.me",
    coverImage:
      "https://placehold.co/600x400/e3f2fd/1565c0?text=Qwickly+Partnership",
  },
  {
    id: "fallback-3",
    slug: "clinical-rotations",
    title:
      "Revolutionizing Clinical Rotations: Introducing EZCheck.me Seamless Clinical Rotation Attendance Tracking",
    coverImage:
      "https://placehold.co/600x400/fff3e0/e65100?text=Clinical+Rotations",
  },
];

function parseWPPost(post: WPPost): DisplayPost {
  let coverImage = "";
  if (post._embedded?.["wp:featuredmedia"]?.[0]) {
    const media = post._embedded["wp:featuredmedia"][0];
    coverImage =
      media.media_details?.sizes?.medium?.source_url ||
      media.media_details?.sizes?.full?.source_url ||
      media.source_url ||
      "";
  }
  // Decode HTML entities from WP title
  const div = document.createElement("div");
  div.innerHTML = post.title.rendered;
  const title = div.textContent || post.title.rendered;

  return {
    id: String(post.id),
    slug: post.slug,
    title,
    coverImage,
  };
}

export function FeaturesSection() {
  const [posts, setPosts] = useState<DisplayPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${WP_API_URL}/posts?per_page=3&_embed`)
      .then((r) => r.json())
      .then((data: WPPost[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data.slice(0, 3).map(parseWPPost));
        } else {
          setPosts(FALLBACK_POSTS);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch blog posts:", err);
        setPosts(FALLBACK_POSTS);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="features" className="relative pt-8 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        {/* Blog/Feature cards grid — matches legacy LatestPosts carousel */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col bg-white overflow-hidden rounded-xl">
                <Skeleton height={200} borderRadius={0} />
                <div className="p-6 space-y-3 flex flex-col items-center">
                  <Skeleton width="85%" height={16} borderRadius={3} />
                  <Skeleton width="60%" height={14} borderRadius={3} />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
            {posts.map((post) => {
              const imageUrl =
                post.coverImage ||
                "https://placehold.co/600x400/f3f4f6/9ca3af?text=EzCheck.me";

              return (
                <Link
                  key={post.id}
                  to="/blog/$id"
                  params={{ id: post.slug || post.id }}
                  className={cn(
                    "group flex flex-col items-center bg-white overflow-hidden rounded-xl border border-transparent hover:border-gray-200 hover:shadow-lg transition-all duration-300",
                  )}
                >
                  <div className="w-full aspect-video overflow-hidden bg-gray-200">
                    <img
                      src={imageUrl}
                      alt={post.title}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/600x400/f3f4f6/9ca3af?text=EzCheck.me";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3
                      className="text-[17px] font-medium leading-snug"
                      style={{ color: "#222" }}
                    >
                      {post.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
