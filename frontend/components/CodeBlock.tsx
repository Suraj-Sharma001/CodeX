'use client';

import { Highlight, themes } from 'prism-react-renderer';

type Props = {
  code: string;
  language: string;
};

const LANG_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  py: 'python',
  rb: 'ruby',
  cpp: 'cpp',
  cs: 'csharp',
};

export function CodeBlock({ code, language }: Props) {
  const lang = LANG_MAP[language.toLowerCase()] || language.toLowerCase();

  return (
    <Highlight theme={themes.github} code={code.trim()} language={lang}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} rounded-lg p-4 text-sm overflow-x-auto border border-gray-200 dark:border-gray-700 dark:!bg-gray-950`}
          style={style}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
