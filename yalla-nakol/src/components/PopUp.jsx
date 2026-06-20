import React, { useEffect } from 'react';
import { CiTrash, CiWarning } from 'react-icons/ci';
import { FaCheckCircle } from 'react-icons/fa';

// 1. Completed the themes object so it doesn't break when switching themes
const themes = {
    delete: {
        icon: CiTrash,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        confirmTheme: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    },
    confirm: {
        icon: FaCheckCircle,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        confirmTheme: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    },
    warning: {
        icon: CiWarning, // Added a warning icon
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        confirmTheme: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    }
};

const PopUp = ({
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel', 
    theme = 'delete', 
    isLoading = false
}) => {
    // Fallback to 'delete' if an invalid theme string is passed
    const themeConfig = themes[theme] || themes.delete; 

    // 2. Fixed the Escape key listener (needs to be attached to the document)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onCancel && !isLoading) {
                onCancel();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onCancel, isLoading]);

    return (
        // 3. Darkened the backdrop slightly to make the modal pop out more
        <div 
            className='fixed inset-0 z-50 flex items-center h-screen justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity'
            onClick={() => !isLoading && onCancel && onCancel()} // Allows clicking outside to close
        >
            {/* 4. Changed background to white, added shadow, and rounded corners */}
            <div 
                className='relative w-full max-w-md p-6 bg-white rounded-xl shadow-2xl'
                onClick={(e) => e.stopPropagation()} // Prevents the backdrop click from triggering inside the card
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className='flex items-center gap-4 mb-4'>
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${themeConfig.iconBg}`}>
                        <themeConfig.icon className={`w-6 h-6 ${themeConfig.iconColor}`} />
                    </div>
                    <h2 className='text-xl font-bold text-slate-800'>{title}</h2>
                </div>

                {/* Body */}
                <div className='mb-6 text-slate-600 leading-relaxed'>
                    {message}
                </div>

                {/* Footer */}
                <div className='flex justify-end gap-3'>
                    {/* 5. Fixed onClick syntax. () => {onCancel} does nothing. It needs to be () => onCancel() or just onCancel */}
                    <button 
                        onClick={onCancel} 
                        disabled={isLoading}
                        className='px-4 py-2 font-medium text-slate-700 transition-colors bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50'
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2 ${themeConfig.confirmTheme}`}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PopUp;