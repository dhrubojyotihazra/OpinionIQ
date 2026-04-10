import * as React from "react"
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonWithIconProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  href?: string;
}

const ButtonWithIcon = React.forwardRef<HTMLAnchorElement, ButtonWithIconProps>(
  ({ className, children, href, ...props }, ref) => {
    const content = (
      <>
        <span className="relative z-10 transition-all duration-500">
          {children}
        </span>
        <div className="absolute right-1 w-10 h-10 bg-background text-foreground rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45">
          <ArrowUpRight size={16} />
        </div>
      </>
    );

    const baseClassName = cn(
      "relative inline-flex items-center justify-center text-sm font-medium rounded-full h-12 p-1 ps-6 pe-14 group transition-all duration-500 hover:ps-14 hover:pe-6 w-full overflow-hidden cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-indigo-500/25",
      className
    );

    if (href) {
      return (
        <a
          ref={ref}
          href={href}
          className={baseClassName}
          {...props}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as any}
        className={baseClassName}
        {...(props as any)}
      >
        {content}
      </button>
    );
  }
);

ButtonWithIcon.displayName = "ButtonWithIcon";

export { ButtonWithIcon };
