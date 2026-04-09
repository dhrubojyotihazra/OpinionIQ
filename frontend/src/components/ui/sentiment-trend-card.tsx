import * as React from "react";
import { motion } from "framer-motion";
import * as RechartsPrimitive from "recharts";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { cn } from "@/lib/utils";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export interface TopicSentiment {
  icon: React.ReactNode;
  name: string;
  duration: string;
  color?: string;
}

interface SentimentTrendCardProps {
  totalReviews: number;
  barData: number[];
  timeLabels?: string[];
  topTopics: TopicSentiment[];
  className?: string;
}

const chartConfig = {
  volume: {
    label: "Reviews",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export const SentimentTrendCard = ({
  totalReviews,
  barData,
  timeLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"],
  topTopics,
  className,
}: SentimentTrendCardProps) => {
  // Transform data for Recharts
  const chartData = React.useMemo(() => {
    return barData.map((value, index) => ({
      period: timeLabels[index] || `P${index + 1}`,
      volume: value,
    }));
  }, [barData, timeLabels]);

  return (
    <div className={cn("w-full h-full p-0", className)}>
      <div className="flex flex-col md:flex-row gap-12 relative z-10">
        <div className="flex-1 flex flex-col">
          <div className="mb-3 text-3xl font-semibold text-white">
            {totalReviews.toLocaleString()} Total Reviews
          </div>
          
          <div className="flex-1 min-h-[300px] w-full mt-4">
            <ChartContainer config={chartConfig} className="h-full w-full bg-transparent aspect-auto">
              <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  stroke="#94a3b8"
                  fontSize={12}
                />
                <RechartsPrimitive.YAxis hide domain={[0, 'auto']} />
                <ChartTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="volume"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  barSize={60}
                  animationDuration={500}
                >
                  <RechartsPrimitive.LabelList
                    dataKey="volume"
                    position="top"
                    offset={10}
                    className="fill-white font-medium text-[10px]"
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <div className="hidden md:block w-px bg-white/10 self-stretch" />

        <div className="flex flex-col gap-4 justify-center min-w-[240px]">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Key Topics</h3>
          {topTopics.map((topic, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-indigo-400">
                  {topic.icon}
                </div>
                <span className="text-sm font-medium text-slate-200">{topic.name}</span>
              </div>
              <span className="text-sm font-bold text-indigo-400">{topic.duration}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
