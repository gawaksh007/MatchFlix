import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoodToggleProps {
  onToggle: (enabled: boolean) => void;
}

export function MoodToggle({ onToggle }: MoodToggleProps) {
  const [enabled, setEnabled] = useState(false);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    onToggle(newState);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn(
        "relative transition-colors duration-300",
        enabled && "text-rose-500 hover:text-rose-600"
      )}
    >
      {enabled ? (
        <Moon className="h-5 w-5 transition-transform rotate-90" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      {enabled && (
        <span className="absolute inset-0 bg-rose-500/10 animate-pulse rounded-md" />
      )}
    </Button>
  );
}
