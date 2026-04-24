'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import { Heart, MessageCircle, Send, Loader2, Rss } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function FeedPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  useEffect(() => { fetch('/api/feed').then(r => r.json()).then(setPosts).finally(() => setLoading(false)); }, []);

  const createPost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    const res = await fetch('/api/feed', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newPost }),
    });
    if (res.ok) {
      const post = await res.json();
      setPosts(prev => [post, ...prev]);
      setNewPost('');
      addToast('Post published!', 'success');
    }
    setPosting(false);
  };

  const toggleLike = async (postId: string) => {
    const res = await fetch(`/api/feed/${postId}/like`, { method: 'POST' });
    const data = await res.json();
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const likes = data.liked
        ? [...p.likes, { userId: session?.user?.id }]
        : p.likes.filter((l: any) => l.userId !== session?.user?.id);
      return { ...p, likes, _count: { ...p._count, likes: likes.length } };
    }));
  };

  const addComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    const res = await fetch(`/api/feed/${postId}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const comment = await res.json();
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment], _count: { ...p._count, comments: p._count.comments + 1 } } : p));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    }
  };

  const isLiked = (post: any) => post.likes?.some((l: any) => l.userId === session?.user?.id);
  const initials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="spinner w-8 h-8 border-[3px]" /></div>;

  return (
    <div className="max-w-[640px] mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-notion-text mb-6">Feed</h1>

      {/* Compose */}
      <div className="bg-notion-bg border border-notion-border rounded-lg p-5 mb-5">
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-full bg-notion-blue-bg text-notion-blue flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {initials(session?.user?.name || '')}
          </div>
          <textarea
            value={newPost} onChange={e => setNewPost(e.target.value)}
            className="flex-1 border-none bg-transparent text-notion-text text-sm outline-none resize-none min-h-[60px] leading-relaxed placeholder:text-notion-text-placeholder"
            placeholder="Share something with the community..."
          />
        </div>
        <div className="flex items-center justify-end pt-3 border-t border-notion-border-light mt-3">
          <button onClick={createPost} disabled={posting || !newPost.trim()} className="btn-primary text-sm">
            {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Post
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-notion-bg border border-notion-border rounded-lg p-5 hover:shadow-sm transition-shadow">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-notion-blue-bg text-notion-blue flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {initials(post.author?.name)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-notion-text">{post.author?.name}</div>
                <div className="text-xs text-notion-text-tertiary">
                  {post.author?.role?.replace('_', ' ')} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>

            {/* Content */}
            <p className="text-[15px] leading-relaxed text-notion-text whitespace-pre-wrap mb-3">{post.content}</p>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-notion-border-light">
              <button
                onClick={() => toggleLike(post.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-all ${isLiked(post) ? 'text-notion-red' : 'text-notion-text-secondary hover:text-notion-text hover:bg-notion-bg-hover'}`}
              >
                <Heart size={16} fill={isLiked(post) ? 'currentColor' : 'none'} />
                {post._count?.likes || 0}
              </button>
              <button
                onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-sm text-notion-text-secondary hover:text-notion-text hover:bg-notion-bg-hover transition-all"
              >
                <MessageCircle size={16} /> {post._count?.comments || 0}
              </button>
            </div>

            {/* Comments */}
            {expandedComments[post.id] && (
              <div className="mt-3 pt-3 border-t border-notion-border-light">
                {post.comments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-notion-bg-tertiary text-notion-text-tertiary flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">
                      {initials(comment.user?.name)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-notion-text">{comment.user?.name}</span>
                      <p className="text-sm text-notion-text-secondary">{comment.content}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input
                    value={commentInputs[post.id] || ''}
                    onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
                    className="notion-input text-xs" placeholder="Write a comment..."
                  />
                  <button onClick={() => addComment(post.id)} className="btn-primary text-xs px-3">Post</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-16">
            <Rss size={40} className="mx-auto mb-4 text-notion-text-tertiary opacity-40" />
            <h3 className="text-lg font-semibold text-notion-text mb-2">No posts yet</h3>
            <p className="text-sm text-notion-text-secondary">Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}
