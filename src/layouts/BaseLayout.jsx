// src/layouts/BaseLayout.jsx

/**
 * A reusable layout component that provides the consistent background gradient
 * and wrapper structure for the entire application.
 */
export default function BaseLayout({ children }) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-white dark:bg-black">
        {/* Consistent Background Gradients */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Dark mode gradient */}
          <div
            className="hidden dark:block w-full h-full"
            style={{
              background: 'radial-gradient(circle at center, #0e3e37 0%, #051412 100%)',
            }}
          />
          {/* Light mode gradient */}
          <div
            className="block dark:hidden w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(circle at center, #e6f8f5 0%, #f6fdfc 100%)',
            }}
          />
        </div>
  
        {/* Page Content */}
        <div className="relative z-10 flex min-h-screen flex-col">
          {children}
        </div>
      </div>
    );
  }