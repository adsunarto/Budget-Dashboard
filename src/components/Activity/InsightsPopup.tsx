import { useState } from 'react';

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
  const currentSuggestion = suggestions[currentIndex];

  const calculateSuggestedBudget = (suggestion: Suggestion) => {
    // Use the actual suggested budget value from the suggestion
    return suggestion.suggestedBudget;
  };

  const handleDecision = (action: 'approve' | 'deny') => {
    if (action === 'approve') {
      // Check if the suggestion is about budget adjustment
      const isBudgetAdjustment = currentSuggestion.text.toLowerCase().includes('budget');
      
      if (isBudgetAdjustment) {
        const newBudget = calculateSuggestedBudget(currentSuggestion);
        const adjustedSuggestion = {
          ...currentSuggestion,
          suggestedBudget: newBudget,
          // Ensure we pass the category for budget updates
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

  const suggestedBudget = calculateSuggestedBudget(currentSuggestion);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-xl border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-200">Insights</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-lg border border-gray-700 bg-gray-900">
            <p className="text-gray-200 mb-2">{currentSuggestion.text}</p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{currentSuggestion.category}</span>
              <span>•</span>
              <div className="text-sm text-muted-foreground">
                Current: ${currentSuggestion.currentBudget.toFixed(2)}
              </div>
              <span>→</span>
              <div className="text-sm text-muted-foreground">
                Suggested: ${currentSuggestion.suggestedBudget.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {suggestions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-600'
                }`}
                aria-label={`Suggestion ${index + 1} of ${suggestions.length}`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => handleDecision('deny')}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-200 transition border border-gray-600 hover:border-gray-500"
          >
            Deny
          </button>
          <button
            onClick={() => handleDecision('approve')}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightsPopup; 