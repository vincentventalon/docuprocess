"use client";

interface SubscriptionCardProps {
  planName: string;
  expiresAt: Date;
  price: number;
  creditsPerMonth: number;
  creditsUsed: number;
}

export function SubscriptionCard({
  planName,
  expiresAt,
  price,
  creditsPerMonth,
  creditsUsed,
}: SubscriptionCardProps) {
  const usagePercentage = Math.min(
    100,
    Math.max(0, Math.round((creditsUsed / creditsPerMonth) * 100))
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Current subscription
      </h3>

      <div className="flex items-start justify-between">
        <div className="space-y-1 text-sm">
          <p className="text-gray-800">
            <span className="font-medium">Plan:</span> {planName}
          </p>
          <p className="text-gray-800">
            <span className="font-medium">Expires at:</span>{" "}
            {formatDate(expiresAt)}
          </p>
          <p className="text-gray-800">
            <span className="font-medium">Price:</span>{" "}
            {price === 0 ? "Free" : `$${price}`}
          </p>
          <p className="text-gray-800">
            <span className="font-medium">Credits:</span> {creditsPerMonth}
            /month
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#e5e7eb"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-primary"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${usagePercentage * 1.76} 176`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-700">
                {usagePercentage}%
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-500 mt-1">USAGE</span>
        </div>
      </div>
    </div>
  );
}
