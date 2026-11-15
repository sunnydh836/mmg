import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { generateBreadcrumbSchema, BreadcrumbItem } from "@/lib/seo";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  includeHome?: boolean;
  className?: string;
}

export function Breadcrumbs({
  items,
  includeHome = true,
  className = "",
}: BreadcrumbsProps) {
  const fullItems: BreadcrumbItem[] = includeHome
    ? [{ name: "Home", path: "/" }, ...items]
    : items;

  const schema = generateBreadcrumbSchema(fullItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center text-xs md:text-sm text-gray-400 py-3 ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1.5 md:gap-2">
          {fullItems.map((item, index) => {
            const isLast = index === fullItems.length - 1;

            return (
              <li key={item.path} className="flex items-center">
                {index > 0 && (
                  <ChevronRight
                    size={14}
                    className="mx-1 text-gray-600 flex-shrink-0"
                    aria-hidden="true"
                  />
                )}
                {isLast ? (
                  <span
                    className="text-white font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md"
                    aria-current="page"
                  >
                    {index === 0 && includeHome ? (
                      <span className="flex items-center gap-1">
                        <Home size={14} /> Home
                      </span>
                    ) : (
                      item.name
                    )}
                  </span>
                ) : (
                  <Link
                    href={item.path}
                    className="hover:text-accent transition-colors flex items-center gap-1"
                  >
                    {index === 0 && includeHome && <Home size={14} />}
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

