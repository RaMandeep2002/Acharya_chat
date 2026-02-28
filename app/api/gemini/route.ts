
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";


const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string
});

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        console.log("Received prompt: ", prompt);

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
            config: {
                maxOutputTokens: 2000,
                // temperature: 0.7,
                // topP: 0.9,
            },
        });

        // For GoogleGenAI, check where text is in the response:
        // it may be under response.candidates[0].content.parts[0].text with recent SDKs,
        // or you can use response.text if present.
        let text = "";
        if (response.text) {
            text = response.text;
        } else if (
            response.candidates &&
            response.candidates[0]?.content?.parts &&
            response.candidates[0].content.parts[0]?.text
        ) {
            text = response.candidates[0].content.parts[0].text;
        } else {
            text = "";
        }

        console.log("AI response: ", text);

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
