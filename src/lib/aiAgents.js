import { base44 } from '@/api/base44Client';

/**
 * AI Agent utilities for HubSpot and Notion sync
 */

export const aiAgents = {
  /**
   * Sync review to HubSpot as deal
   */
  async syncReviewToHubSpot(review) {
    try {
      return await base44.functions.invoke('syncReviewToHubSpot', {
        review_id: review.id,
        contractor_email: review.contractor_email,
        rating: review.overall_rating,
        comment: review.comment,
      });
    } catch (error) {
      console.error('HubSpot sync failed:', error);
      throw error;
    }
  },

  /**
   * Create Notion page for scope of work
   */
  async createNotionPageForScope(scope) {
    try {
      return await base44.functions.invoke('notionProjectDoc', {
        scope_id: scope.id,
        job_title: scope.job_title,
        contractor_name: scope.contractor_name,
        customer_email: scope.customer_email,
        cost_amount: scope.cost_amount,
      });
    } catch (error) {
      console.error('Notion page creation failed:', error);
      throw error;
    }
  },

  /**
   * Auto-respond to vendor inquiry with HubSpot data
   */
  async generateAutoResponse(inquiry) {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional response to this vendor inquiry:\n\n${inquiry.message}\n\nKeep it under 100 words and friendly.`,
        model: 'gemini_3_flash',
      });
      return response;
    } catch (error) {
      console.error('Auto-response generation failed:', error);
      throw error;
    }
  },

  /**
   * Sync contact to HubSpot when created
   */
  async syncContactToHubSpot(email, name) {
    try {
      return await base44.functions.invoke('syncContactToHubSpot', {
        email,
        name,
      });
    } catch (error) {
      console.error('Contact sync failed:', error);
      throw error;
    }
  },

  /**
   * Create HubSpot deal from job completion
   */
  async createDealFromJobCompletion(scope) {
    try {
      return await base44.functions.invoke('syncDealToHubSpot', {
        scope_id: scope.id,
        contractor_email: scope.contractor_email,
        job_title: scope.job_title,
        amount: scope.contractor_payout_amount,
      });
    } catch (error) {
      console.error('Deal creation failed:', error);
      throw error;
    }
  },

  /**
   * Recommend contractors using AI
   */
  async recommendContractors(jobDescription, location, budget) {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this job:\n\nTitle: ${jobDescription}\nLocation: ${location}\nBudget: $${budget}\n\nWhat trade skills are most relevant? List top 3.`,
        model: 'gemini_3_flash',
      });
      return response;
    } catch (error) {
      console.error('Recommendation generation failed:', error);
      throw error;
    }
  },

  /**
   * Generate job description from photo AI analysis
   */
  async generateJobFromPhotos(photoUrls) {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: 'Look at these before/after photos of work completed. Write a detailed job description for similar future work.',
        file_urls: photoUrls,
        model: 'gpt_5',
      });
      return response;
    } catch (error) {
      console.error('Job generation failed:', error);
      throw error;
    }
  },
};