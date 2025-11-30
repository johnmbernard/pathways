# Theme System

The Pathways app uses a centralized theme system for consistent styling across all components.

## File Structure

```
src/
  theme/
    colors.js       # Color palette definitions
    tokens.js       # Spacing, typography, shadows, borders
    index.js        # Main theme export with component configs
  components/
    ui/
      index.jsx     # Reusable UI components (Button, Badge, Card, Input)
  styles.css        # CSS custom properties and utility classes
```

## Usage

### Using Theme in JS Components

```jsx
import theme from '../theme';

const MyComponent = () => {
  return (
    <div style={{ backgroundColor: theme.colors.primary[600] }}>
      Themed content
    </div>
  );
};
```

### Using CSS Variables

```css
.my-element {
  background-color: var(--color-primary-600);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
```

### Using UI Components

```jsx
import { Button, Badge, Card } from '../components/ui';

<Button variant="primary" size="md" icon={<Plus />}>
  New Item
</Button>

<Badge variant="tier1">Tier 1</Badge>

<Card>
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>
```

## Color System

### Primary Colors
- `primary[50-900]` - Main brand color (blue)

### Neutral Colors
- `neutral[50-900]` - Grays for text, borders, backgrounds

### Semantic Colors
- `success` - Green for success states
- `warning` - Orange/amber for warnings
- `error` - Red for errors

### Tier Colors
- `tier[1-5]` - Distinct colors for hierarchy visualization

## Component Variants

### Button
- `primary` - Blue filled button (default)
- `secondary` - White outlined button
- `danger` - Red filled button
- `ghost` - Transparent with hover

### Badge
- `default`, `primary`, `success`, `warning`, `error`
- `tier1`, `tier2`, `tier3` - For hierarchy tier badges

## Next Steps

1. Gradually migrate existing inline styles to use theme system
2. Add more component variants as needed
3. Consider adding dark mode support
4. Add animation/transition tokens
