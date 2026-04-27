"use client";

import { useState } from "react";
import type { BlogPost } from "@/data/blogs";

interface CategoryFilterProps {
  posts: BlogPost[];
  onFilterChange: (filtered: BlogPost[]) => void;
}

const categories = [
  { id: "all", label: "All Articles", color: "bg-gray-900" },
  { id: "Strategy", label: "Strategy", color: "bg-blue-600" },
  { id: "Guide", label: "Guide", color: "bg-emerald-600" },
  { id: "Prediction", label: "Prediction", color: "bg-purple-600" },
  { id: "Dream Numbers", label: "Dream Numbers", color: "bg-amber-600" },
  { id: "Results", label: "Results Analysis", color: "bg-rose-600" },
];

export function CategoryFilter({ posts, onFilterChange }: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const handleFilter = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId === "all") {
      onFilterChange(posts);
    } else {
      onFilterChange(posts.filter((post) => post.category === categoryId));
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleFilter(cat.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeCategory === cat.id
                ? `${cat.color} text-white shadow-md`
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.id !== "all" && (
              <span className={`h-2 w-2 rounded-full ${cat.color.replace("bg-", "bg-")}`} />
            )}
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
