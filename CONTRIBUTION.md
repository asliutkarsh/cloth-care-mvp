# ClothCare Contribution Guide

## 📖 Overview

ClothCare is a modern web application for wardrobe management built with React, Tailwind CSS, and a clean architecture. This guide provides comprehensive documentation for contributors to understand the codebase structure, follow UI/UX best practices, and maintain consistency across the application.

## 🛠️ Tech Stack

- **Framework:** React
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Routing:** React Router
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Root Level Files

- **package.json** - Project dependencies and scripts
- **tailwind.config.js** - Tailwind CSS configuration with custom theme colors
- **vite.config.js** - Vite build configuration
- **eslint.config.js** - ESLint configuration
- **index.html** - Main HTML template
- **README.md** - Project overview and setup instructions

### `/src` Directory Structure

```
src/
├── components/          # Reusable UI components
├── layouts/            # Layout components (Navbar, Sidebar, etc.)
├── pages/              # Top-level route components
├── stores/             # Zustand state management
├── services/           # Business logic and API services
├── context/            # React context providers
├── main.jsx           # Application entry point
├── App.jsx            # Main application component
└── index.css          # Global styles and Tailwind directives
```

## 📁 Detailed Folder Documentation

### `/src/components`

Contains all reusable React components organized by feature domains.

#### `/components/ui` - Design System Components

**Purpose**: Core reusable UI components that maintain design consistency

| Component | Purpose | Key Props | Theme Integration |
|-----------|---------|-----------|------------------|
| `Button.jsx` | Primary, secondary, ghost, and danger button variants | `variant`, `size`, `fullWidth` | Uses custom theme colors (`primary-*`, `gray-*`) |
| `Tabs.jsx` | Tab navigation interface | `value`, `onValueChange` | Uses `primary-deep` for active state |
| `Card.jsx` | Content containers | `className` | Uses `glass-card` utility class |
| `Input.jsx` | Form input fields | `type`, `placeholder`, `error` | Consistent focus states |
| `Modal.jsx` | Modal dialogs | `isOpen`, `onClose`, `title` | Backdrop blur effects |
| `Select.jsx` | Dropdown selection | `options`, `value`, `onChange` | Custom styling |
| `Logo.jsx` | Application logo | None | SVG-based, theme-aware |

#### `/components/wardrobe` - Wardrobe Feature Components

| Component | Purpose | State Management |
|-----------|---------|------------------|
| `ClothCard.jsx` | Individual clothing item display | `useWardrobeStore` |
| `ClothList.jsx` | Grid/list view of clothes | Grid responsive layout |
| `OutfitList.jsx` | Outfit collection display | Similar to ClothList |
| `FilterChipBar.jsx` | Filter controls | Category and tag filtering |
| `CreateNewMenu.jsx` | Quick actions menu | FAB-style menu |

#### `/components/calendar` - Calendar Feature

| Component | Purpose |
|-----------|---------|
| `ActivityCalendar.jsx` | Main calendar view |
| `CalendarDay.jsx` | Individual day component |
| `CalendarHeader.jsx` | Month/year navigation |

#### `/components/modal` - Modal Components

Specialized modal dialogs for specific workflows:

- `AddClothModal.jsx` - Add new clothing items
- `EditClothModal.jsx` - Edit existing items
- `CreateOutfitModal.jsx` - Create outfits

### `/src/layouts`

Layout components that provide consistent page structure.

| Component | Purpose | Features |
|-----------|---------|----------|
| `AppLayout.jsx` | Main application layout | Sidebar navigation |
| `BaseLayout.jsx` | Base layout wrapper | Theme provider |
| `Navbar.jsx` | Top navigation bar | Theme toggle, user menu |
| `Sidebar.jsx` | Side navigation | Collapsible menu |
| `BottomNav.jsx` | Mobile bottom navigation | Touch-friendly |

### `/src/pages`

Top-level route components that compose the main application views.

| Page | Purpose | Key Components |
|------|---------|----------------|
| `Dashboard.jsx` | Overview and statistics | Stats cards, recent activity |
| `Wardrobe.jsx` | Main wardrobe management | ClothList, OutfitList, filters |
| `Calendar.jsx` | Activity calendar | ActivityCalendar, filters |
| `Profile.jsx` | User profile management | Settings, preferences |
| `Settings.jsx` | Application settings | Theme, preferences |
| `Landing.jsx` | Public landing page | Marketing content |

### `/src/stores`

Zustand state management stores.

| Store | Purpose | Key Actions |
|-------|---------|-------------|
| `useAuthStore.js` | Authentication state | `login`, `logout`, `initializeAuth` |
| `useWardrobeStore.js` | Wardrobe data | `addCloth`, `updateCloth`, `removeCloth` |
| `useCalendarStore.js` | Calendar activities | `logActivity`, `getActivitiesByDate` |
| `useThemeStore.js` | Theme management | `setTheme`, `initializeTheme` |
| `useSettingsStore.js` | User preferences | `updatePreference`, `fetchPreferences` |
| `useLaundryStore.js` | Laundry tracking | `washItems`, `markAsClean` |

### `/src/services`

Business logic and data persistence layer.

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `ClothService.js` | Clothing CRUD operations | `createCloth`, `updateCloth` |
| `OutfitService.js` | Outfit management | `createOutfit`, `addToOutfit` |
| `StorageService.js` | Data persistence | `save`, `load`, `exportData` |
| `CategoryService.js` | Category management | `createCategory`, `getCategories` |

## 🎨 Theme System

### Color Palette

The application uses a custom color system defined in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    DEFAULT: '#2ECC71',
    bright: '#2ECC71',
    deep: '#27AE60',
    activeBg: '#1F7A5C',
  },
  accent: {
    violet: '#9775FA',
    orange: '#FFA94D',
    cyan: '#3BC9DB',
    blueLight: '#74C0FC',
  },
  status: {
    clean: '#2ECC71',
    worn: '#FFA94D',
    dirty: '#FF6B6B',
    new: '#74C0FC',
  }
}
```

### Theme Implementation

#### Light/Dark Mode

The theme system supports:

- **Light mode**: Clean, bright interface
- **Dark mode**: Eye-friendly dark interface
- **System preference**: Automatically follows OS setting

#### Usage in Components

```jsx
// Use theme colors instead of hardcoded values
<div className="bg-primary-deep text-white dark:bg-primary-bright">
  Themed content
</div>

// Use semantic color classes
<div className="text-gray-800 dark:text-gray-100">
  Adaptive text color
</div>
```

### Status Colors

For clothing status indicators:

```jsx
// Clean items
className="bg-status-clean/15 text-status-clean"

// Dirty items
className="bg-status-dirty/15 text-status-dirty"

// Needs pressing
className="bg-accent-cyan/15 text-accent-cyan"
```

## 📱 UI/UX Best Practices

### Responsive Design

```jsx
// Mobile-first approach
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
  {/* Responsive grid */}
</div>
```

### Animation Guidelines

```jsx
// Use Framer Motion for smooth transitions
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: i * 0.03 }}
>
  {/* Animated content */}
</motion.div>
```

### Accessibility

```jsx
// Always include proper ARIA labels
<button
  aria-label="Add to favorites"
  onClick={toggleFavorite}
>
  <Heart className="w-4 h-4" />
</button>

// Use semantic HTML
<nav role="navigation">
<main role="main">
```

### Loading States

```jsx
// Show loading indicators
{isLoading ? (
  <div className="text-center py-8">
    <div className="animate-spin">Loading...</div>
  </div>
) : (
  <Content />
)}
```

## 🔧 Practical Examples

### Adding a New Theme Color

**Step 1**: Update `tailwind.config.js`

```javascript
// tailwind.config.js
colors: {
  primary: {
    DEFAULT: '#2ECC71',
    bright: '#2ECC71',
    deep: '#27AE60',
    activeBg: '#1F7A5C',
  },
  accent: {
    violet: '#9775FA',
    orange: '#FFA94D',
    cyan: '#3BC9DB',
    blueLight: '#74C0FC',
    // Add new accent color
    purple: '#8B5CF6',
  },
}
```

**Step 2**: Update `src/index.css` (if needed)

```css
/* src/index.css */
@layer components {
  .hover-highlight {
    @apply transition-colors hover:bg-accent-purple/10 hover:ring-1 hover:ring-accent-purple/30;
  }
}
```

**Step 3**: Use in components

```jsx
// In any component
<div className="bg-accent-purple/20 text-accent-purple">
  New purple theme color
</div>
```

### Creating a New UI Component

**Step 1**: Create component file

```jsx
// src/components/ui/Alert.jsx
import React from 'react';
import clsx from 'clsx';

const variants = {
  success: 'bg-status-clean/15 text-status-clean border-status-clean/30',
  error: 'bg-status-dirty/15 text-status-dirty border-status-dirty/30',
  warning: 'bg-accent-orange/15 text-accent-orange border-accent-orange/30',
  info: 'bg-accent-blueLight/15 text-accent-blueLight border-accent-blueLight/30',
};

export default function Alert({ variant = 'info', children, className }) {
  return (
    <div className={clsx(
      'rounded-lg border p-4 text-sm',
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
}
```

**Step 2**: Export from index.js

```jsx
// src/components/ui/index.js
export { default as Alert } from './Alert';
```

**Step 3**: Use in other components

```jsx
// In any component
import { Alert } from '../components/ui';

<Alert variant="success">
  Operation completed successfully!
</Alert>
```

### Adding a New Page

**Step 1**: Create page component

```jsx
// src/pages/NewFeature.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNewFeatureStore } from '../stores/useNewFeatureStore';

export default function NewFeature() {
  const { data, isLoading } = useNewFeatureStore();

  return (
    <div className="max-w-7xl mx-auto p-4 pb-24 sm:p-6 md:p-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold mb-2">New Feature</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Description of the new feature
        </p>
      </motion.header>

      {/* Page content */}
    </div>
  );
}
```

**Step 2**: Add route in App.jsx

```jsx
// src/App.jsx
import NewFeature from './pages/NewFeature';

// In your routes
<Route path="/new-feature" element={<NewFeature />} />
```

**Step 3**: Create corresponding store (if needed)

```jsx
// src/stores/useNewFeatureStore.js
import { create } from 'zustand';

export const useNewFeatureStore = create((set) => ({
  data: [],
  isLoading: false,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const data = await NewFeatureService.getData();
      set({ data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));
```

### Customizing Status Colors

**Step 1**: Update theme configuration

```javascript
// tailwind.config.js
colors: {
  status: {
    clean: '#2ECC71',
    worn: '#FFA94D',
    dirty: '#FF6B6B',
    new: '#74C0FC',
    // Add new status
    archived: '#6B7280',
  },
}
```

**Step 2**: Update status mapping

```jsx
// In ClothCard.jsx or similar component
const statusMap = {
  clean: { tagClass: 'tag-clean', ringClass: 'status-ring-clean', label: 'Clean' },
  dirty: { tagClass: 'tag-dirty', ringClass: 'status-ring-dirty', label: 'Dirty' },
  needs_pressing: { tagClass: 'bg-accent-cyan/15 text-accent-cyan ring-1 ring-accent-cyan/30 rounded-full px-2 py-0.5 text-xs font-medium', ringClass: 'status-ring-new', label: 'Needs Pressing' },
  // Add new status
  archived: { tagClass: 'bg-status-archived/15 text-status-archived ring-1 ring-status-archived/30 rounded-full px-2 py-0.5 text-xs font-medium', ringClass: 'status-ring-archived', label: 'Archived' },
};
```

**Step 3**: Update CSS classes

```css
/* src/index.css */
@layer components {
  .tag-archived { @apply tag bg-status-archived/15 dark:bg-status-archived/20 text-status-archived ring-1 ring-status-archived/30 dark:ring-status-archived/40; }
  .status-ring-archived { @apply ring-2 ring-status-archived; }
}
```

### Adding a New Store

**Step 1**: Create store file

```jsx
// src/stores/useCustomStore.js
import { create } from 'zustand';

export const useCustomStore = create((set, get) => ({
  // State
  items: [],
  isLoading: false,
  error: null,

  // Actions
  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await CustomService.getItems();
      set({ items, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addItem: (item) => {
    set((state) => ({
      items: [...state.items, item]
    }));
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter(item => item.id !== id)
    }));
  },
}));
```

**Step 2**: Create corresponding service

```jsx
// src/services/CustomService.js
export const CustomService = {
  getItems: async () => {
    // Implementation
    return [];
  },

  createItem: async (data) => {
    // Implementation
    return {};
  },

  updateItem: async (id, data) => {
    // Implementation
    return {};
  },
};
```

## 🚀 Development Guidelines

- Use functional components with hooks
- Prefer custom hooks for complex logic
- Use TypeScript for better type safety (recommended)
- Follow ESLint configuration
- Use meaningful variable and function names

### State Management

- Use Zustand for global state
- Keep stores focused on single domains
- Use services for business logic
- Prefer local state for component-specific UI state

### Performance

- Use React.memo for expensive components
- Implement proper loading states
- Use pagination for large lists
- Optimize re-renders with useMemo/useCallback

### Testing

```jsx
// Basic testing pattern
import { render, screen, fireEvent } from '@testing-library/react';
import Component from './Component';

test('renders component', () => {
  render(<Component />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

## 🤝 Contributing Workflow

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
4. **Make** your changes following the guidelines
5. **Test** your changes thoroughly
6. **Submit** a pull request with a clear description

## 📞 Getting Help

- Check existing issues and discussions
- Review the codebase documentation
- Ask questions in the project discussions
- Follow the established patterns in the codebase

---

This guide is maintained by the ClothCare development team. Last updated: 2025
