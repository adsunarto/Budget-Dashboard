import { useEffect, useState } from "react";

interface UserData {
    netSavings: number;
    categoriesOverBudget: number;
    budgeteerScore: number;
    budgets: Array<{
        category: string;
        budgeted: number;
        spent: number;
    }>;
    assets: {
        accounts: Array<{
            name: string;
            balance: number;
        }>;
        loans: Array<{
            name: string;
            balance: number;
        }>;
        investments: Array<{
            name: string;
            balance: number;
        }>;
    };
}

interface LearnProps {
    userData: UserData;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface LearningContent {
    content: ContentItem[];
    quiz: {
        questions: QuizQuestion[];
    };
}

interface GenerationStep {
    title: string;
    prompt: string;
    key: keyof LearningContent;
}

interface ContentItem {
    type: "header" | "paragraph";
    text: string;
}

interface TopicHeader {
    title: string;
    description: string;
}

const Learn = ({ userData }: LearnProps) => {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [learningContent, setLearningContent] = useState<LearningContent>({
        content: [],
        quiz: { questions: [] }
    });
    const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generationProgress, setGenerationProgress] = useState<string>("");
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [title, setTitle] = useState<string>("");
    const [topicHeaders, setTopicHeaders] = useState<TopicHeader[]>([]);
    const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);

    useEffect(() => {
        console.log("learningContent updated:", learningContent);
    }, [learningContent]);

    const getContextPrompt = (currentContent: ContentItem[]) => {
        if (currentContent.length === 0) return '';
        return `Here is what has been generated so far:\n${JSON.stringify(currentContent, null, 2)}\n\n`;
    };

    const createGenerationSteps = (headers: TopicHeader[]): GenerationStep[] => {
        return headers.map(header => ({
            title: header.title,
            prompt: `{context}Write a comprehensive section about "${header.title}". Format your response as a valid JSON object with this exact structure:
            {
                "content": [
                    {
                        "type": "header",
                        "text": "${header.title}"
                    },
                    {
                        "type": "paragraph",
                        "text": "Your first paragraph about ${header.title}..."
                    },
                    {
                        "type": "paragraph",
                        "text": "Your second paragraph about ${header.title}..."
                    }
                ]
            }
            Do not include any text before or after the JSON object.`,
            key: "content"
        }));
    };

    const fetchTopicHeaders = async (topic: string) => {
        try {
            setGenerationProgress("Generating topic outline...");
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama3.1',
                    prompt: `Generate a list of 2-4 key topic headers about ${topic}. Format your response as a valid JSON array of objects with this exact structure:
                    [
                        {
                            "title": "Topic Header 1",
                            "description": "Brief description of what this topic covers"
                        },
                        {
                            "title": "Topic Header 2",
                            "description": "Brief description of what this topic covers"
                        }
                    ]
                    Do not include any text before or after the JSON array. It must be able to be parsed as JSON otherwise the generation will fail.`,
                    stream: false,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate topic headers');
            }

            const data = await response.json();
            const responseText = data.response.trim();

            try {
                const jsonStart = responseText.indexOf('[');
                const jsonEnd = responseText.lastIndexOf(']');

                if (jsonStart === -1 || jsonEnd === 0) {
                    throw new Error('No valid JSON found in response');
                }

                const jsonStr = responseText.slice(jsonStart, jsonEnd + 1);
                const headers = JSON.parse(jsonStr);
                setTopicHeaders(headers);
                const steps = createGenerationSteps(headers);
                setGenerationSteps(steps);
                return headers;
            } catch (parseError) {
                console.error('Error parsing topic headers:', parseError);
                throw new Error('Failed to parse topic headers');
            }
        } catch (error) {
            console.error('Error fetching topic headers:', error);
            throw error;
        }
    };

    const generateTitle = async (currentContent: ContentItem[]) => {
        const context = getContextPrompt(currentContent);
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama3.1',
                prompt: `The following text is content from a lesson, article, or piece of writing:
                "${context}"

                Analyze the meaning and key ideas in this content. Then, generate a short, catchy, and relevant title that accurately reflects the main topic or takeaway of the content.

                Format your response exactly as this JSON:
                {
                    "title": "Your generated title here"
                }

                Do not include any text before or after the JSON object. It must be able to be parsed as JSON otherwise the generation will fail.`,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate title');
        }

        const data = await response.json();
        const responseText = data.response.trim();
        const title = JSON.parse(responseText).title;
        setTitle(title);
    };

    const generateContentForHeader = async (topic: string, header: TopicHeader, currentContent: ContentItem[]) => {
        const context = getContextPrompt(currentContent);
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama3.1',
                prompt: `Topic: ${topic}. Prior context: ${context}. Write a comprehensive section about "${header.title}". Format your response as a valid JSON object with this exact structure:
                {
                    "content": [
                        {
                            "type": "header",
                            "text": "${header.title}"
                        },
                        {
                            "type": "paragraph",
                            "text": "Your first paragraph about ${header.title}..."
                        },
                        {
                            "type": "paragraph",
                            "text": "Your second paragraph about ${header.title}..."
                        }
                    ]
                }
                Do not include any text before or after the JSON object. It must be able to be parsed as JSON otherwise the generation will fail.`,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to generate content for ${header.title}`);
        }

        const data = await response.json();
        const responseText = data.response.trim();

        try {
            const jsonStart = responseText.indexOf('{');
            const jsonEnd = responseText.lastIndexOf('}');

            if (jsonStart === -1 || jsonEnd === 0) {
                throw new Error(`No valid JSON found in response for ${header.title}`);
            }

            const jsonStr = responseText.slice(jsonStart, jsonEnd + 1);
            const newContent = JSON.parse(jsonStr);
            return newContent.content;
        } catch (parseError) {
            console.error(`Error parsing content for ${header.title}:`, parseError);
            throw new Error(`Failed to parse content for ${header.title}`);
        }
    };

    const fetchLearningContent = async (topic: string) => {
        try {
            setIsLoading(true);
            setError(null);
            setCurrentStep(0);
            setLearningContent({ content: [], quiz: { questions: [] } });

            // First, generate topic headers and create steps
            const headers = await fetchTopicHeaders(topic);

            let allContent: ContentItem[] = []; // <-- create a local array

            // Then generate content for each header
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i];
                setCurrentStep(i);
                setGenerationProgress(`Generating content for: ${header.title}...`);

                const newContent = await generateContentForHeader(topic, header, allContent);
                allContent = [...allContent, ...newContent]; // <-- accumulate content here
            }

            // After all sections are generated
            setLearningContent(prev => ({
                ...prev,
                content: allContent,
            }));

            // Finally, generate the quiz
            setGenerationProgress("Generating quiz...");
            const context = getContextPrompt(allContent); // <-- use local allContent, not state
            const quizResponse = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama3.1',
                    prompt: `Prior context: ${context}. Only ask questions that can be answered based on the prior context. Use exact keywords and phrases from the context to create the questions and answer options. Do not ask opinion based questions. Everything must be objective. This is not a survey—answers must be absolute, no "maybe" or "sometimes" or "unsure" options allowed. Ensure both the questions and answer options make sense given the context. Create a multiple-choice quiz with 3 questions about ${topic}, based on all the content discussed so far. Format your response as a valid JSON object with this exact structure:
                    {
                        "quiz": {
                            "questions": [
                                {
                                    "question": "Your first question here",
                                    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                                    "correctAnswer": 0
                                },
                                {
                                    "question": "Your second question here",
                                    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                                    "correctAnswer": 1
                                },
                                {
                                    "question": "Your third question here",
                                    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                                    "correctAnswer": 2
                                }
                            ]
                        }
                    }
                    Do not include any text before or after the JSON object. It must be able to be parsed as JSON otherwise the generation will fail.`,
                    stream: false,
                }),
            });

            if (!quizResponse.ok) {
                throw new Error('Failed to generate quiz');
            }

            const quizData = await quizResponse.json();
            const quizText = quizData.response.trim();

            try {
                const jsonStr = quizText.slice(quizText.indexOf('{'), quizText.lastIndexOf('}') + 1);
                const quizContent = JSON.parse(jsonStr);    

                setLearningContent(prev => ({
                    ...prev,
                    quiz: quizContent.quiz,
                }));
            } catch (parseError) {
                console.error('Error parsing quiz:', parseError);
                throw new Error('Failed to parse quiz content');
            }

            // Generate title last
            await generateTitle(allContent); // <-- again use local allContent

            setQuizAnswers(new Array(3).fill(-1));
            setQuizSubmitted(false);
            setGenerationProgress("");
        } catch (error) {
            console.error('Error fetching learning content:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while fetching content');
            setGenerationProgress("");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        await fetchLearningContent(input.trim());
        setInput("");
    };

    const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
        if (quizSubmitted) return;
        const newAnswers = [...quizAnswers];
        newAnswers[questionIndex] = answerIndex;
        setQuizAnswers(newAnswers);
    };

    const handleQuizSubmit = () => {
        setQuizSubmitted(true);
    };

    return (
        <div className="flex flex-col h-full p-6 space-y-6">
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-[66.67%] mx-auto w-full">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What would you like to learn about?"
                    className="flex-1 p-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Loading..." : "Learn"}
                </button>
            </form>

            {/* Generation Progress */}
            {generationProgress && (
                <div className="max-w-[66.67%] mx-auto w-full">
                    <div className="flex items-center gap-2 text-white/80">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        <span>{generationProgress}</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                        {generationSteps.map((step, index) => (
                            <div
                                key={index}
                                className={`h-1 flex-1 rounded ${index < currentStep
                                    ? 'bg-primary'
                                    : index === currentStep
                                        ? 'bg-primary/50'
                                        : 'bg-gray-700'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 max-w-[66.67%] mx-auto w-full">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                    <p className="text-sm mt-2">Please try again or try a different topic.</p>
                </div>
            )}

            {/* Learning Content */}
            {isLoading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            )}

            {learningContent && !isLoading &&
                <div className="max-w-[66.67%] mx-auto w-full">
                    <h1 className="text-2xl font-semibold text-white">{title}</h1>
                </div>
            }

            {learningContent && !isLoading && (
                <div className="space-y-8 max-w-[66.67%] mx-auto w-full">
                    {/* Content */}
                    <div className="prose prose-lg max-w-none text-white">
                        {learningContent.content.map((item, index) => {
                            if (item.type === "header") {
                                return (
                                    <h3 key={index} className="text-xl font-semibold mb-2 mt-4 text-white">
                                        {item.text}
                                    </h3>
                                );
                            } else if (item.type === "paragraph") {
                                return (
                                    <p key={index} className="mb-4 text-white/90 leading-relaxed">
                                        {item.text}
                                    </p>
                                );
                            }
                            return null;
                        })}
                    </div>

                    {/* Quiz - Only show if there's content */}
                    {learningContent.content.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-semibold text-white">Test Your Knowledge</h3>
                            {learningContent.quiz.questions.map((question, questionIndex) => (
                                <div key={questionIndex} className="space-y-3">
                                    <p className="font-medium text-white">{questionIndex + 1}. {question.question}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {question.options.map((option, optionIndex) => (
                                            <div
                                                key={optionIndex}
                                                className={`p-2 rounded-lg border cursor-pointer transition-colors text-sm ${quizSubmitted
                                                    ? optionIndex === question.correctAnswer
                                                        ? 'bg-green-50 border-green-300 text-green-800'
                                                        : quizAnswers[questionIndex] === optionIndex
                                                            ? 'bg-red-50 border-red-300 text-red-800 line-through'
                                                            : 'border-gray-300 text-white'
                                                    : quizAnswers[questionIndex] === optionIndex
                                                        ? 'bg-primary/20 border-primary text-white'
                                                        : 'border-gray-300 hover:bg-primary/10 hover:border-primary text-white'
                                                    }`}
                                                onClick={() => handleQuizAnswer(questionIndex, optionIndex)}
                                            >
                                                {optionIndex === 0 ? "A" : optionIndex === 1 ? "B" : optionIndex === 2 ? "C" : "D"}. {option}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {!quizSubmitted && (
                                <button
                                    onClick={handleQuizSubmit}
                                    disabled={quizAnswers.includes(-1)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-white hover:bg-primary/10 hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-300 outline outline-1 outline-white/20"
                                >
                                    Submit Quiz
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Learn; 