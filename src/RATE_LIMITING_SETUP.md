# Rate Limiting & Request Throttling System

## Overview
Complete rate limiting infrastructure protecting API endpoints from abuse with configurable limits, tracking, and admin controls.

## Components

### 1. Frontend Rate Limiter (`lib/rateLimiter.js`)
Client-side rate limiting, throttling, and debouncing utilities.

**Features:**
- In-memory rate limit tracking
- Throttle and debounce functions
- Exponential backoff retry logic
- Request queue for sequential execution
- Auto-cleanup of old data

**Usage:**
```javascript
import {
  frontendLimiter,
  throttle,
  debounce,
  retryWithBackoff,
  RequestQueue,
  checkRateLimit
} from '@/lib/rateLimiter';

// Frontend rate limiting
if (!frontendLimiter.isAllowed('endpoint:user123', 5, 60000)) {
  console.error('Rate limit exceeded');
}

// Get status
const status = frontendLimiter.getStatus('endpoint:user123', 5);
// { remaining: 3, limit: 5, resetIn: 45000 }

// Throttle expensive operations
const throttledSearch = throttle(handleSearch, 300);
input.addEventListener('input', throttledSearch);

// Debounce form submissions
const debouncedSubmit = debounce(handleSubmit, 500);
form.addEventListener('submit', debouncedSubmit);

// Retry with backoff
await retryWithBackoff(
  () => base44.functions.invoke('risky-operation', {}),
  { maxRetries: 3, baseDelay: 1000 }
);

// Queue requests sequentially
const queue = new RequestQueue(1); // 1 at a time
await queue.add(() => api.create(...));
await queue.add(() => api.delete(...));
```

### 2. Backend Rate Limiter (`functions/checkRateLimit.js`)
Server-side rate limit enforcement with tracking.

**Endpoint Configuration:**
- `createQuoteRequest`: 5 per minute
- `submitMessage`: 20 per minute
- `createPayment`: 10 per hour
- `submitReview`: 3 per hour
- `createJob`: 10 per day
- Default: 100 per minute

**Returns:**
```javascript
// Allowed
{
  allowed: true,
  endpoint: "createQuoteRequest",
  remaining: 4,
  limit: 5,
  window: "minute",
  reset_at: "2026-03-30T12:15:00Z"
}

// Blocked (HTTP 429)
{
  allowed: false,
  reason: "Rate limit exceeded",
  limit: 5,
  window: "minute",
  blocked_until: "2026-03-30T12:16:00Z",
  retry_after: 60
}
```

### 3. Rate Limit Tracker Entity (`entities/RateLimitTracker.json`)
Tracks requests and violations per endpoint/user/IP.

**Key Fields:**
- `endpoint` - API endpoint being limited
- `user_id` - User ID (if authenticated)
- `ip_address` - Client IP address
- `request_count` - Requests in current window
- `limit` - Configured limit
- `window_type` - minute/hour/day
- `blocked` - Whether requests currently blocked
- `violation_count` - Total violations
- `blocked_until` - When blocking expires

### 4. Admin Dashboard
Enhanced monitoring dashboard with error and rate limit tabs.

**Features:**
- View blocked endpoints
- Track violation history
- Manually unblock users/IPs
- Add admin notes
- Real-time stats

## Usage Examples

### Protect an API endpoint
```javascript
// In a backend function
const rateCheck = await checkRateLimit('createQuoteRequest', userId);
if (!rateCheck.allowed) {
  return Response.json(rateCheck, { status: 429 });
}

// Process request...
```

### Throttle search input
```javascript
import { throttle } from '@/lib/rateLimiter';

const handleSearch = (query) => {
  // Expensive search logic
};

const throttledSearch = throttle(handleSearch, 500);

searchInput.addEventListener('input', (e) => {
  throttledSearch(e.target.value);
});
```

### Debounce form submission
```javascript
import { debounce } from '@/lib/rateLimiter';

const handleSubmit = async (formData) => {
  await base44.functions.invoke('submitForm', formData);
};

const debouncedSubmit = debounce(handleSubmit, 1000);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  debouncedSubmit(new FormData(form));
});
```

### Retry with exponential backoff
```javascript
import { retryWithBackoff } from '@/lib/rateLimiter';

const result = await retryWithBackoff(
  () => fetchPaymentStatus(paymentId),
  {
    maxRetries: 5,
    baseDelay: 500,
    maxDelay: 10000,
    backoffMultiplier: 2
  }
);
```

### Sequential request processing
```javascript
import { RequestQueue } from '@/lib/rateLimiter';

const queue = new RequestQueue(1); // 1 concurrent request

for (const item of items) {
  await queue.add(() =>
    base44.functions.invoke('processItem', { item })
  );
}
```

## Rate Limit Configuration

### Default Limits
Modify in `checkRateLimit.js`:
```javascript
const limits = {
  'createQuoteRequest': { limit: 5, window: 'minute' },
  'submitMessage': { limit: 20, window: 'minute' },
  'createPayment': { limit: 10, window: 'hour' },
  'submitReview': { limit: 3, window: 'hour' },
  'createJob': { limit: 10, window: 'day' },
  'default': { limit: 100, window: 'minute' }
};
```

### Per-user limits
Can be customized by passing `userId` to `checkRateLimit`.

### IP-based limits
Used for unauthenticated requests.

## Response Headers
Rate limit info included in responses:
- `X-RateLimit-Limit` - Request limit
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - When limit resets
- `Retry-After` - Seconds to wait (on 429)

## Monitoring

### View blocked requests
- Navigate to `/error-monitoring`
- Click "Rate Limits" tab
- See all blocked endpoints

### Unblock users
- Find blocked record
- Click "Unblock"
- Optionally add admin notes

### Track violations
- `violation_count` shows total violations
- `last_violation_at` shows when last exceeded
- Can query by user or IP

## Best Practices

1. **Set appropriate limits** - Too strict blocks legitimate use, too loose doesn't protect
2. **Monitor patterns** - Review blocked endpoints for abuse patterns
3. **Use throttle/debounce** - Prevent accidental rapid requests
4. **Retry gracefully** - Use exponential backoff on rate limits
5. **Communicate limits** - Show users remaining requests
6. **Different limits by action** - More restrictive for expensive operations
7. **Track by context** - Use user ID when authenticated, IP when not

## Troubleshooting

**Users getting blocked:**
- Check configured limits are appropriate
- Review violation patterns for abuse
- Consider whitelisting legitimate heavy users

**Rate limiter not working:**
- Verify `checkRateLimit` function deployed
- Check RateLimitTracker entity exists
- Verify admin can access dashboard

**High violation count:**
- May indicate bot activity
- Review IP addresses for patterns
- Consider stricter limits for specific endpoint

## Next Steps

1. Review and adjust limits for your endpoints
2. Integrate `checkRateLimit` into sensitive functions
3. Add throttle/debounce to high-frequency UI actions
4. Monitor dashboard for abuse patterns
5. Adjust limits based on usage patterns