import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    // Logic for truncation if many pages (simplified for now)
    const renderPageNumbers = () => {
        return pages.map((page) => (
            <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-4 py-2 rounded-md font-medium transition-all ${currentPage === page
                        ? 'bg-blue-900 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
            >
                {page}
            </button>
        ));
    };

    return (
        <div className="flex items-center justify-center space-x-2 mt-8 py-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={20} />
            </button>

            <div className="flex items-center space-x-2">
                {renderPageNumbers()}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default Pagination;
