import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
    Type, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon,
    Undo, Redo, Highlighter, Eraser, Baseline, Image as ImageIcon,
    Loader
} from 'lucide-react';

// Custom extension for Font Size
import { Extension } from '@tiptap/core';

const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        };
    },
    addAttributes() {
        return {
            fontSize: {
                default: null,
                parseHTML: element => element.style.fontSize,
                renderHTML: attributes => {
                    if (!attributes.fontSize) {
                        return {};
                    }
                    return {
                        style: `font-size: ${attributes.fontSize}`,
                    };
                },
            },
        };
    },
    addCommands() {
        return {
            setFontSize: fontSize => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run();
            },
            unsetFontSize: () => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .run();
            },
        };
    },
});

import { useUploadImageMutation } from '../features/announcements/announcementsApiSlice';

const TiptapEditor = ({ value, onChange, placeholder = 'Start writing...' }) => {
    const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
    const fileInputRef = React.useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            FontFamily,
            FontSize,
            Underline,
            Placeholder.configure({
                placeholder,
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Highlight.configure({ multicolor: true }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        const formData = new FormData();
                        formData.append('image', file);

                        // Handle async upload
                        uploadImage(formData).unwrap()
                            .then(response => {
                                const { schema } = view.state;
                                const node = schema.nodes.image.create({ src: response.url });
                                const transaction = view.state.tr.insert(view.state.selection.from, node);
                                view.dispatch(transaction);
                            })
                            .catch(err => {
                                console.error('Upload failed:', err);
                                alert('Failed to upload image. Please try again.');
                            });
                        return true; // handled
                    }
                }
                return false;
            },
            attributes: {
                class: 'prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none',
            },
        },
    });

    // Keep editor content in sync with value prop, but only if not focused
    // This prevents the editor from resetting the cursor while the user is typing
    React.useEffect(() => {
        if (editor && value !== editor.getHTML() && !editor.isFocused) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('image', file);
                const response = await uploadImage(formData).unwrap();
                editor.chain().focus().setImage({ src: response.url }).run();
            } catch (err) {
                console.error('Upload failed:', err);
                alert('Failed to upload image. Please try again.');
            }
        }
        // Reset input
        e.target.value = '';
    };

    const addImage = () => {
        fileInputRef.current?.click();
    };

    if (!editor) {
        return null;
    }

    const ToolbarButton = ({ onClick, isActive = false, disabled = false, children, title }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-1.5 rounded-md transition-all hover:bg-gray-100 ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                }`}
        >
            {children}
        </button>
    );

    const fonts = [
        { name: 'Default', value: 'Inter, sans-serif' },
        { name: 'Serif', value: 'Georgia, serif' },
        { name: 'Monospace', value: 'monospace' },
        { name: 'Poppins', value: 'Poppins, sans-serif' },
        { name: 'Roboto', value: 'Roboto, sans-serif' },
    ];

    const fontSizes = [
        '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px',
    ];

    return (
        <div className="border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all bg-white">
            <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-[100] shadow-md rounded-t-xl">
                {/* Text Styles */}
                <div className="flex gap-1 pr-2 border-r border-gray-200">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Bold"
                    >
                        <Bold size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italic"
                    >
                        <Italic size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        title="Underline"
                    >
                        <UnderlineIcon size={18} />
                    </ToolbarButton>
                </div>

                {/* Font and Size */}
                <div className="flex gap-2 px-2 border-r border-gray-200 items-center">
                    <select
                        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                        className="text-xs bg-white border border-gray-200 rounded px-1 py-1 outline-none"
                    >
                        {fonts.map(f => (
                            <option key={f.value} value={f.value}>{f.name}</option>
                        ))}
                    </select>

                    <select
                        onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
                        className="text-xs bg-white border border-gray-200 rounded px-1 py-1 outline-none"
                    >
                        <option value="">Size</option>
                        {fontSizes.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {/* Lists & Alignment */}
                <div className="flex gap-1 px-2 border-r border-gray-200">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Bullet List"
                    >
                        <List size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Ordered List"
                    >
                        <ListOrdered size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                        title="Align Left"
                    >
                        <AlignLeft size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                        title="Align Center"
                    >
                        <AlignCenter size={18} />
                    </ToolbarButton>
                </div>

                {/* Color & Misc */}
                <div className="flex gap-1 pl-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />
                    <input
                        type="color"
                        onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
                        className="w-8 h-8 p-1 cursor-pointer bg-transparent border-0"
                        title="Text Color"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        isActive={editor.isActive('highlight')}
                        title="Highlight"
                    >
                        <Highlighter size={18} />
                    </ToolbarButton>
                    <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title="Link">
                        <LinkIcon size={18} />
                    </ToolbarButton>
                    <ToolbarButton onClick={addImage} disabled={isUploading} title="Insert Image from System">
                        {isUploading ? <Loader size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                        <Undo size={18} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                        <Redo size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => {
                            editor.chain().focus().clearNodes().unsetAllMarks().run();
                        }}
                        title="Clear Formatting"
                    >
                        <Eraser size={18} />
                    </ToolbarButton>
                </div>
            </div>

            <div className="prose prose-sm max-w-none min-h-[300px] outline-none announcement-editor">
                <EditorContent editor={editor} />
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                }
                .ProseMirror {
                    outline: none !important;
                    min-height: 300px;
                }
                .ProseMirror ul {
                    list-style-type: disc !important;
                    padding-left: 1.5rem !important;
                    margin-top: 0.5rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .ProseMirror ol {
                    list-style-type: decimal !important;
                    padding-left: 1.5rem !important;
                    margin-top: 0.5rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .ProseMirror li {
                    margin-top: 0.25rem !important;
                    margin-bottom: 0.25rem !important;
                }
                .ProseMirror a {
                    color: #2563eb !important;
                    text-decoration: underline !important;
                    cursor: pointer !important;
                }
            `}} />
        </div>
    );
};

export default TiptapEditor;
