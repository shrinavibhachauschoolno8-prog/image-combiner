
import React, { useState, useRef } from 'react';
import { PageSize, Orientation, LayoutType, ImageState, GlobalSettings, Language } from './types';
import { PAGE_DIMENSIONS, DPI_TO_PIXELS, Icons } from './constants';
import { ImageControlPanel } from './components/ImageControlPanel';
import { PreviewCanvas } from './components/PreviewCanvas';
import { translations } from './translations';

declare const jspdf: any;

const INITIAL_IMAGE_STATE = (id: 'img1' | 'img2'): ImageState => ({
  id,
  src: null,
  rotation: 0,
  scale: 1,
  x: 0,
  y: 0,
  crop: null,
  originalWidth: 0,
  originalHeight: 0,
});

const INITIAL_SETTINGS: GlobalSettings = {
  pageSize: PageSize.A4,
  orientation: Orientation.PORTRAIT,
  layout: LayoutType.VERTICAL,
  margin: 10,
  spacing: 10,
  customWidth: 210,
  customHeight: 297,
  dpi: 300,
  language: Language.ENGLISH,
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<GlobalSettings>(INITIAL_SETTINGS);
  const [img1, setImg1] = useState<ImageState>(INITIAL_IMAGE_STATE('img1'));
  const [img2, setImg2] = useState<ImageState>(INITIAL_IMAGE_STATE('img2'));
  const [isExporting, setIsExporting] = useState(false);
  const [croppingId, setCroppingId] = useState<'img1' | 'img2' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const t = translations[settings.language];

  const handleImageUpload = (id: 'img1' | 'img2', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        const imgObj = new Image();
        imgObj.onload = () => {
          const update = {
            src,
            originalWidth: imgObj.width,
            originalHeight: imgObj.height,
            scale: 1,
            rotation: 0,
            x: 0,
            y: 0,
            crop: null
          };
          if (id === 'img1') setImg1(prev => ({ ...prev, ...update }));
          else setImg2(prev => ({ ...prev, ...update }));
        };
        imgObj.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportJPG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `fused-images-${Date.now()}.jpg`;
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.92);
    link.click();
  };

  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const { jsPDF } = jspdf;
      const doc = new jsPDF({
        orientation: settings.orientation.toLowerCase(),
        unit: 'mm',
        format: settings.pageSize === PageSize.CUSTOM 
          ? [settings.customWidth, settings.customHeight] 
          : settings.pageSize.toLowerCase(),
      });

      const imgData = canvasRef.current.toDataURL('image/jpeg', 0.95);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      
      doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      doc.save(`fused-images-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "fused-image.jpg", { type: "image/jpeg" });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: t.title,
            text: t.subtitle,
          });
        } catch (error) {
          handleExportJPG();
        }
      } else {
        handleExportJPG();
      }
    }, 'image/jpeg');
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row ${settings.language === Language.GUJARATI ? 'font-serif' : ''}`}>
      <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 p-6 flex-shrink-0 flex flex-col gap-6 overflow-y-auto max-h-screen sticky top-0 scrollbar-thin">
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600 leading-tight">{t.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
          </div>
          <button 
            onClick={() => setSettings(s => ({ ...s, language: s.language === Language.ENGLISH ? Language.GUJARATI : Language.ENGLISH }))}
            className="text-[10px] bg-slate-100 px-2 py-1 rounded hover:bg-indigo-100 hover:text-indigo-600 transition-colors font-bold border border-slate-200"
          >
            {settings.language === Language.ENGLISH ? 'ગુજરાતી' : 'English'}
          </button>
        </header>

        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.layoutSettings}</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-600">{t.pageSize}</label>
              <select 
                value={settings.pageSize}
                onChange={(e) => setSettings(s => ({ ...s, pageSize: e.target.value as PageSize }))}
                className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value={PageSize.A4}>A4</option>
                <option value={PageSize.LETTER}>Letter</option>
                <option value={PageSize.CUSTOM}>Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-600">{t.orientation}</label>
              <select 
                value={settings.orientation}
                onChange={(e) => setSettings(s => ({ ...s, orientation: e.target.value as Orientation }))}
                className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value={Orientation.PORTRAIT}>{t.portrait}</option>
                <option value={Orientation.LANDSCAPE}>{t.landscape}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
              <label className="block text-xs font-medium mb-1 text-slate-600">{t.arrangement}</label>
              <div className="flex gap-1 p-1 bg-slate-50 rounded-lg border border-slate-200">
                <button 
                  onClick={() => setSettings(s => ({ ...s, layout: LayoutType.VERTICAL }))}
                  className={`flex-1 py-1 rounded-md text-[11px] font-bold uppercase transition-all ${settings.layout === LayoutType.VERTICAL ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                >
                  {t.vertical}
                </button>
                <button 
                  onClick={() => setSettings(s => ({ ...s, layout: LayoutType.HORIZONTAL }))}
                  className={`flex-1 py-1 rounded-md text-[11px] font-bold uppercase transition-all ${settings.layout === LayoutType.HORIZONTAL ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                >
                  {t.horizontal}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-600">{t.dpi}</label>
              <select 
                value={settings.dpi}
                onChange={(e) => setSettings(s => ({ ...s, dpi: parseInt(e.target.value) }))}
                className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="72">72 (Web)</option>
                <option value="150">150 (Draft)</option>
                <option value="300">300 (Standard)</option>
                <option value="600">600 (High)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500">{t.margin}</label>
              <input type="range" min="0" max="50" value={settings.margin} onChange={(e) => setSettings(s => ({ ...s, margin: Number(e.target.value) }))} className="w-full accent-indigo-600" />
              <div className="text-[10px] text-right text-slate-400 font-mono">{settings.margin}mm</div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500">{t.spacing}</label>
              <input type="range" min="0" max="50" value={settings.spacing} onChange={(e) => setSettings(s => ({ ...s, spacing: Number(e.target.value) }))} className="w-full accent-indigo-600" />
              <div className="text-[10px] text-right text-slate-400 font-mono">{settings.spacing}mm</div>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.img1}</h2>
            {img1.src && <button onClick={() => setImg1(INITIAL_IMAGE_STATE('img1'))} className="text-slate-300 hover:text-red-500 transition-colors"><Icons.Trash /></button>}
          </div>
          {!img1.src ? (
            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group cursor-pointer">
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload('img1', e)} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="text-slate-300 group-hover:text-indigo-400 mb-2 flex justify-center scale-125"><Icons.Download /></div>
              <p className="text-sm font-semibold text-slate-500">{t.upload}</p>
            </div>
          ) : (
            <ImageControlPanel state={img1} setState={setImg1} language={settings.language} onStartCrop={() => setCroppingId('img1')} isCropping={croppingId === 'img1'} />
          )}
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.img2}</h2>
            {img2.src && <button onClick={() => setImg2(INITIAL_IMAGE_STATE('img2'))} className="text-slate-300 hover:text-red-500 transition-colors"><Icons.Trash /></button>}
          </div>
          {!img2.src ? (
            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group cursor-pointer">
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload('img2', e)} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="text-slate-300 group-hover:text-indigo-400 mb-2 flex justify-center scale-125"><Icons.Download /></div>
              <p className="text-sm font-semibold text-slate-500">{t.upload}</p>
            </div>
          ) : (
            <ImageControlPanel state={img2} setState={setImg2} language={settings.language} onStartCrop={() => setCroppingId('img2')} isCropping={croppingId === 'img2'} />
          )}
        </section>

        <footer className="mt-auto pt-6 flex flex-col gap-2">
           <button 
            disabled={!img1.src && !img2.src}
            onClick={handleExportPDF}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isExporting ? t.generating : (
              <>
                <Icons.Download />
                {t.exportPdf}
              </>
            )}
          </button>
          <div className="flex gap-2">
            <button 
               disabled={!img1.src && !img2.src}
               onClick={handleExportJPG}
               className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
            >
              {t.exportJpg}
            </button>
            <button 
               disabled={!img1.src && !img2.src}
               onClick={handleShare}
               className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 p-3 rounded-xl transition-all disabled:opacity-50"
            >
              <Icons.Share />
            </button>
          </div>
        </footer>
      </aside>

      <main className="flex-1 p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center overflow-auto bg-slate-100 relative">
        {croppingId && (
          <div className="absolute top-4 z-10 bg-indigo-600 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-4 animate-bounce">
             <span className="text-sm font-bold">{t.croppingActive}</span>
             <button onClick={() => setCroppingId(null)} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md text-xs font-bold uppercase">{t.cancel}</button>
          </div>
        )}
        
        <div className="w-full max-w-5xl flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
            <span className="bg-white px-2 py-1 rounded shadow-sm border border-slate-200">{settings.dpi} DPI</span>
            <span className="bg-white px-2 py-1 rounded shadow-sm border border-slate-200">{settings.pageSize}</span>
            <span className="bg-indigo-50 text-indigo-500 px-2 py-1 rounded shadow-sm border border-indigo-100">{settings.orientation}</span>
          </div>
          
          <div className="canvas-container relative bg-white border border-slate-300 rounded overflow-hidden cursor-move">
            <PreviewCanvas 
              ref={canvasRef}
              settings={settings}
              img1={img1}
              img2={img2}
              onUpdateImg1={setImg1}
              onUpdateImg2={setImg2}
              croppingId={croppingId}
              onStopCrop={() => setCroppingId(null)}
            />
          </div>
          
          <p className="text-slate-400 text-xs text-center max-w-xs leading-relaxed opacity-80">
            {t.tip}
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
