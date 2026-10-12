# CUI Freelancing Platform - Design System

## Overview
Professional, university-oriented freelancing platform with clean, modern design using a restrained blue-and-white color scheme.

## Color Palette

### Primary Colors
- **Navy**: `#102B52` - Primary brand color, headers, important text
- **Primary Blue**: `#1769E8` - Interactive elements, buttons, links
- **Page Background**: `#F4F7FC` - Main background color
- **White**: `#FFFFFF` - Cards, forms, content backgrounds

### Text Colors
- **Primary Text**: `#18314F` - Main content, headings
- **Muted Text**: `#64748B` - Secondary text, descriptions
- **Border Color**: `#E2E8F0` - Borders, dividers, subtle separations

### Tailwind Configuration
```css
colors: {
  navy: '#102B52',
  'primary-blue': '#1769E8', 
  'page-bg': '#F4F7FC',
  'primary-text': '#18314F',
  'muted-text': '#64748B',
  'border-color': '#E2E8F0',
}
```

## Typography

### Font Hierarchy
- **Display**: 2xl-4xl, font-bold, text-navy
- **Headings**: xl-2xl, font-semibold, text-primary-text
- **Body**: base, font-normal, text-primary-text  
- **Secondary**: sm, font-normal, text-muted-text
- **Captions**: xs, font-medium, text-muted-text

### Font Weights
- **Bold**: 700 - Page titles, important headings
- **Semibold**: 600 - Section headers, card titles
- **Medium**: 500 - Labels, button text
- **Normal**: 400 - Body text, descriptions

## Spacing System

### Standard Spacing (Tailwind)
- **xs**: 0.5rem (8px)
- **sm**: 0.75rem (12px) 
- **base**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)

### Component Spacing
- **Card padding**: p-6 (24px)
- **Form spacing**: space-y-4 (16px)
- **Section margins**: mb-8 (32px)
- **Button padding**: px-4 py-2 (16px/8px)

## Component Standards

### Buttons
```jsx
// Primary Button
<button className="bg-primary-blue hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md transition-colors">

// Secondary Button  
<button className="border border-border-color hover:bg-gray-50 text-primary-text font-medium px-4 py-2 rounded-md transition-colors">

// Danger Button
<button className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition-colors">
```

### Input Fields
```jsx
<input className="w-full px-3 py-2 border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent" />
```

### Cards
```jsx
<div className="bg-white rounded-lg border border-border-color p-6 shadow-sm">
```

### Status Badges
```jsx
// Success
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">

// Warning  
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">

// Info
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
```

## Layout Structure

### Authentication Layout
- Full-screen centered forms
- No sidebar or navigation
- Clean, minimal design
- Logo and branding only

### Dashboard Layout  
- Sidebar navigation (left)
- Top bar with user menu (right)
- Main content area
- Responsive collapse on mobile

### Grid System
- 12-column grid using CSS Grid or Flexbox
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Content max-width: 1200px

## Navigation Design

### Sidebar Navigation
- **Width**: 256px (w-64) 
- **Background**: White with navy accent
- **Active state**: Primary blue background
- **Hover state**: Light gray background
- **Icons**: Lucide React icons, 20px

### Top Bar
- **Height**: 64px (h-16)
- **Background**: White  
- **Border**: Bottom border in border-color
- **User menu**: Dropdown with avatar

## Form Design

### Form Layout
- Single column layout
- Consistent spacing (space-y-4)
- Clear labels above inputs
- Validation messages below inputs
- Submit buttons aligned right

### Validation States
```jsx
// Error state
<input className="border-red-500 focus:ring-red-500" />
<p className="text-red-600 text-sm mt-1">Error message</p>

// Success state  
<input className="border-green-500 focus:ring-green-500" />
```

## Responsive Design

### Breakpoints
- **Mobile**: < 640px - Stack everything, hide sidebar
- **Tablet**: 640px-1023px - Collapsed sidebar, adjusted spacing
- **Desktop**: 1024px+ - Full sidebar, optimal spacing

### Mobile Considerations
- Touch-friendly button sizes (min 44px height)
- Readable font sizes (min 16px for inputs)
- Easy navigation with hamburger menu
- No horizontal scrolling

## Accessibility

### Focus States
```jsx
focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2
```

### Color Contrast
- Ensure 4.5:1 contrast ratio for normal text
- Ensure 3:1 contrast ratio for large text
- Test with accessibility tools

### Form Labels
- Always include proper labels
- Use aria-labels for icon-only buttons
- Provide clear error messages

## Animation Guidelines

### Subtle Transitions
```jsx
transition-colors duration-200  // Color changes
transition-transform duration-200  // Hover effects
transition-opacity duration-300  // Show/hide
```

### Avoid
- Excessive animations
- Decorative gradients  
- Spinning loaders (use simple progress indicators)
- Flashy hover effects

## Icon Usage

### Lucide React Icons
- 20px for navigation icons
- 16px for inline icons  
- 24px for action buttons
- Consistent stroke width (1.5-2)

### Icon + Text Spacing
- 8px gap between icon and text
- Align icons with text baseline

## Card Design Patterns

### Project Cards
```jsx
<div className="bg-white rounded-lg border border-border-color p-6 hover:shadow-md transition-shadow">
  <h3 className="font-semibold text-primary-text mb-2">Title</h3>
  <p className="text-muted-text text-sm mb-4">Description</p>
  <div className="flex justify-between items-center">
    <StatusBadge />
    <Button />
  </div>
</div>
```

### Stats Cards
```jsx
<div className="bg-white rounded-lg border border-border-color p-6">
  <div className="flex items-center">
    <Icon className="text-primary-blue" />
    <div className="ml-4">
      <p className="text-2xl font-bold text-primary-text">$1,234</p>
      <p className="text-sm text-muted-text">Total Earnings</p>
    </div>
  </div>
</div>
```

## Implementation Notes

### CSS Architecture
- Use Tailwind utility classes
- Create component classes only when necessary
- Maintain consistent naming conventions
- Document custom CSS in comments

### Component Consistency
- Reuse components across pages
- Maintain consistent props interface
- Use TypeScript for prop validation (future)
- Document component usage examples

### Performance Considerations
- Optimize images and icons
- Use CSS transitions over JavaScript animations
- Minimize CSS bundle size
- Lazy load non-critical components