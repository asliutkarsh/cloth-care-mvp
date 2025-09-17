import AnimatedPage from '../components/AnimatedPage'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  FAQ,
  Footer,
  CtaButton,
  FeatureGrid,
  Section,
} from '../components/landing'
import { useThemeStore } from '../stores/useThemeStore' // 1. Import the theme store

// --- Data Constants ---
// const featuresData = [
//   { emoji: '👕', title: 'Digital Wardrobe', text: 'Snap and organize all your clothes in one place.' },
//   { emoji: '📅', title: 'Calendar Logging', text: 'Track what you wore and when with a simple calendar view.' },
//   { emoji: '🧺', title: 'Laundry Made Easy', text: 'See what’s dirty, needs pressing, or ready to wear.' },
//   { emoji: '🔔', title: 'Smart Reminders', text: 'Get notified when it’s time to wash your clothes.' },
// ];

const benefitsData = [
  {
    emoji: '👕',
    title: 'Save Clothes',
    text: 'Extend clothing lifespan and cut laundry costs.',
  },
  {
    emoji: '⏱️',
    title: 'Save Time',
    text: 'No more guessing what’s clean or what to wear.',
  },
  {
    emoji: '💸',
    title: 'Save Money',
    text: 'Extend clothing lifespan and cut laundry costs.',
  },
  {
    emoji: '📦',
    title: 'Stay Organized',
    text: 'A clutter-free wardrobe in your pocket.',
  },
]

const personaData = [
  {
    emoji: '👔',
    title: 'Busy Professional',
    text: 'Stay efficient and always look presentable for work.',
  },
  {
    emoji: '🎓',
    title: 'College Student ',
    text: 'Stay on top of outfits and laundry, stress-free.',
  },
  {
    emoji: '👩‍👧',
    title: 'Parents & Families ',
    text: 'Easily manage outfits for the whole household.',
  },
  {
    emoji: '🌍',
    title: 'Eco-Conscious Users ',
    text: 'Wash less, waste less, and reduce your footprint.',
  },
]

const sustainabilityData = [
  { emoji: '💧', title: 'Water Saved', text: '~100L per week' },
  { emoji: '⚡', title: 'Energy Saved', text: '~5 kWh per week' },
  { emoji: '🌍', title: 'Carbon Reduced', text: '~3kg CO₂ per week' },
  { emoji: '💰', title: 'Money Saved', text: '~$5 per week' },
]

const howItWorkData = [
  {
    step: 1,
    emoji: '📸',
    title: 'Add Clothes',
    text: 'Snap or upload your wardrobe.',
  },
  {
    step: 2,
    emoji: '📅',
    title: 'Log Outfits',
    text: 'Mark worn days and laundry days.',
  },
  {
    step: 3,
    emoji: '🔔',
    title: 'Get Notifications',
    text: 'Get notified when it’s time to wash your clothes.',
  },
  {
    step: 4,
    emoji: '📊',
    title: 'Get Insights',
    text: 'Save time, money, and resources.',
  },
]

// --- Calendar Showcase (Emerald theme) ---
const CalendarShowcase = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [wornDays, setWornDays] = useState([]);
  const [laundryDays, setLaundryDays] = useState([]);

  useEffect(() => {
    const daysInMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      0
    ).getDate();

    const newWornDays = [];
    const newLaundryDays = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const isWorn = Math.random() > 0.7;
      const isLaundry = Math.random() > 0.75;

      if (isWorn) newWornDays.push(i);
      if (isLaundry) newLaundryDays.push(i);
    }

    setWornDays(newWornDays);
    setLaundryDays(newLaundryDays);
  }, [selectedMonth]);

  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  return (
    <div className="mx-auto max-w-lg p-6 rounded-2xl shadow-md bg-white/80 dark:bg-black/40 backdrop-blur relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-gradient-to-br from-emerald-400/30 via-transparent to-transparent" />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePreviousMonth}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-600 to-gray-800 text-white font-semibold shadow-md hover:from-gray-700 hover:to-black transition-all"
        >
          ← Prev
        </button>

        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          {selectedMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>

        <button
          onClick={handleNextMonth}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-600 to-gray-800 text-white font-semibold shadow-md hover:from-gray-700 hover:to-black transition-all"
        >
          Next →
        </button>
      </div>

      <CalendarMonth
        month={selectedMonth.getMonth()}
        year={selectedMonth.getFullYear()}
        wornDays={wornDays}
        laundryDays={laundryDays}
      />

    </div>
  );
};

const CalendarMonth = ({ month, year, wornDays = [], laundryDays = [] }) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstDate = new Date(year, month, 1);
  const startDay = firstDate.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks = Array.from({ length: startDay }, () => null);
  const dateNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalCells = blanks.length + dateNumbers.length;

  const trailingBlanks = Array.from(
    { length: totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7) },
    () => null
  );

  const dates = [...blanks, ...dateNumbers, ...trailingBlanks];

  return (
    <div className="relative">
      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {days.map((day) => (
          <div
            key={day}
            className="font-semibold text-emerald-600 dark:text-emerald-400"
          >
            {day}
          </div>
        ))}

        {dates.map((date, idx) =>
          date ? (
            <CalendarDay
              key={`${year}-${month}-${date}`}
              date={date}
              month={month}
              year={year}
              wornDays={wornDays}
              laundryDays={laundryDays}
            />
          ) : (
            <div key={`blank-${idx}`} />
          )
        )}
      </div>
    </div>
  );
};

const CalendarDay = ({ date, month, year, wornDays = [], laundryDays = [] }) => {
  const isWorn = wornDays.includes(date);
  const isLaundry = laundryDays.includes(date);

  let bgColor = "bg-gray-50 dark:bg-gray-800";
  let textColor = "";
  let emoji = <span>{date}</span>;

  if (isWorn && isLaundry) {
    bgColor = "bg-purple-500 shadow-purple-500/30";
    textColor = "text-white font-bold";
    emoji = (
      <div className="flex gap-1 items-center text-white">
        <span>👕</span>
        <span>🧺</span>
      </div>
    );
  } else if (isWorn) {
    bgColor = "bg-blue-500 shadow-blue-500/30";
    textColor = "text-white font-bold";
    emoji = <span className="text-white">👕</span>;
  } else if (isLaundry) {
    bgColor = "bg-emerald-500 shadow-emerald-500/30";
    textColor = "text-white font-bold";
    emoji = <span className="text-white">🧺</span>;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative w-full h-12 flex items-center justify-center rounded-lg"
    >
      {/* Background */}
      <div
        className={`absolute inset-0 z-0 rounded-lg border border-gray-200/20 dark:border-gray-700/40 ${bgColor} ${textColor}`}
      />
      {/* Emoji */}
      <span className="z-10">{emoji}</span>
    </motion.div>
  );
};



// --- Main Landing Page ---
export default function Landing() {
  const theme = useThemeStore((state) => state.theme)
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <AnimatedPage>
      {/* HERO */}
      <section className="relative flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20 md:py-28 overflow-hidden">
        {/* Emerald glow background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark ? "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(16,185,129,0.25), transparent 70%)" : "radial-gradient(125% 125% at 50% 20%, #ffffff 40%, #a6d5cd 100%)",
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
            Track outfits, optimize laundry, and care for your clothes. Save
            money 💰 and the planet 🌍, one wear at a time.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center"
          >
            <CtaButton to="/signup" variant={isDark ? 'secondary' : 'primary'}>
              🚀 Get Started
            </CtaButton>
            <CtaButton to="/login" variant={isDark ? 'primary' : 'secondary'}>
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
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          🌱 Save Money & Resources
        </h2>
        <p className="text-center mt-3 text-gray-600 dark:text-gray-300">
          Every small action counts. By tracking your outfits and laundry, you
          save money and resources.
        </p>
        <div className="mt-10">
          <FeatureGrid items={sustainabilityData} />
        </div>
      </Section>

      <Section>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          How It Works
        </h2>
        <p className="text-center mt-3 text-gray-600 dark:text-gray-300">
          Follow these simple steps to get started.
        </p>
        <div className="mt-10">
          <FeatureGrid items={howItWorkData} />
        </div>
      </Section>

      {/* CALENDAR */}
      <Section className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          📅 Outfit Calendar
        </h2>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Log your outfits directly on a calendar. See what you wore 👕, when
          you wore it, and what’s ready to wear again.
        </p>
        <div className="mt-8">
          <CalendarShowcase />
        </div>
      </Section>

      {/* BENEFITS */}
      <Section>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Why Use It?
        </h2>
        <div className="mt-10">
          <FeatureGrid items={benefitsData} />
        </div>
      </Section>

      {/* PERSONAS */}
      <Section>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Who Is It For?
        </h2>
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
  )
}
