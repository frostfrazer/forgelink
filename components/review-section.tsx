'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Star } from 'lucide-react';

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  reviewerName: string | null;
  createdAt: string;
};

function StarRow({ rating, interactive = false, onRate }: {
  rating: number; interactive?: boolean; onRate?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? 'p-0.5 transition-transform hover:scale-110' : 'p-0.5 cursor-default'}
        >
          <Star className={`w-6 h-6 transition-colors ${star <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
        </button>
      ))}
    </div>
  );
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function ReviewSection({ serverId }: { serverId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch existing reviews
  useEffect(() => {
    fetch(`/api/reviews/${serverId}`)
      .then(r => r.json())
      .then(data => setReviews(data.reviews ?? []))
      .catch(() => {})
      .finally(() => setLoadingReviews(false));

    // Check localStorage for spam guard
    const key = `reviewed_${serverId}`;
    if (typeof window !== 'undefined' && localStorage.getItem(key)) {
      setAlreadyReviewed(true);
    }
  }, [serverId]);

  const handleSubmit = async () => {
    if (!rating) { setError('Please select a star rating.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId, rating, comment, reviewerName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to submit.'); return; }
      // Mark as reviewed in localStorage
      localStorage.setItem(`reviewed_${serverId}`, '1');
      setSubmitted(true);
      // Optimistically add to list
      setReviews(prev => [{
        id: Date.now().toString(),
        rating,
        comment: comment || null,
        reviewerName: reviewerName || 'Anonymous',
        createdAt: new Date().toISOString(),
      }, ...prev]);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Reviews</span>
          {reviews.length > 0 && (
            <span className="text-sm font-normal text-gray-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Summary bar */}
        {reviews.length > 0 && (
          <div className="flex gap-6 items-center p-4 bg-gray-50 rounded-xl">
            <div className="text-center shrink-0">
              <p className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
              <StarRow rating={Math.round(avgRating)} />
              <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {ratingDist.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-4 shrink-0">{star}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-4 shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review form */}
        {alreadyReviewed || submitted ? (
          <div className="text-center py-4 bg-green-50 rounded-xl border border-green-200">
            <p className="font-semibold text-green-800">✓ Thanks for your review!</p>
            <p className="text-sm text-green-600 mt-1">It helps other developers choose the right tools.</p>
          </div>
        ) : (
          <div className="space-y-3 border-t pt-5">
            <p className="text-sm font-semibold text-gray-700">Leave a review</p>
            <StarRow rating={rating} interactive onRate={setRating} />
            <input
              type="text"
              placeholder="Your name (optional)"
              value={reviewerName}
              onChange={e => setReviewerName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="What did you think? (optional)"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={!rating || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        )}

        {/* Review list */}
        {!loadingReviews && reviews.length > 0 && (
          <div className="space-y-4 border-t pt-5">
            {reviews.map(r => (
              <div key={r.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(r.reviewerName ?? 'A')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-gray-900">{r.reviewerName ?? 'Anonymous'}</span>
                    <StarRow rating={r.rating} />
                    <span className="text-xs text-gray-400">{timeAgo(r.createdAt)}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {loadingReviews && (
          <div className="text-center py-4 text-sm text-gray-400">Loading reviews…</div>
        )}

        {!loadingReviews && reviews.length === 0 && !submitted && (
          <p className="text-sm text-gray-400 text-center py-2">No reviews yet — be the first!</p>
        )}

      </CardContent>
    </Card>
  );
}
