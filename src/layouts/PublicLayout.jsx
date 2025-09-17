// src/layouts/PublicLayout.jsx (Updated)

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BaseLayout from './BaseLayout'; // Use the new BaseLayout

export default function PublicLayout() {
  return (
    <BaseLayout>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </BaseLayout>
  );
}