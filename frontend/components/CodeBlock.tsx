'use client';

'use client';

import { useEffect, useState } from 'react';
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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains('dark');
      setIsDark(dark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const theme = isDark ? themes.dracula : themes.github;

  return (
    <Highlight theme={theme} code={code.trim()} language={lang}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} rounded-lg p-4 text-sm overflow-x-auto border transition-colors duration-200 border-gray-200 dark:border-gray-700`}
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
