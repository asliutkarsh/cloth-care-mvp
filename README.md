# ClothCare

ClothCare is a modern web application designed to help users digitize their wardrobe, track outfits, manage laundry, and make smarter decisions about their clothes.

---

## ✨ Key Features

- **Digital Wardrobe:** Add, edit, and view all your clothes and outfits in one place.
- **Category Management:** Organize your wardrobe with a fully customizable nested category system.
- **Activity Calendar:** Log what you wear each day and view your wear history on an interactive calendar.
- **Laundry Management:** Automatically track which clothes are dirty or need pressing, and manage your laundry workflow.
- **User Dashboard:** Get an at-a-glance summary of your wardrobe stats, recent activity, and quick actions.
- **Data Portability:** Full support for exporting and importing your entire wardrobe data to a JSON file.
- **Responsive Design:** A mobile-first interface that works beautifully on all screen sizes.
- **Light & Dark Mode:** A theme manager that supports user preference and respects system settings.

---

## 🛠️ Tech Stack

- **Framework:** React
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Routing:** React Router
- **Animations:** Framer Motion
- **Icons:** Lucide React

---

## 🏛️ Project Architecture

This application follows a clean, three-layer architecture to ensure a clear separation of concerns.

### 1. UI Layer (Components & Pages)

- **Location:** `src/pages` & `src/components`
- **Description:** Contains all React components. `pages` are top-level views corresponding to routes, while `components` hold reusable UI elements (e.g., `Modal`, `Button`, `StatCard`).
- **Routing:** Handled by `react-router-dom` in `src/App.jsx`, which defines separate layouts for public (`PublicLayout`) and protected (`AppLayout`) routes.

### 2. State Management Layer (Zustand)

- **Location:** `src/stores`
- **Description:** This layer is the "single source of truth" for the application's state. It uses Zustand to create multiple, feature-specific stores (e.g., `useWardrobeStore`, `useAuthStore`, `useCalendarStore`).
- **Data Flow:** Components subscribe to these stores to get data. When they need to change something, they call an "action" in the store. The action then calls the appropriate service to perform the logic and update the data.

### 3. Service Layer

- **Location:** `src/services`
- **Description:** Contains all the core business logic and data persistence. Each service is a stateless collection of asynchronous functions with a single responsibility (e.g., `ClothService` handles all logic related to clothes).
- **Data Persistence:** All services currently use the `StorageService` to read from and write to the browser's `localStorage`. To connect to a real backend, one would only need to modify the `StorageService` to make API calls instead.

---

## 📦 Core Data Models

- **Cloth:** Represents a single clothing item (`id`, `name`, `categoryId`, `status`, `currentWearCount`).
- **Outfit:** Represents a collection of clothes (`id`, `name`, `clothIds`).
- **Category:** Represents a category or subcategory (`id`, `name`, `parentId`, `maxWearCount`).
- **ActivityLog:** A record of an outfit or cloth being worn on a specific date (`id`, `date`, `type`, `outfitId`/`clothIds`).

---

## 🚀 Getting Started

1. **Clone the repository.**
2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Run the development server:**

    ```bash
    npm run dev
    ```
