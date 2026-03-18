/**
 * BlogPage — displays list of blog posts, or a single post if an ID is present.
 * Replaces the placeholder blog route.
 *
 * Source: old Blogs.js → modern functional component.
 */

import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
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
    if (postId) return; // Don't load list if viewing single post
    setLoading(true);
    blogService
      .getBlogPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [postId]);

  // Single post view
  if (postId) {
    return <BlogPostView slug={postId} />;
  }

  // List view
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <title>Blog — ezCheckMe</title>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Blog</h1>
      <p className="text-gray-500 mb-8">
        Tips, updates, and insights on attendance management
      </p>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
              <Skeleton height={180} borderRadius={0} />
              <div className="p-5 space-y-3">
                <Skeleton width={100} height={10} borderRadius={3} />
                <Skeleton width="90%" height={16} borderRadius={3} />
                <Skeleton width="70%" height={12} borderRadius={3} />
                <Skeleton width="50%" height={12} borderRadius={3} />
                <div className="flex gap-2 pt-1">
                  <Skeleton width={48} height={16} borderRadius={10} />
                  <Skeleton width={56} height={16} borderRadius={10} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No blog posts yet.</p>
          <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() =>
                navigate({
                  to: "/blog/$id",
                  params: { id: post.slug || post.id },
                })
              }
              className="group cursor-pointer rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {post.coverImage && (
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.publishedAt).toLocaleDateString()}
                </div>
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-link transition-colors mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 line-clamp-3">
                  {post.excerpt}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single Blog Post View (inline sub-component)
// ---------------------------------------------------------------------------

function BlogPostView({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    blogService
      .getBlogPost(slug)
      .then((result) => setPost(result))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <Skeleton width={80} height={14} borderRadius={3} />
        <Skeleton height={280} borderRadius={12} />
        <div className="flex items-center gap-3">
          <Skeleton width={100} height={12} borderRadius={3} />
          <Skeleton width={120} height={12} borderRadius={3} />
        </div>
        <Skeleton width="80%" height={24} borderRadius={4} />
        <div className="space-y-3 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width={`${85 + (i % 3) * 5}%`} height={14} borderRadius={3} />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-lg text-gray-500">Post not found.</p>
        <button
          onClick={() => navigate({ to: "/blog" })}
          className="mt-4 text-link hover:underline text-sm"
        >
          ← Back to Blog
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate({ to: "/blog" })}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-link mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </button>

      {post.coverImage && (
        <div className="aspect-video rounded-xl overflow-hidden mb-6">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
        <span>{post.author}</span>
        <span>•</span>
        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">{post.title}</h1>

      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
      />
    </article>
  );
}
