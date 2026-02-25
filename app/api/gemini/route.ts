
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";


const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string
});

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        console.log("prompt -------> ", prompt);

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
            config: {
                // maxOutputTokens:1000,
                temperature: 0.7,
                // topP: 0.9,
            },
        });
        console.log(response.text)
        const text = response.text;
        return NextResponse.json({ text });
    }
    catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong!";
        console.error("FULL ERROR:", error);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

