# UI Performance Optimization Pattern

## ✅ Pattern Applied to Devices Page

The Devices page now serves as the **reference implementation** for all other pages.

### Pattern to Apply:

```typescript
// 1. Import React for CSSProperties type
import React, { useEffect, useState, useCallback, useMemo } from 'react'

// 2. Extract style constants (before component)
const ACTION_BUTTON_STYLE: React.CSSProperties = { padding: '7px 10px', fontSize: '11px' }
const ACTION_CONTAINER_STYLE: React.CSSProperties = { display: 'flex', gap: '8px', flexWrap: 'wrap' }

// 3. Inside component, after useEffect hooks, add:

// Memoize filter array
const filterItems = useMemo<FilterItem[]>(() => [
  // filter definitions
], [searchQuery, otherDependencies])

// Memoize stats array  
const statsItems = useMemo(() => stats ? [
  // stats definitions
] : undefined, [stats])

// Memoize column definitions
const columns = useMemo<Column<Type>[]>(() => [
  // column definitions
], [projectId, otherDependencies])

// Memoize handlers
const handleRowClick = useCallback((item: Type) => {
  // handler logic
}, [])

const paginationConfig = useMemo(() => totalPages > 1 ? {
  currentPage: page,
  totalPages,
  onPageChange: setPage,
} : undefined, [totalPages, page])

// 4. Use memoized values in JSX
<FilterBar filters={filterItems} stats={statsItems} />
<DataTable columns={columns} onRowClick={handleRowClick} pagination={paginationConfig} />
```

## 📋 Status

- ✅ **Devices** - COMPLETE (reference implementation)
- 🔄 **All Other Pages** - Need to apply same pattern

## 🎯 Next Steps

Apply this exact pattern to all remaining 16 pages.

