import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Eye, Calendar } from 'lucide-react';

export default function BlogCard({ post }) {
  const publishedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {post.featured_image_url && (
        <div className="h-48 overflow-hidden bg-slate-200">
          <img 
            src={post.featured_image_url} 
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {post.category}
          </Badge>
          {post.tags?.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <Link to={createPageUrl('BlogDetail') + `?slug=${post.slug}`}>
          <h3 className="font-semibold text-slate-900 hover:text-amber-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-sm text-slate-600 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {publishedDate}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {post.views_count} views
          </div>
        </div>

        <div className="text-xs text-slate-500">
          By {post.author_name}
        </div>
      </CardContent>
    </Card>
  );
}