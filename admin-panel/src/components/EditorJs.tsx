// admin-panel/src/components/EditorJs.tsx
import React, { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import Quote from '@editorjs/quote';
// @ts-ignore
import Delimiter from '@editorjs/delimiter';

interface EditorProps {
    value: string;
    onChange: (val: string) => void;
}

const EditorJsComp = ({ value, onChange }: EditorProps) => {
    const editorRef = useRef<EditorJS | null>(null);

    useEffect(() => {
        if (!editorRef.current) {
            let initialData;
            try {
                initialData = value ? JSON.parse(value) : undefined;
            } catch (e) {
                // If it's not JSON (legacy markdown), convert to a single paragraph block
                initialData = {
                    time: new Date().getTime(),
                    blocks: [{ type: "paragraph", data: { text: value } }],
                    version: "2.30.0"
                };
            }

            const editor = new EditorJS({
                holder: 'editorjs-container',
                data: initialData,
                placeholder: 'Let your SEO-optimized masterpiece begin...',
                tools: {
                    header: Header,
                    list: List,
                    quote: Quote,
                    delimiter: Delimiter,
                },
                onChange: async () => {
                    const content = await editor.saver.save();
                    onChange(JSON.stringify(content));
                },
                minHeight: 300,
            });
            editorRef.current = editor;
        }

        return () => {
            if (editorRef.current && typeof editorRef.current.destroy === 'function') {
                try {
                    editorRef.current.destroy();
                } catch (e) {
                    console.error("EditorJS cleanup", e);
                }
                editorRef.current = null;
            }
        };
    }, []);

    // We do not want the value to forcefully re-render EditorJS blocks entirely, Editor.js handles its own internal state
    return (
        <div id="editorjs-container" className="prose max-w-none w-full border border-slate-200 rounded-xl p-6 bg-white min-h-[300px] shadow-sm"></div>
    );
};

export default EditorJsComp;
