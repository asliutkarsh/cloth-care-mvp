import { Link, Outlet } from "react-router-dom";
import AnimatedPage from "../components/AnimatedPage";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
    const { logout } = useAuth()


  return (
    <AnimatedPage>
      <div className="p-6 dark:text-white">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <nav className="space-x-4 mb-6">
          <Link to="profile" className="underline">Profile</Link>
          <button
              onClick={() => { logout(); }}
              className="w-full text-left px-3 py-2 rounded bg-gray-100/70 dark:bg-gray-800/70 hover:bg-gray-200/70 dark:hover:bg-gray-700/70"
            >
              Sign out
            </button>
        </nav>
        <Outlet />
      </div>
    </AnimatedPage>
  );
}
