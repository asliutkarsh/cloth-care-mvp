import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Section from "./Section";

const faqs = [
  { q: "How will it help me save money?", a: "ClothCare reduces laundry costs by extending your clothes lifespan." },
  { q: "How will it help me reduce waste?", a: "ClothCare reduces waste by extending clothes lifespan and encouraging you to wash less." },
  { q: "How will it help me save time?", a: "ClothCare organizes your clothes and reminds you when it’s time to wash, saving you time and stress." },
  { q: "How will it help me feel more organized?", a: "ClothCare keeps your clothes organized and helps you stay on top of your laundry, saving you from clutter and stress." },
  { q: "Is it free?", a: "Yes, it is completely free and open source." },
];

export default function FAQ() {
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