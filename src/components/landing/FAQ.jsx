import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Section from "./Section";
// Assuming you have a way to import icons, but will use simple characters for portability

const faqs = [
  // Enhanced & new questions
  { 
    q: "How will ClothCare help me save money? 💸", 
    a: "By tracking the true wear count of each item, ClothCare helps you avoid premature washing, which significantly **extends your clothing's lifespan** and reduces costs associated with utility bills, detergent, and replacement garments." 
  },
  { 
    q: "How does it help me reduce my environmental footprint? 🌍", 
    a: "ClothCare encourages you to **wash less often** by knowing exactly when an item is truly 'dirty.' This directly translates to lower water and energy consumption, reducing your contribution to CO₂ emissions and microplastic pollution from laundry cycles." 
  },
  { 
    q: "How does ClothCare save me time? ⏱️", 
    a: "It eliminates the 'laundry guessing game.' You can instantly see which items are clean, which are ready to wear again, and when the laundry basket is actually full, making decisions faster and simplifying your weekly chores." 
  },
  { 
    q: "What is a 'Digital Wardrobe' and how does it keep me organized? 📦", 
    a: "A Digital Wardrobe is a virtual copy of your closet. ClothCare keeps your items cataloged, tracks their status (clean, worn, dirty), and helps you stay on top of your laundry schedule, saving you from physical clutter and mental stress." 
  },
  { 
    q: "Can I track items that are part of an outfit? 👔", 
    a: "Yes! You can log an entire **outfit** with a single tap. The system automatically updates the wear count and status for all individual items within that outfit, providing comprehensive tracking without tedious manual entry." 
  },
  { 
    q: "Do I have to take photos of every single item I own? 📸", 
    a: "While photos give the best experience, you can start by simply adding the item name, category, and desired wear count. You can always add photos later! Focus on digitizing your most frequently worn clothes first." 
  },
  { 
    q: "Is the app free, and where can I use it? 🆓", 
    a: "Yes, the app is completely free and **open source**. It is currently a web application, meaning you can access it on any device—phone, tablet, or desktop—through your web browser." 
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggleOpen = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <Section className="max-w-3xl mx-auto">
      <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12">
        Frequently Asked Questions
      </h2>

      <div className="mt-8 divide-y divide-gray-200/50 dark:divide-gray-700/60 border-t border-b border-gray-200/50 dark:border-gray-700/60">
        {faqs.map((item, i) => (
          <div key={i} className="py-4">
            {/* Question Button */}
            <button
              type="button"
              onClick={() => toggleOpen(i)}
              // Added hover background for better interactivity feedback
              className="w-full flex justify-between items-center text-xl font-semibold text-gray-900 dark:text-white text-left p-2 -m-2 rounded-lg transition-colors duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            >
              <span className="pr-4">{item.q}</span>
              
              {/* Enhanced Arrow Icon with Rotation */}
              <span className="ml-2 flex-shrink-0">
                <motion.span
                    initial={false}
                    animate={{ rotate: openIdx === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl text-emerald-500 dark:text-emerald-400"
                >
                    ▾
                </motion.span>
              </span>
            </button>

            {/* Animated Answer */}
            <AnimatePresence initial={false}>
              {openIdx === i && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    ease: "easeInOut",
                  }}
                  className="mt-3 pl-2 text-base text-gray-600 dark:text-gray-300 overflow-hidden"
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
}