import React, { useState, useRef, useEffect } from 'react';
import { removeBackground } from '@imgly/background-removal';
import {
  FiUpload, FiSliders, FiCpu, FiDownload, FiMove, FiType,
  FiRefreshCw, FiScissors, FiMaximize2, FiLayers
} from 'react-icons/fi';

const ASPECT_RATIOS = [
  { id: '1:1', name: 'Square Feed', width: 1080, height: 1080, desc: 'Instagram Post' },
  { id: '4:5', name: 'Portrait', width: 1080, height: 1350, desc: 'Social Feed Grid' },
  { id: '9:16', name: 'Stories & Reels', width: 1080, height: 1920, desc: 'Full Vertical Mobile' },
  { id: '16:9', name: 'Widescreen Banner', width: 1920, height: 1080, desc: 'Landscape Display' },
  { id: 'A4-Poster', name: 'A4 Document', width: 2480, height: 3508, desc: 'Print Ready (300 DPI)' },
  { id: 'Large-Poster', name: 'Exhibition Poster', width: 3600, height: 5400, desc: 'Ultra-Res Master Print' }
];

const FONT_STYLES = [
  { id: 'font-sans', name: 'Brutalist Sans', fontValue: 'bold sans-serif' },
  { id: 'font-serif', name: 'Editorial Serif', fontValue: 'italic Georgia, serif' },
  { id: 'font-mono', name: 'Technical Mono', fontValue: 'bold "Courier New", monospace' },
  { id: 'font-display', name: 'Grotesk Display', fontValue: '900 Impact, sans-serif-black' },
  { id: 'font-cursive', name: 'Vintage Cursive', fontValue: 'italic "Times New Roman", serif' },
  { id: 'font-tech', name: 'Modern Geometric', fontValue: '800 "Trebuchet MS", sans-serif' }
];

export default function StudioImageRemover() {
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Core Configuration States
  const [rawImage, setRawImage] = useState(null);
  const [rawImageFile, setRawImageFile] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldRemoveBg, setShouldRemoveBg] = useState(true);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[1]);
  const [exportFormat, setExportFormat] = useState('image/png');

  // Drag-and-Drop Interaction States
  const [dragMode, setDragMode] = useState('none');
  const [imagePos, setImagePos] = useState({ x: 0, y: 0 });
  const [textPos, setTextPos] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Typographic Overlay Properties
  const [textOverlay, setTextOverlay] = useState('');
  const [selectedFont, setSelectedFont] = useState(FONT_STYLES[0]);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(64);

  // Precision Image Filters Matrix
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [imgScale, setImgScale] = useState(100);
  const [canvasBg, setCanvasBg] = useState('#020617');

  // Re-run compilation sequence instantly on any control interaction
  useEffect(() => {
    drawCanvasMatrix();
  }, [processedImage, rawImage, shouldRemoveBg, imagePos, textPos, textOverlay, selectedFont, textColor, textSize, brightness, contrast, saturation, imgScale, canvasBg, selectedRatio]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setRawImage(result);
      setRawImageFile(file);
      resetLayoutCoordinates();

      if (shouldRemoveBg) {
        executeBackgroundRemoval(file);
      } else {
        setProcessedImage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleBgRemoval = () => {
    const nextState = !shouldRemoveBg;
    setShouldRemoveBg(nextState);

    if (rawImageFile) {
      if (nextState) {
        executeBackgroundRemoval(rawImageFile);
      } else {
        setProcessedImage(null);
      }
    }
  };

  const resetLayoutCoordinates = () => {
    setImagePos({ x: 0, y: 0 });
    setTextPos({ x: 0, y: 0 });
  };

  const executeBackgroundRemoval = async (imageFile) => {
    setIsProcessing(true);
    try {
      const resultBlob = await removeBackground(imageFile);
      const url = URL.createObjectURL(resultBlob);
      setProcessedImage(url);
    } catch (error) {
      console.error('Background removal engine failure:', error);
      setProcessedImage(null);
      setShouldRemoveBg(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const drawCanvasMatrix = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = selectedRatio.width;
    canvas.height = selectedRatio.height;

    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const activeImgSrc = (shouldRemoveBg && processedImage) ? processedImage : rawImage;
    if (!activeImgSrc) return;

    const img = new Image();
    img.src = activeImgSrc;
    img.onload = () => {
      ctx.save();
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

      const scaleFactor = imgScale / 100;
      let baseW = canvas.width * 0.85;

      if (selectedRatio.id === '16:9') baseW = canvas.width * 0.45;

      const baseH = (img.height / img.width) * baseW;
      const finalW = baseW * scaleFactor;
      const finalH = baseH * scaleFactor;

      const drawX = (canvas.width - finalW) / 2 + imagePos.x;
      const drawY = (canvas.height - finalH) / 2 + imagePos.y;

      ctx.drawImage(img, drawX, drawY, finalW, finalH);
      ctx.restore();

      if (textOverlay.trim() !== '') {
        ctx.save();
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const responsiveFontSize = (textSize * (canvas.width / 1080));
        ctx.font = `${responsiveFontSize}px ${selectedFont.fontValue}`;

        const textCenterX = canvas.width / 2 + textPos.x;
        const textCenterY = canvas.height / 3 + textPos.y;

        ctx.fillText(textOverlay, textCenterX, textCenterY);
        ctx.restore();
      }
    };
  };

  const handleMouseDown = (e) => {
    const activeImgSrc = shouldRemoveBg ? processedImage : rawImage;
    if (!activeImgSrc || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = selectedRatio.width / rect.width;
    const scaleY = selectedRatio.height / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    const targetTextX = selectedRatio.width / 2 + textPos.x;
    const targetTextY = selectedRatio.height / 3 + textPos.y;

    const responsiveFontSize = (textSize * (selectedRatio.width / 1080));
    const distanceToText = Math.hypot(canvasX - targetTextX, canvasY - targetTextY);

    if (textOverlay.trim() !== '' && distanceToText < (responsiveFontSize * 2.5)) {
      setDragMode('text');
      setDragStart({ x: (e.clientX * scaleX) - textPos.x, y: (e.clientY * scaleY) - textPos.y });
    } else {
      setDragMode('image');
      setDragStart({ x: (e.clientX * scaleX) - imagePos.x, y: (e.clientY * scaleY) - imagePos.y });
    }
  };

  const handleMouseMove = (e) => {
    if (dragMode === 'none' || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = selectedRatio.width / rect.width;
    const scaleY = selectedRatio.height / rect.height;

    const currentCanvasX = e.clientX * scaleX;
    const currentCanvasY = e.clientY * scaleY;

    if (dragMode === 'image') {
      setImagePos({
        x: currentCanvasX - dragStart.x,
        y: currentCanvasY - dragStart.y
      });
    } else if (dragMode === 'text') {
      setTextPos({
        x: currentCanvasX - dragStart.x,
        y: currentCanvasY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setDragMode('none');

  const exportFinalAsset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const extension = exportFormat.split('/')[1];
    const dataUrl = canvas.toDataURL(exportFormat, 1.0);
    const downloadAnchor = document.createElement('a');

    downloadAnchor.download = `studio-export-${selectedRatio.id}-${Date.now()}.${extension}`;
    downloadAnchor.href = dataUrl;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-8 bg-slate-950 text-slate-100 rounded-2xl border border-slate-900 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start antialiased">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      {/* LEFT COLUMN: Workspace Studio Canvas Frame Viewport */}
      <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-8">
        <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-slate-900/60 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-300 font-mono">Studio Canvas</h3>
            </div>

            <button
              onClick={toggleBgRemoval}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium border transition-all ${shouldRemoveBg ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <FiScissors className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{shouldRemoveBg ? 'AI Background Removal' : 'Original Background'}</span>
            </button>
          </div>

          {(processedImage || rawImage) && (
            <div className="text-[11px] bg-slate-950 px-2.5 py-1 rounded-md border border-slate-850 text-slate-400 flex items-center gap-2 font-medium">
              <FiMove className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Drag to reposition layers</span>
            </div>
          )}
        </div>

        {/* Viewport Frame Box: Keeps poster scaling balanced on screen */}
        <div className="w-full bg-slate-900/10 rounded-2xl border border-slate-900 shadow-inner flex items-center justify-center p-4 min-h-[400px] max-h-[65vh] overflow-hidden">
          <div
            ref={containerRef}
            style={{ aspectRatio: `${selectedRatio.width} / ${selectedRatio.height}` }}
            className="relative max-w-full max-h-full w-auto h-auto overflow-hidden flex items-center justify-center cursor-move select-none"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {isProcessing && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-2xl">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-6 py-6 text-center shadow-xl max-w-xs">
                  <FiCpu className="mx-auto mb-3 w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-sm font-semibold text-slate-200">Isolating Foreground...</p>
                  <p className="mt-1 text-xs text-slate-400">Removing background in browser environment.</p>
                </div>
              </div>
            )}

            {rawImage ? (
              <div className={`w-full h-full flex items-center justify-center transition-all duration-300 ${isProcessing ? 'blur-sm opacity-50' : ''}`}>
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full object-contain shadow-2xl transition-transform duration-75"
                />
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed border-slate-800 hover:border-indigo-500/40 rounded-2xl bg-slate-950/40 group transition-all w-72 text-center"
              >
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5 transition-all">
                  <FiUpload className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-200">Upload Studio Image</h4>
                  <p className="text-xs text-slate-500 mt-1">Supports PNG, JPEG, or WebP formats</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Control Suites & Layout Presets Matrix panels */}
      <div className="lg:col-span-5 space-y-5">

        {/* Workspace Ratio Aspect Geometry Selection Suite */}
        <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2 border-b border-slate-900 pb-3">
            <FiMaximize2 className="w-3.5 h-3.5" /> Canvas Aspect Ratio
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.id}
                onClick={() => setSelectedRatio(ratio)}
                className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between h-20 ${selectedRatio.id === ratio.id ? 'bg-indigo-500/5 border-indigo-500/60 shadow-sm' : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-medium text-slate-200 truncate pr-1">{ratio.name}</span>
                  <span className="text-[10px] bg-slate-900/80 px-1.5 py-0.5 border border-slate-800 text-indigo-400 rounded font-mono font-medium shrink-0">{ratio.id}</span>
                </div>
                <div className="mt-1">
                  <span className="text-[11px] text-slate-400 font-mono block font-medium">{ratio.width} × {ratio.height} px</span>
                  <span className="text-[11px] text-slate-500 truncate block mt-0.5">{ratio.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Global Image Parameters Adjustments Cluster */}
        <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FiSliders className="text-indigo-400 w-3.5 h-3.5" /> Image Adjustments
            </h3>
            {rawImage && (
              <button onClick={() => fileInputRef.current?.click()} className="text-xs text-slate-400 hover:text-indigo-400 font-medium flex items-center gap-1.5 transition-colors">
                <FiRefreshCw className="w-3 h-3" /> Change Image
              </button>
            )}
          </div>

          {rawImage ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-400"><span>Scale</span><span className="text-indigo-400 font-mono">{imgScale}%</span></div>
                <input type="range" min="10" max="300" value={imgScale} onChange={(e) => setImgScale(Number(e.target.value))} className="w-full accent-indigo-500 h-1 bg-slate-950 rounded-lg cursor-pointer" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-400"><span>Brightness</span><span className="text-indigo-400 font-mono">{brightness}%</span></div>
                <input type="range" min="30" max="180" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full accent-indigo-500 h-1 bg-slate-950 rounded-lg cursor-pointer" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-400"><span>Contrast</span><span className="text-indigo-400 font-mono">{contrast}%</span></div>
                <input type="range" min="30" max="180" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full accent-indigo-500 h-1 bg-slate-950 rounded-lg cursor-pointer" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-400"><span>Saturation</span><span className="text-indigo-400 font-mono">{saturation}%</span></div>
                <input type="range" min="0" max="250" value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} className="w-full accent-indigo-500 h-1 bg-slate-950 rounded-lg cursor-pointer" />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-900">
                <span className="text-xs font-medium text-slate-400">Canvas Backdrop Color</span>
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6 rounded border border-slate-800 overflow-hidden shadow-sm">
                    <input type="color" value={canvasBg} onChange={(e) => setCanvasBg(e.target.value)} className="absolute inset-0 w-full h-full p-0 bg-transparent border-0 cursor-pointer scale-150" />
                  </div>
                  <span className="text-xs font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-900 text-slate-400 uppercase font-medium">{canvasBg}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-2">Upload an image to access configuration properties.</p>
          )}
        </div>

        {/* Advanced Typographic Vector Engine Panel */}
        {rawImage && (
          <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2 border-b border-slate-900 pb-3">
              <FiType className="w-3.5 h-3.5" /> Text Overlay Controls
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 block">Custom Overlay Text</label>
                <input
                  type="text"
                  placeholder="Type overlay text here..."
                  value={textOverlay}
                  onChange={(e) => setTextOverlay(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 block">Font Typography Style</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {FONT_STYLES.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setSelectedFont(font)}
                      className={`text-xs font-medium p-2 rounded-lg border transition-all text-left truncate ${selectedFont.id === font.id ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-950/80 border-slate-900 text-slate-400 hover:text-slate-200'}`}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1 items-center">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-400"><span>Font Size</span><span className="text-indigo-400 font-mono">{textSize}px</span></div>
                  <input type="range" min="15" max="200" value={textSize} onChange={(e) => setTextSize(Number(e.target.value))} className="w-full accent-indigo-500 h-1 bg-slate-950 rounded-lg cursor-pointer" />
                </div>

                <div className="flex flex-col items-end space-y-1.5">
                  <span className="text-xs font-medium text-slate-400 block w-full text-right">Font Color</span>
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 rounded border border-slate-800 overflow-hidden shadow-sm">
                      <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="absolute inset-0 w-full h-full p-0 bg-transparent border-0 cursor-pointer scale-150" />
                    </div>
                    <span className="text-xs font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-900 text-slate-400 uppercase font-medium">{textColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Output Export Matrix Configuration Assembly */}
        {rawImage && (
          <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-slate-900 pb-3">
              <FiLayers className="w-3.5 h-3.5" /> Compilation & Export Output
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 block">Export File Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image/png', label: 'PNG Image' },
                    { id: 'image/jpeg', label: 'JPEG Lossless' },
                    { id: 'image/webp', label: 'WebP Format' }
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setExportFormat(fmt.id)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all ${exportFormat === fmt.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950/80 border-slate-900 text-slate-400 hover:text-slate-200'}`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={isProcessing}
                onClick={exportFinalAsset}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:opacity-95 shadow-md shadow-emerald-500/5 active:scale-[0.99] disabled:opacity-40 select-none"
              >
                <FiDownload className="w-4 h-4 stroke-[2.5]" />
                <span>Download Asset ({selectedRatio.width} × {selectedRatio.height})</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}