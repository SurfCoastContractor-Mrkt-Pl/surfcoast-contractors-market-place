import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Words/patterns that are clearly inappropriate (hate speech, threats, slurs, explicit content)
// Excited positive profanity (e.g. "damn good job!") is acceptable per policy.
const INAPPROPRIATE_PATTERN_PROMPT = `
You are a content moderation AI for a contractor and vendor marketplace platform.

Analyze the following review/testimonial text and determine if it contains INAPPROPRIATE content.

INAPPROPRIATE means ANY of the following:
- Hate speech, slurs, or discriminatory language targeting race, gender, religion, sexual orientation, etc.
- Threats or calls to violence
- Explicit sexual content
- Personal attacks on someone's character unrelated to the service provided (e.g. "this person is a criminal", "they are a terrible human being")
- False factual claims clearly intended to defame (e.g. claiming illegal activity without basis)
- Spam or advertising for other services

NOT inappropriate (acceptable to keep):
- Profanity used to express excitement or enthusiasm about good work (e.g. "damn good job!", "holy shit they were amazing!")
- Honest negative feedback about the quality of work, communication, or professionalism
- Complaints about pricing or scheduling
- Any legitimate criticism of the business service

Respond in JSON with this exact structure:
{
  "is_inappropriate": boolean,
  "reason": "brief explanation if inappropriate, or null if appropriate",
  "severity": "high" | "medium" | "low" | null
}
`;

async function recalculateContractorRating(base44, contractorId, contractorEmail) {
  try {
    // Fetch all non-pending reviews for this contractor
    const allReviews = await base44.asServiceRole.entities.Review.filter({
      contractor_id: contractorId
    });

    // Only include approved or flagged (penalty) reviews, exclude pending
    const countableReviews = allReviews.filter(r =>
      r.moderation_status === 'approved' || r.moderation_status === 'flagged_inappropriate'
    );

    if (countableReviews.length === 0) return;

    const totalRating = countableReviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0);
    const avgRating = Math.round((totalRating / countableReviews.length) * 10) / 10;

    // Update the contractor's rating
    const contractors = await base44.asServiceRole.entities.Contractor.filter({ id: contractorId });
    if (contractors.length > 0) {
      await base44.asServiceRole.entities.Contractor.update(contractors[0].id, {
        rating: avgRating,
        reviews_count: countableReviews.length
      });
      console.log(`Updated contractor ${contractorId} rating to ${avgRating} (${countableReviews.length} reviews)`);
    }
  } catch (err) {
    console.error('Error recalculating contractor rating:', err.message);
  }
}

async function recalculateShopRating(base44, shopId) {
  try {
    const allReviews = await base44.asServiceRole.entities.VendorReview.filter({ shop_id: shopId });

    const countableReviews = allReviews.filter(r =>
      r.moderation_status === 'approved' || r.moderation_status === 'flagged_inappropriate'
    );

    if (countableReviews.length === 0) return;

    const totalRating = countableReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const avgRating = Math.round((totalRating / countableReviews.length) * 10) / 10;

    const shops = await base44.asServiceRole.entities.MarketShop.filter({ id: shopId });
    if (shops.length > 0) {
      await base44.asServiceRole.entities.MarketShop.update(shops[0].id, {
        average_rating: avgRating,
        total_ratings: countableReviews.length
      });
      console.log(`Updated shop ${shopId} rating to ${avgRating} (${countableReviews.length} reviews)`);
    }
  } catch (err) {
    console.error('Error recalculating shop rating:', err.message);
  }
}

async function sendWarningEmail(base44, reviewerEmail, reviewerName, reviewType) {
  try {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: reviewerEmail,
      subject: 'Your review has been removed — Community Guidelines Violation',
      body: `Hi ${reviewerName},

We wanted to let you know that a ${reviewType} you recently submitted has been automatically removed by our content moderation system.

Our community guidelines require that all reviews remain professional and focused on the service experience. Your review contained content that violated these guidelines.

As a result:
• Your review has been hidden from public view
• A 2-star rating has been recorded in its place to maintain fairness
• Repeated violations may result in account restrictions

We encourage you to resubmit an honest review focused on your actual service experience. Constructive feedback — even negative — is always welcome as long as it remains professional.

If you believe this was an error, please contact our support team.

Thank you for being part of our community.

— The SurfCoast Wave Team`
    });
    console.log(`Warning email sent to ${reviewerEmail}`);
  } catch (err) {
    console.error('Error sending warning email:', err.message);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const internalKey = Deno.env.get('INTERNAL_SERVICE_KEY');
    const authHeader = req.headers.get('authorization') || '';
    
    if (!internalKey || authHeader !== `Bearer ${internalKey}`) {
      console.warn('Unauthorized moderateReview call');
      return Response.json({ error: 'Forbidden: Invalid internal service key' }, { status: 403 });
    }

    const payload = await req.json();

    const { entity_name, entity_id, review_text, reviewer_email, reviewer_name, current_rating, entity_type } = payload;

    if (!entity_id || !review_text) {
      return Response.json({ error: 'Missing required fields: entity_id, review_text' }, { status: 400 });
    }

    console.log(`Moderating ${entity_type || entity_name} review ${entity_id} by ${reviewer_email}`);

    // Call LLM for content moderation
    const moderationResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${INAPPROPRIATE_PATTERN_PROMPT}\n\nReview text to analyze:\n"${review_text}"`,
      response_json_schema: {
        type: 'object',
        properties: {
          is_inappropriate: { type: 'boolean' },
          reason: { type: 'string' },
          severity: { type: 'string' }
        }
      }
    });

    console.log('Moderation result:', JSON.stringify(moderationResult));

    const isInappropriate = moderationResult?.is_inappropriate === true;

    if (entity_type === 'VendorReview') {
      // Handle VendorReview moderation
      const reviews = await base44.asServiceRole.entities.VendorReview.filter({ id: entity_id });
      if (reviews.length === 0) {
        return Response.json({ error: 'VendorReview not found' }, { status: 404 });
      }
      const review = reviews[0];

      if (isInappropriate) {
        const originalRating = review.rating;
        const penaltyRating = 2;

        await base44.asServiceRole.entities.VendorReview.update(entity_id, {
          status: 'hidden',
          flagged: true,
          moderation_status: 'flagged_inappropriate',
          moderation_reason: moderationResult.reason,
          original_rating: originalRating,
          rating: penaltyRating,
          moderation_penalty_applied: true
        });

        console.log(`VendorReview ${entity_id} flagged. Original rating: ${originalRating}, Penalty rating: ${penaltyRating}`);

        // Recalculate shop rating
        await recalculateShopRating(base44, review.shop_id);

        // Send warning email
        await sendWarningEmail(base44, review.reviewer_email, review.reviewer_name, 'vendor review');
      } else {
        // Approve the review
        await base44.asServiceRole.entities.VendorReview.update(entity_id, {
          moderation_status: 'approved',
          status: 'visible'
        });

        await recalculateShopRating(base44, review.shop_id);
      }

    } else {
      // Handle Review (contractor/customer) moderation
      const reviews = await base44.asServiceRole.entities.Review.filter({ id: entity_id });
      if (reviews.length === 0) {
        return Response.json({ error: 'Review not found' }, { status: 404 });
      }
      const review = reviews[0];

      if (isInappropriate) {
        const originalRating = review.overall_rating;
        const penaltyRating = 2;

        await base44.asServiceRole.entities.Review.update(entity_id, {
          moderation_status: 'flagged_inappropriate',
          moderation_reason: moderationResult.reason,
          original_rating: originalRating,
          overall_rating: penaltyRating,
          moderation_penalty_applied: true,
          verified: false
        });

        console.log(`Review ${entity_id} flagged. Original rating: ${originalRating}, Penalty rating: ${penaltyRating}`);

        // Recalculate contractor rating if applicable
        if (review.contractor_id) {
          await recalculateContractorRating(base44, review.contractor_id, review.contractor_email);
        }

        // Send warning email
        await sendWarningEmail(base44, review.reviewer_email, review.reviewer_name, 'review');
      } else {
        // Approve the review
        await base44.asServiceRole.entities.Review.update(entity_id, {
          moderation_status: 'approved'
        });

        if (review.contractor_id) {
          await recalculateContractorRating(base44, review.contractor_id, review.contractor_email);
        }
      }
    }

    return Response.json({
      success: true,
      is_inappropriate: isInappropriate,
      reason: moderationResult?.reason || null
    });

  } catch (error) {
    console.error('moderateReview error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});