import React, { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface ProductImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  onDelete: (imageId: string) => void;
  onUpload: (files: FileList) => void;
  onSetPrimary: (imageId: string) => void;
}

export function ProductImageGallery({ images, onDelete, onUpload, onSetPrimary }: ProductImageGalleryProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
     onUpload(files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img src={image.imageUrl} alt="Product" className="w-full h-40 object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="destructive" size="sm" onClick={() => onDelete(image.id)}>
                <X className="h-4 w-4" />
              </Button>
              {!image.isPrimary && (
                <Button variant="secondary" size="sm" onClick={() => onSetPrimary(image.id)} className="ml-2">
                  Set as Primary
                </Button>
              )}
            </div>
            {image.isPrimary && (
              <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                Primary
              </span>
            )}
          </div>
        ))}
      </div>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragOver ? 'border-primary' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*"
          multiple
        />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">Drag and drop images here, or click to select files</p>
      </div>
    </div>
  );
}