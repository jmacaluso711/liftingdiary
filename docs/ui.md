# UI Coding Standards

## Component Library

**CRITICAL RULE**: This project uses **shadcn/ui components ONLY**.

- ✅ **DO**: Use shadcn/ui components for all UI elements
- ❌ **DO NOT**: Create custom components
- ❌ **DO NOT**: Use any other UI libraries

All UI components must be sourced from [shadcn/ui](https://ui.shadcn.com/). If a component is needed, install it from shadcn/ui using their CLI:

```bash
npx shadcn@latest add [component-name]
```

## Date Formatting

All date formatting must be done using **date-fns**.

### Date Format Standard

Dates should be formatted using the following pattern:

- **Format**: `do MMM yyyy`
- **Examples**:
  - 1st Sep 2025
  - 2nd Aug 2025
  - 3rd Jan 2026
  - 4th Jun 2024

### Implementation

```typescript
import { format } from 'date-fns';

const formattedDate = format(new Date(), 'do MMM yyyy');
// Output: "1st Sep 2025"
```

### Key Points

- Always use `do` for ordinal day (1st, 2nd, 3rd, etc.)
- Always use `MMM` for abbreviated month name (Jan, Feb, Mar, etc.)
- Always use `yyyy` for 4-digit year
- No commas or additional separators between date parts
