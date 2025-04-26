import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

const AIExplanation = ({ response, handleCloseCard }) => {
    return (
        <div className="flex items-left justify-center m-4">
            <Alert className="relative flex justify-left p-6 pr-24 bg-[#282A39] shadow-2xl rounded-lg w-[80%]">
                <div>
                    <Terminal className="h-5 w-5 text-[#FF5733] mr-2" style={{ color: '#FF5733' }} />
                </div>
                <div>
                    <AlertTitle>{response.title}</AlertTitle>
                    <AlertDescription>{response.explanation}</AlertDescription>
                </div>

                {/* Hide Button Positioned at the Bottom Right */}
                <button
                    onClick={handleCloseCard}
                    className="absolute bottom-4 right-4 p-2 text-[#FF5733] focus:outline-none"
                >
                    [Close]
                </button>
            </Alert>
        </div>
    );
};

export default AIExplanation;
