import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// This function is triggered by entity automations on Review and VendorReview create/update events.
// It calls the moderateReview function to analyze the content.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const internalKey = req.headers.get('x-internal-service-key');
    if (!internalKey || internalKey !== Deno.env.get('INTERNAL_SERVICE_KEY')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();

    const { event, data } = payload;

    if (!data || !event) {
      console.log('Missing event or data in payload');
      return Response.json({ skipped: true });
    }

    const entityName = event.entity_name;
    const entityId = event.entity_id;

    console.log(`Processing ${entityName} ${event.type} event for ID: ${entityId}`);

    // Skip if already moderated (avoid infinite loops on update)
    if (data.moderation_status && data.moderation_status !== 'pending') {
      console.log(`Skipping: ${entityName} ${entityId} already has moderation_status=${data.moderation_status}`);
      return Response.json({ skipped: true, reason: 'already_moderated' });
    }

    // Skip if this is a contractor_response update (don't re-moderate responses)
    if (event.type === 'update' && data.contractor_response && !data.comment) {
      console.log('Skipping: update is a contractor response, not a new review');
      return Response.json({ skipped: true, reason: 'contractor_response_update' });
    }

    let reviewText = '';
    let reviewerEmail = '';
    let reviewerName = '';
    let currentRating = 0;
    let entityType = '';

    if (entityName === 'VendorReview') {
      reviewText = `${data.title || ''} ${data.comment || ''}`.trim();
      reviewerEmail = data.reviewer_email || '';
      reviewerName = data.reviewer_name || '';
      currentRating = data.rating || 0;
      entityType = 'VendorReview';
    } else if (entityName === 'Review') {
      reviewText = data.comment || '';
      reviewerEmail = data.reviewer_email || '';
      reviewerName = data.reviewer_name || '';
      currentRating = data.overall_rating || 0;
      entityType = 'Review';
    } else {
      console.log(`Unknown entity: ${entityName}`);
      return Response.json({ skipped: true, reason: 'unknown_entity' });
    }

    if (!reviewText.trim()) {
      console.log('No review text to moderate');
      return Response.json({ skipped: true, reason: 'no_text' });
    }

    // Call the moderation function
    const result = await base44.asServiceRole.functions.invoke('moderateReview', {
      entity_name: entityName,
      entity_id: entityId,
      review_text: reviewText,
      reviewer_email: reviewerEmail,
      reviewer_name: reviewerName,
      current_rating: currentRating,
      entity_type: entityType
    });

    console.log(`Moderation complete for ${entityName} ${entityId}:`, JSON.stringify(result?.data || result));

    return Response.json({ success: true, result: result?.data || result });

  } catch (error) {
    console.error('onReviewCreatedOrUpdated error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});