
import React, { useState, useRef, useEffect, forwardRef } from 'react';
import ReactDOM from 'react-dom/client';

/**
 * 1. TYPES
 */
export enum PageSize {
  A4 = 'A4',
  LETTER = 'LETTER',
  CUSTOM = 'CUSTOM'
}

export enum Orientation {
  PORTRAIT = 'PORTRAIT',
  LANDSCAPE = 'LANDSCAPE'
}

export enum LayoutType {
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL'
}

export enum Language {
  ENGLISH = 'EN',
  GUJARATI = 'GU'
}

export interface ImageState {
  id: 'img1' | 'img2';
  src: string | null;
  rotation: number;
  scale: number;
  x: number;
  y: number;
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  originalWidth: number;
  originalHeight: number;
}

export interface GlobalSettings {
  pageSize: PageSize;
  orientation: Orientation;
  layout: LayoutType;
  margin: number;
  spacing: number;
  customWidth: number;
  customHeight: number;
  dpi: number;
  language: Language;
}

/**
 * 2. CONSTANTS & UTILS
 */
export const PAGE_DIMENSIONS = {
  A4: { width: 210, height: 297 },
  LETTER: { width: 215.9, height: 279.4 },
};

export const DPI_TO_PIXELS = (mm: number, dpi: number) => {
  return (mm * dpi) / 25.4;
};

export const Icons = {
  RotateCcw: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
  ),
  RotateCw: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
  ),
  ZoomIn: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
  ),
  ZoomOut: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  ),
  Share: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
  ),
  Move: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
  ),
  Crop: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>
  )
};

/**
 * 3. TRANSLATIONS
 */
export const translations = {
  EN: {
    title: "Image Fusion Pro",
    subtitle: "Combine & edit your images for print.",
    layoutSettings: "Layout Settings",
    pageSize: "Page Size",
    orientation: "Orientation",
    arrangement: "Arrangement",
    vertical: "Vertical",
    horizontal: "Horizontal",
    margin: "Margin (mm)",
    spacing: "Spacing (mm)",
    dpi: "DPI (Quality)",
    img1: "Image 1 (Front)",
    img2: "Image 2 (Back)",
    upload: "Click to Upload Image",
    formats: "JPG, PNG, WEBP",
    scale: "Scale",
    rotate: "Rotate",
    offsetX: "Offset X",
    offsetY: "Offset Y",
    reset: "Reset Adjustments",
    exportPdf: "Export High-Quality PDF",
    exportJpg: "Save as JPG",
    generating: "Generating PDF...",
    portrait: "Portrait",
    landscape: "Landscape",
    tip: "Tip: Click and drag images on the preview to reposition them.",
    crop: "Crop",
    resetCrop: "Reset Crop",
    applyCrop: "Apply Crop",
    cancel: "Cancel",
    croppingActive: "Select area to crop. Drag edges to resize."
  },
  GU: {
    title: "ઇમેજ ફ્યુઝન પ્રો",
    subtitle: "પ્રિન્ટ માટે તમારી છબીઓને ભેગી કરો અને સંપાદિત કરો.",
    layoutSettings: "લેઆઉટ સેટિંગ્સ",
    pageSize: "પૃષ્ઠ કદ",
    orientation: "દિશામાન",
    arrangement: "ગોઠવણ",
    vertical: "ઊભી",
    horizontal: "આડી",
    margin: "માર્જિન (mm)",
    spacing: "અંતર (mm)",
    dpi: "DPI (ગુણવત્તા)",
    img1: "છબી ૧ (આગળ)",
    img2: "છબી ૨ (પાછળ)",
    upload: "છબી અપલોડ કરવા માટે ક્લિક કરો",
    formats: "JPG, PNG, WEBP",
    scale: "માપ",
    rotate: "ફેરવો",
    offsetX: "ઓફસેટ X",
    offsetY: "ઓફસેટ Y",
    reset: "બધું ફરીથી સેટ કરો",
    exportPdf: "ઉચ્ચ ગુણવત્તાવાળી PDF નિકાસ કરો",
    exportJpg: "JPG તરીકે સાચવો",
    generating: "PDF બનાવી રહ્યા છીએ...",
    portrait: "પોર્ટ્રેટ",
    landscape: "લેન્ડસ્કેપ",
    tip: "ટિપ: સ્થાન બદલવા માટે પ્રિવ્યૂ પર છબીઓને ક્લિક કરો અને ખેંચો.",
    crop: "ક્રોપ",
    resetCrop: "ક્રોપ રીસેટ કરો",
    applyCrop: "લાગુ કરો",
    cancel: "રદ કરો",
    croppingActive: "ક્રોપ કરવા માટે વિસ્તાર પસંદ કરો. માપ બદલવા માટે કિનારીઓ ખેંચો."
  }
};

/**
 * 4. COMPONENTS
 */
const ImageControlPanel: React.FC<{
  state: ImageState;
  setState: React.Dispatch<React.SetStateAction<ImageState>>;
  language: Language;
  onStartCrop: () => void;
  isCropping: boolean;
}> = ({ state, setState, language, onStartCrop, isCropping }) => {
  const update = (changes: Partial<ImageState>) => setState(prev => ({ ...prev, ...changes }));
  const t = translations[language];

  return (
    <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-100">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">{t.scale}</label>
            <span className="text-[10px] font-mono bg-white px-1 border border-slate-200 rounded text-slate-600">{(state.scale * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => update({ scale: Math.max(0.1, state.scale - 0.1) })} className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"><Icons.ZoomOut /></button>
            <input type="range" min="0.1" max="5" step="0.05" value={state.scale} onChange={(e) => update({ scale: parseFloat(e.target.value) })} className="flex-1 accent-indigo-600" />
            <button onClick={() => update({ scale: Math.min(10, state.scale + 0.1) })} className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"><Icons.ZoomIn /></button>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">{t.rotate}</label>
            <span className="text-[10px] font-mono bg-white px-1 border border-slate-200 rounded text-slate-600">{state.rotation}°</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => update({ rotation: (state.rotation - 90 + 360) % 360 })} className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"><Icons.RotateCcw /></button>
            <input type="range" min="0" max="359" value={state.rotation} onChange={(e) => update({ rotation: parseInt(e.target.value) })} className="flex-1 accent-indigo-600" />
            <button onClick={() => update({ rotation: (state.rotation + 90) % 360 })} className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"><Icons.RotateCw /></button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onStartCrop} className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg border transition-all ${isCropping ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50'}`}>
            <Icons.Crop />{t.crop}
          </button>
          <button disabled={!state.crop} onClick={() => update({ crop: null })} className="flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-200 disabled:opacity-50 transition-all">
            <Icons.Trash />{t.resetCrop}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">{t.offsetX}</label>
            <input type="range" min="-100" max="100" value={state.x} onChange={(e) => update({ x: parseInt(e.target.value) })} className="w-full accent-indigo-600" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">{t.offsetY}</label>
            <input type="range" min="-100" max="100" value={state.y} onChange={(e) => update({ y: parseInt(e.target.value) })} className="w-full accent-indigo-600" />
          </div>
        </div>
      </div>
      <button onClick={() => update({ scale: 1, rotation: 0, x: 0, y: 0, crop: null })} className="w-full py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 rounded-lg hover:bg-white hover:text-indigo-600 hover:border-indigo-200 transition-all">
        {t.reset}
      </button>
    </div>
  );
};

const PreviewCanvas = forwardRef<HTMLCanvasElement, {
  settings: GlobalSettings;
  img1: ImageState;
  img2: ImageState;
  onUpdateImg1: (val: React.SetStateAction<ImageState>) => void;
  onUpdateImg2: (val: React.SetStateAction<ImageState>) => void;
  croppingId: 'img1' | 'img2' | null;
  onStopCrop: () => void;
}>(({ settings, img1, img2, onUpdateImg1, onUpdateImg2, croppingId, onStopCrop }, ref) => {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const [dragState, setDragState] = useState<{ id: 'img1' | 'img2', startX: number, startY: number, initialX: number, initialY: number } | null>(null);
  const [cropSelection, setCropSelection] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);

  useEffect(() => {
    if (typeof ref === 'function') ref(internalRef.current);
    else if (ref) (ref as any).current = internalRef.current;
  }, [ref]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = internalRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: ((clientX - rect.left) / rect.width) * canvas.width, y: ((clientY - rect.top) / rect.height) * canvas.height };
  };

  const getSlotLayout = () => {
    let baseWidthMm = settings.pageSize === PageSize.CUSTOM ? settings.customWidth : PAGE_DIMENSIONS[settings.pageSize].width;
    let baseHeightMm = settings.pageSize === PageSize.CUSTOM ? settings.customHeight : PAGE_DIMENSIONS[settings.pageSize].height;
    if (settings.orientation === Orientation.LANDSCAPE) [baseWidthMm, baseHeightMm] = [baseHeightMm, baseWidthMm];
    const pxWidth = DPI_TO_PIXELS(baseWidthMm, settings.dpi);
    const pxHeight = DPI_TO_PIXELS(baseHeightMm, settings.dpi);
    const marginPx = DPI_TO_PIXELS(settings.margin, settings.dpi);
    const spacingPx = DPI_TO_PIXELS(settings.spacing, settings.dpi);
    const slots: { x: number, y: number, w: number, h: number }[] = [];
    if (settings.layout === LayoutType.VERTICAL) {
      const slotH = (pxHeight - (marginPx * 2) - spacingPx) / 2;
      slots.push({ x: marginPx, y: marginPx, w: pxWidth - (marginPx * 2), h: slotH });
      slots.push({ x: marginPx, y: marginPx + slotH + spacingPx, w: pxWidth - (marginPx * 2), h: slotH });
    } else {
      const slotW = (pxWidth - (marginPx * 2) - spacingPx) / 2;
      slots.push({ x: marginPx, y: marginPx, w: slotW, h: pxHeight - (marginPx * 2) });
      slots.push({ x: marginPx + slotW + spacingPx, y: marginPx, w: slotW, h: pxHeight - (marginPx * 2) });
    }
    return { slots, pxWidth, pxHeight };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoords(e);
    const { slots } = getSlotLayout();
    if (croppingId) { setCropSelection({ startX: x, startY: y, currentX: x, currentY: y }); return; }
    if (x >= slots[0].x && x <= slots[0].x + slots[0].w && y >= slots[0].y && y <= slots[0].y + slots[0].h) setDragState({ id: 'img1', startX: x, startY: y, initialX: img1.x, initialY: img1.y });
    else if (x >= slots[1].x && x <= slots[1].x + slots[1].w && y >= slots[1].y && y <= slots[1].y + slots[1].h) setDragState({ id: 'img2', startX: x, startY: y, initialX: img2.x, initialY: img2.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoords(e);
    if (croppingId && cropSelection) { setCropSelection(prev => prev ? { ...prev, currentX: x, currentY: y } : null); return; }
    if (!dragState) return;
    const { slots } = getSlotLayout();
    const slot = dragState.id === 'img1' ? slots[0] : slots[1];
    if (dragState.id === 'img1') onUpdateImg1(p => ({ ...p, x: Math.max(-100, Math.min(100, dragState.initialX + ((x - dragState.startX) / slot.w) * 100)), y: Math.max(-100, Math.min(100, dragState.initialY + ((y - dragState.startY) / slot.h) * 100)) }));
    else onUpdateImg2(p => ({ ...p, x: Math.max(-100, Math.min(100, dragState.initialX + ((x - dragState.startX) / slot.w) * 100)), y: Math.max(-100, Math.min(100, dragState.initialY + ((y - dragState.startY) / slot.h) * 100)) }));
  };

  const handleMouseUp = () => {
    if (croppingId && cropSelection) {
      const { slots } = getSlotLayout();
      const slot = croppingId === 'img1' ? slots[0] : slots[1];
      const state = croppingId === 'img1' ? img1 : img2;
      const x1 = Math.min(cropSelection.startX, cropSelection.currentX);
      const y1 = Math.min(cropSelection.startY, cropSelection.currentY);
      const w = Math.abs(cropSelection.startX - cropSelection.currentX);
      const h = Math.abs(cropSelection.startY - cropSelection.currentY);
      if (w > 10 && h > 10) {
        const img = new Image();
        img.src = state.src!;
        const centerX = slot.x + slot.w / 2 + (state.x * (slot.w / 100));
        const centerY = slot.y + slot.h / 2 + (state.y * (slot.h / 100));
        const imgRatio = img.width / img.height;
        const slotRatio = slot.w / slot.h;
        const finalScale = ((imgRatio > slotRatio) ? slot.w / img.width : slot.h / img.height) * state.scale;
        const crop = { x: img.width / 2 + (x1 - centerX) / finalScale, y: img.height / 2 + (y1 - centerY) / finalScale, width: w / finalScale, height: h / finalScale };
        if (croppingId === 'img1') onUpdateImg1(p => ({ ...p, crop }));
        else onUpdateImg2(p => ({ ...p, crop }));
      }
      onStopCrop(); setCropSelection(null);
    }
    setDragState(null);
  };

  useEffect(() => {
    const canvas = internalRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const { slots, pxWidth, pxHeight } = getSlotLayout();
    canvas.width = pxWidth; canvas.height = pxHeight;
    const drawAll = () => {
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, pxWidth, pxHeight);
      [img1, img2].forEach((state, i) => {
        if (!state.src) return;
        const img = new Image(); img.src = state.src;
        if (!img.complete) { img.onload = drawAll; return; }
        const slot = slots[i]; ctx.save(); ctx.beginPath(); ctx.rect(slot.x, slot.y, slot.w, slot.h); ctx.clip();
        ctx.translate(slot.x + slot.w / 2 + (state.x * (slot.w / 100)), slot.y + slot.h / 2 + (state.y * (slot.h / 100)));
        ctx.rotate((state.rotation * Math.PI) / 180); ctx.scale(state.scale, state.scale);
        const ir = img.width / img.height; const sr = slot.w / slot.h;
        const bs = (ir > sr) ? slot.w / img.width : slot.h / img.height;
        if (state.crop) ctx.drawImage(img, state.crop.x, state.crop.y, state.crop.width, state.crop.height, -img.width * bs / 2, -img.height * bs / 2, img.width * bs, img.height * bs);
        else ctx.drawImage(img, -img.width * bs / 2, -img.height * bs / 2, img.width * bs, img.height * bs);
        ctx.restore();
      });
      ctx.strokeStyle = '#F1F5F9'; ctx.setLineDash([20, 10]); ctx.lineWidth = DPI_TO_PIXELS(1, settings.dpi);
      slots.forEach(s => ctx.strokeRect(s.x, s.y, s.w, s.h));
      if (croppingId && cropSelection) {
        const x = Math.min(cropSelection.startX, cropSelection.currentX), y = Math.min(cropSelection.startY, cropSelection.currentY);
        const w = Math.abs(cropSelection.startX - cropSelection.currentX), h = Math.abs(cropSelection.startY - cropSelection.currentY);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; ctx.fillRect(0, 0, pxWidth, pxHeight); ctx.clearRect(x, y, w, h);
        ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
      }
    };
    drawAll();
  }, [settings, img1, img2, croppingId, cropSelection]);

  return <canvas ref={internalRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} className={`max-w-full h-auto rounded shadow-md border border-slate-200 ${croppingId ? 'cursor-crosshair' : 'cursor-move'}`} style={{ maxHeight: '82vh', objectFit: 'contain', touchAction: 'none' }} />;
});

/**
 * 5. MAIN APP
 */
const INITIAL_IMAGE_STATE = (id: 'img1' | 'img2'): ImageState => ({
  id, src: null, rotation: 0, scale: 1, x: 0, y: 0, crop: null, originalWidth: 0, originalHeight: 0,
});

const App: React.FC = () => {
  const [settings, setSettings] = useState<GlobalSettings>({
    pageSize: PageSize.A4, orientation: Orientation.PORTRAIT, layout: LayoutType.VERTICAL, margin: 10, spacing: 10, customWidth: 210, customHeight: 297, dpi: 300, language: Language.ENGLISH,
  });
  const [img1, setImg1] = useState<ImageState>(INITIAL_IMAGE_STATE('img1'));
  const [img2, setImg2] = useState<ImageState>(INITIAL_IMAGE_STATE('img2'));
  const [isExporting, setIsExporting] = useState(false);
  const [croppingId, setCroppingId] = useState<'img1' | 'img2' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = translations[settings.language];

  const handleUpload = (id: 'img1' | 'img2', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        const imgObj = new Image();
        imgObj.onload = () => {
          const upd = { src, originalWidth: imgObj.width, originalHeight: imgObj.height, scale: 1, rotation: 0, x: 0, y: 0, crop: null };
          if (id === 'img1') setImg1(p => ({ ...p, ...upd })); else setImg2(p => ({ ...p, ...upd }));
        };
        imgObj.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  const exportPdf = async () => {
    if (!canvasRef.current || typeof (window as any).jspdf === 'undefined') return;
    setIsExporting(true);
    try {
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF({ orientation: settings.orientation.toLowerCase(), unit: 'mm', format: settings.pageSize === PageSize.CUSTOM ? [settings.customWidth, settings.customHeight] : settings.pageSize.toLowerCase() });
      doc.addImage(canvasRef.current.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
      doc.save(`fused-${Date.now()}.pdf`);
    } finally { setIsExporting(false); }
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row ${settings.language === Language.GUJARATI ? 'font-serif' : ''}`}>
      <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto max-h-screen sticky top-0">
        <header className="flex justify-between items-start">
          <div><h1 className="text-2xl font-bold text-indigo-600">{t.title}</h1><p className="text-slate-500 text-sm">{t.subtitle}</p></div>
          <button onClick={() => setSettings(s => ({ ...s, language: s.language === Language.ENGLISH ? Language.GUJARATI : Language.ENGLISH }))} className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold border">{settings.language === Language.ENGLISH ? 'ગુજરાતી' : 'English'}</button>
        </header>
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase text-slate-400">{t.layoutSettings}</h2>
          <div className="grid grid-cols-2 gap-3">
            <select value={settings.pageSize} onChange={e => setSettings(s => ({ ...s, pageSize: e.target.value as PageSize }))} className="p-2 border rounded-lg text-sm"><option value={PageSize.A4}>A4</option><option value={PageSize.LETTER}>Letter</option></select>
            <select value={settings.orientation} onChange={e => setSettings(s => ({ ...s, orientation: e.target.value as Orientation }))} className="p-2 border rounded-lg text-sm"><option value={Orientation.PORTRAIT}>{t.portrait}</option><option value={Orientation.LANDSCAPE}>{t.landscape}</option></select>
          </div>
          <div className="flex gap-1 p-1 bg-slate-50 border rounded-lg">
            <button onClick={() => setSettings(s => ({ ...s, layout: LayoutType.VERTICAL }))} className={`flex-1 py-1 text-[11px] font-bold rounded ${settings.layout === LayoutType.VERTICAL ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>{t.vertical}</button>
            <button onClick={() => setSettings(s => ({ ...s, layout: LayoutType.HORIZONTAL }))} className={`flex-1 py-1 text-[11px] font-bold rounded ${settings.layout === LayoutType.HORIZONTAL ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>{t.horizontal}</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] font-bold text-slate-500">{t.margin}</label><input type="range" min="0" max="50" value={settings.margin} onChange={e => setSettings(s => ({ ...s, margin: Number(e.target.value) }))} className="w-full" /><div className="text-[10px] text-right text-slate-400">{settings.margin}mm</div></div>
            <div><label className="text-[10px] font-bold text-slate-500">{t.spacing}</label><input type="range" min="0" max="50" value={settings.spacing} onChange={e => setSettings(s => ({ ...s, spacing: Number(e.target.value) }))} className="w-full" /><div className="text-[10px] text-right text-slate-400">{settings.spacing}mm</div></div>
          </div>
        </section>
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-slate-400">{t.img1}</h2>
          {!img1.src ? <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 cursor-pointer"><input type="file" accept="image/*" onChange={e => handleUpload('img1', e)} className="absolute inset-0 opacity-0 cursor-pointer" /><p className="text-sm font-semibold">{t.upload}</p></div> : <ImageControlPanel state={img1} setState={setImg1} language={settings.language} onStartCrop={() => setCroppingId('img1')} isCropping={croppingId === 'img1'} />}
        </section>
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-slate-400">{t.img2}</h2>
          {!img2.src ? <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 cursor-pointer"><input type="file" accept="image/*" onChange={e => handleUpload('img2', e)} className="absolute inset-0 opacity-0 cursor-pointer" /><p className="text-sm font-semibold">{t.upload}</p></div> : <ImageControlPanel state={img2} setState={setImg2} language={settings.language} onStartCrop={() => setCroppingId('img2')} isCropping={croppingId === 'img2'} />}
        </section>
        <footer className="mt-auto space-y-2">
          <button disabled={!img1.src && !img2.src} onClick={exportPdf} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50">{isExporting ? t.generating : t.exportPdf}</button>
          <div className="flex gap-2"><button disabled={!img1.src && !img2.src} onClick={() => canvasRef.current && (window.location.href = canvasRef.current.toDataURL('image/jpeg'))} className="flex-1 bg-white border p-3 rounded-xl font-bold">{t.exportJpg}</button></div>
        </footer>
      </aside>
      <main className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-100 relative">
        {croppingId && <div className="absolute top-4 z-10 bg-indigo-600 text-white px-6 py-2 rounded-full font-bold">{t.croppingActive}</div>}
        <PreviewCanvas ref={canvasRef} settings={settings} img1={img1} img2={img2} onUpdateImg1={setImg1} onUpdateImg2={setImg2} croppingId={croppingId} onStopCrop={() => setCroppingId(null)} />
        <p className="mt-4 text-slate-400 text-xs">{t.tip}</p>
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
