# Skill: Supabase SSR & Database Rules

## 1. Context Trigger

Apply these rules whenever working with data fetching, authentication, or `supabase` client instances.

## 2. Server-Side First

* All data fetching MUST occur in the frontmatter `---` of `.astro` files (Server-Side) or within Astro API endpoints (`src/pages/api/`).
* Never expose the `SUPABASE_SERVICE_ROLE_KEY` to the client.

## 3. Client Instance Pattern

If a React component needs Supabase (e.g., for real-time subscriptions), you must suggest using the public anonymous key explicitly.

**Correct Pattern (Astro Server-Side):**

```astro
---
import { supabase } from '../lib/supabase';

// Suggest fetching data before render
const { data, error } = await supabase
  .from('reservations')
  .select('*')
  .eq('status', 'active');
---
```

## 4. Type Safety

Always use **TypeScript** interfaces mapped to the Supabase schema. Do not suggest the  ``any`` type for database rows.
