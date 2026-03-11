// hero-section-dark.tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    subtitle?: {
        regular: string
        gradient: string
    }
    description?: string
    ctaText?: string
    ctaHref?: string
    bottomImage?: {
        light: string
        dark: string
    }
    gridOptions?: {
        angle?: number
        cellSize?: number
        opacity?: number
        lightLineColor?: string
        darkLineColor?: string
    }
}

const RetroGrid = ({
    angle = 65,
    cellSize = 60,
    opacity = 0.5,
    lightLineColor = "gray",
    darkLineColor = "gray",
}) => {
    const gridStyles = {
        "--grid-angle": `${angle}deg`,
        "--cell-size": `${cellSize}px`,
        "--opacity": opacity,
        "--light-line": lightLineColor,
        "--dark-line": darkLineColor,
    } as React.CSSProperties

    return (
        <div
            className={cn(
                "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
                `opacity-[var(--opacity)]`,
            )}
            style={gridStyles}
        >
            <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
                <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent to-90% dark:from-slate-950" />
        </div>
    )
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
    (
        {
            className,
            title = "OpinionIQ Enterprise Analysis",
            subtitle = {
                regular: "Decode your feedback ",
                gradient: "instantly with AI.",
            },
            description = "Upload any CSV and instantly receive a fully analyzed, structured dataset alongside an interactive 3D sentiment dashboard.",
            ctaText = "Get Started",
            ctaHref = "#",
            bottomImage,
            gridOptions,
            ...props
        },
        ref,
    ) => {
        return (
            <div className={cn("relative", className)} ref={ref} {...props}>
                <div className="absolute top-0 z-[0] h-screen w-screen bg-indigo-950/10 dark:bg-indigo-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(79,70,229,0.3),rgba(255,255,255,0))]" />
                <section className="relative max-w-full mx-auto z-1">
                    <RetroGrid {...gridOptions} />
                    <div className="max-w-screen-xl z-10 mx-auto px-4 py-28 gap-12 md:px-8">
                        <div className="space-y-5 max-w-3xl leading-0 lg:leading-5 mx-auto text-center">
                            <h1 className="text-sm text-slate-300 dark:text-slate-300 group font-sans mx-auto px-5 py-2 bg-gradient-to-tr from-slate-800/40 via-indigo-900/40 to-transparent dark:from-slate-800/40 dark:via-indigo-900/40 border-[2px] border-slate-700/50 dark:border-slate-700/50 rounded-3xl w-fit">
                                {title}
                                <ChevronRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
                            </h1>
                            <h2 className="text-4xl tracking-tighter font-sans font-bold bg-clip-text text-transparent mx-auto md:text-6xl bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.8)_202.08%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.8)_202.08%)]">
                                {subtitle.regular}
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">
                                    {subtitle.gradient}
                                </span>
                            </h2>
                            <p className="max-w-2xl mx-auto text-slate-400 dark:text-slate-400 text-lg">
                                {description}
                            </p>

                            {/* Children pass through for Dropzone injection */}
                            {props.children}

                        </div>
                    </div>
                </section>
            </div>
        )
    },
)
HeroSection.displayName = "HeroSection"

export { HeroSection }
