import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useWardrobeStore } from "../../stores/useWardrobeStore";

const DEFAULT_CATEGORY = { name: "Unknown", icon: "❓" };

const findCategoryById = (categoryTree = [], targetId) => {
  if (!targetId) return null;
  for (const node of categoryTree) {
    if (node?.id === targetId) return node;
    const childMatch = findCategoryById(node?.children || [], targetId);
    if (childMatch) return childMatch;
  }
  return null;
};
export default function ClothCard({
  cloth,
  isSelectMode = false,
  selected = false,
  onSelectToggle,
}) {
  const navigate = useNavigate();
  const { categories = [], updateCloth } = useWardrobeStore();

  const statusMap = {
    clean: {
      tagClass: "tag-clean",
      ringClass: "status-ring-clean",
      label: "Clean",
    },
    dirty: {
      tagClass: "tag-dirty",
      ringClass: "status-ring-dirty",
      label: "Dirty",
    },
    needs_pressing: {
      tagClass:
        "bg-accent-cyan/15 text-accent-cyan ring-1 ring-accent-cyan/30 rounded-full px-2 py-0.5 text-xs font-medium",
      ringClass: "status-ring-new",
      label: "Needs Pressing",
    },
  };

  const status = statusMap[cloth.status] || {
    tagClass: "tag",
    ringClass: "",
    label: "Unknown",
  };

  const rawCategory = cloth.category;
  const categoryId =
    cloth.categoryId ??
    (typeof rawCategory === "object" && rawCategory?.id) ??
    (typeof rawCategory === "string" || typeof rawCategory === "number"
      ? rawCategory
      : null);
  const resolvedCategory = findCategoryById(categories, categoryId);
  const categoryData =
    resolvedCategory ||
    (typeof rawCategory === "object" && (rawCategory.name || rawCategory.icon)
      ? rawCategory
      : null) ||
    DEFAULT_CATEGORY;
  const categoryIcon = categoryData.icon || DEFAULT_CATEGORY.icon;
  const categoryName = categoryData.name || DEFAULT_CATEGORY.name;

  const hasColor =
    typeof cloth.color === "string" && cloth.color.trim().length > 0;
  const colorValue = hasColor ? cloth.color : "#d1d5db";
  const colorLabel = hasColor ? cloth.color : "Neutral color";

  const wearCount = cloth.currentWearCount ?? 0;
  const cost = typeof cloth.cost === "number" ? cloth.cost : Number(cloth.cost || 0);
  const hasCost = Number.isFinite(cost) && cost > 0;
  const costPerWear = hasCost && wearCount > 0 ? cost / wearCount : cost;
  const costPerWearLabel = hasCost
    ? wearCount > 0
      ? `$${costPerWear.toFixed(2)} per wear`
      : `$${cost.toFixed(2)} total`
    : null;

  const handleClick = () => {
    if (isSelectMode) {
      onSelectToggle?.(cloth.id);
    } else {
      navigate(`/wardrobe/cloth/${cloth.id}`);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`relative text-left w-full rounded-xl shadow-md overflow-hidden card-gradient backdrop-blur border border-white/20 dark:border-white/10 transition-all group ${
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
          Worn {cloth.currentWearCount ?? 0} {cloth.currentWearCount === 1 ? "time" : "times"}
        </p>
        {costPerWearLabel && (
          <p className="text-xs font-medium text-primary-deep dark:text-primary-bright">
            {costPerWearLabel}
          </p>
        )}
      </div>
    </motion.button>
  );
}
