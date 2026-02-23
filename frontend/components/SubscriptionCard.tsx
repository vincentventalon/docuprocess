import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface SubscriptionCardProps {
  plan: string;
  startDate?: Date;
  endDate?: Date;
  autoRenew: string;
  price: number;
  status: "Active" | "Inactive" | "Cancelled";
  templatesUsed: number;
  templatesLimit: number;
  creditsUsed: number;
  creditsLimit: number;
  lastReset?: Date;
}

export function SubscriptionCard({
  plan,
  startDate,
  endDate,
  autoRenew,
  price,
  status,
  templatesUsed,
  templatesLimit,
  creditsUsed,
  creditsLimit,
  lastReset,
}: SubscriptionCardProps) {
  const creditsPercentage = (creditsUsed / creditsLimit) * 100;
  const templatesPercentage = (templatesUsed / templatesLimit) * 100;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Subscription</CardTitle>
        <CardDescription>Manage your subscription and usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Subscription */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Current Subscription
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">{plan}</p>
            <Badge
              variant={status === "Active" ? "default" : "secondary"}
              className={
                status === "Active" ? "bg-green-500 hover:bg-green-600" : ""
              }
            >
              {status}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Plan Details */}
        <div className="grid grid-cols-2 gap-4">
          {startDate && (
            <div>
              <p className="text-sm text-muted-foreground">Start</p>
              <p className="text-sm font-medium">{formatDate(startDate)}</p>
            </div>
          )}
          {endDate && (
            <div>
              <p className="text-sm text-muted-foreground">End</p>
              <p className="text-sm font-medium">{formatDate(endDate)}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Auto Renew</p>
            <p className="text-sm font-medium">{autoRenew}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-sm font-medium">{price === 0 ? "Free" : `USD ${price.toFixed(2)}`}</p>
          </div>
        </div>

        <Separator />

        {/* Templates Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Template(s)</p>
            <p className="text-sm text-muted-foreground">
              {templatesUsed}/{templatesLimit}
            </p>
          </div>
          <Progress value={templatesPercentage} className="h-2" />
        </div>

        {/* Credits Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Credits Used</p>
            <p className="text-sm text-muted-foreground">
              {creditsUsed.toFixed(2)} / {creditsLimit.toFixed(2)}
            </p>
          </div>
          <Progress value={creditsPercentage} className="h-2" />
        </div>

        {lastReset && (
          <>
            <Separator />

            {/* Last Reset */}
            <div>
              <p className="text-sm text-muted-foreground">Last Reset</p>
              <p className="text-sm font-medium">{formatDate(lastReset)}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
