import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;

        // Make request to local Llama3 instance
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama3',
                prompt: `You are a helpful financial assistant. The user asked: "${message}". 
                Please provide a detailed, accurate, and helpful response about personal finance. 
                If the question is unclear, ask for clarification. 
                If it's not related to finance, politely redirect to financial topics.`,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to get response from Llama3');
        }

        const data = await response.json();
        return res.status(200).json({ response: data.response });

    } catch (error) {
        console.error('Error in chat API:', error);
        return res.status(500).json({ 
            error: 'Failed to process request',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 