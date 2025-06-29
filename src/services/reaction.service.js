import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Service for handling product reactions (like/dislike)
 */
class ReactionService {
  /**
   * Toggle like/dislike for a product
   * @param {string} productId - Product ID
   * @param {"like"|"dislike"} action - Reaction type
   * @returns {Promise} - Server response
   */
  async toggleReaction(productId, action) {
    try {
      // استخدم reaction_type بدل action حسب متطلبات الـ API
      const response = await apiService.post(
        API_ENDPOINTS.PRODUCTS.REACTION(productId),
        { reaction_type: action }
      );

      // Handle Arabic message response
      if (response.message && response.message.includes('neutral')) {
        return {
          productId,
          action: null,
          success: true,
          message: 'Reaction removed successfully',
          likes: response.likes || 0,
          dislikes: response.dislikes || 0,
          userReaction: null
        };
      }

      return {
        productId,
        action,
        success: true,
        message: action === 'like' ? 'Product liked successfully' : 'Product disliked successfully',
        likes: response.likes || 0,
        dislikes: response.dislikes || 0,
        userReaction: action
      };
    } catch (error) {
      console.error(`Error toggling ${action} for product ${productId}:`, error);
      if (error.response?.status === 404) {
        throw new Error("This feature is not available yet");
      }
      throw error;
    }
  }

  /**
   * Get user reaction for a product
   * @param {string} productId
   * @returns {Promise<{reaction: "like"|"dislike"|null}>}
   */
  async getUserReaction(productId) {
    try {
      const response = await apiService.get(API_ENDPOINTS.PRODUCTS.REACTIONS.GET_USER_REACTION(productId));
      
      // Handle Arabic message response
      if (response.message && response.message.includes('neutral')) {
        return {
          productId,
          reaction: null
        };
      }

      return {
        productId,
        reaction: response.reaction || null
      };
    } catch (error) {
      console.error(`Error fetching user reaction for product ${productId}:`, error);
      // Return null if user hasn't reacted yet
      if (error.response?.status === 404) {
        return {
          productId,
          reaction: null
        };
      }
      throw error;
    }
  }
}

export const reactionService = new ReactionService();