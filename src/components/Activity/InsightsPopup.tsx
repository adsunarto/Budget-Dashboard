import { useState, useEffect } from 'react';
import { getFromLocalStorage } from "@/lib/storage";

type Suggestion = {
  id: number;
  text: string;
  category: string;
  currentBudget: number;
  suggestedBudget: number;
};

type Props = {
  suggestions: Suggestion[];
  onApprove: (suggestion: Suggestion) => void;
  onDeny: (suggestion: Suggestion) => void;
  onClose: () => void;
};

const InsightsPopup = ({ suggestions, onApprove, onDeny, onClose }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [primaryGoal, setPrimaryGoal] = useState("");
  const currentSuggestion = suggestions[currentIndex];

  useEffect(() => {
    const goal = getFromLocalStorage("primaryGoal", "Build 6 month emergency fund");
    setPrimaryGoal(goal);
  }, []);

  const getGoalIcon = () => {
    if (primaryGoal.toLowerCase().includes("emergency fund")) {
      return "🛡️";
    } else if (primaryGoal.toLowerCase().includes("student loans")) {
      return "🎓";
    } else if (primaryGoal.toLowerCase().includes("eating out")) {
      return "🍽️";
    } else if (primaryGoal.toLowerCase().includes("condo")) {
      return "🏠";
    }
    return "🎯";
  };

  const calculateSuggestedBudget = (suggestion: Suggestion) => {
    return suggestion.suggestedBudget;
  };

  const handleDecision = (action: 'approve' | 'deny') => {
    if (action === 'approve') {
      const isBudgetAdjustment = currentSuggestion.text.toLowerCase().includes('budget');
      
      if (isBudgetAdjustment) {
        const newBudget = calculateSuggestedBudget(currentSuggestion);
        const adjustedSuggestion = {
          ...currentSuggestion,
          suggestedBudget: newBudget,
          category: currentSuggestion.category
        };
        onApprove(adjustedSuggestion);
      } else {
        onApprove(currentSuggestion);
      }
    } else {
      onDeny(currentSuggestion);
    }
    
    if (currentIndex < suggestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  // const suggestedBudget = calculateSuggestedBudget(currentSuggestion);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
      <div className="bg-background rounded-2xl p-8 w-full max-w-2xl mx-4 shadow-xl border border-border">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-semibold text-foreground">Insights</h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-sm">
              <span>{getGoalIcon()}</span>
              <span className="text-muted-foreground">{primaryGoal}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>

        <div className="space-y-6 mb-8">
          <div className="p-6 rounded-lg border border-border bg-muted/50">
            <p className="text-lg text-foreground mb-4">{currentSuggestion.text}</p>
            <div className="flex items-center gap-3 text-base text-muted-foreground">
              <span>{currentSuggestion.category}</span>
              <span>•</span>
              <div className="text-base">
                Current: ${currentSuggestion.currentBudget.toFixed(2)}
              </div>
              <span>→</span>
              <div className="text-base">
                Suggested: ${currentSuggestion.suggestedBudget.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-3 mt-6">
            {suggestions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
                aria-label={`Suggestion ${index + 1} of ${suggestions.length}`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-6">
          <button
            onClick={() => handleDecision('deny')}
            className="px-6 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground transition border border-border hover:border-foreground"
          >
            Deny
          </button>
          <button
            onClick={() => handleDecision('approve')}
            className="px-6 py-3 rounded-lg text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightsPopup; 