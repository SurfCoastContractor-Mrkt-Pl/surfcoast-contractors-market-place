# Performance Optimization Guide

## Quick Wins (Implement First)

### 1. Code Splitting & Lazy Loading
```javascript
// Instead of:
import HeavyComponent from './components/HeavyComponent';

// Use:
const HeavyComponent = React.lazy(() => import('./components/HeavyComponent'));
```

### 2. Optimize Re-renders
```javascript
// Use React.memo for components that don't need frequent updates
export default React.memo(MyComponent);

// Use useCallback for stable function references
const handleClick = useCallback(() => {
  // logic
}, [dependencies]);
```

### 3. Image Optimization
- Use Unsplash CDN with `w=400` query params for thumbnails
- Lazy load images with `loading="lazy"`
- Use WebP format where supported

### 4. Remove Inline Styles
```javascript
// Bad: creates new object on every render
<div style={{ marginBottom: '16px' }}>

// Good: use Tailwind classes
<div className="mb-4">
```

### 5. Bundle Size Reduction
- Remove unused imports
- Replace large libraries with smaller alternatives
- Tree-shake unused code

## Frontend Profiling Checklist

- [ ] Check DevTools Network tab (what's slow to load?)
- [ ] Check DevTools Performance tab (what's slow to render?)
- [ ] Identify components that re-render unnecessarily
- [ ] Look for large inline style objects
- [ ] Check for missing `key` props in lists
- [ ] Profile memory usage (any leaks?)

## Pages Requiring Optimization

### High Priority (Critical)
- `pages/Home` — landing page, should load in <2s
- `pages/ContractorAccount` — frequently accessed, large component
- `pages/ProjectManagement` — complex data rendering

### Medium Priority
- `pages/ContractorFinancialDashboard` — charts and calculations
- `pages/TradeGames` — game rendering
- Search and filter pages

### Lower Priority
- Admin dashboards
- Reporting pages

## Specific Performance Patterns

### Pattern 1: Pagination Instead of Infinite Lists
```javascript
// Bad: loads all items at once
const items = await base44.entities.Item.list();

// Good: paginate
const { data: items, hasMore, loadMore } = usePaginatedList('Item', 20);
```

### Pattern 2: Debounced Search
```javascript
// Use useDebounce hook
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

useEffect(() => {
  if (debouncedSearch) {
    fetchResults(debouncedSearch);
  }
}, [debouncedSearch]);
```

### Pattern 3: Selective Data Fetching
```javascript
// Bad: fetch everything
const contractor = await base44.entities.Contractor.get(id);

// Good: fetch only needed fields (if API supports)
const contractor = await base44.entities.Contractor.filter(
  { id },
  undefined,
  1,
  ['name', 'email', 'rating'] // specific fields
);
```

## Caching Strategy

- **HTTP Cache**: Use browser cache headers for static assets
- **React Query**: Already in use, configure cache time appropriately
- **useFetch Hook**: Provides 5min default cache
- **Local State**: Cache calculated values (memoization)

## Monitoring

Add performance tracking:
```javascript
import { logPerformanceMetrics } from '@/lib/performanceMonitor';

useEffect(() => {
  const start = performance.now();
  
  return () => {
    logPerformanceMetrics({
      page: 'ComponentName',
      duration: performance.now() - start,
      timestamp: new Date().toISOString()
    });
  };
}, []);
```

## Common Anti-Patterns to Avoid

❌ Fetching data in render phase  
❌ Creating functions inside render  
❌ Inline object/array creation in JSX  
❌ Missing dependency arrays in useEffect  
❌ Uncontrolled components that should be controlled  
❌ Loading entire lists at once  
❌ Large inline styles  
❌ Importing entire libraries for one function  

## Testing Performance Improvements

```javascript
// Before
console.time('myComponent');
// ... component code
console.timeEnd('myComponent');

// Or use DevTools Performance tab
// Or use Lighthouse in Chrome DevTools
``