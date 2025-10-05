export const APP_VERSION = "1.7.1";

export const WHATS_NEW = [
  {
    version: "1.7.1",
    date: "2025-10-06",
    changes: [
      "🧩 New **Modal System** for adding clothes and outfits with a smoother workflow.",
      "📥 Added **Import Functionality** to bring wardrobe data from JSON files easily.",
      "⚙️ Settings updated with **Backup Frequency** options and import controls.",
      "📦 Backup service now includes essentials and wash history for complete data sync.",
      "🔔 Added **PWA Notifier** for update alerts and background sync improvements.",
      "✨ Better user experience with detailed **toast notifications** for import results."
    ]
  },
  {
    version: "1.7.0",
    date: "2025-10-05",
    changes: [
      "🧳 Manage your packing essentials with the all-new **Essentials Page** — add, edit, and delete items easily.",
      "⚙️ New **Wardrobe Settings** to customize your default view and sort preferences.",
      "📂 Improved **Category Management** with subcategories and item counts.",
      "🧵 Smarter cloth tracking using enhanced data handling and status management.",
      "🚀 App performance boosted with new global state and cleaner data handling."
    ]
  },
  {
    version: "1.6.0",
    date: "2025-10-02",
    changes: [
      "ℹ️ **About Page** added with easy access to app details.",
      "🕓 **Changelog Modal** lets you view version history directly in the app.",
      "🖼️ Image uploads now use compression for faster and lighter uploads."
    ]
  },
  {
    version: "1.5.1",
    date: "2025-09-30",
    changes: [
      "🗓️ Plan your outfits with the new **Activity Log “Planned”** status.",
      "✅ Dashboard now shows planned outfits with quick confirm actions.",
      "⚠️ Settings updated with **Data & Privacy** warning and demo default items."
    ]
  },
  {
    version: "1.5.0",
    date: "2025-09-29",
    changes: [
      "📊 **Insights Dashboard** added for wardrobe stats and financial overview.",
      "🌟 New **Hero Insights** and modules to track wardrobe usage.",
      "🧭 Improved navigation with **Insights** and **Trips** sections."
    ]
  },
  {
    version: "1.4.1",
    date: "2025-09-28",
    changes: [
      "🔑 **Demo Login** added for instant app access.",
      "❤️ Default outfits marked as favorites for quicker selection.",
      "💨 Added **Skeleton Screens** for smoother loading experience."
    ]
  },
  {
    version: "1.4.0",
    date: "2025-09-20",
    changes: [
      "👕 Outfit management improved with **tag suggestions** and preferences.",
      "🧩 Manage filters for clothes and outfits with a new dedicated page.",
      "😄 Added **Emoji Picker** for fun outfit customization."
    ]
  },
  {
    version: "1.3.1",
    date: "2025-09-18",
    changes: [
      "📱 **PWA support** added — use the app offline!",
      "🪶 New **Logo component** for consistent branding.",
      "🎨 Refreshed app backgrounds and layouts for a cleaner look."
    ]
  },
  {
    version: "1.3.0",
    date: "2025-09-14",
    changes: [
      "🧺 Redesigned **Laundry** and **Wardrobe** pages with new detail modals.",
      "🔍 Improved **Wardrobe filtering** for faster item searches."
    ]
  },
  {
    version: "1.2.1",
    date: "2025-09-11",
    changes: [
      "👤 **Profile Page** refreshed with updated UI.",
      "⚙️ **Settings Page** improved for easier navigation."
    ]
  },
  {
    version: "1.2.0",
    date: "2025-09-10",
    changes: [
      "📁 New **Category Management Page** — add, edit, and delete categories.",
      "🛠️ Settings now support **category management** and **data import/export**."
    ]
  },
  {
    version: "1.1.0",
    date: "2025-09-09",
    changes: [
      "🗓️ Improved **Calendar** for better activity tracking and day interactions.",
      "📝 Added **Activity Log** to view and delete past activities.",
      "🏠 **Dashboard** layout and navigation enhanced for smoother experience."
    ]
  },
  {
    version: "1.0.0",
    date: "2025-09-08",
    changes: [
      "🚀 Initial release of **ClothCare** with wardrobe, laundry, and calendar management."
    ]
  }
];

export const CHANGELOG = [
  {
    version: "1.7.1",
    date: "2025-10-06",
    changes: [
      { type: "Feature", description: "Implemented modal system for adding clothes and outfits with global Zustand state management." },
      { type: "Feature", description: "Created ImportModal component to import wardrobe data from JSON files." },
      { type: "Feature", description: "Integrated modal triggers into CreateNewMenu and Wardrobe components for seamless workflow." },
      { type: "Feature", description: "Enhanced Settings page with backup frequency preferences and import data options." },
      { type: "Feature", description: "Added PWANotifier for service worker updates and background notifications." },
      { type: "Improvement", description: "Backup service updated to include essentials and wash history during export/import." },
      { type: "Improvement", description: "Enhanced user experience with toast notifications for import success or failure." },
      { type: "Refactor", description: "Refactored modal rendering logic in AppLayout for better modularity and performance." }
    ]
  },
  {
    version: "1.7.0",
    date: "2025-10-05",
    changes: [
      { type: "Feature", description: "Implemented `useClothData` hook for enhanced cloth management with status, category resolution, and cost calculation." },
      { type: "Feature", description: "Created CategoryManagementPage with recursive category display, subcategory management, and item counts." },
      { type: "Feature", description: "Built Essentials management interface with add, edit, and delete functionality." },
      { type: "Feature", description: "Developed WardrobeSettings page for user preferences (default view, sort order, and feedback handling)." },
      { type: "Feature", description: "Added EssentialsService and WashHistoryService for CRUD operations and wash tracking." },
      { type: "Feature", description: "Defined EssentialItem and EssentialInput interfaces for improved type safety." },
      { type: "Improvement", description: "Enhanced app-wide state management with Zustand via useAppStore for loading and error tracking." },
      { type: "Improvement", description: "Added utility functions for cloth status metadata and price formatting." }
    ]
  },
  {
    version: "1.6.0",
    date: "2025-10-02",
    changes: [
      { type: "Feature", description: "Integrated Dexie for IndexedDB storage and refactored services for improved data handling." },
      { type: "Feature", description: "Project migrated from JavaScript to TypeScript with types added for models, services, and utilities." },
      { type: "Improvement", description: "TypeScript configuration added for better development experience; imports and code refactored accordingly." },
      { type: "Feature", description: "Browser-image-compression added for image uploads; AddNewCloth component removed." },
      { type: "Feature", description: "About page added with navigation to Changelog modal." },
      { type: "Feature", description: "Changelog page implemented with improved display of app version history." }
    ]
  },
  {
    version: "1.5.1",
    date: "2025-09-30",
    changes: [
      { type: "Feature", description: "Activity Log now supports planned status and 'Mark Worn' functionality." },
      { type: "Feature", description: "Dashboard displays planned outfits with confirmation actions." },
      { type: "Improvement", description: "Settings page updated with Data & Privacy warning and demo default values." },
      { type: "Improvement", description: "Utility functions added for date parsing and validation." },
      { type: "Improvement", description: "Refactored calendar store to manage planned activities and statuses." }
    ]
  },
  {
    version: "1.5.0",
    date: "2025-09-29",
    changes: [
      { type: "Feature", description: "Insights Dashboard added for wardrobe activity and financial overview." },
      { type: "Feature", description: "Hero insights module added with versatile module limits." },
      { type: "Feature", description: "Enhanced AddActivityModal with search and toast notifications." },
      { type: "Feature", description: "BottomNav updated with new actions for adding clothes and outfits." },
      { type: "Feature", description: "Sidebar extended with Insights and Trips sections." },
      { type: "Feature", description: "Settings page updated with Trips & Packing and Wardrobe Insights modules." },
      { type: "Improvement", description: "FabMenu component updated with descriptions and improved styling." },
      { type: "Improvement", description: "ManageFiltersPage optimized for categories and outfit tags." },
      { type: "Improvement", description: "Wardrobe page layout and preferences refined." }
    ]
  },
  {
    version: "1.4.1",
    date: "2025-09-28",
    changes: [
      { type: "Feature", description: "Demo login functionality added." },
      { type: "Feature", description: "Default outfits marked as favorites." },
      { type: "Improvement", description: "Skeleton components implemented across major pages for loading states." },
      { type: "Chore", description: "Vercel deployment configuration added." },
      { type: "Docs", description: "Comprehensive contribution guide added for project setup and best practices." }
    ]
  },
  {
    version: "1.4.0",
    date: "2025-09-20",
    changes: [
      { type: "Feature", description: "Outfit management enhanced with tag normalization and preference updates." },
      { type: "Feature", description: "ManageFiltersPage added for clothes and outfits quick filters." },
      { type: "Feature", description: "New UI components: BulkActionBar, ClothRow, CreateNewMenu, and EmojiPicker." },
      { type: "Improvement", description: "Sidebar navigation and ViewControls improved." },
      { type: "Improvement", description: "Tailwind CSS configuration updated with new colors and gradients." }
    ]
  },
  {
    version: "1.3.1",
    date: "2025-09-18",
    changes: [
      { type: "Feature", description: "Added site.webmanifest for PWA support." },
      { type: "Feature", description: "Logo component added for consistent branding." },
      { type: "Feature", description: "BaseLayout component implemented for consistent backgrounds." },
      { type: "Improvement", description: "Background gradients and layouts updated for AppLayout, Navbar, PublicLayout, and Landing pages." },
      { type: "Fix", description: "Corrected import casing for AuthProvider in App.jsx." }
    ]
  },
  {
    version: "1.3.0",
    date: "2025-09-14",
    changes: [
      { type: "Feature", description: "Laundry and Wardrobe pages refactored to use Zustand for state management." },
      { type: "Feature", description: "New LaundryList and OutfitList components added." },
      { type: "Feature", description: "Cloth and Outfit detail pages with modals for editing added." },
      { type: "Improvement", description: "Filtering capabilities enhanced in Wardrobe." },
      { type: "Feature", description: "New services for Laundry and Wardrobe management implemented." }
    ]
  },
  {
    version: "1.2.1",
    date: "2025-09-11",
    changes: [
      { type: "Improvement", description: "Profile page UI updated." },
      { type: "Improvement", description: "Settings page improved for easier navigation." }
    ]
  },
  {
    version: "1.2.0",
    date: "2025-09-10",
    changes: [
      { type: "Feature", description: "CategoryManagementPage added for managing categories." },
      { type: "Feature", description: "CategoryItem and CategoryModal components added for display and editing." },
      { type: "Feature", description: "ConfirmationModal implemented for delete confirmations." },
      { type: "Feature", description: "Category actions integrated into wardrobe store." },
      { type: "Improvement", description: "Settings page enhanced with link to manage categories." },
      { type: "Change", description: "Removed old CategoriesView component and its references." },
      { type: "Improvement", description: "Settings store refactored to handle data export and import." },
      { type: "Change", description: "App.jsx updated to include CategoryManagementPage route." }
    ]
  },
  {
    version: "1.1.0",
    date: "2025-09-09",
    changes: [
      { type: "Feature", description: "AddActivityModal refactored to use Zustand for wardrobe state management." },
      { type: "Feature", description: "Calendar component enhanced to fetch and manage activities via Zustand." },
      { type: "Feature", description: "ActivityLog component introduced for viewing and deleting activities." },
      { type: "Feature", description: "DayCell component added for better calendar interactions." },
      { type: "Feature", description: "ClothService extended with wear count management methods." },
      { type: "Feature", description: "useWardrobeStore updated to include outfit creation." },
      { type: "Improvement", description: "Dashboard and Landing pages refactored for navigation and UI consistency." },
      { type: "Improvement", description: "Overall code structure and readability improved." }
    ]
  },
  {
    version: "1.0.0",
    date: "2025-09-08",
    changes: [
      { type: "Feature", description: "Initial release of ClothCare with wardrobe, laundry, and calendar management." }
    ]
  }
];
