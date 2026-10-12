"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Buttons/Button";
import { FormTextarea } from "@/components/ui/Forms/FormTextarea";
import { FiStar } from "react-icons/fi";
import { useUser } from "@/store/useUser";
import { createOrUpdateReview } from "@/api/reviews";
import type { Review } from "@/api/reviews";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: (review: Review) => void;
  existingReview?: Review | null;
}

export default function ReviewForm({
  productId,
  onReviewSubmitted,
  existingReview,
}: ReviewFormProps) {
  const { isAuthenticated, user } = useUser();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-dark rounded-lg p-6 border border-gray-200 dark:border-coal">
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Чтобы оставить отзыв, пожалуйста,{" "}
          <a href="/login" className="text-orange hover:underline">
            войдите в систему
          </a>
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Пожалуйста, выберите оценку");
      return;
    }

    if (!comment.trim()) {
      setError("Пожалуйста, напишите комментарий");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const review = await createOrUpdateReview({
        productId,
        rating,
        comment: comment.trim(),
      });
      onReviewSubmitted(review);
      // Reset form if it's a new review
      if (!existingReview) {
        setRating(0);
        setComment("");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ошибка при отправке отзыва. Попробуйте еще раз."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark rounded-lg p-6 border border-gray-200 dark:border-coal">
      <h3 className="text-xl font-semibold text-coal dark:text-foreground mb-4">
        {existingReview ? "Редактировать отзыв" : "Оставить отзыв"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-coal dark:text-foreground mb-2">
            Оценка *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`transition-colors ${
                  star <= rating
                    ? "text-orange"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              >
                <FiStar
                  className={`w-8 h-8 ${
                    star <= rating ? "fill-orange" : ""
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-coal dark:text-foreground mb-2">
            Комментарий *
          </label>
          <FormTextarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Напишите ваш отзыв о товаре..."
            rows={4}
            required
            className="w-full"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || rating === 0 || !comment.trim()}
          className="w-full"
        >
          {isSubmitting
            ? "Отправка..."
            : existingReview
            ? "Обновить отзыв"
            : "Отправить отзыв"}
        </Button>
      </form>
    </div>
  );
}
