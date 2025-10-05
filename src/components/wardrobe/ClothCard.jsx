import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useWardrobeStore } from "../../stores/useWardrobeStore";
import useClothData from "../../hooks/useClothData";
function ClothCard({
  cloth,
  isSelectMode = false,
  selected = false,
  onSelectToggle,
}) {
  const navigate = useNavigate();
  const { categories = [], updateCloth } = useWardrobeStore();
  
  const {
    status,
    categoryIcon,
    categoryName,
    colorValue,
    colorLabel,
    wearCount,
    costPerWearLabel
  } = useClothData(cloth, categories);

  const handleClick = () => {
    if (isSelectMode) {
      onSelectToggle?.(cloth.id);
    } else {
      navigate(`/wardrobe/cloth/${cloth.id}`);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`relative text-left w-full rounded-xl shadow-md overflow-hidden card-gradient backdrop-blur border border-white/20 dark:border-white/10 transition-all group cursor-pointer ${
        selected ? "ring-2 ring-primary-deep" : ""
      }`}
    >
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-900/70 flex items-center justify-center border-b border-black/5 dark:border-white/5">
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 pointer-events-none">
          {status.label !== "Unknown" && (
            <span className={`${status.tagClass} pointer-events-none`}>
              {status.label}
            </span>
          )}
          <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md text-xs bg-white/90 dark:bg-gray-900/85 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 shadow-sm">
            <span className="leading-none max-w-[8rem] truncate">
              {categoryName}
            </span>
          </span>
        </div>

        {cloth.image ? (
          <img
            src={cloth.image}
            alt={cloth.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 w-full h-full p-4">
            <div className={`status-ring ${status.ringClass}`}>
              <div
                className="w-16 h-16 rounded-full border border-white/50 dark:border-black/30 flex items-center justify-center text-2xl shadow-inner"
                style={{ backgroundColor: colorValue }}
                aria-label={`Color swatch: ${colorLabel}`}
                title={colorLabel}
              >
                <span className="leading-none drop-shadow-sm">
                  {categoryIcon}
                </span>
              </div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              {categoryName}
            </span>
          </div>
        )}

        {/* Favorite toggle */}
        <button
          className="absolute bottom-2 right-2 p-1 rounded-full bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-white/10 shadow hover-highlight"
          onClick={(e) => {
            e.stopPropagation();
            updateCloth(cloth.id, { favorite: !cloth.favorite });
          }}
          aria-label={
            cloth.favorite ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Heart
            className={`w-4 h-4 ${
              cloth.favorite
                ? "fill-current text-red-500"
                : "text-gray-500 dark:text-gray-300"
            }`}
          />
        </button>

        {/* Selection checkbox overlay */}
        {isSelectMode && (
          <div className="absolute bottom-2 left-2">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelectToggle?.(cloth.id)}
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5"
            />
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <h4 className="font-semibold truncate text-gray-900 dark:text-gray-100">
          {cloth.name}
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Worn {wearCount} {wearCount === 1 ? "time" : "times"}
        </p>
        {costPerWearLabel && (
          <p className="text-xs font-medium text-primary-deep dark:text-primary-bright">
            {costPerWearLabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Performance optimization: Only re-render if props change
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.cloth?.id === nextProps.cloth?.id &&
    prevProps.isSelectMode === nextProps.isSelectMode &&
    prevProps.selected === nextProps.selected &&
    // Deep compare cloth object
    JSON.stringify(prevProps.cloth) === JSON.stringify(nextProps.cloth)
  );
};

export default React.memo(ClothCard, areEqual);
