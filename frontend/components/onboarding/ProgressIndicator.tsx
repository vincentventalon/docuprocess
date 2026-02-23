interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step === currentStep
                ? "bg-primary text-white"
                : step < currentStep
                  ? "bg-primary/20 text-primary"
                  : "bg-gray-100 text-gray-400"
            }`}
          >
            {step}
          </div>
          {step < totalSteps && (
            <div
              className={`w-8 h-0.5 ${
                step < currentStep ? "bg-primary/20" : "bg-gray-100"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
