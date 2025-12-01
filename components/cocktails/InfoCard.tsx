import { BeakerIcon, SparklesIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

interface InfoCardProps {
  title: string;
  content: string;
  type: "garnish" | "glassware" | "notes";
}

export function InfoCard({ title, content, type }: InfoCardProps) {
  const getIcon = () => {
    switch (type) {
      case "garnish":
        return <SparklesIcon className="w-5 h-5 text-olive" />;
      case "glassware":
        return <BeakerIcon className="w-5 h-5 text-terracotta" />;
      case "notes":
        return <InformationCircleIcon className="w-5 h-5 text-forest" />;
    }
  };

  const getColorClass = () => {
    switch (type) {
      case "garnish":
        return "border-olive/20 bg-olive/5";
      case "glassware":
        return "border-terracotta/20 bg-terracotta/5";
      case "notes":
        return "border-forest/20 bg-forest/5";
    }
  };

  return (
    <div className={`rounded-2xl border p-4 ${getColorClass()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-forest text-sm uppercase tracking-wide mb-1">
            {title}
          </h4>
          <p className="text-charcoal text-sm leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}
