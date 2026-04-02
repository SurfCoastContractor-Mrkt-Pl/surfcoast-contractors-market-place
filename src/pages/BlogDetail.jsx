import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useSearchParams, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Calendar, User, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

export default function BlogDetail() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('slug');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => base44.entities.BlogPost.filter({ slug }),
    enabled: !!slug,
  });

  const post = posts?.[0];

  const { mutate: trackView } = useMutation({
    mutationFn: () => base44.entities.BlogPost.update(post.id, {
      views_count: (post.views_count || 0) + 1
    }),
  });

  useEffect(() => {
    if (post && post.id) {
      trackView();
    }
  }, [post?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-600 text-lg">Article not found</p>
        <Link to={createPageUrl('Blog')}>
          <Button variant="outline" className="mt-4">Back to Blog</Button>
        </Link>
      </div>
    );
  }

  const publishedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link to={createPageUrl('Blog')}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-6 text-slate-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{publishedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{post.views_count} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.featured_image_url && (
        <div className="h-96 overflow-hidden bg-slate-200">
          <img 
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article className="prose prose-slate max-w-none">
          <ReactMarkdown
            components={{
              h2: ({ children }) => <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>,
              h3: ({ children }) => <h3 className="text-2xl font-bold mt-6 mb-3">{children}</h3>,
              p: ({ children }) => <p className="text-lg text-slate-700 leading-relaxed mb-4">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>,
              li: ({ children }) => <li className="text-slate-700">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-amber-500 pl-4 py-2 my-4 bg-amber-50 italic text-slate-700">
                  {children}
                </blockquote>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm font-semibold text-slate-600 mb-3">Tags</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}