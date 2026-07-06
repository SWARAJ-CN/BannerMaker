import React, { useState, useRef } from 'react';
import { FiLayout, FiLayers, FiZap, FiCheckCircle, FiUpload, FiSliders, FiMaximize2, FiImage, FiGrid, FiActivity, FiDownload, FiEye, FiTv, FiInstagram, FiCrop } from 'react-icons/fi';

const TEMPLATE_PRESETS = [
  {
    id: 'st-minimal-story',
    name: 'Minimal Editorial',
    category: 'Story',
    description: 'Clean 9:16 vertical canvas with floating center image focus.',
    aspectRatio: '9:16',
    widthRatio: 0.8,
    heightRatio: 0.65,
    yOffsetFactor: 0,
    hasFrame: false,
    textOverlay: 'EDITORIAL CORE',
    badge: '9:16'
  },
  {
    id: 'st-cinematic-reel',
    name: 'Cinematic Reel Cover',
    category: 'Reel Cover',
    description: 'Full-bleed lower offset layout with heavy letterbox formatting markers.',
    aspectRatio: '9:16',
    widthRatio: 1.0,
    heightRatio: 0.55,
    yOffsetFactor: 120,
    hasFrame: true,
    textOverlay: 'CINEMATIC CUT',
    badge: '9:16 Cover'
  },
  {
    id: 'st-square-post',
    name: 'Brutalist Square Feed',
    category: 'Post',
    description: 'Standard 1:1 square micro-grid block for regular main timeline feeds.',
    aspectRatio: '1:1',
    widthRatio: 0.9,
    heightRatio: 0.9,
    yOffsetFactor: 0,
    hasFrame: false,
    textOverlay: 'FEED PROTOCOL',
    badge: '1:1 Square'
  },
  {
    id: 'st-polaroid-frame',
    name: 'Analog Polaroid Asset',
    category: 'Story',
    description: 'Vintage high-contrast frame simulation layout container.',
    aspectRatio: '9:16',
    widthRatio: 0.85,
    heightRatio: 0.72,
    yOffsetFactor: -40,
    hasFrame: true,
    textOverlay: 'ANALOG SHOT',
    badge: '9:16 Retro'
  },
  {
    id: 'st-landscape-post',
    name: 'Seamless Carousel Banner',
    category: 'Post',
    description: '4:5 modern high-impact aspect ratio optimized for Instagram feeds.',
    aspectRatio: '4:5',
    widthRatio: 0.95,
    heightRatio: 0.85,
    yOffsetFactor: 0,
    hasFrame: false,
    textOverlay: 'CAROUSEL BLOCK',
    badge: '4:5 Portrait'
  }
];

const FILTER_PRESETS = [
  { id: 'normal', name: 'Raw', filterStr: 'none', canvasFilter: 'none' },
  { id: 'cyberpunk', name: 'Cyberpunk 2077', filterStr: 'contrast(1.25) saturate(1.8) hue-rotate(-10deg)', canvasFilter: 'contrast(125%) saturate(180%) hue-rotate(-10deg)' },
  { id: 'noir', name: 'Tokyo Noir', filterStr: 'grayscale(1) contrast(1.5) brightness(0.9)', canvasFilter: 'grayscale(100%) contrast(150%) brightness(90%)' },
  { id: 'vintage', name: 'Portra 400', filterStr: 'sepia(0.35) contrast(1.05) brightness(1.02) saturate(1.2)', canvasFilter: 'sepia(35%) contrast(105%) brightness(102%) saturate(120%)' },
  { id: 'chroma', name: 'Vibrant Chroma', filterStr: 'saturate(2.2) contrast(1.1) brightness(1.05)', canvasFilter: 'saturate(220%) contrast(110%) brightness(105%)' }
];

export default function InstaStoryTemplates() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATE_PRESETS[0]);
  const [userImage, setUserImage] = useState(null);
  const fileInputRef = useRef(null);
  const hiddenCanvasRef = useRef(null);

  // Creative Precision State Controls
  const [imgScale, setImgScale] = useState(100);
  const [imgBlur, setImgBlur] = useState(0);
  const [imgRadius, setImgRadius] = useState(12);
  const [posY, setPosY] = useState(0);
  const [posX, setPosX] = useState(0);
  const [bgColor, setBgColor] = useState('#090d16');
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [showGridOverlay, setShowGridOverlay] = useState(false);

  // Export Sequence Engine States
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportSuccess, setExportSuccess] = useState(false);

  const categories = ['All', 'Story', 'Reel Cover', 'Post'];

  const filteredTemplates = activeCategory === 'All'
    ? TEMPLATE_PRESETS
    : TEMPLATE_PRESETS.filter(t => t.category === activeCategory);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setExportSuccess(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result);
        setExportSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // High-Resolution Export Engine
  const generateDownload = () => {
    const canvas = hiddenCanvasRef.current;
    if (!canvas || !userImage) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = userImage;

    img.onload = () => {
      if (selectedTemplate.aspectRatio === '1:1') {
        canvas.width = 1080;
        canvas.height = 1080;
      } else if (selectedTemplate.aspectRatio === '4:5') {
        canvas.width = 1080;
        canvas.height = 1350;
      } else {
        canvas.width = 1080;
        canvas.height = 1920;
      }

      // 1. Background Render Layer
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Artistic Text Watermark Engine Injection
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.font = 'black 90px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(selectedTemplate.textOverlay, canvas.width / 2, canvas.height / 2 + 300);

      // 3. Compute Color Filters matrix
      const filterObj = FILTER_PRESETS.find(f => f.id === selectedFilter);
      let filterChain = filterObj ? filterObj.canvasFilter : 'none';
      if (imgBlur > 0) filterChain += ` blur(${imgBlur * 4}px)`;
      ctx.filter = filterChain;

      // 4. Transform Matrix math parameters calculations
      const baseTargetW = canvas.width * selectedTemplate.widthRatio;
      const baseTargetH = canvas.height * selectedTemplate.heightRatio;
      const scaleFactor = imgScale / 100;
      
      const finalW = baseTargetW * scaleFactor;
      const finalH = baseTargetH * scaleFactor;

      const calculatedX = (canvas.width - finalW) / 2 + (posX * 4);
      const calculatedY = (canvas.height - finalH) / 2 + (selectedTemplate.yOffsetFactor) + (posY * 4);

      // 5. Context Layer Clipping (Radius Processing)
      ctx.save();
      if (imgRadius > 0) {
        const rad = imgRadius * 4;
        ctx.beginPath();
        ctx.moveTo(calculatedX + rad, calculatedY);
        ctx.lineTo(calculatedX + finalW - rad, calculatedY);
        ctx.quadraticCurveTo(calculatedX + finalW, calculatedY, calculatedX + finalW, calculatedY + rad);
        ctx.lineTo(calculatedX + finalW, calculatedY + finalH - rad);
        ctx.quadraticCurveTo(calculatedX + finalW, calculatedY + finalH, calculatedX + finalW - rad, calculatedY + finalH);
        ctx.lineTo(calculatedX + rad, calculatedY + finalH);
        ctx.quadraticCurveTo(calculatedX, calculatedY + finalH, calculatedX, calculatedY + finalH - rad);
        ctx.lineTo(calculatedX, calculatedY + rad);
        ctx.quadraticCurveTo(calculatedX, calculatedY, calculatedX + rad, calculatedY);
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(img, calculatedX, calculatedY, finalW, finalH);
      ctx.restore();

      // 6. Template Framing Simulation Overlay Layer
      if (selectedTemplate.hasFrame) {
        ctx.filter = 'none';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 16;
        ctx.strokeRect(calculatedX - 8, calculatedY - 8, finalW + 16, finalH + 16);
      }

      // 7. Grid Alignment Overlay Compilation Pipeline
      if (showGridOverlay) {
        ctx.filter = 'none';
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 4;
        const colW = finalW / 3;
        const rowH = finalH / 3;

        for (let i = 1; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(calculatedX + (colW * i), calculatedY);
          ctx.lineTo(calculatedX + (colW * i), calculatedY + finalH);
          ctx.stroke();
        }
        for (let j = 1; j < 3; j++) {
          ctx.beginPath();
          ctx.moveTo(calculatedX, calculatedY + (rowH * j));
          ctx.lineTo(calculatedX + finalW, calculatedY + (rowH * j));
          ctx.stroke();
        }
      }

      // 8. Auto Browser Save link Generation
      const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
      const anchor = document.createElement('a');
      anchor.download = `studio-${selectedTemplate.id}-${Date.now()}.jpg`;
      anchor.href = dataUrl;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    };
  };

  const runExportSequence = () => {
    if (!userImage || isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    setExportSuccess(false);

    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            setExportSuccess(true);
            generateDownload();
          }, 250);
          return 100;
        }
        return p + 20;
      });
    }, 40);
  };

  const getAspectClass = () => {
    if (selectedTemplate.aspectRatio === '1:1') return 'w-[240px] h-[240px]';
    if (selectedTemplate.aspectRatio === '4:5') return 'w-[220px] h-[275px]';
    return 'w-[200px] h-[355px]';
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto p-4 bg-slate-950 text-slate-100 rounded-3xl border border-slate-900">
      <canvas ref={hiddenCanvasRef} className="hidden" />
      
      {/* ⚡ CRITICAL FIX: File input node is placed out here so it's always accessible in the DOM tree */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Engine & Presets Selection Directory */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800/80 p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-black tracking-wider flex items-center gap-2 uppercase text-cyan-400">
                <FiCrop /> Format Engine Matrices
              </h2>
              <p className="text-xs text-slate-400">Transform your layout structure instantly across target networks</p>
            </div>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] px-3 py-1.5 rounded-lg font-bold transition-all uppercase ${activeCategory === cat ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplate.id === template.id;
              return (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group ${isSelected ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-cyan-500 ring-1 ring-cyan-500/20' : 'bg-slate-950/60 border-slate-850 hover:border-slate-700'}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-xs font-black font-mono uppercase group-hover:text-cyan-400 transition-colors">{template.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{template.description}</p>
                    </div>
                    <span className="text-[8px] tracking-tight font-black bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-cyan-400 font-mono uppercase">{template.badge}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400">
                    {template.category === 'Story' && <FiInstagram />}
                    {template.category === 'Reel Cover' && <FiTv />}
                    {template.category === 'Post' && <FiLayers />}
                    <span className="uppercase text-slate-500 font-bold">{template.category} Structure</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Live Canvas Editor Frame & Controllers */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800/80 p-6 rounded-2xl space-y-6">
          <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FiSliders className="text-cyan-400" /> Live Target Matrix Preview
          </h2>

          <div className="flex justify-center items-center p-4 bg-slate-950/80 rounded-2xl border border-slate-850 min-h-[390px]">
            <div 
              style={{ backgroundColor: bgColor }}
              className={`rounded-xl relative border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between p-4 transition-all duration-300 ${getAspectClass()}`}
            >
              <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none select-none font-mono font-black text-[15px] tracking-widest break-all p-2">
                {selectedTemplate.textOverlay}
              </div>

              <div className="relative w-full h-full flex flex-col justify-center items-center z-10">
                {userImage ? (
                  <div 
                    style={{ 
                      borderRadius: `${imgRadius}px`,
                      transform: `scale(${imgScale / 100}) translate(${posX}px, ${selectedTemplate.yOffsetFactor / 5 + posY}px)`,
                      filter: `${imgBlur > 0 ? `blur(${imgBlur}px)` : ''} ${FILTER_PRESETS.find(f => f.id === selectedFilter)?.filterStr || 'none'}`,
                      border: selectedTemplate.hasFrame ? '2px solid #ffffff' : 'none'
                    }} 
                    className="w-full h-3/4 overflow-hidden relative border border-slate-800 bg-slate-950 flex items-center justify-center transition-transform duration-75"
                  >
                    <img src={userImage} alt="Viewport Core Asset" className="w-full h-full object-cover select-none pointer-events-none" />
                    
                    {showGridOverlay && (
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none transition-all duration-200">
                        <div className="border-r border-b border-cyan-400/30"></div>
                        <div className="border-r border-b border-cyan-400/30"></div>
                        <div className="border-b border-cyan-400/30"></div>
                        <div className="border-r border-b border-cyan-400/30"></div>
                        <div className="border-r border-b border-cyan-400/30"></div>
                        <div className="border-b border-cyan-400/30"></div>
                        <div className="border-r border-cyan-400/30"></div>
                        <div className="border-r border-cyan-400/30"></div>
                        <div></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-3/4 border-2 border-dashed border-slate-800 hover:border-cyan-500/40 rounded-xl bg-slate-950 flex flex-col items-center justify-center p-4 text-center gap-2 group transition-colors"
                  >
                    <FiUpload className="text-slate-600 group-hover:text-cyan-400 w-6 h-6 transition-colors" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Incorporate Source Media</span>
                  </button>
                )}
              </div>

              <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest pt-2 border-t border-slate-800/40">
                <span>{selectedTemplate.name}</span>
                <span>{selectedTemplate.aspectRatio}</span>
              </div>
            </div>
          </div>

          {/* Control Suites Panel */}
          {userImage && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <FiActivity className="text-purple-400" /> Color Profile Grading Engine
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {FILTER_PRESETS.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedFilter(filter.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all border ${selectedFilter === filter.id ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                      >
                        {filter.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <FiGrid className="text-cyan-400" /> Dynamic 3x3 Framing Matrix Lines
                  </span>
                  <button
                    onClick={() => setShowGridOverlay(!showGridOverlay)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition-all border flex items-center gap-1 ${showGridOverlay ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                  >
                    <FiEye /> {showGridOverlay ? 'GRID ACTIVE' : 'MUTED'}
                  </button>
                </div>
              </div>

              {/* Advanced Multi-Sliders Panel */}
              <div className="space-y-3.5 bg-slate-950 p-4 rounded-xl border border-slate-850">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">Source Media Asset</span>
                  <button onClick={() => fileInputRef.current?.click()} className="text-[10px] text-cyan-400 font-bold hover:underline">
                    Replace Image File
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                      <span>SCALE ACCENT</span>
                      <span className="text-cyan-400">{imgScale}%</span>
                    </div>
                    <input type="range" min="30" max="200" value={imgScale} onChange={(e) => setImgScale(Number(e.target.value))} className="w-full accent-cyan-500 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                      <span>CORNER RADIUS</span>
                      <span className="text-cyan-400">{imgRadius}px</span>
                    </div>
                    <input type="range" min="0" max="50" value={imgRadius} onChange={(e) => setImgRadius(Number(e.target.value))} className="w-full accent-cyan-500 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                      <span>VERTICAL ADJUST</span>
                      <span className="text-cyan-400">{posY}px</span>
                    </div>
                    <input type="range" min="-80" max="80" value={posY} onChange={(e) => setPosY(Number(e.target.value))} className="w-full accent-cyan-500 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                      <span>HORIZONTAL ADJUST</span>
                      <span className="text-cyan-400">{posX}px</span>
                    </div>
                    <input type="range" min="-80" max="80" value={posX} onChange={(e) => setPosX(Number(e.target.value))} className="w-full accent-cyan-500 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-900 items-center">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                      <span>GAUSSIAN BLUR</span>
                      <span className="text-cyan-400">{imgBlur}px</span>
                    </div>
                    <input type="range" min="0" max="20" value={imgBlur} onChange={(e) => setImgBlur(Number(e.target.value))} className="w-full accent-cyan-500 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">MATRICES CANVAS BACKDROP</span>
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-5 h-5 bg-transparent border-0 cursor-pointer rounded" />
                      <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{bgColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Sequences */}
          <div className="space-y-3">
            {isExporting && (
              <div className="space-y-1.5 animate-fadeIn">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Executing Engine Compilation Sequence...</span>
                  <span className="text-cyan-400 font-bold">{exportProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1 bg-slate-900 overflow-hidden">
                  <div style={{ width: `${exportProgress}%` }} className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-150" />
                </div>
              </div>
            )}

            {exportSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-xl flex items-center gap-2 justify-center animate-fadeIn">
                <FiCheckCircle className="stroke-[2.5]" /> Asset Compiled successfully. Check your browser downloads directory.
              </div>
            )}

            <button 
              disabled={!userImage || isExporting}
              onClick={runExportSequence}
              className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${userImage && !isExporting ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-blue-700 text-slate-950 shadow-lg shadow-cyan-500/10 active:scale-[0.99]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            >
              <FiDownload className="w-4 h-4 stroke-[2.5]" />
              <span>{isExporting ? 'Processing Target Geometry Layout...' : `Compile & Export Format`}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}