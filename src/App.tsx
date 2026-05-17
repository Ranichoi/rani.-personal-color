import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Palette, 
  User, 
  ChevronRight, 
  AlertCircle,
  RefreshCcw,
  CheckCircle2,
  Info
} from "lucide-react";

interface AnalysisResult {
  disclaimer: string;
  summary: string;
  tone_direction: "warm" | "cool" | "neutral";
  season_type: string;
  sub_type: string;
  confidence: number;
  analysis: {
    skin_tone: string;
    brightness: string;
    saturation: string;
    contrast: string;
    overall_impression: string;
  };
  recommended_colors: Array<{ name: string; hex: string; reason: string }>;
  avoid_colors: Array<{ name: string; hex: string; reason: string }>;
  makeup_recommendations: {
    lip: string[];
    blush: string[];
    eyeshadow: string[];
  };
  hair_recommendations: string[];
  fashion_recommendations: string[];
  style_tip: string;
  photo_quality_note: string;
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setError(null);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-brand-beige/80 backdrop-blur-md border-b border-border-subtle px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-end justify-between">
          <div>
            <h1 className="heading-serif text-2xl text-brand-text">Personal Color Analysis</h1>
            <p className="tracking-widest-xs text-muted-text mt-1">Image Analysis & Diagnostic Report</p>
          </div>
          <div className="flex items-center gap-6">
            <p className="hidden md:block text-[10px] text-[#A39D93] leading-tight max-w-[300px] text-right">
              본 분석은 업로드된 사진의 조명과 카메라 환경에 따라 차이가 있을 수 있으므로 참고용으로 활용하시길 바랍니다.
            </p>
            {image && (
              <button 
                onClick={reset}
                className="text-[10px] font-bold uppercase tracking-widest text-muted-text hover:text-brand-text flex items-center gap-1.5 transition-colors border-l border-border-subtle pl-6"
              >
                <RefreshCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto pt-32 px-8">
        <div className="flex flex-col gap-8">
          
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto w-full space-y-10 py-12"
              >
                <div className="text-center space-y-4">
                  <h2 className="heading-serif text-5xl text-brand-text">Discover Your Palette</h2>
                  <p className="text-muted-text text-sm tracking-wide">
                    Please upload a clear, front-facing photo taken in natural light.
                  </p>
                </div>

                <div 
                  onClick={() => !loading && fileInputRef.current?.click()}
                  className={`relative aspect-[3/4] max-w-sm mx-auto minimal-card border-dashed flex flex-col items-center justify-center gap-6 cursor-pointer group transition-all hover:bg-neutral-50/50 ${
                    image ? "border-accent-blue" : "border-border-subtle"
                  }`}
                >
                  {image ? (
                    <div className="relative w-full h-full p-6">
                      <img 
                        src={image} 
                        alt="Subject" 
                        className="w-full h-full object-cover rounded-2xl shadow-sm grayscale-[0.2]"
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl m-6">
                        <p className="text-white bg-brand-text/80 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase">Change Photo</p>
                      </div>
                    </div>
                  ) : (loading ? (
                    <div className="flex flex-col items-center gap-4">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCcw className="w-8 h-8 text-border-subtle" />
                      </motion.div>
                      <p className="tracking-widest-xs text-muted-text">Processing Engine v2.0</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full border border-border-subtle flex items-center justify-center group-hover:scale-105 transition-transform bg-white">
                        <Upload className="w-8 h-8 text-muted-text" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-text">Select Image</p>
                        <p className="text-[10px] text-muted-text mt-2 uppercase tracking-widest">DRAG & DROP OR BROWSE</p>
                      </div>
                    </>
                  ))}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                {image && !loading && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={analyzeImage}
                      className="px-12 py-5 bg-brand-text text-white rounded-full text-xs font-bold tracking-[0.3em] uppercase hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/5"
                    >
                      Begin Diagnosis
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8"
              >
                {/* Column 1: Summary */}
                <div className="md:col-span-4 flex flex-col gap-6">
                  <div className="minimal-card p-10 flex flex-col items-center text-center">
                    <div className="w-40 h-40 rounded-full border-4 border-accent-blue/5 mb-8 bg-[#F0F4F8] flex items-center justify-center overflow-hidden shadow-inner p-1">
                      {image ? (
                        <img src={image} className="w-full h-full object-cover rounded-full grayscale-[0.3]" alt="Result thumbnail" />
                      ) : (
                        <span className="text-4xl italic">✨</span>
                      )}
                    </div>
                    <p className="tracking-widest-xs text-muted-text mb-2">Primary Season</p>
                    <h2 className="heading-serif text-4xl text-accent-blue mb-4">{result.season_type}</h2>
                    <p className="text-[10px] uppercase tracking-widest text-[#5C574F] bg-[#E9F1FA] px-4 py-1.5 rounded-full font-bold">
                      {result.sub_type}
                    </p>
                    
                    <div className="mt-10 w-full max-w-[200px]">
                      <div className="flex justify-between text-[8px] uppercase tracking-widest mb-2 font-bold text-muted-text">
                        <span>Confidence Index</span>
                        <span>{result.confidence}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          className="bg-accent-blue h-full rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F5F5F0] rounded-3xl p-8 border border-border-subtle/50">
                    <h3 className="tracking-widest-xs text-muted-text mb-4 font-bold border-b border-border-subtle pb-2">Analysis Summary</h3>
                    <p className="text-sm leading-relaxed text-[#4A463F] font-medium italic">
                      "{result.summary}"
                    </p>
                  </div>
                </div>

                {/* Column 2: Metrics */}
                <div className="md:col-span-4 flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="minimal-card p-6">
                      <p className="tracking-widest-xs text-muted-text mb-2 text-[8px]">Tone Direction</p>
                      <p className={`text-lg font-bold capitalize ${result.tone_direction === 'cool' ? 'text-blue-700' : 'text-orange-700'}`}>
                        {result.tone_direction}
                      </p>
                    </div>
                    <div className="minimal-card p-6">
                      <p className="tracking-widest-xs text-muted-text mb-2 text-[8px]">Contrast</p>
                      <p className="text-lg font-bold">{result.analysis.contrast.split(' ')[0]}</p>
                    </div>
                  </div>

                  <div className="minimal-card p-8 flex-1">
                    <h3 className="tracking-widest-xs text-muted-text mb-8 border-b border-border-subtle pb-2">Detailed Metrics</h3>
                    <div className="space-y-6">
                      {[
                        { label: "Skin Tone", value: result.analysis.skin_tone },
                        { label: "Brightness", value: result.analysis.brightness },
                        { label: "Saturation", value: result.analysis.saturation },
                        { label: "Impression", value: result.analysis.overall_impression }
                      ].map((metric) => (
                        <div key={metric.label} className="group">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] uppercase font-bold text-muted-text/70">{metric.label}</span>
                            <span className="text-xs font-semibold text-brand-text">{metric.value}</span>
                          </div>
                          <div className="w-full h-px bg-border-subtle"></div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-12 pt-6 border-t border-border-subtle/50">
                      <h3 className="tracking-widest-xs text-muted-text mb-6">Beauty Guide</h3>
                      <ul className="space-y-4">
                        {[
                          { key: 'LIP', val: result.makeup_recommendations.lip.join(', ') },
                          { key: 'EYE', val: result.makeup_recommendations.eyeshadow.slice(0, 2).join(', ') },
                          { key: 'HAIR', val: result.hair_recommendations.slice(0, 2).join(', ') }
                        ].map(item => (
                          <li key={item.key} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-blue/30 mt-1.5" />
                            <p className="text-[11px] leading-relaxed">
                              <b className="tracking-widest uppercase mr-1 opacity-40">{item.key}:</b> 
                              <span className="font-medium text-brand-text/80">{item.val}</span>
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Column 3: Palettes & Fashion */}
                <div className="md:col-span-4 flex flex-col gap-6">
                  <div className="minimal-card p-8">
                    <h3 className="tracking-widest-xs text-muted-text mb-6 border-b border-border-subtle pb-2">Best Color Palette</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {result.recommended_colors.map((color) => (
                        <div key={color.name} className="flex flex-col items-center gap-1.5 group">
                          <div 
                            className="w-full aspect-square rounded-lg shadow-inner border border-black/5 group-hover:scale-105 transition-transform" 
                            style={{ backgroundColor: color.hex }}
                            title={color.reason}
                          />
                          <span className="text-[7px] text-muted-text uppercase font-bold tracking-tighter truncate w-full text-center">{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="minimal-card p-8">
                    <h3 className="tracking-widest-xs text-[#A35D5D] mb-6 border-b border-[#A35D5D20] pb-2">Colors to Avoid</h3>
                    <div className="flex flex-wrap gap-3">
                      {result.avoid_colors.map((color) => (
                        <div key={color.name} className="flex flex-col items-center gap-1.5">
                          <div 
                            className="w-8 h-8 rounded-full border border-black/5 opacity-80" 
                            style={{ backgroundColor: color.hex }}
                            title={color.reason}
                          />
                          <span className="text-[7px] text-muted-text font-bold truncate w-8 text-center">{color.name}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-6 text-[10px] leading-relaxed text-muted-text italic">
                      {result.disclaimer}
                    </p>
                  </div>

                  <div className="minimal-card p-8 bg-brand-text text-white">
                    <h3 className="tracking-widest-xs text-white/50 mb-6 border-b border-white/10 pb-2">Style Strategy</h3>
                    <ul className="space-y-4">
                      {result.fashion_recommendations.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase opacity-80">
                          <ChevronRight className="w-3 h-3 text-white/30" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="w-full py-4 bg-brand-text text-white rounded-2xl text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-black transition-all active:scale-95 shadow-xl shadow-black/10">
                    Download Report PDF
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-beige/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 90, 180, 270, 360]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 border-4 border-warm-accent/20 border-t-warm-accent rounded-full mb-6"
            />
            <h3 className="heading-display text-2xl font-bold mb-2">Consulting with AI Consultant</h3>
            <p className="text-brand-text/60 max-w-xs leading-relaxed">
              Analyzing your features, skin patterns, and color harmony. This will just take a moment...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

