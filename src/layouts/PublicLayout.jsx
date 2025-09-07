// src/layouts/PublicLayout.jsx
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar' // The same Navbar component is smart enough to be reused

export default function PublicLayout() {
    
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-white dark:bg-black">
      {/* Consistent background styling from AppLayout */}
      <div
        className="absolute inset-0 z-0 pointer-events-none hidden dark:block"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.25), transparent 70%), #000000',
        }}
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet /> {/* Public pages like Landing, Login, etc. will render here */}
        </main>
      </div>
    </div>
  )
}