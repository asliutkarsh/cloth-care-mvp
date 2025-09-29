// services/index.js

// --- Core Data Services ---
export { StorageService } from "./storageService.js";
export { CategoryService } from "./categoryService.js";
export { ClothService } from "./clothService.js";
export { OutfitService } from "./outfitService.js";

// --- App Workflow & Logic ---
export { LaundryService } from "./laundryService.js";
export { ActivityLogService } from "./activityLogService.js";
export { AnalyticsService } from "./analyticsService.js";
export { InsightsService } from "./insightsService.js";
export { SetupService } from "./setupService.js";

// --- User & Auth Services ---
export { UserService } from "./userService.js";
export { AuthService } from "./authService.js";

// --- Features & Utilities ---
export { BackupService } from "./backupService.js";
export { SearchService } from "./searchService.js";
export { PreferenceService } from "./preferenceService.js";
export { AuditLogService } from "./auditLogService.js"; // From original files
export { TripService } from "./tripService.js";