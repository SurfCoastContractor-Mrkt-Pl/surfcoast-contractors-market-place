# Platform Fundamentals Implementation Guide

## What's Been Implemented

### 1. **Analytics Tracking** ✅
- **Location**: `src/lib/analytics.js`
- Tracks user events: location ratings, selections, searches
- Events logged to Base44 analytics dashboard
- **Usage**: 
  ```javascript
  import { trackEvent, EVENTS } from '@/lib/analytics';
  trackEvent(EVENTS.LOCATION_RATED, { location: 'name', rating: 5 });
  ```

### 2. **Error Logging** ✅
- **Location**: `src/lib/errorLogger.js`
- All errors logged to `ErrorLog` entity for admin review
- Categorized errors (auth, validation, network, etc.)
- **Usage**:
  ```javascript
  import { logError } from '@/lib/errorLogger';
  await logError('Failed to save', 'rating', { error: err.message });
  ```

### 3. **Real-time Subscriptions** ✅
- **Location**: `src/hooks/useRealTimeEntity.js`
- Subscribe to entity changes in real-time
- Auto-update UI without page refresh
- **Usage**:
  ```javascript
  const { data, loading } = useRealTimeEntity('SwapMeetLocationRating', [], { location_type: 'swap_meet' });
  ```

### 4. **Query Optimization** ✅
- **Location**: `src/lib/queryOptimization.js`
- Pagination support with limit
- Filter & sort applied at query level (not client-side)
- Updated pages to use `.filter()` instead of `.list()`
- **Modified files**:
  - `pages/FarmersMarketRatings.jsx`
  - `pages/SwapMeetRatings.jsx`
  - `components/locations/LocationSelector.jsx`

### 5. **File Upload Validation** ✅
- **Location**: `src/lib/fileUtils.js`
- Validates file types (images, documents)
- Enforces 5MB size limit
- Sanitizes filenames
- **Usage**:
  ```javascript
  import { uploadFile } from '@/lib/fileUtils';
  const url = await uploadFile(file, 'image');
  ```

### 6. **Admin Automations Ready** ⚙️
Backend functions created for:
- **`onRatingCreated.js`**: Logs activity + sends alerts for low ratings
- **`cleanupExpiredSessions.js`**: Scheduled cleanup of expired chat sessions

To activate automations:
1. Deploy the functions (they're in `src/functions/`)
2. Create automations via dashboard:
   - Entity automation: `SwapMeetLocationRating` on `create` → `onRatingCreated`
   - Scheduled automation: Daily at 2am → `cleanupExpiredSessions`

---

## Quick Integration Examples

### Track a page view
```javascript
import { trackEvent, EVENTS } from '@/lib/analytics';

useEffect(() => {
  trackEvent(EVENTS.RATING_VIEWED, { type: 'farmers_market' });
}, []);
```

### Use real-time data
```javascript
import { useRealTimeEntity } from '@/hooks/useRealTimeEntity';

function RatingsList() {
  const { data: ratings, loading } = useRealTimeEntity('SwapMeetLocationRating');
  return loading ? <p>Loading...</p> : <div>{ratings.map(r => ...)}</div>;
}
```

### Validate uploads
```javascript
import { uploadFile } from '@/lib/fileUtils';

async function handleUpload(file) {
  try {
    const url = await uploadFile(file, 'image');
    // Use url...
  } catch (error) {
    console.error(error.message); // "Invalid file type" or "File too large"
  }
}
```

### Log errors
```javascript
import { logError } from '@/lib/errorLogger';

try {
  // some operation
} catch (error) {
  await logError('Operation failed', 'payment', { 
    amount: 100,
    error: error.message 
  });
}
```

---

## What's Missing (Optional Future)

- AI Agents (would need to configure Notion/HubSpot sync)
- Service role operations (not needed yet for this app)
- Email workflows (would need sendEmail automation setup)
- Data migrations (no schema changes needed currently)

---

## Testing

1. **Analytics**: Go to dashboard → Analytics to see tracked events
2. **Error logging**: Create error, check `ErrorLog` entity
3. **Real-time**: Open 2 tabs, rate a location in one → instantly appears in other
4. **Query optimization**: Check network tab → query filters applied server-side
5. **File validation**: Try uploading >5MB or non-image file → see error