import { api, apiAuth } from "./axios";

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  success: boolean;
  reviews?: Review[];
  review?: Review;
  message?: string;
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
}

// GET /reviews/{productId} - Получить все отзывы на товар
export async function getReviews(productId: string): Promise<Review[]> {
  try {
    const response = await api.get<ReviewResponse>(`/reviews/${productId}`);
    if (response.data.success && response.data.reviews) {
      return response.data.reviews;
    }
    return [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

// POST /reviews - Оставить/обновить отзыв на товар (требует авторизации)
export async function createOrUpdateReview(
  data: CreateReviewData
): Promise<Review> {
  const response = await apiAuth.post<ReviewResponse>("/reviews", data);
  if (!response.data.success || !response.data.review) {
    throw new Error(response.data.message || "Failed to create review");
  }
  return response.data.review;
}

// DELETE /reviews/{reviewId} - Удалить свой отзыв (требует авторизации)
export async function deleteReview(reviewId: string): Promise<void> {
  const response = await apiAuth.delete<ReviewResponse>(`/reviews/${reviewId}`);
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete review");
  }
}
