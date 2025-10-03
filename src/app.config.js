export const APP_VERSION = "1.6.0";

export const WHATS_NEW = [
  {
    version: "1.6.0",
    date: "2025-10-02",
    changes: [
      "About page added with easy access to app information.",
      "Changelog modal added to view version history directly in-app.",
      "Image uploads now support compression for faster and smaller uploads."
    ]
  },
  {
    version: "1.5.1",
    date: "2025-09-30",
    changes: [
      "Plan your outfits and track activities with the new Activity Log “Planned” status.",
      "Dashboard now shows planned outfits for the day with easy confirmation.",
      "Settings page updated with Data & Privacy warning and demo default items."
    ]
  },
  {
    version: "1.5.0",
    date: "2025-09-29",
    changes: [
      "Insights Dashboard added for wardrobe activities and financial overview.",
      "New modules and hero insights help track stats and wardrobe usage.",
      "Enhanced navigation with Insights and Trips sections, plus new settings options."
    ]
  },
  {
    version: "1.4.1",
    date: "2025-09-28",
    changes: [
      "Demo login added for quick app access.",
      "Default outfits now marked as favorites for easier selection.",
      "Skeleton screens added for smoother page loading experience."
    ]
  },
  {
    version: "1.4.0",
    date: "2025-09-20",
    changes: [
      "Outfit management improved with tag suggestions and preference updates.",
      "Manage filters for clothes and outfits with new dedicated page and UI components.",
      "Emoji Picker added for creating outfits with fun custom icons."
    ]
  },
  {
    version: "1.3.1",
    date: "2025-09-18",
    changes: [
      "PWA support added for offline usage.",
      "New Logo component for consistent app branding.",
      "Refreshed app backgrounds and layout styling for a cleaner look."
    ]
  },
  {
    version: "1.3.0",
    date: "2025-09-14",
    changes: [
      "Laundry and Wardrobe pages redesigned with new lists and detail modals.",
      "Enhanced filtering in Wardrobe for faster item searches."
    ]
  },
  {
    version: "1.2.1",
    date: "2025-09-11",
    changes: [
      "Profile page refreshed with updated UI.",
      "Settings page improved for easier navigation and use."
    ]
  },
  {
    version: "1.2.0",
    date: "2025-09-10",
    changes: [
      "New Category Management page: add, edit, and delete categories easily.",
      "Settings now include category management and data import/export options."
    ]
  },
  {
    version: "1.1.0",
    date: "2025-09-09",
    changes: [
      "Calendar improved for better activity tracking and day interactions.",
      "Activity Log added to view and delete past activities.",
      "Dashboard navigation and layout improved for a smoother experience."
    ]
  },
  {
    version: "1.0.0",
    date: "2025-09-08",
    changes: [
      "Initial release of ClothCare with wardrobe, laundry, and calendar management."
    ]
  }
];

export const CHANGELOG = [
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
