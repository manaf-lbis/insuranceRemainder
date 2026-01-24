import React, { useMemo, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useUploadPosterMutation } from '../features/posters/postersApiSlice';
import { Loader } from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder }) => {
    const quillRef = useRef(null);
    const [uploadImage, { isLoading }] = useUploadPosterMutation(); // Reusing poster upload for now as it returns URL

    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('title', 'Content Image'); // Dummy title

                try {
                    // Save current cursor state
                    const range = quillRef.current.getEditor().getSelection(true);

                    // Insert temporary placeholder
                    quillRef.current.getEditor().insertText(range.index, 'Uploading image...', 'bold', true);

                    const res = await uploadImage(formData).unwrap();

                    // Remove placeholder
                    quillRef.current.getEditor().deleteText(range.index, 'Uploading image...'.length);

                    // Insert image
                    quillRef.current.getEditor().insertEmbed(range.index, 'image', res.imageUrl);
                } catch (err) {
                    console.error('Image upload failed', err);
                    alert('Failed to upload image');
                }
            }
        };
    }, [uploadImage]);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), [imageHandler]);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link', 'image'
    ];

    return (
        <div className="relative">
            {isLoading && (
                <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
                    <Loader className="animate-spin text-blue-600" />
                </div>
            )}
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="bg-white h-64 mb-12 sm:mb-10" // Margin bottom for toolbar
            />
        </div>
    );
};

export default RichTextEditor;
