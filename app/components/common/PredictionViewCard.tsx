"use client";

import ReactMarkdown from "react-markdown";

export default function PredictionCardView({ content }: { content: string }) {
  return (
    <div className="prose prose-lg max-w-none m-2 md:m-0">
      <ReactMarkdown
        components={{
          h1: ({ ...props }) => (
            <h1
              className="text-4xl font-extrabold mb-6 text-amber-900 dark:text-yellow-100 border-b-2 border-amber-300 dark:border-yellow-800 pb-2"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="text-2xl font-semibold mt-8 mb-4 text-amber-700 dark:text-yellow-300 border-b border-amber-200 dark:border-yellow-700 pb-1"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className=" font-semibold mt-6 mb-3 text-amber-700 dark:text-yellow-300"
              {...props}
            />
          ),
          p: ({ ...props }) => (
            <p className="text-gray-800 dark:text-neutral-200" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="list-disc list-outside ml-6 mb-4" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal list-outside ml-6 mt-1 mb-1"
              {...props}
            />
          ),
          li: ({ ...props }) => <li className="mb-2" {...props} />,
          strong: ({ ...props }) => (
            <strong
              className="font-bold text-amber-800 dark:text-yellow-200"
              {...props}
            />
          ),
          em: ({ ...props }) => (
            <em
              className="italic text-amber-700 dark:text-yellow-300"
              {...props}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-amber-400 dark:border-yellow-500 pl-4 italic text-gray-700 dark:text-neutral-400 bg-amber-50 dark:bg-neutral-800 py-1 my-4"
              {...props}
            />
          ),
          code: ({ ...props }) => (
            <code
              className="bg-gray-200 dark:bg-neutral-700 rounded px-1 text-sm font-mono text-amber-800 dark:text-yellow-200"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
