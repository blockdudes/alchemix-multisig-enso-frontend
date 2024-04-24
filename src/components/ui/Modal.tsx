import React from 'react';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 backdrop-blur-sm " >
            <div className="absolute top-0 left-0 w-full h-full bg-black  opacity-50"></div>
            <div className="bg-black  p-8 rounded shadow-lg z-10 relative">
                <button onClick={onClose} className="absolute top-2 right-2 bg-slate-700 rounded-full w-6 h-6 flex items-center justify-center text-white">
                    X
                </button>
                <div className="overflow-y-auto max-h-[600px]"> {/* Add this div */}
                    {children}
                </div>  
                    </div>
        </div>
    );
};

export default Modal;
