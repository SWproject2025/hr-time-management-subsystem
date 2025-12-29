import { cn } from "@/lib/utils"; // Create a utility helper if you haven't (see below)

export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("rounded-lg border bg-white text-slate-950 shadow-sm", className)}>{children}</div>
}

export function CardHeader({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>
}

export function CardContent({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>
}