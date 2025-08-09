'use client';

import React, { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { lineNumbers, highlightActiveLineGutter, ViewUpdate, scrollPastEnd } from '@codemirror/view';
import { foldGutter } from '@codemirror/language';

interface CodeEditorProps {
  code: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (code: string) => void;
  height?: string;
  isStreaming?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  language = 'javascript',
  readOnly = true,
  onChange,
  height = '100%',
  isStreaming = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };

  useEffect(() => {
    if (!editorRef.current) return;

    // Select language plugin
    const getLangExtension = () => {
      switch (language) {
        case 'javascript':
        case 'typescript':
        case 'tsx':
          return javascript();
        case 'python':
          return python();
        case 'html':
          return html();
        case 'css':
          return css();
        case 'json':
          return json();
        case 'markdown':
          return markdown();
        default:
          return javascript();
      }
    };

    // Enhanced setup with IDE-like features
    const enhancedSetup = [
      lineNumbers(),
      highlightActiveLineGutter(),
      scrollPastEnd(), // Allow scrolling past the end of the document
      foldGutter({
        markerDOM: (open) => {
          const marker = document.createElement("span");
          marker.className = open ? "cm-foldMarker-open" : "cm-foldMarker-closed";
          marker.textContent = open ? "▾" : "▸";
          marker.style.fontSize = "0.9em";
          marker.style.padding = "0 4px";
          return marker;
        }
      }),
      // Custom extension to handle the editor view theme
      EditorView.theme({
        "&": {
          backgroundColor: "#0d0d0d",
          height: "100%"
        },
        ".cm-scroller": {
          overflow: "auto",
          fontFamily: "Menlo, Monaco, 'Courier New', monospace"
        },
        "&.cm-focused": {
          outline: "none"
        },
        ".cm-gutters": {
          backgroundColor: "#121212",
          color: "#555",
          border: "none",
          borderRight: "1px solid rgba(128, 128, 128, 0.1)"
        },
        ".cm-activeLineGutter": {
          backgroundColor: "rgba(66, 133, 244, 0.1)"
        },
        ".cm-content": {
          caretColor: "#fff",
          minHeight: "100%",
          paddingBottom: "100px" // Add extra padding at the bottom
        },
        ".cm-line": {
          padding: "0 4px",
          lineHeight: "1.6"
        },
        // Add styles for the "phantom" space after code to match the editor's background
        ".cm-content::after": {
          content: "''",
          display: "block",
          // height: "100vh", // Make it very tall to fill any size
          backgroundColor: "#0d0d0d"
        }
      }),
      // Add streaming-specific extensions with better styling
      ...(isStreaming ? [
        EditorView.theme({
          ".cm-line": {
            // Remove the animation that causes flickering
            opacity: "1 !important",
            color: "inherit !important"
          },
          // Add a subtle cursor at the end instead of the blinking one
          ".cm-cursor": {
            borderLeftColor: "#00ff00",
            animation: "blink 1s infinite"
          },
          // Add streaming cursor at the end of content
          ".cm-content::after": {
            content: "'|'",
            color: "#00ff00",
            animation: "blink 1s infinite",
            fontSize: "14px",
            fontWeight: "bold"
          }
        })
      ] : [])
    ];

    // Create editor
    const state = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        enhancedSetup,
        getLangExtension(),
        oneDark,
        EditorView.editable.of(!readOnly),
        EditorState.readOnly.of(readOnly),
        EditorView.updateListener.of((update: ViewUpdate) => {
          if (update.docChanged && onChange) {
            onChange(update.state.doc.toString());
          }
        })
      ]
    });

    // Cleanup previous instance
    if (editorViewRef.current) {
      editorViewRef.current.destroy();
    }

    // Create new editor view
    editorViewRef.current = new EditorView({
      state,
      parent: editorRef.current
    });

    return () => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
      }
    };
  }, [code, language, readOnly, onChange, isStreaming]);

  // Update editor content when code changes (for streaming)
  useEffect(() => {
    if (editorViewRef.current) {
      const view = editorViewRef.current;
      const currentContent = view.state.doc.toString();
      
      // Only update if content has actually changed
      if (currentContent !== code) {
        if (isStreaming && code.startsWith(currentContent)) {
          // For streaming: only append the new content to avoid replacing
          const newContent = code.slice(currentContent.length);
          if (newContent) {
            const transaction = view.state.update({
              changes: {
                from: currentContent.length,
                insert: newContent
              }
            });
            view.dispatch(transaction);
            
            // Throttled auto-scroll to reduce frequency and prevent UI freezing
            // Only scroll if there's significant new content (more than a few characters)
            if (newContent.length > 3) {
              setTimeout(() => {
                if (editorViewRef.current) {
                  const endPos = editorViewRef.current.state.doc.length;
                  editorViewRef.current.dispatch({
                    selection: { anchor: endPos },
                    effects: EditorView.scrollIntoView(endPos, { y: 'end' })
                  });
                }
              }, 50); // Delay scroll by 50ms to allow batching
            }
          }
        } else {
          // For non-streaming: replace entire content
          const transaction = view.state.update({
            changes: {
              from: 0,
              to: view.state.doc.length,
              insert: code
            }
          });
          view.dispatch(transaction);
        }
      }
    }
  }, [code, isStreaming]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex flex-col bg-[#0d0d0d]"
    >
      <div className="flex items-center justify-between px-3 py-1 bg-[#1a1a1a] border-b border-[#333]">
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-400">{language}</div>
        </div>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1 text-xs px-2 py-1 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded text-gray-300 transition-colors"
          aria-label="Copy code"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {copyStatus === 'idle' ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            )}
          </svg>
          {copyStatus === 'idle' ? 'Copy' : 'Copied!'}
        </button>
      </div>
      <div 
        ref={editorRef} 
        className="w-full flex-grow text-sm font-mono overflow-hidden"
        style={{ height }}
      ></div>
      
      {/* Add CSS for streaming animations */}
      <style jsx global>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        /* Ensure streaming content has proper contrast */
        .cm-editor.cm-focused .cm-content {
          color: #fff !important;
        }
        
        .cm-editor .cm-line {
          color: inherit !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default CodeEditor;