import Link from "next/link";
import { IoChevronForward } from "react-icons/io5";

export interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
  className?: string;
}

export const Breadcrumbs = ({ items, className = "" }: Props) => {
  return (
    <nav aria-label="Breadcrumb" className={`text-sm text-brand-smoke px-5 sm:px-0 ${className}`}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1 min-w-0">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-brand-orange transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-brand-black font-medium truncate max-w-[180px] sm:max-w-xs md:max-w-none" : ""}>
                  {item.label}
                </span>
              )}
              {!isLast && <IoChevronForward size={14} className="opacity-60" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
