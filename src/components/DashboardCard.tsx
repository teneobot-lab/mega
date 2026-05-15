import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color?: string;
  count?: number | string;
}

export function DashboardCard({ title, description, href, icon: Icon, color = "blue", count }: DashboardCardProps) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
    red: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100",
    green: "bg-green-50 text-green-600 border-green-200 hover:bg-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100",
  };

  return (
    <Link 
      to={href}
      className={cn(
        "group p-6 rounded-xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between h-full min-h-[160px]",
        "border-zinc-200"
      )}
    >
      <div className="flex justify-between items-start">
        <div className={cn("p-3 rounded-xl border transition-colors", colorMap[color])}>
          <Icon className="h-6 w-6" />
        </div>
        {count !== undefined && (
          <span className="text-2xl font-black text-zinc-300 group-hover:text-primary transition-colors">
            {count}
          </span>
        )}
      </div>
      <div>
        <h3 className="font-bold text-zinc-900 group-hover:text-primary transition-colors mt-4">
          {title}
        </h3>
        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  );
}
