# Styling Guide

## Tailwind 4 Configuration

### CSS Variables Approach

This project uses Tailwind 4's CSS variables approach defined in `app/globals.css`.

### Theme Colors (Minimalist Warm Palette)

```css
/* Warm neutral base */
--background: #FAFAF8 (warm off-white)
--foreground: #1A1816 (warm near-black)

/* Primary: Burnt sienna/terracotta */
--primary: #C7522A
--primary-foreground: #FAFAF8

/* Secondary: Deep teal */
--secondary: #2C5F5D
--secondary-foreground: #FAFAF8

/* Accent: Same as primary (minimalist approach) */
--accent: #C7522A
--accent-foreground: #FAFAF8

/* Muted */
--muted: #E8E6E1 (warm gray)
--muted-foreground: #706B63

/* Destructive */
--destructive: #D93F3F
--destructive-foreground: #FFFFFF

/* Borders & Inputs */
--border: #D6D3CC
--input: #F2F1EE
--ring: #C7522A
```

### Accent Colors (Minimal Palette)

```css
--warm-terracotta: #C7522A
--deep-teal: #2C5F5D
--soft-sage: #A4B4A5
--warm-sand: #D6C8B5
```

### Usage in Components

```typescript
// Use semantic color names
<div className="bg-background text-foreground">

// Primary actions
<Button className="bg-primary text-primary-foreground">

// Secondary actions
<Button className="bg-secondary text-secondary-foreground">

// Destructive actions
<Button className="bg-destructive text-destructive-foreground">

// Muted text
<p className="text-muted-foreground">
```

## Typography

### Font Families

```css
--font-sans: 'DM Sans' (body text - clean, slightly quirky)
--font-display: 'Fraunces' (headings - distinctive variable serif)
--font-mono: 'IBM Plex Mono' (code/numbers)
```

### Font Usage

```typescript
// Body text (default)
<p className="font-sans">Regular text</p>

// Headings (automatically applied via globals.css)
<h1>Heading</h1>  // Uses 'Fraunces'

// Display text (manual application)
<div className="font-display">Special heading</div>

// Monospace
<div className="font-mono">Code or numbers</div>
```

### Heading Defaults

All h1-h6 tags automatically use `Fraunces` with `font-weight: 600` and optical sizing enabled (defined in globals.css).

## Border Radius

### Standard Radius

```css
--radius: 0.375rem (6px) - subtle, minimalist aesthetic

/* Derived radii */
--radius-sm: calc(var(--radius) - 2px)   // 4px
--radius-md: var(--radius)               // 6px
--radius-lg: calc(var(--radius) + 2px)   // 8px
--radius-xl: calc(var(--radius) + 4px)   // 10px
```

### Usage

```typescript
<Card className="rounded-lg">        // Uses --radius-lg (8px)
<Button className="rounded-md">      // Uses --radius-md (6px)
<Input className="rounded-sm">       // Uses --radius-sm (4px)
```

## Spacing Patterns

### Consistent Spacing Scale

```typescript
// Gaps
gap-2    // 0.5rem (8px)
gap-3    // 0.75rem (12px)
gap-4    // 1rem (16px)
gap-6    // 1.5rem (24px)

// Padding
p-3      // 0.75rem (12px)
p-4      // 1rem (16px)
p-6      // 1.5rem (24px)
px-4     // Horizontal padding
py-2     // Vertical padding

// Margin
m-4      // 1rem
mt-6     // Margin top 1.5rem
mb-8     // Margin bottom 2rem
```

### Common Patterns

```typescript
// Card with consistent spacing
<Card className="p-6 space-y-4">
  <h3>Title</h3>
  <p>Content</p>
</Card>

// Flex with gap
<div className="flex items-center gap-3">
  <Icon />
  <span>Text</span>
</div>

// Grid with gap
<div className="grid grid-cols-2 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Layout Patterns

### Mobile-First Responsive

```typescript
// Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div>Left</div>
  <div>Right</div>
</div>

// Hide on mobile, show on tablet+
<div className="hidden md:block">
  Desktop content
</div>

// Show on mobile only
<div className="block md:hidden">
  Mobile content
</div>
```

### Breakpoints

```text
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Container Patterns

```typescript
// Full width with max-width
<div className="w-full max-w-7xl mx-auto px-4">
  Content
</div>

// Centered content
<div className="flex items-center justify-center min-h-screen">
  Centered
</div>

// Full height layout
<div className="flex flex-col h-full">
  <header>Header</header>
  <main className="flex-1">Scrollable content</main>
  <footer>Footer</footer>
</div>
```

## Color Usage Patterns

### Background Colors

```typescript
// Page background (default)
bg-background

// Card background
bg-card

// Muted background
bg-muted

// Input background
bg-input
```

### Text Colors

```typescript
// Primary text (default)
text-foreground

// Muted/secondary text
text-muted-foreground

// Accent text
text-accent-foreground

// Destructive/error text
text-destructive
```

### Border Colors

```typescript
// Default border
border border-border

// Muted border
border border-muted

// Accent border
border border-accent
```

## Conditional Styling with cn()

### Import

```typescript
import { cn } from "@/lib/utils";
```

### Basic Usage

```typescript
<div className={cn(
  "base classes",
  "always applied"
)}>
```

### Conditional Classes

```typescript
<div className={cn(
  "flex items-center gap-3 p-3 rounded-lg border",
  status === "completed" && "bg-green-50 dark:bg-green-950/20",
  status === "in_progress" && "bg-blue-50 dark:bg-blue-950/20",
  status === "failed" && "bg-red-50 dark:bg-red-950/20"
)}>
```

### With Props Override

```typescript
interface Props {
  className?: string;
  variant?: "default" | "outlined";
}

<div className={cn(
  "base-styles",
  variant === "outlined" && "border-2",
  className  // User override (last = highest priority)
)}>
```

## Dark Mode

### Dark Mode Classes

```typescript
// Custom dark mode variant
@custom-variant dark (&:is(.dark *));

// Usage
<div className="bg-white dark:bg-gray-900">
<p className="text-gray-900 dark:text-gray-100">
```

### Dark Mode Patterns

```typescript
// Conditional background
bg-green-50 dark:bg-green-950/20

// Conditional text
text-gray-900 dark:text-gray-100

// Conditional border
border-gray-200 dark:border-gray-800
```

## Custom Utility Classes

### Glass Effect

```typescript
<div className="glass-effect">
  // Subtle blurred background with transparency
</div>
```

### Text Gradients

```typescript
<h1 className="text-gradient">
  Terracotta to teal gradient text
</h1>
```

### Pattern Backgrounds

```typescript
<div className="bg-grid-subtle">
  // Subtle grid pattern overlay
</div>

<div className="bg-texture">
  // Diagonal line texture
</div>
```

## Animation Classes

### Custom Animations

```typescript
// Accordion animations
animate-accordion-down
animate-accordion-up

// Shimmer effect (loading)
animate-shimmer

// Fade animations
animate-fade-in
animate-fade-in-up

// Scale in
animate-scale-in

// Slide animations
animate-slide-in-right
animate-slide-in-left
```

### Usage Examples

```typescript
// Loading shimmer
<div className="animate-shimmer bg-gradient-to-r">

// Fade in content
<div className="animate-fade-in-up">

// Spinning loader
<Loader2 className="animate-spin" />

// Pulsing dot
<div className="animate-pulse bg-blue-500 rounded-full" />
```

## Common Component Styling Patterns

### Cards

```typescript
<Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
  <h3 className="font-display font-semibold text-lg">Title</h3>
  <p className="text-muted-foreground">Description</p>
</Card>
```

### Buttons

```typescript
// Primary
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">

// Secondary
<Button className="bg-secondary text-secondary-foreground">

// Outline
<Button variant="outline" className="border-border">

// Ghost
<Button variant="ghost">

// Destructive
<Button variant="destructive">
```

### Inputs

```typescript
<Input className="bg-input border-border focus:ring-ring" />
```

### Badges

```typescript
<Badge className="bg-primary text-primary-foreground">
  Status
</Badge>

<Badge className="bg-secondary text-secondary-foreground">
  Category
</Badge>
```

## Hover & Focus States

### Hover Patterns

```typescript
// Shadow on hover
hover:shadow-lg

// Background change
hover:bg-accent

// Scale on hover
hover:scale-105 transition-transform

// Opacity change
hover:opacity-80
```

### Focus States

```typescript
// Focus ring (default for inputs)
focus:ring-2 focus:ring-ring

// Focus outline
focus:outline-none focus:ring-2 focus:ring-offset-2

// Focus visible (keyboard only)
focus-visible:ring-2 focus-visible:ring-ring
```

### Transition

```typescript
// Standard transition
transition-all duration-300

// Transform transition
transition-transform duration-200

// Color transition
transition-colors duration-150

// Shadow transition
transition-shadow duration-300
```

## Responsive Text Sizing

```typescript
// Responsive headings
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Responsive body text
<p className="text-sm md:text-base">

// Responsive line height
<p className="leading-relaxed md:leading-loose">
```

## Accessibility Considerations

### Motion Preferences

Respects `prefers-reduced-motion` (configured in globals.css):

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Focus Indicators

Always include focus states:

```typescript
<button className="focus:ring-2 focus:ring-ring focus:outline-none">
  Click me
</button>
```

### Color Contrast

Use semantic color variables which maintain proper contrast:

```typescript
// ✅ Good contrast
<div className="bg-background text-foreground">

// ✅ Good contrast
<Button className="bg-primary text-primary-foreground">
```

## Mobile-Specific Patterns

### Touch-Friendly Sizing

```typescript
// Minimum 44x44px touch targets
<button className="min-h-[44px] min-w-[44px] p-3">

// Larger padding on mobile
<div className="p-4 md:p-6">
```

### Safe Areas

```typescript
// Avoid fixed backgrounds on mobile (performance)
// Already handled in globals.css via:
@media (hover: hover) and (pointer: fine) {
  body {
    background-attachment: fixed;
  }
}
```

## Common Patterns from Codebase

### Status Indicators

```typescript
<div className={cn(
  "flex items-center gap-3 p-3 rounded-lg border",
  category.status === "completed" && "bg-green-50 dark:bg-green-950/20",
  category.status === "in_progress" && "bg-blue-50 dark:bg-blue-950/20",
  category.status === "pending" && "bg-gray-50 dark:bg-gray-950/20",
  category.status === "failed" && "bg-red-50 dark:bg-red-950/20"
)}>
```

### Icon + Text Pattern

```typescript
<div className="flex items-center gap-3">
  <Icon className="h-5 w-5 text-muted-foreground" />
  <span className="font-medium">Label</span>
</div>
```

### Progress Indicators

```typescript
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Progress</span>
    <span>{percentage}%</span>
  </div>
  <div className="h-2 bg-muted rounded-full overflow-hidden">
    <div
      className="h-full bg-primary transition-all duration-300"
      style={{ width: `${percentage}%` }}
    />
  </div>
</div>
```

## Known Issues & Missing Utilities

### ⚠️ Undefined Utilities

| Utility | Used In | Fix |
|---------|---------|-----|
| `animate-float` | EmptyState.tsx | Define keyframe or use `animate-pulse` |
| `text-gradient-primary` | EmptyState, app-sidebar | Use `.text-gradient` instead |
| `macaron-*` colors | EmptyState, PRDCard | Use warm-terracotta, deep-teal, soft-sage |

### ⚠️ Hardcoded Dark Mode Colors

Replace hardcoded colors with CSS variables:

```typescript
// ❌ Wrong
<div className="dark:bg-gray-900 dark:text-red-400">

// ✅ Correct
<div className="dark:bg-card dark:text-destructive">
```

**Best Practice:** Always use CSS variable-based colors for dark mode variants.
