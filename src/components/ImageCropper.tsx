'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropDone: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageSrc, onCropDone, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const CROP_SIZE = 280;
  const CANVAS_SIZE = 380;

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
      // Auto-fit the image to the crop area
      const fitScale = CROP_SIZE / Math.min(img.width, img.height);
      setScale(fitScale);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw image
    ctx.save();
    ctx.translate(cx + offset.x, cy + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    // Overlay with cutout
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx, cy, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Circle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.stroke();
  }, [scale, rotation, offset, imageLoaded]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse/touch handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setScale(prev => Math.max(0.1, Math.min(5, prev + delta)));
  };

  const zoomIn = () => setScale(prev => Math.min(5, prev + 0.15));
  const zoomOut = () => setScale(prev => Math.max(0.1, prev - 0.15));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  // Crop and export
  const handleCrop = () => {
    const img = imgRef.current;
    if (!img) return;

    const outputSize = 400; // Output 400x400 pixels
    const outCanvas = document.createElement('canvas');
    outCanvas.width = outputSize;
    outCanvas.height = outputSize;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    const cx = outputSize / 2;
    const cy = outputSize / 2;

    // Clip circle
    ctx.beginPath();
    ctx.arc(cx, cy, outputSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Scale factor between preview canvas and output
    const scaleFactor = outputSize / CROP_SIZE;

    ctx.translate(cx + offset.x * scaleFactor, cy + offset.y * scaleFactor);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale * scaleFactor, scale * scaleFactor);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    outCanvas.toBlob(
      (blob) => {
        if (blob) onCropDone(blob);
      },
      'image/webp',
      0.9
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[460px] mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-notion-border">
          <h2 className="text-lg font-semibold text-notion-text">Crop Profile Picture</h2>
          <button onClick={onCancel} className="p-1 text-notion-text-tertiary hover:text-notion-text rounded-md transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="flex items-center justify-center bg-[#1a1a2e] py-4"
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="cursor-grab active:cursor-grabbing rounded-lg"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-3 border-t border-notion-border bg-notion-bg-secondary">
          <div className="flex items-center justify-center gap-3 mb-3">
            <button onClick={zoomOut} className="p-2 rounded-lg text-notion-text-secondary hover:bg-notion-bg-hover hover:text-notion-text transition-colors" title="Zoom out">
              <ZoomOut size={18} />
            </button>
            <div className="flex-1 max-w-[180px]">
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.01"
                value={scale}
                onChange={e => setScale(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-notion-border rounded-full appearance-none cursor-pointer accent-notion-blue"
              />
            </div>
            <button onClick={zoomIn} className="p-2 rounded-lg text-notion-text-secondary hover:bg-notion-bg-hover hover:text-notion-text transition-colors" title="Zoom in">
              <ZoomIn size={18} />
            </button>
            <div className="w-px h-6 bg-notion-border mx-1" />
            <button onClick={rotate} className="p-2 rounded-lg text-notion-text-secondary hover:bg-notion-bg-hover hover:text-notion-text transition-colors" title="Rotate 90°">
              <RotateCw size={18} />
            </button>
          </div>
          <p className="text-[11px] text-notion-text-tertiary text-center">Drag to reposition • Scroll to zoom</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-notion-border">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={handleCrop} className="btn-primary">
            <Check size={16} /> Apply
          </button>
        </div>
      </div>
    </div>
  );
}
