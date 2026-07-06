import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import { FiUploadCloud, FiGrid, FiDownload, FiRefreshCw, FiCheckCircle, FiInfo, FiLayers, FiFolderPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import JSZip from 'jszip';
import 'react-image-crop/dist/ReactCrop.css';

export default function InstaGridCropper() {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  
  // 4 Core Single-Item Aspect Ratios ('1:1', '4:5', '3:4', '9:16')
  const [currentMode, setCurrentMode] = useState('1:1'); 
  
  // Slicing Mode Configuration: 9 (3x3), 6 (3x2), or 3 (3x1)
  const [sliceCountMode, setSliceCountMode] = useState(9); 
  
  const [gridSlices, setGridSlices] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imgRef = useRef(null);

  // 1. Calculate base single item aspect ratio
  const getSingleAspectRatio = (mode = currentMode) => {
    switch (mode) {
      case '1:1': return 1;
      case '4:5': return 4 / 5;
      case '3:4': return 3 / 4;
      case '9:16': return 9 / 16;
      default: return 1;
    }
  };

  // 2. Computes the AGGREGATE aspect ratio of the ENTIRE cropping zone based on rows vs columns
  const getAggregateAspectRatio = (mode = currentMode, slices = sliceCountMode) => {
    const singleAspect = getSingleAspectRatio(mode); 
    const totalTargetRows = slices === 9 ? 3 : slices === 6 ? 2 : 1;
    return (3 / totalTargetRows) * singleAspect;
  };

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setGridSlices([]);
        toast.success('Image imported successfully!');
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, getAggregateAspectRatio(), width, height),
      width,
      height
    );
    setCrop(initialCrop);
  }

  // Handle aspect ratio mode changes dynamically
  function handleModeChange(mode) {
    setCurrentMode(mode);
    setGridSlices([]);
    recomputeCropBounds(mode, sliceCountMode);
  }

  // Handle slice layout mode changes and immediately resize the adjustable crop box
  function handleSliceModeChange(count) {
    setSliceCountMode(count);
    setGridSlices([]);
    recomputeCropBounds(currentMode, count);
  }

  // Re-trigger bounds adjustment logic matching the selection footprint safely
  function recomputeCropBounds(mode, slices) {
    if (imgSrc) {
      setTimeout(() => {
        if (imgRef.current) {
          const { width, height } = imgRef.current;
          const aggregateAspect = getAggregateAspectRatio(mode, slices);

          const initialCrop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, aggregateAspect, width, height),
            width,
            height
          );
          setCrop(initialCrop);
        }
      }, 50);
    }
  }

  async function generateGrid() {
    if (!completedCrop || !imgRef.current) {
      toast.error('Please select an area to crop first');
      return;
    }

    setIsProcessing(true);
    const totalTargetRows = sliceCountMode === 9 ? 3 : sliceCountMode === 6 ? 2 : 1;
    const loadingToast = toast.loading(`Slicing layout into ${sliceCountMode} matching segments...`);

    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const sliceWidth = 1080;
      let sliceHeight = 1080; 
      
      if (currentMode === '4:5') sliceHeight = 1350;
      if (currentMode === '3:4') sliceHeight = 1436;
      if (currentMode === '9:16') sliceHeight = 1920;

      const totalWidth = sliceWidth * 3;
      const totalHeight = sliceHeight * totalTargetRows;

      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = totalWidth;
      sourceCanvas.height = totalHeight;
      const sCtx = sourceCanvas.getContext('2d');

      sCtx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        totalWidth,
        totalHeight
      );

      const slices = [];
      canvas.width = sliceWidth;
      canvas.height = sliceHeight;

      for (let row = 0; row < totalTargetRows; row++) {
        for (let col = 0; col < 3; col++) {
          ctx.clearRect(0, 0, sliceWidth, sliceHeight);
          ctx.drawImage(
            sourceCanvas,
            col * sliceWidth, row * sliceHeight, sliceWidth, sliceHeight,
            0, 0, sliceWidth, sliceHeight
          );

          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          slices.push({
            id: row * 3 + col + 1,
            row: row + 1,
            col: col + 1,
            dataUrl
          });
        }
      }

      setGridSlices(slices);
      toast.dismiss(loadingToast);
      toast.success('Grid generated! Check preview below.', { icon: '🔥' });
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Failed to process image matrix');
    } finally {
      setIsProcessing(false);
    }
  }

  function downloadSingleSlice(slice) {
    const link = document.createElement('a');
    link.href = slice.dataUrl;
    link.download = `grid_slice_${slice.id}.jpg`;
    link.click();
    toast.success(`Downloaded Slice #${slice.id}`);
  }

  function downloadZip() {
    if (gridSlices.length === 0) {
      toast.error('Please compile your slices first');
      return;
    }
    
    const zip = new JSZip();
    gridSlices.forEach((slice) => {
      const base64Data = slice.dataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
      zip.file(`grid_slice_${slice.id}.jpg`, base64Data, { base64: true });
    });

    zip.generateAsync({ type: 'blob' }).then((content) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `insta_grid_${sliceCountMode}_pack_${currentMode.replace(':', 'x')}.zip`;
      link.click();
      toast.success('ZIP bundle download started!');
    });
  }

  function resetWorkspace() {
    setImgSrc('');
    setGridSlices([]);
    setCrop(undefined);
    setCompletedCrop(null);
    toast('Workspace reset', { icon: '🧹' });
  }

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
      
      {/* Configuration Switches */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-md font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FiGrid className="text-cyan-400" /> Grid Sandbox Canvas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Crop adjustments adapt automatically based on layout dimensions</p>
        </div>
        
        {/* The 4 Ratios Selector Control Rack */}
        <div className="flex flex-wrap bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 w-full lg:w-auto">
          {['1:1', '4:5', '3:4', '9:16'].map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`text-xs px-3.5 py-2 rounded-lg font-bold transition-all flex-1 lg:flex-none ${
                currentMode === mode 
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {mode === '1:1' && 'SQUARE (1:1)'}
              {mode === '4:5' && 'PORTRAIT (4:5)'}
              {mode === '3:4' && 'VERTICAL (3:4)'}
              {mode === '9:16' && 'STORY (9:16)'}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Aspect Banner Box */}
      <div className="bg-gradient-to-r from-cyan-950/40 to-blue-950/20 border border-cyan-800/40 p-4 rounded-2xl flex items-start gap-3">
        <FiInfo className="text-cyan-400 w-5 h-5 mt-0.5 shrink-0" />
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs font-black uppercase text-cyan-300 tracking-wider">
              Adaptive Grid Boundaries
            </h4>
            <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-mono font-bold uppercase">
              Auto-Scaling Box
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Changing your <strong>Slicing Mode</strong> updates the cropping selector aspect box. Example: Selecting 3 Slices (3x1 layout) limits the crop handler to an exact widescreen horizontal strip format.
          </p>
        </div>
      </div>

      {!imgSrc && (
        <div className="w-full">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-12 bg-slate-950/40 hover:border-cyan-500/40 cursor-pointer transition-all group text-center min-h-[240px]">
            <div className="flex flex-col items-center max-w-sm mx-auto">
              <FiUploadCloud className="w-10 h-10 text-slate-500 group-hover:text-cyan-400 mb-4 transition-colors" />
              <p className="text-sm font-bold text-slate-300 group-hover:text-slate-200 transition-colors">
                Upload layout panel asset or creative image
              </p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Supports PNG, JPG, JPEG, and AVIF formats
              </p>
            </div>
            <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
          </label>
        </div>
      )}

      {/* Main Interactive Space */}
      {imgSrc && (
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Crop Module */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Adjust Active Crop Bounds</span>
              <button onClick={resetWorkspace} className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors">
                <FiRefreshCw /> Reset Layout
              </button>
            </div>

            {/* DUAL BUTTON ACTION PANEL (Top Placed) */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={generateGrid}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-black py-3.5 rounded-xl transition-all uppercase text-xs tracking-wider shadow-lg shadow-cyan-500/10 disabled:opacity-50"
              >
                {isProcessing ? 'Slicing Pixels...' : `Compile ${sliceCountMode} Seamless Slices`}
              </button>

              <button 
                onClick={downloadZip}
                disabled={gridSlices.length === 0 || isProcessing}
                className={`flex-1 flex items-center justify-center gap-2 font-black py-3.5 rounded-xl transition-all text-xs tracking-wider uppercase border text-center ${
                  gridSlices.length > 0 
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 border-transparent shadow-lg shadow-emerald-500/10 cursor-pointer' 
                    : 'bg-slate-950 text-slate-600 border-slate-800 opacity-40 cursor-not-allowed'
                }`}
              >
                <FiFolderPlus className="text-sm" /> Download Entire Pack (.ZIP)
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={getAggregateAspectRatio()}
                locked
              >
                <img ref={imgRef} src={imgSrc} alt="Source" onLoad={onImageLoad} className="max-h-[450px] w-full object-contain block" />
              </ReactCrop>
            </div>
          </div>

          {/* Right Live Simulation Grid Output Preview */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:space-y-0">
            
            {/* Slicing Method Selector Controls */}
            <div className="space-y-4 w-full">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FiLayers className="text-cyan-400" /> Slicing Mode (Adjusts Crop Shape)
                </span>
                <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
                  {[9, 6, 3].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleSliceModeChange(count)}
                      className={`text-[11px] py-2 rounded-lg font-bold transition-all ${
                        sliceCountMode === count
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-black shadow-md'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {count === 9 && '9 Slices (3x3)'}
                      {count === 6 && '6 Slices (3x2)'}
                      {count === 3 && '3 Slices (3x1)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {gridSlices.length > 0 ? (
              <>
                <div className="space-y-4 flex flex-col items-center w-full mt-4">
                  <div className="text-center w-full">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Profile Layout Preview</span>
                    <p className="text-[10px] text-slate-500 mt-1">Hover over any block to download it individually</p>
                  </div>
                  
                  <div className="w-full max-w-[280px] bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner">
                    <div className="grid grid-cols-3 gap-[2px]">
                      {gridSlices.map((slice) => (
                        <div 
                          key={slice.id} 
                          className="relative bg-slate-900 overflow-hidden group/slice cursor-pointer" 
                          style={{ aspectRatio: getSingleAspectRatio() }}
                          title={`Click to download piece #${slice.id}`}
                          onClick={() => downloadSingleSlice(slice)}
                        >
                          <img src={slice.dataUrl} alt="" className="w-full h-full object-cover select-none pointer-events-none" />
                          
                          <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover/slice:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 gap-1">
                            <FiDownload className="text-cyan-400 text-xs animate-bounce" />
                            <span className="text-[9px] font-black tracking-tight text-white uppercase">Get #{slice.id}</span>
                          </div>

                          <span className="absolute bottom-1 right-1 bg-slate-950/80 text-[8px] px-1 py-0.5 rounded font-mono text-cyan-400 font-bold border border-slate-800/30 group-hover/slice:hidden">
                            #{slice.id}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 w-full mt-4">
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60">
                    <p className="text-[10px] font-black text-amber-400 tracking-wider uppercase flex items-center gap-1">
                      <FiCheckCircle /> Upload Sequence Protocol
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      To make the profile mosaic stitch cleanly, upload items starting backwards from <span className="text-cyan-400 font-bold">slice_{gridSlices.length}</span> back to 1.
                    </p>
                  </div>
                  {/* Kept here too as a fallback, but users can now safely rely on the top action sticky row */}
                  <button 
                    onClick={downloadZip}
                    className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black py-3.5 rounded-xl transition-all text-xs tracking-wider uppercase shadow-lg shadow-emerald-500/5 flex items-center justify-center gap-2"
                  >
                    <FiDownload className="text-sm" /> Download Entire Pack (.ZIP)
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full border border-dashed border-slate-800/60 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-600 min-h-[220px] mt-4">
                <FiGrid className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs font-medium max-w-[220px] mx-auto leading-relaxed">
                  Compile the active crop boundaries on the left to review the layout simulator dashboard here.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}