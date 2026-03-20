/**
 * BlogPage — matches legacy Posts.js (list) and Post.js (single post) exactly.
 *
 * Layout: Sage green #9ab0a0 background, 828px Paper container,
 * horizontal cards (image 360×216 left, excerpt right with gradient blur overlay).
 * Single post: white paper container, close X icon, content with 60px margins.
 */

import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { useParams, useNavigate, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import * as blogService from "@/shared/services/blog.service";
import type { BlogPost } from "@/shared/services/blog.service";

export function BlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Try to get the blog post ID from route params
  let postId: string | undefined;
  try {
    const params = useParams({ from: "/blog/$id" });
    postId = params.id;
  } catch {
    // On /blog list route — no ID
  }

  useEffect(() => {
    if (postId) return;
    setLoading(true);
    blogService
      .getBlogPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [postId]);

  // Single post view
  if (postId) {
    return <BlogPostView slug={postId} allPosts={posts} />;
  }

  // Blog list view — matching old Posts.js layout
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        background: "#9ab0a0",
        minHeight: "100%",
      }}
    >
      <title>Blog — ezCheckMe</title>
      <div
        style={{
          position: "relative",
          width: 828,
          display: "flex",
          flexDirection: "column",
          margin: "20px auto 30px auto",
          fontSize: 16,
          background: "#9ab0a0",
        }}
      >
        {loading ? (
          <div className="flex flex-col gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 216,
                  margin: "0px 20px 30px 20px",
                  boxShadow:
                    "0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)",
                  background: "#fff",
                  borderRadius: 4,
                }}
              >
                <Skeleton width={360} height={216} borderRadius={0} />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: "#fff", fontSize: 18 }}>No blog posts yet.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              onClick={() =>
                navigate({
                  to: "/blog/$id",
                  params: { id: post.slug || post.id },
                })
              }
              className="cursor-pointer"
              style={{
                height: 216,
                boxShadow:
                  "0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)",
                margin: "0px 20px 30px 20px",
                position: "relative",
                overflow: "visible",
                background: "#fff",
                borderRadius: 4,
              }}
            >
              {/* Image on left */}
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  style={{
                    width: 360,
                    height: 216,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    objectFit: "cover",
                  }}
                />
              )}

              {/* Excerpt text on right */}
              <div
                style={{
                  margin: "10px 30px",
                  height: 200,
                  overflow: "hidden",
                  position: "absolute",
                  top: 0,
                  left: 360,
                  fontSize: 21,
                  fontWeight: 700,
                }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(post.excerpt),
                }}
              />

              {/* Gradient blur overlay with "Read more..." */}
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 360,
                  width: 423,
                  height: 70,
                  fontSize: 20,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,1) 70%, rgba(255,255,255,1) 100%)",
                }}
              >
                <Link
                  to="/blog/$id"
                  params={{ id: post.slug || post.id }}
                  style={{
                    position: "absolute",
                    bottom: 10,
                    right: 20,
                    textDecoration: "underline",
                    color: "#1976d2",
                  }}
                >
                  Read more...
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single Blog Post View — matches old Post.js layout
// ---------------------------------------------------------------------------

function BlogPostView({
  slug,
  allPosts: _allPosts,
}: {
  slug: string;
  allPosts: BlogPost[];
}) {
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>(_allPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Load both the current post and all posts (for "Read Next")
    const loadPost = blogService
      .getBlogPost(slug)
      .then((result) => setPost(result));
    const loadAll =
      allPosts.length > 0
        ? Promise.resolve()
        : blogService.getBlogPosts().then((p) => setAllPosts(p));

    Promise.all([loadPost, loadAll])
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  // Find next post for "Read Next" link
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const nextPost =
    currentIndex >= 0 && allPosts.length > 1
      ? allPosts[(currentIndex + 1) % allPosts.length]
      : null;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          background: "#9ab0a0",
          minHeight: "100%",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 828,
            margin: "20px auto 30px auto",
            background: "#9ab0a0",
          }}
        >
          <div
            style={{
              position: "relative",
              maxWidth: 800,
              marginTop: 39,
              background: "#fff",
              padding: "25px 60px",
              boxShadow:
                "0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)",
            }}
          >
            <Skeleton width="80%" height={24} borderRadius={4} />
            <div className="flex justify-between mt-6 mb-4">
              <Skeleton width={120} height={14} borderRadius={3} />
              <Skeleton width={100} height={14} borderRadius={3} />
            </div>
            <div className="space-y-3 pt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  width={`${85 + (i % 3) * 5}%`}
                  height={14}
                  borderRadius={3}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          background: "#9ab0a0",
          minHeight: "100%",
        }}
      >
        <div className="text-center text-white">
          <p style={{ fontSize: 18 }}>Post not found.</p>
          <button
            onClick={() => navigate({ to: "/blog" })}
            className="mt-4 underline text-sm"
            style={{ color: "#fff" }}
          >
            ← Back to Blog
          </button>
        </div>
      </div>
    );
  }

  // Format date like old app: "MMM d yyyy"
  const formattedDate = (() => {
    try {
      const d = new Date(post.publishedAt);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
    } catch {
      return post.publishedAt;
    }
  })();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        background: "#9ab0a0",
        minHeight: "100%",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 828,
          display: "flex",
          flexDirection: "column",
          margin: "20px auto 30px auto",
          fontSize: 16,
          background: "#9ab0a0",
        }}
      >
        <div
          style={{
            position: "relative",
            maxWidth: 800,
            display: "flex",
            flexDirection: "column",
            marginTop: 39,
            marginBottom: 20,
            fontSize: 16,
            background: "#fff",
            boxShadow:
              "0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)",
          }}
        >
          {/* Close icon — matches old HighlightOffIcon */}
          <button
            onClick={() => navigate({ to: "/" })}
            className="cursor-pointer hover:opacity-80"
            style={{
              position: "absolute",
              top: -33,
              right: -38,
              color: "#fff",
              background: "none",
              border: "none",
              fontSize: 36,
            }}
            aria-label="Close"
          >
            <X className="h-9 w-9" />
          </button>

          {/* Title */}
          <h1
            style={{
              margin: "25px 60px 10px 60px",
              fontSize: "2.125rem",
              fontWeight: 400,
            }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.title),
            }}
          />

          {/* Date + Author */}
          <div
            style={{
              display: "flex",
              margin: "25px 60px 10px 60px",
              fontSize: 18,
              justifyContent: "space-between",
            }}
          >
            <span>
              By the{" "}
              <a href="https://ezcheck.me" style={{ color: "#1976d2" }}>
                EZCheck.me
              </a>{" "}
              team
            </span>
            <span>{formattedDate}</span>
          </div>

          {/* Content */}
          <div
            className="blog-content"
            style={{ margin: "10px 60px" }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content),
            }}
          />

          {/* Read Next */}
          {nextPost && (
            <div className="flex flex-row mb-10 mt-8">
              <h6
                style={{
                  fontSize: 17,
                  margin: "0 60px",
                  fontWeight: 500,
                }}
              >
                Read Next:{" "}
                <Link
                  to="/blog/$id"
                  params={{ id: nextPost.slug || nextPost.id }}
                  style={{ color: "#1976d2" }}
                >
                  {nextPost.title}
                </Link>
              </h6>
            </div>
          )}
        </div>
      </div>

      {/* Blog content styles — match old app's WordPress content rendering */}
      <style>{`
        .blog-content p {
          margin-block-end: 0;
          margin-block-start: 0.5rem;
        }
        .blog-content img {
          width: 100%;
        }
        .blog-content a {
          color: #1976d2;
          text-decoration: underline;
        }
        @media (max-width: 700px) {
          .blog-content {
            font-size: 16px;
            margin: 10px 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
