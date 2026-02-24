"use client";

import ReactMarkdown from "react-markdown";

export default function PredictionCardView({ content }: { content: string }) {
  return (
    <div className="prose prose-lg max-w-none text-md">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
