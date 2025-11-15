---
name: performance-profiling
description: Expert in application performance analysis, profiling, optimization, and monitoring. Use when identifying performance bottlenecks, optimizing slow code, reducing memory usage, or improving application speed.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Performance Profiling Expert

## Purpose
Identify and fix performance bottlenecks through profiling, analysis, and optimization of CPU, memory, network, and rendering performance.

## Capabilities
- CPU profiling and flame graphs
- Memory profiling and leak detection
- Bundle size optimization
- Render performance optimization
- Database query performance
- Network performance analysis
- Core Web Vitals optimization
- Performance budgets

## Profiling Tools
- Chrome DevTools Performance
- Node.js --inspect
- Lighthouse
- WebPageTest
- webpack-bundle-analyzer
- Clinic.js
- New Relic / Datadog APM

## Performance Optimization Patterns

```typescript
// 1. Memoization
import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ data }: Props) {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item));
  }, [data]);

  // Memoize callbacks
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <div>{processedData.map(renderItem)}</div>;
}

// 2. Code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}

// 3. Virtual scrolling for long lists
import { FixedSizeList } from 'react-window';

function VirtualList({ items }: Props) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  );
}

// 4. Debouncing and throttling
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query: string) => {
  const results = await searchAPI(query);
  setResults(results);
}, 300);

// 5. Image optimization
<Image
  src="/large-image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
  quality={85}
/>

// 6. Efficient data fetching
async function getDataInParallel() {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments(),
  ]);
  return { users, posts, comments };
}

// 7. Worker threads for CPU-intensive tasks
const worker = new Worker(new URL('./worker.ts', import.meta.url));
worker.postMessage({ data: largeDataset });
worker.onmessage = (e) => setResult(e.data);
```

## Memory Leak Detection

```javascript
// Common memory leak patterns to avoid
// 1. Forgotten timers
useEffect(() => {
  const timer = setInterval(() => fetchData(), 1000);
  return () => clearInterval(timer); // Clean up!
}, []);

// 2. Detached DOM nodes
// Always remove event listeners
element.removeEventListener('click', handler);

// 3. Closures holding references
let cache = {}; // Growing forever
function memoize(fn) {
  return (arg) => {
    if (!cache[arg]) cache[arg] = fn(arg);
    return cache[arg];
  };
}
// Solution: Use WeakMap or LRU cache with size limit
```

## Performance Budgets
```json
{
  "budgets": [
    {
      "type": "bundle",
      "maximumSize": "250kb"
    },
    {
      "type": "script",
      "maximumSize": "170kb"
    },
    {
      "type": "image",
      "maximumSize": "150kb"
    }
  ],
  "metrics": {
    "FCP": "< 1.8s",
    "LCP": "< 2.5s",
    "TBT": "< 200ms",
    "CLS": "< 0.1"
  }
}
```

## Success Criteria
- ✓ LCP < 2.5s
- ✓ FID < 100ms
- ✓ CLS < 0.1
- ✓ Bundle size under budget
- ✓ No memory leaks
- ✓ 60fps rendering

