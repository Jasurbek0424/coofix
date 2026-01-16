"use client";

import { useState } from "react";
import { FiStar, FiTrash2, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useUser } from "@/store/useUser";
import { deleteReview } from "@/api/reviews";
import type { Review } from "@/api/reviews";

interface ReviewListProps {
  reviews: Review[];
  onReviewDeleted: (reviewId: string) => void;
}

export default function ReviewList({
  reviews,
  onReviewDeleted,
}: ReviewListProps) {
  const { user } = useUser();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот отзыв?")) {
      return;
    }

    setDeletingId(reviewId);
    try {
      await deleteReview(reviewId);
      onReviewDeleted(reviewId);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Ошибка при удалении отзыва"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-smoky">
        Отзывов пока нет. Будьте первым!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isOwner = user?._id === review.userId;
        const reviewDate = new Date(review.createdAt).toLocaleDateString(
          "ru-RU",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );

        return (
          <div
            key={review._id}
            className="bg-white dark:bg-dark rounded-lg p-6 border border-gray-200 dark:border-coal"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "text-orange fill-orange"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-smoky">{reviewDate}</span>
                </div>
                {review.userName && (
                  <p className="font-medium text-coal dark:text-foreground">
                    {review.userName}
                  </p>
                )}
              </div>
              {isOwner && (
                <button
                  onClick={() => handleDelete(review._id)}
                  disabled={deletingId === review._id}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                  title="Удалить отзыв"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            {review.comment && (
              <div>
                <div
                  className={`text-gray-600 dark:text-gray-400 whitespace-pre-wrap transition-all duration-300 ${
                    expandedReviews.has(review._id)
                      ? ""
                      : "line-clamp-1"
                  }`}
                >
                  {review.comment}
                </div>
                {review.comment.length > 50 && (
                  <button
                    onClick={() => {
                      const newExpanded = new Set(expandedReviews);
                      if (newExpanded.has(review._id)) {
                        newExpanded.delete(review._id);
                      } else {
                        newExpanded.add(review._id);
                      }
                      setExpandedReviews(newExpanded);
                    }}
                    className="mt-2 flex items-center gap-1 text-orange hover:text-orange/80 text-sm transition-colors"
                  >
                    {expandedReviews.has(review._id) ? (
                      <>
                        <span>Свернуть</span>
                        <FiChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Развернуть</span>
                        <FiChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
            {review.updatedAt !== review.createdAt && (
              <p className="text-xs text-gray-smoky mt-2">
                (Отредактировано)
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
