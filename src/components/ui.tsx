import { ReactNode } from "react";

interface BadgeProps {
 children: ReactNode;
 color: string;
className?: string;
}

export default function Badge({ children, color, className }: BadgeProps) {

  const getColorClasses = (color: string): string => {
    switch (color) {
      case 'primary':
        return 'bg-blue-100 text-blue-800';
      case 'secondary':
        return 'bg-indigo-100 text-indigo-800';
      case 'danger':
        return 'bg-red-100 text-red-600';
      case 'success':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  return (
    <span
      className={
        "text-sm font-medium px-2.5 py-0.5 rounded group mx-1 " +
        getColorClasses(color) + " " + className
      }
    >
      {children}
    </span>
  );
}