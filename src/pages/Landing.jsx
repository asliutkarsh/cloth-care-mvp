import AnimatedPage from '../components/AnimatedPage';
import { Link } from 'react-router-dom';
import { motion , AnimatePresence} from 'framer-motion';
import { useState } from 'react';

// --- Data Constants ---
// const featuresData = [
//   { emoji: '👕', title: 'Digital Wardrobe', text: 'Snap and organize all your clothes in one place.' },
//   { emoji: '📅', title: 'Calendar Logging', text: 'Track what you wore and when with a simple calendar view.' },
//   { emoji: '🧺', title: 'Laundry Made Easy', text: 'See what’s dirty, needs pressing, or ready to wear.' },
//   { emoji: '🔔', title: 'Smart Reminders', text: 'Get notified when it’s time to wash your clothes.' },
// ];

const benefitsData = [
  { emoji: '👕', title: 'Save Clothes', text: 'Extend clothing lifespan and cut laundry costs.' },
  { emoji: '⏱️', title: 'Save Time', text: 'No more guessing what’s clean or what to wear.' },
  { emoji: '💸', title: 'Save Money', text: 'Extend clothing lifespan and cut laundry costs.' },
  { emoji: '📦', title: 'Stay Organized', text: 'A clutter-free wardrobe in your pocket.' },
];

const personaData = [
  { emoji: '👔', title: 'Busy Professional', text: 'Stay efficient and always look presentable for work.' },
  { emoji: '🎓', title: 'College Student ', text: 'Stay on top of outfits and laundry, stress-free.' },
  { emoji: '👩‍👧', title: 'Parents & Families ', text: 'Easily manage outfits for the whole household.' },
  { emoji: '🌍', title: 'Eco-Conscious Users ', text: 'Wash less, waste less, and reduce your footprint.' },
];

const sustainabilityData = [
  { emoji: '💧', title: 'Water Saved', text: '~100L per week' },
  { emoji: '⚡', title: 'Energy Saved', text: '~5 kWh per week' },
  { emoji: '🌍', title: 'Carbon Reduced', text: '~3kg CO₂ per week' },
  { emoji: '💰', title: 'Money Saved', text: '~$5 per week' },
];

const howItWorkData = [
  { step: 1, emoji: '📸', title: 'Add Clothes', text: 'Snap or upload your wardrobe.' },
  { step: 2, emoji: '📅', title: 'Log Outfits', text: 'Mark worn days and laundry days.' },
  { step: 3, emoji: '🔔', title: 'Get Notifications', text: 'Get notified when it’s time to wash your clothes.' },
  { step: 4, emoji: '📊', title: 'Get Insights', text: 'Save time, money, and resources.' },
];

const faqs = [
  { q: "How will it help me save money?", a: "ClothCare reduces laundry costs by extending your clothes lifespan." },
  { q: "How will it help me reduce waste?", a: "ClothCare reduces waste by extending clothes lifespan and encouraging you to wash less." },
  { q: "How will it help me save time?", a: "ClothCare organizes your clothes and reminds you when it’s time to wash, saving you time and stress." },
  { q: "How will it help me feel more organized?", a: "ClothCare keeps your clothes organized and helps you stay on top of your laundry, saving you from clutter and stress." },
  { q: "Is it free?", a: "Yes, it is completely free and open source." },
];

// --- Reusable UI Components ---
const Section = ({ children, className = '' }) => (
  <section className={`container px-4 sm:px-6 lg:px-8 py-14 md:py-20 ${className}`}>{children}</section>
);

const CtaButton = ({ to, children, variant = 'primary' }) => {
  const base =
    'inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold transition hover:scale-[1.02] active:scale-[0.98]';
  const variants = {
    primary: 'bg-brand text-white shadow-lg shadow-brand/20',
    secondary:
      'bg-white/70 dark:bg-gray-800/70 border border-white/30 dark:border-white/10 backdrop-blur text-gray-900 dark:text-gray-100',
  };
  return (
    <Link to={to} className={`${base} ${variants[variant]}`}>
      {children}
    </Link>
  );
};

const FeatureCard = ({ emoji, title, text }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    className="text-center p-6"
  >
    <span className="text-4xl">{emoji}</span>
    <h4 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{title}</h4>
    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{text}</p>
  </motion.div>
);

const FeatureGrid = ({ items }) => {
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={gridVariants}
      className="grid sm:grid-cols-2 md:grid-cols-4 gap-6"
    >
      {items.map((item, i) => (
        <FeatureCard key={i} {...item} />
      ))}
    </motion.div>
  );
};

// --- Calendar Showcase (Emerald theme) ---
const CalendarShowcase = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const handlePreviousMonth = () => {
    setSelectedMonth((prevMonth) => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prevMonth) => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1));
  };

  return (
    <div className="mx-auto max-w-lg p-6 rounded-2xl shadow-md bg-white/80 dark:bg-black/40 backdrop-blur relative overflow-hidden">
      {/* emerald spotlight overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-gradient-to-br from-emerald-400/30 via-transparent to-transparent"></div>

      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePreviousMonth}>Previous Month</button>
        <h3 className="text-lg font-bold">{selectedMonth.toLocaleString("default", { month: "long", year: "numeric" })}</h3>
        <button onClick={handleNextMonth}>Next Month</button>
      </div>

      <div className="relative">
        <CalendarMonth month={selectedMonth.getMonth()} year={selectedMonth.getFullYear()} />
        <hr className="my-4" />
      </div>
    </div>
  );
};

const CalendarMonth = ({ month, year }) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDate = new Date(year, month, 1);
  const startDay = firstDate.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks = Array.from({ length: startDay }, () => null);
  const dates = [...blanks, ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="relative">
      <div className="grid grid-cols-7 gap-2 text-center text-sm relative">
        {days.map((day) => (
          <div key={day} className="font-semibold text-emerald-600 dark:text-emerald-400">
            {day}
          </div>
        ))}
        {dates.map((date, idx) =>
          date ? (
            <CalendarDay key={idx} date={date} month={month} year={year} />
          ) : (
            <div key={idx}></div>
          )
        )}
      </div>
    </div>
  );
};

const CalendarDay = ({ date, month, year }) => {
  const dayDate = new Date(year, month, date);
  const today = new Date();

  const isToday = dayDate.toDateString() === today.toDateString();
  const isCurrentMonth = dayDate.getMonth() === month;

  const wornDays = [2, 5, 8, 12, 18, 22, 27]; // 👕
  const laundryDays = [6, 15, 28]; // 🧺

  return (
    <motion.div
      className={`relative h-12 flex flex-col items-center justify-center rounded-lg cursor-pointer ${
        isToday ? "bg-gray-100 dark:bg-gray-800" : ""
      } ${isCurrentMonth ? "" : "opacity-50"}`}
      whileHover={{ scale: 1.05 }}
    >
      <span className="absolute z-10 w-full h-full flex items-center justify-center">
        {wornDays.includes(date) && (
          <motion.span
            className={`inline-block text-lg ${laundryDays.includes(date) ? "text-blue-500" : "text-emerald-500"}`}
          >
            👕
          </motion.span>
        )}
        {laundryDays.includes(date) && (
          <motion.span
            className={`inline-block text-lg ${wornDays.includes(date) ? "text-emerald-500" : "text-blue-500"}`}
          >
            🧺
          </motion.span>
        )}
        {!wornDays.includes(date) && !laundryDays.includes(date) && <span>{date}</span>}
      </span>
      <motion.div
        className={`absolute z-0 w-full h-full flex items-center justify-center rounded-lg border border-gray-200/20 dark:border-gray-700/40 ${
          wornDays.includes(date)
            ? "bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30"
            : laundryDays.includes(date)
              ? "bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30"
              : "bg-gray-50 dark:bg-gray-800"
        }`}
      ></motion.div>
    </motion.div>
  );
};

// --- FAQ ---
const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const toggleOpen = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <Section className="max-w-3xl mx-auto">
      <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
        ❓ FAQ
      </h2>

      <div className="mt-8 divide-y divide-gray-200/20 dark:divide-gray-700/40">
        {faqs.map((item, i) => (
          <div key={i} className="py-4">
            {/* Question Button */}
            <button
              type="button"
              onClick={() => toggleOpen(i)}
              className="w-full flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-white text-left"
            >
              <span>
                {item.qEmoji} {item.q}
              </span>
              <span className="ml-2">{openIdx === i ? "▴" : "▾"}</span>
            </button>

            {/* Animated Answer */}
            <AnimatePresence initial={false}>
              {openIdx === i && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="mt-2 text-sm text-gray-700 dark:text-gray-300 overflow-hidden"
                >
                  {item.a}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </Section>
  );
};


// --- Footer (emerald accent) ---
const Footer = () => (
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
);




// --- Main Landing Page ---
export default function Landing() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" || !localStorage.getItem("theme");
  });
  return (
    <AnimatedPage>
      {/* HERO */}
      <section className="relative flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20 md:py-28 overflow-hidden">
        {/* Emerald glow background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(16,185,129,0.25), transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white"
          >
            Your Smart Digital Wardrobe 👕✨
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mt-5 text-base sm:text-lg text-gray-700 dark:text-gray-300"
          >
            Track outfits, optimize laundry, and care for your clothes. Save money 💰 and the planet 🌍, one wear at a time.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center"
          >
            <CtaButton
              to="/signup"
              variant={dark ? "secondary" : "primary"}
            >
              🚀 Get Started
            </CtaButton>
            <CtaButton
              to="/login"
              variant={dark ? "primary" : "secondary"}
            >
              🔑 Login
            </CtaButton>
          </motion.div>
        </div>
      </section>


      {/* FEATURES */}
      {/* <Section>
        <FeatureGrid items={featuresData} />
      </Section> */}

      <Section>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">🌱 Save Money & Resources</h2>
        <p className="text-center mt-3 text-gray-600 dark:text-gray-300">
          Every small action counts. By tracking your outfits and laundry, you save money and resources.
        </p>
        <div className="mt-10">
          <FeatureGrid items={sustainabilityData} />
        </div>
      </Section>

      <Section>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">How It Works</h2>
        <p className="text-center mt-3 text-gray-600 dark:text-gray-300">
          Follow these simple steps to get started.
        </p>
        <div className="mt-10">
          <FeatureGrid items={howItWorkData} />
        </div>
      </Section>

      {/* CALENDAR */}
      <Section className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">📅 Outfit Calendar</h2>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Log your outfits directly on a calendar. See what you wore 👕, when you wore it, and what’s ready to wear again.
        </p>
        <div className="mt-8">
          <CalendarShowcase />
        </div>
      </Section>

      {/* BENEFITS */}
      <Section>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Why Use It?</h2>
        <div className="mt-10">
          <FeatureGrid items={benefitsData} />
        </div>
      </Section>

      {/* PERSONAS */}
      <Section>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Who Is It For?</h2>
        <div className="mt-10">
          <FeatureGrid items={personaData} />
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <FAQ />
      </Section>

      {/* FINAL CTA */}
      <Section className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Free During Beta 🚀
        </h2>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Join the waitlist and be the first to try it.
        </p>
        <div className="mt-6 flex justify-center">
          <CtaButton to="/signup">✨ Join Now</CtaButton>
        </div>
      </Section>


      {/* FOOTER */}
      <Footer />
    </AnimatedPage>
  );
}