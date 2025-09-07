import { Link } from 'react-router-dom';

export default function Footer () {
  return (  
  <footer className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none"></div>
    <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
      <div className="mx-auto md:mx-0 text-center md:text-left">
        <span className="font-semibold text-gray-800 dark:text-white">👕 ClothCare</span> © {new Date().getFullYear()}
        <p className="mt-1">Your wardrobe, smarter.</p>
      </div>
      <div className="mx-auto md:mx-0 flex gap-6">
        <Link to="/privacy" className="hover:text-emerald-500">Privacy</Link>
        <Link to="/terms" className="hover:text-emerald-500">Terms</Link>
        <Link to="/contact" className="hover:text-emerald-500">Contact</Link>
      </div>
    </div>
  </footer>
    )
}