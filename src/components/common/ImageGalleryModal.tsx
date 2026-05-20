import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MaintenanceImage } from '../../types/maintenanceTicket';

interface ImageGalleryModalProps {
    isOpen: boolean;
    images: MaintenanceImage[];
    title?: string;
    onClose: () => void;
}

const ImageGalleryModal = ({ isOpen, images, title, onClose }: ImageGalleryModalProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!isOpen) return null;

    const currentImage = images[currentIndex];

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Image {currentIndex + 1} of {images.length}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Close"
                    >
                        <X size={24} className="text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Image Display */}
                <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
                    {currentImage ? (
                        <img
                            src={currentImage.imageUrl}
                            alt={`Image ${currentIndex + 1}`}
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    ) : (
                        <p className="text-gray-400">No image available</p>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700">
                    <button
                        onClick={handlePrevious}
                        disabled={images.length <= 1}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous image"
                    >
                        <ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
                    </button>

                    {/* Thumbnail Strip */}
                    <div className="flex gap-2 flex-1 overflow-x-auto justify-center">
                        {images.map((image, index) => (
                            <button
                                key={image.id}
                                onClick={() => setCurrentIndex(index)}
                                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                                    index === currentIndex
                                        ? 'border-blue-500 ring-2 ring-blue-300'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                }`}
                            >
                                <img
                                    src={image.imageUrl}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={images.length <= 1}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next image"
                    >
                        <ChevronRight size={20} className="text-gray-700 dark:text-gray-300" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageGalleryModal;
