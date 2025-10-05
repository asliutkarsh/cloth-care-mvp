# ClothCare

ClothCare is a comprehensive digital wardrobe management application that helps users organize, track, and optimize their clothing usage. Built with modern web technologies, it provides an intuitive interface for managing your wardrobe, planning outfits, tracking laundry, and gaining insights into your clothing habits.

---

## ✨ Key Features

### 🧥 Wardrobe Management

- **Digital Wardrobe:** Add, edit, and organize all your clothes with photos, categories, and custom tags
- **Outfit Creation:** Create and save outfit combinations from your existing clothes
- **Advanced Filtering:** Filter by category, tags, favorites, and search terms
- **Bulk Operations:** Multi-select clothes for batch operations (delete, laundry, outfit creation)
- **View Modes:** Switch between grid and list views with persistent user preferences

### 📅 Activity Calendar

- **Daily Outfit Logging:** Track what you wore each day with visual calendar interface
- **Wear History:** View your complete outfit history with activity details
- **Long-press Support:** Mobile-optimized interaction for quick activity logging
- **Planned Outfits:** Mark outfits as planned and confirm when worn

### 🧺 Laundry Management

- **Smart Status Tracking:** Automatically categorize clothes as clean, dirty, or needs pressing
- **Laundry Workflow:** Dedicated interface for managing dirty clothes and pressing needs
- **Batch Operations:** Wash or press multiple items at once

### 📊 Analytics & Insights

- **Usage Statistics:** Track wear frequency, favorite items, and usage patterns
- **Sustainability Metrics:** Monitor environmental impact (water, energy, carbon savings)
- **Cost Analysis:** Calculate money saved through extended clothing lifespan
- **Configurable Dashboards:** Modular insights system with customizable widgets

### 🏖️ Trip Planning

- **Travel Outfits:** Plan and organize outfits for trips and vacations
- **Packing Lists:** Create comprehensive packing lists based on trip duration and activities
- **Date-based Planning:** Schedule outfits for specific trip dates

### 👤 User Management

- **Profile Management:** User settings, preferences, and account management
- **Theme Support:** Light/dark mode with system preference detection
- **Responsive Design:** Mobile-first interface optimized for all screen sizes

### ⚙️ Advanced Features

- **Category System:** Hierarchical category organization with subcategory support
- **Data Export/Import:** Full data portability with JSON export/import functionality
- **PWA Ready:** Progressive Web App with offline capabilities and native-like experience
- **Toast Notifications:** User-friendly feedback system with customizable notifications

---

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
- **Data Persistence:** IndexedDB via Dexie 4.2.0 with a migration from legacy localStorage
- **Date Utilities:** date-fns 4.1.0 for robust date manipulation

### Advanced Libraries

- **Drag & Drop:** @dnd-kit (core, sortable, utilities) for interactive clothing organization
- **Charts:** Recharts 3.2.1 for insights visualizations
- **PWA:** vite-plugin-pwa 1.0.3 for offline capability and installability
- **Unique IDs:** UUID 12.0.0 for generating unique identifiers
- **Class Utilities:** clsx 2.1.1 for conditional className management

---

## 📚 Further Documentation

- Architecture: `docs/ARCHITECTURE.md`
- Storage & Migration: `docs/STORAGE.md`
- Routes Overview: `docs/ROUTES.md`
- PWA Guide: `docs/PWA.md`

---

## 🏛️ Project Architecture

This application follows a clean, three-layer architecture ensuring clear separation of concerns and maintainability.

### 1. UI Layer (`src/components` & `src/pages`)

- **Pages:** Top-level route components (`Dashboard`, `Wardrobe`, `Calendar`, etc.)
- **Components:** Reusable UI elements organized by feature domains
- **Layouts:** Consistent page structure with responsive navigation
- **Modals:** Specialized dialogs for complex workflows (AddCloth, CreateOutfit, etc.)

### 2. State Management Layer (`src/stores`)

Feature-specific Zustand stores providing "single source of truth":

- `useAuthStore` - Authentication and user session management
- `useWardrobeStore` - Clothing and outfit data management
- `useCalendarStore` - Activity logging and calendar state
- `useLaundryStore` - Laundry workflow management
- `useThemeStore` - Theme and UI preferences
- `useSettingsStore` - User settings and preferences
- `useInsightsStore` - Analytics and insights data

### 3. Service Layer (`src/services`)

Business logic and data persistence with stateless, reusable functions:

- `ClothService` - CRUD operations for clothing items
- `OutfitService` - Outfit management and combinations
- `StorageService` - Data persistence via IndexedDB (Dexie), with automatic migration from legacy localStorage
- `CategoryService` - Category hierarchy management
- `ActivityService` - Calendar activity logging
- `TripService` - Trip planning functionality

### 4. Context Layer (`src/context`)

React context providers for global concerns:

- `AuthProvider` - Authentication state initialization
- `ToastProvider` - Global notification system
- `useAlreadyLoggedInRedirect` - Auth-based routing utility

---

## 📦 Core Data Models

### Cloth

```javascript
{
  id: "string",
  name: "string",
  categoryId: "string",
  status: "clean|dirty|needs_pressing",
  currentWearCount: "number",
  maxWearCount: "number",
  favorite: "boolean",
  tags: ["string"],
  createdAt: "Date",
  updatedAt: "Date"
}
```

### Outfit

```javascript
{
  id: "string",
  name: "string",
  description: "string",
  clothIds: ["string"],
  favorite: "boolean",
  tags: ["string"],
  createdAt: "Date"
}
```

### Activity

```javascript
{
  id: "string",
  type: "cloth|outfit",
  clothId: "string", // for cloth activities
  outfitId: "string", // for outfit activities
  date: "YYYY-MM-DD",
  time: "HH:MM",
  createdAt: "Date"
}
```

### Category

```javascript
{
  id: "string",
  name: "string",
  parentId: "string|null",
  maxWearCount: "number",
  children: ["Category"]
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with ES6+ support

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd cloth-care-mvp
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

---

## 🧭 App Routes

Public routes (`PublicLayout`):

- `/` – Landing
- `/login` – Login
- `/signup` – Signup

Protected routes (`ProtectedRoute` + `AppLayout`):

- `/dashboard` – Dashboard
- `/wardrobe` – Wardrobe list/grid
- `/wardrobe/cloth/:clothId` – Cloth detail
- `/wardrobe/outfit/:outfitId` – Outfit detail
- `/laundry` – Laundry workflow
- `/calendar` – Calendar & activity log
- `/insights` – Insights dashboard
- `/trips` – Trips
- `/trips/:tripId` – Trip planner
- `/settings` – Settings main
- `/settings/insights` – Configure insights modules
- `/profile` – Profile
- `/profile/essentials` – Essentials
- `/profile/wardrobe-settings` – Wardrobe settings
- `/profile/categories` – Category manager
- `/profile/filters` – Manage filters
- `/about` – About
- `/about/changelog` – Changelog
- `*` – Not Found

---

## 🌟 Key Features in Detail

### Wardrobe Organization

- **Hierarchical Categories:** Organize clothes with nested category system
- **Smart Status Tracking:** Automatic status management (clean/dirty/needs pressing)
- **Wear Count Monitoring:** Track usage frequency with customizable wear limits
- **Favorite System:** Mark favorite items for quick access
- **Tag System:** Custom tags for flexible organization

### Calendar Integration

- **Visual Activity Tracking:** Color-coded calendar showing worn days (👕) and laundry days (🧺)
- **Outfit Planning:** Plan outfits in advance and mark as worn when used
- **Activity History:** Complete log of all outfit activities with timestamps
- **Quick Logging:** One-tap outfit logging with mobile-optimized interface

### Analytics Dashboard

- **Usage Insights:** Detailed statistics on clothing usage patterns
- **Cost Savings:** Track money saved through extended clothing lifespan
- **Environmental Impact:** Monitor water, energy, and carbon savings
- **Wear Frequency:** Identify over-worn and under-utilized items

### Trip Planning

- **Itinerary-based Outfits:** Plan outfits for specific trip dates
- **Packing Optimization:** Create efficient packing lists based on trip duration
- **Activity-based Planning:** Consider weather, activities, and formality levels

---

## 🎨 Design System

### Color Palette

The application uses a carefully crafted color system:

```javascript
colors: {
  primary: {
    DEFAULT: '#2ECC71',    // Main brand green
    bright: '#2ECC71',
    deep: '#27AE60',
    activeBg: '#1F7A5C',
  },
  status: {
    clean: '#2ECC71',      // Green for clean items
    worn: '#FFA94D',       // Orange for worn items
    dirty: '#FF6B6B',      // Red for dirty items
    new: '#74C0FC',        // Blue for new items
  },
  accent: {
    violet: '#9775FA',
    orange: '#FFA94D',
    cyan: '#3BC9DB',
    blueLight: '#74C0FC',
  }
}
```

### Responsive Breakpoints

- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 768px (md)
- **Desktop:** 768px - 1024px (lg)
- **Large Desktop:** > 1024px (xl)

---

## 🔒 Security & Privacy

- **Local Data Storage:** All data stored locally in browser (no external servers)
- **No User Tracking:** Privacy-focused with no analytics or tracking
- **Data Export Control:** Users maintain full control over their data
- **Offline Capable:** Works without internet connection
- **Backup & Migration:** On first run, existing localStorage data is migrated into IndexedDB automatically. Use Settings → Data & Privacy to export/import backups.

---

## 📱 PWA

- Installable as a Progressive Web App with offline caching via Workbox (configured in `vite.config.js`).
- Auto-update registration enabled (`registerType: 'autoUpdate'`).
- Ensure icons exist in `public/` and update manifest fields if branding changes.

---

## 🤝 Contributing

Please see [CONTRIBUTION.md](CONTRIBUTION.md) for detailed contribution guidelines, coding standards, and development workflow.

---

## 📄 License

This project is private and not licensed for external use.

---
