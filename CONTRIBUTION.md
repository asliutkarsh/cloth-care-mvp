# ClothCare Contribution Guide

## 📖 Overview

ClothCare is a comprehensive digital wardrobe management application built with modern web technologies including React 19.1.1, Vite 7.1.2, Tailwind CSS 3.4.17, and Zustand 5.0.8. This guide provides detailed documentation for contributors to understand the codebase structure, follow UI/UX best practices, and maintain consistency across the application.

## 🛠️ Tech Stack

### Core Technologies

- **Framework:** React 19.1.1 with modern hooks and concurrent features
- **Build Tool:** Vite 7.1.2 for fast development and optimized production builds
- **Language:** JavaScript (ES6+) with modern async/await patterns

### Styling & UI

- **CSS Framework:** Tailwind CSS 3.4.17 with custom theme system
- **Animations:** Framer Motion 12.23.12 for smooth, performant animations
- **Icons:** Lucide React 0.542.0 for consistent iconography
- **Responsive Design:** Mobile-first approach with breakpoint-based layouts

### State Management & Data

- **State Management:** Zustand 5.0.8 for lightweight, scalable state management
- **Routing:** React Router DOM 7.8.2 for client-side routing and navigation
- **Data Persistence:** Browser localStorage with service layer abstraction
- **Date Utilities:** date-fns 4.1.0 for robust date manipulation

### Advanced Libraries

- **Drag & Drop:** @dnd-kit (core 6.3.1, sortable 10.0.0, utilities 3.2.2)
- **Form Handling:** React Hook Form for complex form validation
- **Unique IDs:** UUID 12.0.0 for generating unique identifiers
- **Class Utilities:** clsx 2.1.1 for conditional className management

### Root Level Files

- **package.json** - Project dependencies and scripts (React 19.1.1, Vite 7.1.2)
- **tailwind.config.js** - Tailwind CSS configuration with custom theme colors
- **vite.config.js** - Vite build configuration with React plugin
- **eslint.config.js** - ESLint configuration for code quality
- **index.html** - Main HTML template with PWA manifest
- **README.md** - Project overview and setup instructions

### `/src` Directory Structure

```
src/
├── components/          # Reusable UI components organized by feature
│   ├── ui/             # Core design system components
│   ├── wardrobe/       # Wardrobe-specific components
│   ├── calendar/       # Calendar and activity components
│   ├── modal/          # Modal dialogs and forms
│   ├── landing/        # Landing page components
│   └── skeleton/       # Loading skeleton components
├── layouts/            # Layout components (Navbar, Sidebar, etc.)
├── pages/              # Top-level route components (16 pages total)
├── stores/             # Zustand state management (7 stores)
├── services/           # Business logic and API services (6 services)
├── context/            # React context providers (3 providers)
├── main.jsx           # Application entry point
├── App.jsx            # Main application component with routing
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
| `ClothList.jsx` | Grid/list view of clothes | Responsive grid layout |
| `OutfitList.jsx` | Outfit collection display | Similar to ClothList |
| `FilterChipBar.jsx` | Category and tag filtering | Zustand store integration |
| `CreateNewMenu.jsx` | Quick actions FAB menu | Global event dispatching |

#### `/components/calendar` - Calendar Feature

| Component | Purpose |
|-----------|---------|
| `ActivityCalendar.jsx` | Main calendar view |
| `CalendarDay.jsx` | Individual day component with activity indicators |
| `CalendarHeader.jsx` | Month/year navigation |

#### `/components/modal` - Modal Components

Specialized modal dialogs for complex workflows:

- `AddClothModal.jsx` - Add new clothing items with photo upload
- `EditClothModal.jsx` - Edit existing clothing items
- `CreateOutfitModal.jsx` - Create outfits from multiple clothes
- `AddActivityModal.jsx` - Log outfit activities on calendar

### `/src/layouts`

Layout components that provide consistent page structure.

| Component | Purpose | Features |
|-----------|---------|----------|
| `AppLayout.jsx` | Main authenticated layout | Sidebar, BottomNav, modals |
| `BaseLayout.jsx` | Base layout wrapper | Theme gradients and backgrounds |
| `Navbar.jsx` | Top navigation bar | Theme toggle, user menu, logo |
| `Sidebar.jsx` | Desktop side navigation | Collapsible menu with 8 nav items |
| `BottomNav.jsx` | Mobile bottom navigation | Touch-friendly with FAB menu |

### `/src/pages`

Top-level route components (16 pages total):

| Page | Purpose | Key Features |
|------|---------|--------------|
| `Landing.jsx` | Public marketing page | Interactive calendar showcase, feature highlights |
| `Dashboard.jsx` | Overview and statistics | Stats cards, recent activity, outfit suggestions |
| `Wardrobe.jsx` | Main wardrobe management | Dual tabs (clothes/outfits), advanced filtering |
| `Calendar.jsx` | Activity calendar | Visual calendar grid, activity logging |
| `Laundry.jsx` | Laundry workflow | Dirty clothes and pressing management |
| `Profile.jsx` | User profile management | Settings and preferences |
| `Settings.jsx` | Application settings | Theme, categories, filters configuration |
| `Insights.jsx` | Analytics dashboard | Usage statistics, sustainability metrics |
| `Trips.jsx` | Trip planning | Travel outfit organization |
| `TripPlanner.jsx` | Individual trip management | Detailed trip outfit planning |

### `/src/stores`

Zustand state management stores (7 stores total):

| Store | Purpose | Key State/Actions |
|-------|---------|------------------|
| `useAuthStore.js` | Authentication state | `login`, `logout`, `checkAuth`, user session |
| `useWardrobeStore.js` | Wardrobe data | `addCloth`, `updateCloth`, `removeCloth`, CRUD operations |
| `useCalendarStore.js` | Calendar activities | `addActivity`, `getActivitiesByDate`, activity logging |
| `useLaundryStore.js` | Laundry tracking | `washItems`, `markAsClean`, laundry workflow |
| `useThemeStore.js` | Theme management | `setTheme`, `initializeTheme`, light/dark mode |
| `useSettingsStore.js` | User preferences | `updatePreference`, `fetchPreferences`, app settings |
| `useInsightsStore.js` | Analytics data | Usage statistics and insights |

### `/src/services`

Business logic and data persistence layer (6 services):

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `ClothService.js` | Clothing CRUD operations | `createCloth`, `updateCloth`, `getClothes` |
| `OutfitService.js` | Outfit management | `createOutfit`, `addToOutfit`, outfit combinations |
| `StorageService.js` | Data persistence | `save`, `load`, `exportData`, localStorage abstraction |
| `CategoryService.js` | Category management | `createCategory`, `getCategories`, hierarchy support |
| `ActivityService.js` | Calendar activities | `logActivity`, activity tracking |
| `TripService.js` | Trip planning | `createTrip`, `getTrips`, travel management |

## 🎨 Theme System

### Color Palette

The application uses a custom color system defined in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    DEFAULT: '#2ECC71',    // Main brand green
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
    clean: '#2ECC71',      // Green for clean items
    worn: '#FFA94D',       // Orange for worn items
    dirty: '#FF6B6B',      // Red for dirty items
    new: '#74C0FC',        // Blue for new items
  },
  coolgray: {
    900: '#2A2D34',
    700: '#3E4149',
    500: '#6C757D',
  }
}
```

### Background Gradients

```javascript
backgroundImage: {
  'app-gradient': 'linear-gradient(145deg, #0f1f1d, #152b29)',
  'card-gradient': 'linear-gradient(145deg, rgba(15,31,29,0.04), rgba(21,43,41,0.06))',
}
```

### Theme Implementation

#### Light/Dark Mode

- **Light mode**: Clean, bright interface with subtle gradients
- **Dark mode**: Eye-friendly dark interface with emerald accents
- **System preference**: Automatically follows OS setting

## 📱 UI/UX Best Practices

### Responsive Design Principles

```jsx
// Mobile-first approach with progressive enhancement
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
  {/* Responsive grid that adapts to screen size */}
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

### Accessibility Standards

```jsx
// Always include proper ARIA labels
<button
  aria-label="Add to favorites"
  onClick={toggleFavorite}
>
  <Heart className="w-4 h-4" />
</button>

// Use semantic HTML structure
<nav role="navigation" aria-label="Main navigation">
<main role="main">
```

### Loading States

```jsx
// Show loading indicators during async operations
{isLoading ? (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-deep"></div>
  </div>
) : (
  <Content />
)}
```

## 🔧 Development Guidelines

### Component Architecture

#### Functional Components with Hooks

```jsx
// Use functional components with modern hooks
const MyComponent = () => {
  const [state, setState] = useState(initialValue);
  const data = useWardrobeStore(state => state.clothes);

  return (
    <div className="component-class">
      {/* Component JSX */}
    </div>
  );
};
```

#### Custom Hooks for Complex Logic

```jsx
// Extract complex logic into custom hooks
const useClothFilters = () => {
  const [filters, setFilters] = useState({});
  const filteredClothes = useMemo(() => {
    // Complex filtering logic
  }, [clothes, filters]);

  return { filters, setFilters, filteredClothes };
};
```

### State Management Patterns

#### Store Organization

```jsx
// Each store focuses on a single domain
export const useWardrobeStore = create((set, get) => ({
  // State
  clothes: [],
  outfits: [],
  categories: [],
  isLoading: false,

  // Actions
  addCloth: async (clothData) => {
    set({ isLoading: true });
    try {
      const newCloth = await ClothService.createCloth(clothData);
      set(state => ({
        clothes: [...state.clothes, newCloth],
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
```

#### Service Layer Pattern

```jsx
// Services handle all business logic
export const ClothService = {
  createCloth: async (clothData) => {
    const cloth = {
      id: uuidv4(),
      ...clothData,
      createdAt: new Date(),
      currentWearCount: 0,
      status: 'clean'
    };

    await StorageService.save('clothes', cloth);
    return cloth;
  },

  getClothes: async () => {
    return await StorageService.load('clothes') || [];
  }
};
```

### Performance Optimization

#### React.memo for Expensive Components

```jsx
const ClothCard = React.memo(({ cloth, onSelect }) => {
  return (
    <div className="cloth-card">
      {/* Component content */}
    </div>
  );
});
```

#### useMemo/useCallback for Expensive Calculations

```jsx
const filteredClothes = useMemo(() => {
  return clothes.filter(cloth => {
    // Expensive filtering logic
  });
}, [clothes, filters]);

const handleClothSelect = useCallback((clothId) => {
  // Expensive selection logic
}, [selectedItems]);
```

## 🚀 Development Workflow

### Getting Started

1. **Clone** the repository
2. **Install** dependencies: `npm install`
3. **Start** development server: `npm run dev`
4. **Open** browser to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Development server with hot reload
- `npm run build` - Production build optimization
- `npm run preview` - Preview production build locally
- `npm run lint` - Code quality checks with ESLint

### Code Organization Best Practices

#### File Naming Conventions

- Components: `PascalCase.jsx` (e.g., `ClothCard.jsx`)
- Pages: `PascalCase.jsx` (e.g., `Dashboard.jsx`)
- Stores: `camelCase.js` (e.g., `useWardrobeStore.js`)
- Services: `PascalCase.js` (e.g., `ClothService.js`)
- Utils: `camelCase.js` (e.g., `dateUtils.js`)

#### Import Organization

```jsx
// Group imports logically
import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Third-party libraries
import { motion } from 'framer-motion';
import { WashingMachine } from 'lucide-react';

// Internal components
import Button from '../components/ui/Button';
import { useWardrobeStore } from '../stores/useWardrobeStore';

// Relative imports last
import './ClothCard.css';
```

## 🤝 Contributing Workflow

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch from `main`
4. **Make** your changes following established patterns
5. **Test** thoroughly across different screen sizes
6. **Submit** a pull request with clear description

### Pull Request Guidelines

- **Title:** Clear, descriptive title (e.g., "Add bulk delete functionality to wardrobe")
- **Description:** Explain what was changed and why
- **Testing:** Mention how the changes were tested
- **Screenshots:** Include screenshots for UI changes

## 📞 Getting Help

- **Issues:** Check existing GitHub issues for similar problems
- **Discussions:** Use GitHub Discussions for questions and ideas
- **Documentation:** Review this guide and existing code patterns
- **Code Review:** Follow established patterns in the codebase

---

This guide is maintained by the ClothCare development team. Last updated: 2025
