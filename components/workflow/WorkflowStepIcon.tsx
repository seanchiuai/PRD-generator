import Link from "next/link";
import { motion } from "framer-motion";
import { Check, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStepIconProps {
  icon: LucideIcon;
  status: "completed" | "current" | "future";
  isNavigable: boolean;
  href?: string;
  size?: "sm" | "md";
  onClick?: () => void;
}

export function WorkflowStepIcon({
  icon: Icon,
  status,
  isNavigable,
  href,
  size = "md",
  onClick,
}: WorkflowStepIconProps) {
  const sizeClass = size === "sm" ? "w-10 h-10" : "w-12 h-12";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  const iconClass = cn(
    `${sizeClass} rounded-full flex items-center justify-center border-2 transition-all`,
    status === "completed" && "bg-green-500 border-green-500 text-white hover:bg-green-600",
    status === "current" && "bg-blue-500 border-blue-500 text-white",
    status === "future" && "bg-gray-100 border-gray-300 text-gray-400",
    isNavigable && "cursor-pointer"
  );

  const content = (
    <div className={iconClass}>
      {status === "completed" ? (
        <Check className={iconSize} />
      ) : (
        <Icon className={iconSize} />
      )}
    </div>
  );

  if (!isNavigable || !href) {
    return content;
  }

  return (
    <Link href={href} onClick={onClick} className="group">
      <motion.div
        whileHover={size === "md" ? { scale: 1.05 } : undefined}
        whileTap={{ scale: 0.95 }}
      >
        {content}
      </motion.div>
    </Link>
  );
}
