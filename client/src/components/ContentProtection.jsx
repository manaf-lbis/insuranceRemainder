import { useEffect } from 'react';

const ContentProtection = () => {
    useEffect(() => {
        // Disable right-click context menu
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // Disable text selection copy
        const handleCopy = (e) => {
            e.preventDefault();
            return false;
        };

        // Disable cut
        const handleCut = (e) => {
            e.preventDefault();
            return false;
        };

        // Disable drag and drop for images
        const handleDragStart = (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                return false;
            }
        };

        // Disable keyboard shortcuts
        const handleKeyDown = (e) => {
            // Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+U (view source), Ctrl+S (save), F12 (devtools)
            if (
                (e.ctrlKey && (e.key === 'c' || e.key === 'x' || e.key === 'a' || e.key === 'u' || e.key === 's')) ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                e.key === 'F12'
            ) {
                e.preventDefault();
                return false;
            }
        };

        // Add event listeners
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('cut', handleCut);
        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('cut', handleCut);
            document.removeEventListener('dragstart', handleDragStart);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return null; // This component doesn't render anything
};

export default ContentProtection;
