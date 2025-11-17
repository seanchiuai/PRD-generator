import { TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface MetricTrend {
  direction: "up" | "down";
  percentage: string;
}

interface MetricFooter {
  primary: string;
  secondary: string;
}

interface MetricCard {
  id: string;
  description: string;
  value: string;
  trend: MetricTrend;
  footer: MetricFooter;
}

interface SectionCardsProps {
  cards?: MetricCard[];
  className?: string;
}

const DEFAULT_CARDS: MetricCard[] = [
  {
    id: "total-revenue",
    description: "Total Revenue",
    value: "$1,250.00",
    trend: { direction: "up", percentage: "+12.5%" },
    footer: { primary: "Trending up this month", secondary: "Visitors for the last 6 months" },
  },
  {
    id: "new-customers",
    description: "New Customers",
    value: "1,234",
    trend: { direction: "down", percentage: "-20%" },
    footer: { primary: "Down 20% this period", secondary: "Acquisition needs attention" },
  },
  {
    id: "active-accounts",
    description: "Active Accounts",
    value: "45,678",
    trend: { direction: "up", percentage: "+12.5%" },
    footer: { primary: "Strong user retention", secondary: "Engagement exceeds targets" },
  },
  {
    id: "growth-rate",
    description: "Growth Rate",
    value: "4.5%",
    trend: { direction: "up", percentage: "+4.5%" },
    footer: { primary: "Steady performance increase", secondary: "Meets growth projections" },
  },
];

export function SectionCards({ cards = DEFAULT_CARDS, className }: SectionCardsProps) {
  return (
    <div className={`*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 ${className || ''}`}>
      {cards.map((card) => {
        const TrendIcon = card.trend.direction === "up" ? TrendingUp : TrendingDown;

        return (
          <Card key={card.id} className="@container/card">
            <CardHeader>
              <CardDescription>{card.description}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <TrendIcon />
                  {card.trend.percentage}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {card.footer.primary} <TrendIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                {card.footer.secondary}
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  )
}
