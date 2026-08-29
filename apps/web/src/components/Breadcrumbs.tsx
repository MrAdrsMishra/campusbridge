import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { generateBreadcrumbSchema } from "./seoUtils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = "" }) => {
  // Build schema items
  const schemaItems = [
    { name: "Home", url: "/" },
    ...items.map((item) => ({
      name: item.label,
      url: item.href || "#",
    })),
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(schemaItems);

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs md:text-sm text-gray-500 py-3 ${className}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ol className="flex items-center flex-wrap gap-1 md:gap-2">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          >
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center">
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 mx-1 flex-shrink-0" />
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-semibold truncate max-w-[200px] md:max-w-none">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
