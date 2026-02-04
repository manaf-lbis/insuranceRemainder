import React, { useCallback, useState, useRef, useEffect } from 'react';
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
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
    AlignLeft, AlignCenter, AlignRight, Link as LinkIcon,
    Undo, Redo, Highlighter, Eraser, Image as ImageIcon,
    Loader, Heading1, Heading2, Heading3, Quote, Minus,
    Type, Palette, ChevronDown, Check,
    Table as TableIcon, Trash2, Plus, ArrowDown, ArrowRight as ArrowRightIcon,
    Split, Minimize
} from 'lucide-react';
import { Extension } from '@tiptap/core';

// Custom extension for Font Size
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

const COLORS = [
    { name: 'Default', value: '#000000' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Green', value: '#10B981' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
];

const TiptapEditor = ({ value, onChange, placeholder = 'Start writing...' }) => {
    const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
    const fileInputRef = useRef(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef(null);

    // Close color picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
                setShowColorPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
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
                    class: 'rounded-lg max-w-full h-auto shadow-md my-4',
                },
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full my-4',
                },
            }),
            TableRow.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300',
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 bg-gray-50 p-2 font-bold text-left',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 p-2 relative',
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
                        uploadImage(formData).unwrap()
                            .then(response => {
                                const { schema } = view.state;
                                const node = schema.nodes.image.create({ src: response.url });
                                const transaction = view.state.tr.insert(view.state.selection.from, node);
                                view.dispatch(transaction);
                            })
                            .catch(err => {
                                console.error('Upload failed:', err);
                                alert('Failed to upload image.');
                            });
                        return true;
                    }
                }
                return false;
            },
            attributes: {
                class: 'prose prose-sm max-w-none p-6 min-h-[300px] focus:outline-none',
            },
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML() && !editor.isFocused) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
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
                alert('Failed to upload image.');
            }
        }
        e.target.value = '';
    };

    if (!editor) return null;

    const ToolbarButton = ({ onClick, isActive, disabled, children, title, className = '' }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-1.5 rounded-md transition-all flex items-center justify-center ${isActive
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {children}
        </button>
    );

    const Separator = () => <div className="w-px h-6 bg-gray-200 mx-1 self-center" />;

    return (
        <div className="border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all bg-white shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-20">

                {/* Text Formatting */}
                <div className="flex gap-0.5">
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)">
                        <Bold size={18} strokeWidth={2.5} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)">
                        <Italic size={18} strokeWidth={2.5} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (Ctrl+U)">
                        <UnderlineIcon size={18} strokeWidth={2.5} />
                    </ToolbarButton>
                </div>

                <Separator />

                {/* Headings */}
                <div className="flex gap-0.5">
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
                        <Heading1 size={18} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
                        <Heading2 size={18} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
                        <Heading3 size={18} />
                    </ToolbarButton>
                </div>

                <Separator />

                {/* Lists & Quote */}
                <div className="flex gap-0.5">
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
                        <List size={18} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List">
                        <ListOrdered size={18} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
                        <Quote size={18} />
                    </ToolbarButton>
                </div>

                <Separator />

                {/* Table Controls */}
                <div className="flex gap-0.5">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        title="Insert Table (3x3)"
                    >
                        <TableIcon size={18} />
                    </ToolbarButton>

                    {editor.isActive('table') && (
                        <>
                            <ToolbarButton onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add Column Before">
                                <ArrowRightIcon size={14} className="rotate-180" />
                            </ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column After">
                                <ArrowRightIcon size={14} />
                            </ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column" className="text-red-500 hover:text-red-700">
                                <Minus size={14} className="rotate-90" />
                            </ToolbarButton>

                            <ToolbarButton onClick={() => editor.chain().focus().addRowBefore().run()} title="Add Row Before">
                                <ArrowDown size={14} className="rotate-180" />
                            </ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row After">
                                <ArrowDown size={14} />
                            </ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row" className="text-red-500 hover:text-red-700">
                                <Minus size={14} />
                            </ToolbarButton>

                            <ToolbarButton onClick={() => editor.chain().focus().mergeCells().run()} title="Merge Cells">
                                <Minimize size={14} />
                            </ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().splitCell().run()} title="Split Cell">
                                <Split size={14} />
                            </ToolbarButton>

                            <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table" className="text-red-600 hover:bg-red-50">
                                <Trash2 size={14} />
                            </ToolbarButton>
                        </>
                    )}
                </div>

                <Separator />

                {/* Alignment */}
                <div className="flex gap-0.5">
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
                        <AlignLeft size={18} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
                        <AlignCenter size={18} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
                        <AlignRight size={18} />
                    </ToolbarButton>
                </div>

                <Separator />

                {/* Colors & Enhancements */}
                <div className="flex gap-1 items-center">
                    {/* Custom Color Picker */}
                    <div className="relative" ref={colorPickerRef}>
                        <button
                            type="button"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className={`flex items-center gap-1 p-1.5 rounded hover:bg-gray-100 ${showColorPicker ? 'bg-gray-100' : ''}`}
                            title="Text Color"
                        >
                            <Palette size={18} style={{ color: editor.getAttributes('textStyle').color || '#000000' }} />
                            <ChevronDown size={12} className="text-gray-500" />
                        </button>

                        {showColorPicker && (
                            <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-100 grid grid-cols-5 gap-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-100">
                                {COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => {
                                            editor.chain().focus().setColor(color.value).run();
                                            setShowColorPicker(false);
                                        }}
                                        className="w-6 h-6 rounded-full border border-gray-200 transition-transform hover:scale-110 flex items-center justify-center"
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    >
                                        {editor.isActive('textStyle', { color: color.value }) && <Check size={12} className="text-white drop-shadow-md" />}
                                    </button>
                                ))}
                                <div className="col-span-5 border-t border-gray-100 pt-2 mt-1">
                                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer hover:text-gray-800">
                                        <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center bg-gradient-to-br from-red-500 via-green-500 to-blue-500">
                                            <input
                                                type="color"
                                                className="opacity-0 w-full h-full cursor-pointer"
                                                onChange={(e) => {
                                                    editor.chain().focus().setColor(e.target.value).run();
                                                    setShowColorPicker(false);
                                                }}
                                            />
                                        </div>
                                        <span>Custom...</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
                        <Highlighter size={18} />
                    </ToolbarButton>

                    <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
                        <Minus size={18} />
                    </ToolbarButton>

                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

                    <ToolbarButton onClick={() => fileInputRef.current?.click()} disabled={isUploading} title="Insert Image">
                        {isUploading ? <Loader size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                    </ToolbarButton>

                    <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title="Link">
                        <LinkIcon size={18} />
                    </ToolbarButton>
                </div>

                <div className="flex-1" />

                {/* History */}
                <div className="flex gap-0.5 border-l border-gray-200 pl-1">
                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
                        <Undo size={18} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
                        <Redo size={18} />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear Formatting">
                        <Eraser size={18} />
                    </ToolbarButton>
                </div>
            </div>

            <div className="relative">
                <EditorContent editor={editor} className="announcement-editor" />
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .announcement-editor .ProseMirror {
                    min-height: 350px;
                    outline: none;
                }
                .announcement-editor .ProseMirror h1 { font-size: 2.25em; font-weight: 800; margin-bottom: 0.5em; line-height: 1.2; }
                .announcement-editor .ProseMirror h2 { font-size: 1.75em; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; line-height: 1.3; }
                .announcement-editor .ProseMirror h3 { font-size: 1.5em; font-weight: 600; margin-top: 1.25em; margin-bottom: 0.5em; }
                .announcement-editor .ProseMirror p { margin-bottom: 1em; line-height: 1.75; }
                .announcement-editor .ProseMirror blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; color: #4b5563; font-style: italic; margin-left: 0; margin-right: 0; }
                .announcement-editor .ProseMirror hr { border: none; border-top: 2px solid #e5e7eb; margin: 2rem 0; }
                .announcement-editor .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; }
                .announcement-editor .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; }
                /* Placeholder */
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #9ca3af;
                    pointer-events: none;
                    height: 0;
                }
                /* Table Styles */
                .announcement-editor table {
                    border-collapse: collapse;
                    table-layout: fixed;
                    width: 100%;
                    margin: 0;
                    overflow: hidden;
                }
                .announcement-editor td,
                .announcement-editor th {
                    min-width: 1em;
                    border: 2px solid #ced4da;
                    padding: 3px 5px;
                    vertical-align: top;
                    box-sizing: border-box;
                    position: relative;
                }
                .announcement-editor th {
                    font-weight: bold;
                    text-align: left;
                    background-color: #f1f3f5;
                }
                .announcement-editor .selectedCell:after {
                    z-index: 2;
                    position: absolute;
                    content: "";
                    left: 0; right: 0; top: 0; bottom: 0;
                    background: rgba(200, 200, 255, 0.4);
                    pointer-events: none;
                }
                .announcement-editor .column-resize-handle {
                    position: absolute;
                    right: -2px;
                    top: 0;
                    bottom: -2px;
                    width: 4px;
                    background-color: #adf;
                    pointer-events: none;
                }
                .announcement-editor .tableWrapper {
                    overflow-x: auto;
                }
                .resize-cursor {
                    cursor: ew-resize;
                    cursor: col-resize;
                }
            `}} />
        </div>
    );
};

export default TiptapEditor;
