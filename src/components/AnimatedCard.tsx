"use client";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedCard({
  children,
  className = "",
  delay = 0,
}: AnimatedCardProps) {
  return (
    <div
      className={`animate-fade-in-up ${className}`}
      style={{
        animationDelay: `${delay * 100}ms`,
        animationFillMode: "both",
      }}
    >
      {children}
    </div>
  );
}
