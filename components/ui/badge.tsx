import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Square, not pill-shaped — badges are the one place the style guide calls
// out explicitly as sharp-cornered rather than inheriting --radius.
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] font-bold whitespace-nowrap",
  {
    variants: {
      variant: {
        success: "bg-success-bg text-success",
        warn: "bg-warn-bg text-warn",
        danger: "bg-danger-bg text-danger",
        info: "bg-info-bg text-info",
        draft: "bg-draft-bg text-draft",
      },
    },
    defaultVariants: {
      variant: "draft",
    },
  }
);

const dotVariants: Record<
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>,
  string
> = {
  success: "bg-success-dot",
  warn: "bg-warn-dot",
  danger: "bg-danger-dot",
  info: "bg-info-dot",
  draft: "bg-draft-dot",
};

function Badge({
  className,
  variant = "draft",
  children,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    >
      {/* The dot stays round — circles are the style guide's one exception
          to the sharp-corner rule, reserved for functional indicators. */}
      <span className={cn("size-1.5 shrink-0 rounded-full", dotVariants[variant ?? "draft"])} />
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
