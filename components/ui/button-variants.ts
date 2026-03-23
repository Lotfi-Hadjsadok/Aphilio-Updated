import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-xs font-medium leading-relaxed whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-accent-gradient text-white shadow-sm transition-[filter,opacity] hover:brightness-110 active:brightness-95 focus-visible:ring-2 focus-visible:ring-white/40",
        outline:
          "border-border bg-background hover:bg-input/50 dark:bg-input/30 dark:hover:bg-input/50 aria-expanded:bg-input/50 aria-expanded:text-foreground dark:aria-expanded:bg-input/40",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/30 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-5 gap-1 rounded-[min(var(--radius-md),10px)] px-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-7 gap-1.5 rounded-md px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        default:
          "h-7 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8 rounded-md",
        "icon-xs":
          "size-5 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-7 rounded-md in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export { buttonVariants };
export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
