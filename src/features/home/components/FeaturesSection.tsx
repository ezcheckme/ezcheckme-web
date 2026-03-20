/**
 * Features/Latest Blog Posts section — matches legacy LatestPosts component.
 * Fetches blog posts from WordPress REST API (same as legacy).
 * Carousel with left/right arrow navigation matching old app exactly.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [allPosts, setAllPosts] = useState<DisplayPost[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<DisplayPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [animateDir, setAnimateDir] = useState<"left" | "right">("right");
  const indexRef = useRef(0);
  const imagesLoadedCount = useRef(0);
  const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`${WP_API_URL}/posts?per_page=12&_embed`)
      .then((r) => r.json())
      .then((data: WPPost[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const parsed = data.map(parseWPPost);
          setAllPosts(parsed);
          setVisiblePosts(parsed.slice(0, 3));
          indexRef.current = 0;
        } else {
          setAllPosts(FALLBACK_POSTS);
          setVisiblePosts(FALLBACK_POSTS);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch blog posts:", err);
        setAllPosts(FALLBACK_POSTS);
        setVisiblePosts(FALLBACK_POSTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const onArrowClick = useCallback(
    (direction: number) => {
      if (!imagesLoaded || allPosts.length === 0) return;

      if (animationTimer.current) clearTimeout(animationTimer.current);
      setAnimateDir(direction < 0 ? "left" : "right");
      setAnimating(true);

      animationTimer.current = setTimeout(() => {
        setAnimating(false);
      }, 400);

      setTimeout(() => {
        const step = direction * 3;
        let newIndex =
          (indexRef.current + step + allPosts.length * 10) % allPosts.length;
        indexRef.current = newIndex;

        const updated: DisplayPost[] = [];
        for (let i = 0; i < 3; i++) {
          updated.push(allPosts[(newIndex + i) % allPosts.length]);
        }
        setVisiblePosts(updated);
      }, 200);
    },
    [allPosts, imagesLoaded],
  );

  const onImageLoad = useCallback(() => {
    imagesLoadedCount.current += 1;
    if (imagesLoadedCount.current >= 3) {
      setImagesLoaded(true);
    }
  }, []);

  return (
    <section id="features" className="relative pt-8 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        {loading ? (
          <div className="flex gap-6 justify-between mb-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col bg-white overflow-hidden rounded-xl"
                style={{ width: "31%" }}
              >
                <Skeleton height={200} borderRadius={10} />
                <div className="p-6 space-y-3 flex flex-col items-center">
                  <Skeleton width="85%" height={16} borderRadius={3} />
                  <Skeleton width="60%" height={14} borderRadius={3} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          visiblePosts.length > 0 && (
            <div className="relative mb-12">
              {/* Left Arrow */}
              <button
                onClick={() => onArrowClick(-1)}
                className="absolute z-10 flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
                style={{
                  top: 89,
                  left: -19,
                  width: 32,
                  height: 32,
                  background: "#000",
                  color: "#fff",
                  border: "3px solid white",
                  borderRadius: 26,
                }}
                aria-label="Previous posts"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={() => onArrowClick(1)}
                className="absolute z-10 flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
                style={{
                  top: 89,
                  right: -19,
                  width: 32,
                  height: 32,
                  background: "#000",
                  color: "#fff",
                  border: "3px solid white",
                  borderRadius: 26,
                }}
                aria-label="Next posts"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Cards container with animation */}
              <div className="w-full overflow-hidden">
                <div
                  className={cn(
                    "flex justify-between w-full transition-all",
                    animating && animateDir === "left" && "animate-bounce-out-right",
                    animating && animateDir === "right" && "animate-bounce-out-left",
                    !animating && "animate-fade-in",
                  )}
                  style={{
                    animationDuration: "400ms",
                    animationFillMode: "both",
                  }}
                >
                  {visiblePosts.map((post) => {
                    const imageUrl =
                      post.coverImage ||
                      "https://placehold.co/600x400/f3f4f6/9ca3af?text=EzCheck.me";

                    return (
                      <Link
                        key={post.id}
                        to="/blog/$id"
                        params={{ id: post.slug || post.id }}
                        className="flex flex-col bg-white overflow-hidden cursor-pointer"
                        style={{ width: "31%" }}
                      >
                        <div
                          className="w-full overflow-hidden relative"
                          style={{ borderRadius: 10 }}
                        >
                          <img
                            src={imageUrl}
                            alt={post.title}
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://placehold.co/600x400/f3f4f6/9ca3af?text=EzCheck.me";
                            }}
                            onLoad={onImageLoad}
                            className="w-full aspect-video object-cover"
                            style={{
                              display: imagesLoaded ? "block" : "none",
                              borderRadius: 10,
                            }}
                          />
                          {/* Placeholder while images load */}
                          {!imagesLoaded && (
                            <div
                              className="w-full aspect-video"
                              style={{
                                backgroundColor: "#eeeeee",
                                borderRadius: 10,
                              }}
                            />
                          )}
                        </div>
                        <div className="py-4 px-2">
                          <h3
                            className="leading-snug"
                            style={{
                              textAlign: "center",
                              minHeight: 80,
                              fontWeight: 600,
                              fontSize: 17,
                              color: imagesLoaded ? "#000" : "#fff",
                            }}
                          >
                            {imagesLoaded ? post.title : "title"}
                          </h3>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes bounceOutLeft {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-30px); opacity: 0; }
        }
        @keyframes bounceOutRight {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(30px); opacity: 0; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-bounce-out-left {
          animation-name: bounceOutLeft;
        }
        .animate-bounce-out-right {
          animation-name: bounceOutRight;
        }
        .animate-fade-in {
          animation-name: fadeIn;
          animation-duration: 300ms;
        }
      `}</style>
    </section>
  );
}
