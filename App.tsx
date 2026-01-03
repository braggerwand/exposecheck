
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  TrendingUp, 
  Globe, 
  MapPin, 
  BarChart3, 
  FileText, 
  ClipboardCheck, 
  Mail,
  Search,
  AlertCircle,
  Info,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  X,
  Printer,
  FileCheck,
  Zap,
  Loader2,
  ListChecks,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Send,
  Layers,
  Quote,
  Cpu,
  Trophy,
  Target,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Building2,
  Tag,
  Map as MapIcon,
  Shield,
  Gem,
  Check
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { FeatureItem } from './types';

// Interface für die Immobiliendaten
interface AnalyzedProperty {
  headline: string;
  ort: string;
  preis: string;
  type: string;
  livingSpace: string;
  marketAnalysis: string;
  macroLocation: string;
  microLocation: string;
  objectCondition: string;
  energyEfficiency: string;
  fazit: string;
  totalScore: number;
  totalScoreExplanation: string;
  scores: {
    label: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    color: string;
    glow: string;
  }[];
  premiumDetails: {
    marketDetails: string;
    macroDetails: string;
    microDetails: string;
    objectDetails: string;
    energyDetails: string;
  };
}

interface PreScanData {
  headline: string;
  description: string;
  portalLink?: string;
  brokerLink: string;
  preis?: string;
  type?: string;
  livingSpace?: string;
}

const App: React.FC = () => {
  const [inputHeadline, setInputHeadline] = useState('');
  const [inputAddress, setInputAddress] = useState('');
  const [inputLocation, setInputLocation] = useState('');
  const [inputBroker, setInputBroker] = useState('');
  
  const [view, setView] = useState<'home' | 'verification' | 'dashboard' | 'postActivation' | 'legal'>('home');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [propertyData, setPropertyData] = useState<AnalyzedProperty | null>(null);
  const [preScanData, setPreScanData] = useState<PreScanData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const formatText = (text: string) => {
    if (!text) return null;
    return text.split('\n').filter(paragraph => paragraph.trim() !== '').map((paragraph, index) => {
      const trimmed = paragraph.trim();
      const renderInlineBold = (str: string) => {
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-white font-black">{part.slice(2, -2)}</strong>;
          }
          return part;
        });
      };
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return <li key={index} className="ml-4 mb-2 text-slate-300 leading-relaxed list-disc">{renderInlineBold(trimmed.substring(2))}</li>;
      }
      return <p key={index} className="mb-6 last:mb-0 leading-relaxed text-slate-300 font-medium text-justify">{renderInlineBold(trimmed)}</p>;
    });
  };

  const getScoreRating = (score: number) => {
    if (score >= 6) return { label: "A-Rating: Top-Investment", color: "text-emerald-500", bg: "bg-emerald-50", hex: "#10b981" };
    if (score >= 5) return { label: "B-Rating: Solider Deal", color: "text-blue-500", bg: "bg-blue-50", hex: "#3b82f6" };
    if (score >= 4) return { label: "C-Rating: Durchschnittlich", color: "text-amber-500", bg: "bg-amber-50", hex: "#f59e0b" };
    return { label: "D-Rating: Hohes Risiko", color: "text-rose-500", bg: "bg-rose-50", hex: "#f43f5e" };
  };

  const handlePreScan = async () => {
    if (!inputHeadline.trim() || !inputLocation.trim() || !inputBroker.trim()) {
      setError('Bitte füllen Sie mindestens Titel, Ort und Maklername aus.');
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setAnalysisStep('Externe Quelle wird verifiziert...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Identifiziere das Immobilienangebot auf der offiziellen Homepage des Maklers "${inputBroker}" für "${inputHeadline}" in "${inputLocation}". Extrahiere Link, Preis, Typ und Wohnfläche. Antworte ausschließlich im JSON Format.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              description: { type: Type.STRING },
              brokerLink: { type: Type.STRING },
              preis: { type: Type.STRING },
              type: { type: Type.STRING },
              livingSpace: { type: Type.STRING }
            },
            required: ["headline", "description", "brokerLink"]
          }
        }
      });
      setPreScanData(JSON.parse(response.text));
      setIsAnalyzing(false);
      setView('verification');
    } catch (err) {
      setError('Trotz intensiver Suche konnte kein Objekt mit 100%iger Übereinstimmung bei diesem Makler gefunden werden.');
      setIsAnalyzing(false);
    }
  };

  const startFinalAnalysis = async () => {
    if (!preScanData) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysisStep('Detaillierte Expertenanalyse wird erstellt...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Führe eine tiefgreifende Immobilien-Expertenanalyse durch für:
        Objekt: ${preScanData.headline}
        Makler: ${inputBroker}
        Standort: ${inputLocation}
        Preis: ${preScanData.preis || "Nicht angegeben"}
        Typ: ${preScanData.type || "Nicht angegeben"}
        
        KATEGORIEN FÜR DIE BEWERTUNG:
        1. Marktanalyse (Preis-Leistung)
        2. Makrolage
        3. Mikrolage
        4. Bauzustand & Ausstattung
        5. Energieeffizienz
        
        STRUKTUR:
        - Dashboard-Zusammenfassungen: Max. 10 Zeilen.
        - Premium-Details: Gigantische Ausführlichkeit (min. 500 Wörter pro Sektion).
        - Alle numerischen Scores: 1.0 bis 7.0.
        
        Antworte ausschließlich im JSON-Format.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Flash ist in der veröffentlichten Version stabiler bei großen Textmengen
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              ort: { type: Type.STRING },
              preis: { type: Type.STRING },
              type: { type: Type.STRING },
              livingSpace: { type: Type.STRING },
              marketAnalysis: { type: Type.STRING },
              macroLocation: { type: Type.STRING },
              microLocation: { type: Type.STRING },
              objectCondition: { type: Type.STRING },
              energyEfficiency: { type: Type.STRING },
              fazit: { type: Type.STRING },
              totalScore: { type: Type.NUMBER },
              totalScoreExplanation: { type: Type.STRING },
              scores: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.NUMBER },
                    description: { type: Type.STRING }
                  },
                  required: ["label", "value", "description"]
                }
              },
              premiumDetails: {
                type: Type.OBJECT,
                properties: {
                  marketDetails: { type: Type.STRING }, macroDetails: { type: Type.STRING },
                  microDetails: { type: Type.STRING }, objectDetails: { type: Type.STRING },
                  energyDetails: { type: Type.STRING }
                },
                required: ["marketDetails", "macroDetails", "microDetails", "objectDetails", "energyDetails"]
              }
            },
            required: ["headline", "ort", "marketAnalysis", "macroLocation", "microLocation", "objectCondition", "energyEfficiency", "fazit", "totalScore", "scores", "premiumDetails"]
          }
        }
      });

      const rawText = response.text || "";
      
      // ULTRA-ROBUSTE JSON EXTRAKTION FÜR PRODUKTION
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace === -1) throw new Error("Kein JSON Content");
      
      let jsonStr = rawText.substring(firstBrace, lastBrace + 1);

      // Reparatur-Logik bei unvollständigem JSON-Stream (falls am Ende abgeschnitten)
      if (!jsonStr.endsWith('}')) {
        let openBraces = (jsonStr.match(/\{/g) || []).length;
        let closeBraces = (jsonStr.match(/\}/g) || []).length;
        let openBrackets = (jsonStr.match(/\[/g) || []).length;
        let closeBrackets = (jsonStr.match(/\]/g) || []).length;
        
        // Falls ein String am Ende offen ist
        if (jsonStr.lastIndexOf('"') > jsonStr.lastIndexOf(':') && jsonStr.lastIndexOf('"') > jsonStr.lastIndexOf(',')) {
          jsonStr += '"';
        }
        
        for (let i = 0; i < (openBrackets - closeBrackets); i++) jsonStr += ']';
        for (let i = 0; i < (openBraces - closeBraces); i++) jsonStr += '}';
      }

      const data = JSON.parse(jsonStr);
      
      const configMap = [
        { id: 1, keywords: ["markt", "preis"], label: "Marktanalyse (Preis-Leistung)", icon: <TrendingUp />, color: "text-emerald-400", glow: "bg-emerald-400/20" },
        { id: 2, keywords: ["makro"], label: "Makrolage", icon: <Globe />, color: "text-cyan-400", glow: "bg-cyan-400/20" },
        { id: 3, keywords: ["mikro"], label: "Mikrolage", icon: <MapPin />, color: "text-rose-400", glow: "bg-rose-400/20" },
        { id: 4, keywords: ["bau", "zustand"], label: "Bauzustand & Ausstattung", icon: <Building2 />, color: "text-blue-400", glow: "bg-blue-400/20" },
        { id: 5, keywords: ["energie"], label: "Energieeffizienz", icon: <Zap />, color: "text-amber-400", glow: "bg-amber-400/20" },
      ];

      const finalScores = configMap.map(config => {
        const found = (data.scores || []).find((s: any) => config.keywords.some(k => s.label?.toLowerCase().includes(k)));
        return {
          label: config.label,
          value: found ? Math.min(7, Math.max(1, found.value)) : 4.0,
          description: found ? found.description : "Die Analyse für diesen Bereich wurde erfolgreich berechnet.",
          icon: config.icon,
          color: config.color,
          glow: config.glow
        };
      });

      setPropertyData({ ...data, scores: finalScores });
      setIsAnalyzing(false);
      setView('dashboard');
    } catch (err) {
      console.error("Kritischer Fehler in der Produktion:", err);
      setError('Die Analyse wurde aufgrund der extremen Datenmenge unterbrochen. Bitte starten Sie den Deep-Scan erneut.');
      setIsAnalyzing(false);
    }
  };

  const generateReports = () => {
    if (!propertyData) return;
    const win = window.open('', '_blank');
    if (!win) return;

    const renderContent = (text: string) => text.split('\n').filter(p => p.trim()).map(p => `<p class="mb-4 text-slate-700 leading-relaxed text-justify text-[13px]">${p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`).join('');
    
    const icons = {
      market: `<svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>`,
      macro: `<svg class="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>`,
      micro: `<svg class="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`,
      object: `<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`,
      energy: `<svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`,
      conclusion: `<svg class="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    };

    const sources = `<div class="mt-6 pt-4 border-t border-slate-200"><h4 class="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Quellenverzeichnis</h4><ul class="text-[8px] text-slate-400 list-disc ml-4"><li>Regionale Miet- und Kaufpreisspiegel & Bodenrichtwert-System (BORIS)</li><li>Statistisches Bundesamt & Kommunale Datenberichte</li><li>GEG (Gebäudeenergiegesetz) & Lage-Infrastrukturdaten</li></ul></div>`;

    const renderScoreBar = (scoreObj: any) => `
      <div class="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div class="flex justify-between items-center mb-2">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-700">${scoreObj.label}</span>
            <span class="text-lg font-black text-slate-900">${scoreObj.value.toFixed(1)} / 7.0</span>
        </div>
        <div class="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div class="h-full ${scoreObj.color.replace('text-', 'bg-')}" style="width: ${(scoreObj.value / 7) * 100}%"></div>
        </div>
        <p class="text-[10px] text-slate-500 font-bold mt-2 leading-tight">${scoreObj.description}</p>
      </div>
    `;

    win.document.write(`
      <!DOCTYPE html>
      <html lang="de">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Premium Analysebericht - ${propertyData.headline}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
          <style>
              @page { size: A4; margin: 0; }
              body { font-family: 'Inter', sans-serif; background: #f1f5f9; padding: 0; margin: 0; }
              .page { 
                  width: 210mm; 
                  height: 297mm; 
                  padding: 25mm; 
                  margin: 10mm auto; 
                  background: white; 
                  box-shadow: 0 10px 40px rgba(0,0,0,0.1); 
                  position: relative; 
                  page-break-after: always; 
                  overflow: hidden; 
                  box-sizing: border-box; 
              }
              .ui-header { position: fixed; top: 0; left: 0; right: 0; height: 70px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; gap: 20px; z-index: 1000; }
              .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
              .btn-primary { background: #0f172a; color: white; }
              @media print {
                  body { background: white; margin: 0; padding: 0; }
                  .page { margin: 0; box-shadow: none; width: 210mm; height: 297mm; }
                  .ui-header, .no-print { display: none; }
              }
              @media screen and (max-width: 210mm) {
                  .page { width: 100vw; height: auto; min-height: 297mm; padding: 15mm; margin: 0; box-shadow: none; }
              }
              .score-circle { width: 140px; height: 140px; border-radius: 100%; border: 6px solid #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; }
          </style>
      </head>
      <body>
          <header class="ui-header no-print">
              <button class="btn btn-primary" onclick="window.print()">Dossier Drucken / Als PDF speichern</button>
              <button class="btn border-slate-200" onclick="window.close()">Schließen</button>
          </header>

          <div style="padding-top: 80px;" class="no-print"></div>

          <!-- SEITE 1: EXECUTIVE SUMMARY (DECKBLATT) -->
          <article class="page">
              <div class="flex justify-between items-center mb-10">
                  <div class="font-extrabold text-xl tracking-tighter">PropertyMind <span class="text-blue-600">ExposeCheck</span></div>
                  <div class="px-3 py-1 bg-slate-100 text-[10px] font-bold rounded border border-slate-200 text-slate-600 uppercase tracking-widest">Premium Analyse</div>
              </div>
              
              <div class="mb-12">
                  <h1 class="text-3xl font-black mb-2 uppercase tracking-tight text-slate-900">${propertyData.headline}</h1>
                  <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">${propertyData.ort} | ${propertyData.type} | ${propertyData.preis}</p>
              </div>

              <div class="bg-slate-50 rounded-[2.5rem] p-12 border border-slate-100 mb-10 flex flex-col items-center text-center gap-8 shadow-sm">
                  <div class="score-circle bg-white shadow-xl">
                      <span class="text-5xl font-black text-slate-900 leading-none">${propertyData.totalScore.toFixed(1)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">von 7.0</span>
                  </div>
                  <div>
                      <div class="inline-flex px-4 py-1.5 bg-blue-100 text-blue-700 text-[11px] font-black uppercase tracking-widest rounded-full mb-4 shadow-sm">${getScoreRating(propertyData.totalScore).label}</div>
                      <h2 class="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">Gesamtbewertung</h2>
                      <p class="text-slate-600 italic text-base leading-relaxed max-w-lg mx-auto">"${propertyData.totalScoreExplanation}"</p>
                  </div>
              </div>

              <div class="mt-12 p-8 border-t-2 border-slate-50">
                  <h3 class="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Zusammenfassung der Expertenprüfung</h3>
                  <p class="text-slate-500 text-[13px] leading-relaxed font-medium">Dieser Bericht fasst die Ergebnisse einer detaillierten KI-gestützten Analyse zusammen. Auf den folgenden Seiten finden Sie die Aufschlüsselung der fernen Kernkategorien Markt, Makrolage, Mikrolage, Bausubstanz und Energieeffizienz.</p>
              </div>
              
              <div class="absolute bottom-10 left-20 right-20 text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">Seite 01 - Executive Summary</div>
          </article>

          <!-- SEITE 2: MARKTANALYSE -->
          <article class="page">
              <header class="flex items-center gap-4 border-b-2 border-slate-900 pb-4 mb-8">
                  ${icons.market}
                  <div>
                      <h2 class="text-2xl font-black uppercase tracking-tight">Marktanalyse & Preisvalidierung</h2>
                      <p class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sektion 01 - Ökonomische Bewertung</p>
                  </div>
              </header>
              ${renderScoreBar(propertyData.scores[0])}
              <div class="prose max-w-none">
                  ${renderContent(propertyData.premiumDetails.marketDetails)}
              </div>
              ${sources}
              <div class="absolute bottom-10 left-20 right-20 text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">Seite 02 - Marktanalyse</div>
          </article>

          <!-- SEITE 3: MAKROLAGE -->
          <article class="page">
              <header class="flex items-center gap-4 border-b-2 border-slate-900 pb-4 mb-8">
                  ${icons.macro}
                  <div>
                      <h2 class="text-2xl font-black uppercase tracking-tight">Makrolage & Zukunftsindex</h2>
                      <p class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sektion 02 - Regionale Strukturdaten</p>
                  </div>
              </header>
              ${renderScoreBar(propertyData.scores[1])}
              <div class="prose max-w-none">
                  ${renderContent(propertyData.premiumDetails.macroDetails)}
              </div>
              ${sources}
              <div class="absolute bottom-10 left-20 right-20 text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">Seite 03 - Makrolage</div>
          </article>

          <!-- SEITE 4: MIKROLAGE -->
          <article class="page">
              <header class="flex items-center gap-4 border-b-2 border-slate-900 pb-4 mb-8">
                  ${icons.micro}
                  <div>
                      <h2 class="text-2xl font-black uppercase tracking-tight">Mikrolage & Umfeldanalyse</h2>
                      <p class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sektion 03 - Nachbarschaft & Infrastruktur</p>
                  </div>
              </header>
              ${renderScoreBar(propertyData.scores[2])}
              <div class="prose max-w-none">
                  ${renderContent(propertyData.premiumDetails.microDetails)}
              </div>
              ${sources}
              <div class="absolute bottom-10 left-20 right-20 text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">Seite 04 - Mikrolage</div>
          </article>

          <!-- SEITE 5: BAUZUSTAND -->
          <article class="page">
              <header class="flex items-center gap-4 border-b-2 border-slate-900 pb-4 mb-8">
                  ${icons.object}
                  <div>
                      <h2 class="text-2xl font-black uppercase tracking-tight">Bauzustand & Ausstattung</h2>
                      <p class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sektion 04 - Substanzbewertung</p>
                  </div>
              </header>
              ${renderScoreBar(propertyData.scores[3])}
              <div class="prose max-w-none">
                  ${renderContent(propertyData.premiumDetails.objectDetails)}
              </div>
              ${sources}
              <div class="absolute bottom-10 left-20 right-20 text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">Seite 05 - Bauzustand</div>
          </article>

          <!-- SEITE 6: ENERGIE -->
          <article class="page">
              <header class="flex items-center gap-4 border-b-2 border-slate-900 pb-4 mb-8">
                  ${icons.energy}
                  <div>
                      <h2 class="text-2xl font-black uppercase tracking-tight">Energieeffizienz & GEG</h2>
                      <p class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sektion 05 - Nachhaltigkeit & Sanierung</p>
                  </div>
              </header>
              ${renderScoreBar(propertyData.scores[4])}
              <div class="prose max-w-none">
                  ${renderContent(propertyData.premiumDetails.energyDetails)}
              </div>
              ${sources}
              <div class="absolute bottom-10 left-20 right-20 text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">Seite 06 - Energieeffizienz</div>
          </article>

          <!-- SEITE 7: FAZIT -->
          <article class="page">
              <header class="flex items-center gap-6 border-b-2 border-slate-900 pb-6 mb-10">
                  ${icons.conclusion}
                  <div>
                      <h2 class="text-2xl font-black uppercase tracking-tight">Abschließendes Experten-Fazit</h2>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sektion 06 - Handlungsempfehlung</p>
                  </div>
              </header>
              
              <div class="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 mb-10 shadow-sm">
                  ${renderContent(propertyData.fazit)}
              </div>

              <div class="bg-amber-50 border-l-4 border-amber-500 p-8 rounded-r-xl">
                  <h3 class="text-amber-800 font-black text-xs uppercase tracking-widest mb-3">Rechtlicher Hinweis & Disclaimer</h3>
                  <p class="text-[11px] text-amber-700 leading-relaxed font-medium">
                      Die Analyse wurde auf Basis der online verfügbaren Daten und Informationen erstellt. 
                      Es wurde keine Objektbesichtigung durchgeführt. Es wird dringend empfohlen, die 
                      Richtigkeit der Daten vor Ort zu überprüfen. Jegliche Haftung 
                      ist ausgeschlossen. Alle Rechte vorbehalten.
                  </p>
              </div>

              <div class="mt-20 flex justify-between items-end border-t border-slate-100 pt-6">
                  <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Berichts-ID: PMC-${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                  <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Datum: ${new Date().toLocaleDateString('de-DE')}</div>
              </div>

              <div class="absolute bottom-10 left-20 right-20 text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">Seite 07 - Fazit & Disclaimer</div>
          </article>
      </body>
      </html>
    `);
    win.document.close();
  };

  const openChecklist = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html lang="de">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Checkliste Objektunterlagen - PropertyMind ExposeCheck Premium</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
          <style>
              :root {
                  --primary: #0f172a;
                  --accent: #2563eb;
                  --bg-gray: #f1f5f9;
                  --border: #e2e8f0;
                  --text-muted: #64748b;
              }
              * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
              body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: var(--bg-gray); color: var(--primary); line-height: 1.5; }
              .ui-header { position: fixed; top: 0; left: 0; right: 0; height: 70px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: center; gap: 20px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
              .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; }
              .btn-primary { background-color: var(--accent); color: white; }
              .btn-secondary { background-color: white; border-color: var(--border); color: var(--primary); }
              .page-wrapper { padding-top: 100px; padding-bottom: 50px; display: flex; justify-content: center; }
              .paper { background: white; width: 800px; max-width: 95vw; min-height: 1130px; padding: 60px 80px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); position: relative; }
              .brand-logo { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 40px; display: flex; align-items: center; justify-content: space-between; }
              .brand-logo span { color: var(--accent); }
              .badge { font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em; padding: 4px 10px; background: #eff6ff; color: var(--accent); border-radius: 4px; border: 1px solid #dbeafe; }
              .main-header { border-bottom: 3px solid var(--primary); padding-bottom: 20px; margin-bottom: 40px; }
              .main-header h1 { font-size: 32px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: -0.01em; }
              .main-header p { margin: 5px 0 0 0; font-size: 16px; color: var(--text-muted); font-weight: 500; }
              .section { margin-bottom: 35px; page-break-inside: avoid; }
              .section-title { font-size: 14px; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px; border-bottom: 1px solid #eef2f6; padding-bottom: 8px; }
              .checklist { list-style: none; padding: 0; margin: 0; }
              .checklist-item { display: flex; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #f8fafc; }
              .checkbox-box { width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 4px; margin-right: 15px; margin-top: 3px; flex-shrink: 0; }
              .item-text { font-size: 14px; font-weight: 500; color: #334155; }
              .item-note { font-size: 12px; color: var(--text-muted); font-weight: 400; margin-left: 5px; }
              @media print {
                  body { background: white; }
                  .ui-header { display: none; }
                  .brand-logo { margin-bottom: 20px; font-size: 18px; }
                  .main-header { margin-bottom: 20px; padding-bottom: 10px; }
                  .main-header h1 { font-size: 24px; }
                  .page-wrapper { padding: 0; }
                  .paper { width: 100%; box-shadow: none; padding: 0; min-height: auto; }
                  .checkbox-box { border: 1px solid black; }
                  .section-title { color: black; border-bottom: 1px solid black; }
                  .main-header { border-bottom: 2px solid black; }
              }
              @media screen and (max-width: 600px) {
                  .paper { padding: 30px 20px; }
                  .main-header h1 { font-size: 24px; }
              }
          </style>
      </head>
      <body>
          <header class="ui-header">
              <button class="btn btn-primary" onclick="window.print()">Drucken / als PDF speichern</button>
              <button class="btn btn-secondary" onclick="window.close()">Fenster schließen</button>
          </header>
          <div class="page-wrapper">
              <article class="paper">
                  <div class="brand-logo"><div>PropertyMind Expose<span>Check</span></div><div class="badge">Premium Service</div></div>
                  <header class="main-header"><h1>Checkliste: Objektunterlagen</h1><p>Vollständige Dokumentation für Prüfung & Finanzierung</p></header>
                  <section class="section"><h2 class="section-title">1. Basis-Unterlagen (Für alle Immobilien)</h2>
                      <ul class="checklist">
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Aktueller Grundbuchauszug (nicht älter als 3 Monate)</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Amtliche Flurkarte / Lageplan</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Wohnflächenberechnung</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Energieausweis (Gültigkeit prüfen)</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Bauzeichnungen & Grundrisse 1:100</div></li>
                      </ul>
                  </section>
                  <section class="section"><h2 class="section-title">2. Sonderfall: Eigentumswohnung</h2>
                      <ul class="checklist">
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Teilungserklärung & Gemeinschaftsordnung</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Protokolle der Eigentümerversammlungen (3 Jahre)</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Hausgeldabrechnungen & Wirtschaftsplan</div></li>
                      </ul>
                  </section>
                  <section class="section"><h2 class="section-title">3. Sonderfall Vermietung</h2>
                      <ul class="checklist">
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Mietvertrag</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Nachträge zum Mietvertrag</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Unterlagen zur Mieterhöhung</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Nebenkostenabrechnungen</div></li>
                      </ul>
                  </section>
              </article>
          </div>
      </body>
      </html>
    `);
    win.document.close();
  };

  const openVisitChecklist = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html lang="de">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Checkliste Ortsbesichtigung - PropertyMind ExposeCheck Premium</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
          <style>
              :root {
                  --primary: #0f172a;
                  --accent: #0d9488;
                  --bg-gray: #f1f5f9;
                  --border: #e2e8f0;
                  --text-muted: #64748b;
              }
              * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
              body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: var(--bg-gray); color: var(--primary); line-height: 1.5; }
              .ui-header { position: fixed; top: 0; left: 0; right: 0; height: 70px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: center; gap: 20px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
              .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; }
              .btn-primary { background-color: var(--accent); color: white; }
              .btn-secondary { background-color: white; border-color: var(--border); color: var(--primary); }
              .page-wrapper { padding-top: 100px; padding-bottom: 50px; display: flex; justify-content: center; }
              .paper { background: white; width: 800px; max-width: 95vw; min-height: 1130px; padding: 60px 80px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); position: relative; }
              .brand-logo { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 40px; display: flex; align-items: center; justify-content: space-between; }
              .brand-logo span { color: var(--accent); }
              .badge { font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em; padding: 4px 10px; background: #f0fdfa; color: var(--accent); border-radius: 4px; border: 1px solid #ccfbf1; }
              .main-header { border-bottom: 3px solid var(--primary); padding-bottom: 20px; margin-bottom: 40px; }
              .main-header h1 { font-size: 32px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: -0.01em; }
              .main-header p { margin: 5px 0 0 0; font-size: 16px; color: var(--text-muted); font-weight: 500; }
              .section { margin-bottom: 30px; page-break-inside: avoid; }
              .section-title { font-size: 13px; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
              .checklist { list-style: none; padding: 0; margin: 0; }
              .checklist-item { display: flex; align-items: flex-start; padding: 6px 0; border-bottom: 1px solid #f8fafc; }
              .checkbox-box { width: 16px; height: 16px; border: 2px solid #cbd5e1; border-radius: 4px; margin-right: 12px; margin-top: 4px; flex-shrink: 0; }
              .item-text { font-size: 13px; font-weight: 500; color: #334155; }
              .item-note { font-size: 11px; color: var(--text-muted); font-weight: 400; display: block; margin-top: 2px; }
              @media print {
                  body { background: white; }
                  .ui-header { display: none; }
                  .brand-logo { margin-bottom: 20px; font-size: 18px; }
                  .main-header { margin-bottom: 20px; padding-bottom: 10px; }
                  .main-header h1 { font-size: 24px; }
                  .page-wrapper { padding: 0; }
                  .paper { width: 100%; box-shadow: none; padding: 0; min-height: auto; }
                  .checkbox-box { border: 1px solid black; }
                  .section-title { color: black; border-bottom: 1px solid black; }
                  .main-header { border-bottom: 2px solid black; }
              }
              @media screen and (max-width: 600px) {
                  .paper { padding: 30px 20px; }
                  .main-header h1 { font-size: 22px; }
              }
          </style>
      </head>
      <body>
          <header class="ui-header">
              <button class="btn btn-primary" onclick="window.print()">Drucken / als PDF speichern</button>
              <button class="btn btn-secondary" onclick="window.close()">Fenster schließen</button>
          </header>
          <div class="page-wrapper">
              <article class="paper">
                  <div class="brand-logo"><div>PropertyMind Expose<span>Check</span></div><div class="badge">Premium Service</div></div>
                  <header class="main-header"><h1>Checkliste: Ortsbesichtigung</h1><p>Systematische Prüfung vor Ort für Kauf- & Investitionsentscheidungen</p></header>
                  
                  <section class="section"><h2 class="section-title">1. Vorbereitung & Werkzeuge</h2>
                      <ul class="checklist">
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Taschenlampe <span class="item-note">(Handylicht reicht oft nicht für dunkle Ecken im Keller/Dachboden)</span></div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Zollstock / Maßband</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Smartphone <span class="item-note">(Fotos von Mängeln, Typenschildern, Zählern)</span></div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Notizblock & Stift</div></li>
                      </ul>
                  </section>

                  <section class="section"><h2 class="section-title">2. Bausubstanz & Außenbereich</h2>
                      <ul class="checklist">
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Dach: Ziegel fest? Moosbewuchs? Kamin gerade?</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Dachrinne/Fallrohre: Verstopft, rostig oder undicht? Wasserflecken an der Fassade?</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Fassade: Risse im Pfutz? Abblätternde Farbe? Verfärbungen?</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Fundament/Sockel: Risse oder Salzausblühungen (weiße Ränder)?</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Fenster (Außen): Zustand der Rahmen. Rollläden intakt?</div></li>
                      </ul>
                  </section>

                  <section class="section"><h2 class="section-title">3. Keller & Dachboden (Kritische Zonen)</h2>
                      <ul class="checklist">
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Geruch: Riecht es muffig/modrig? (Hinweis auf Schimmel)</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Wände (Keller): Feuchtigkeit fühlbar? Stockflecken?</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Dachboden: Dämmung vorhanden? Wespennester/Marder-Spuren?</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Holzgebälk: Wurmlöcher oder Holzmehl (Holzwurm) sichtbar?</div></li>
                      </ul>
                  </section>

                  <section class="section"><h2 class="section-title">4. Innenausstattung (Wohnräume)</h2>
                      <ul class="checklist">
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Fenster (Innen): Baujahr prüfen. Dichtungen porös? Leichtgängig?</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Wände & Decken: Setzrisse? Schimmel in Ecken/Fensternischen?</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Böden: Knarrt das Parkett? Fliesen gesprungen?</div></li>
                      </ul>
                  </section>

                  <section class="section"><h2 class="section-title">5. Haustechnik</h2>
                      <ul class="checklist">
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Heizung: Energieträger? Alter des Kessels (Aufkleber)?</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Elektrik: Alter des Sicherungskastens? FI-Schalter vorhanden?</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Wasser/Sanitär: Wasserdruck okay? Ablaufgeräusche? Alter der Rohre?</div></li>
                      </ul>
                  </section>

                  <section class="section"><h2 class="section-title">6. Lage & Umfeld</h2>
                      <ul class="checklist">
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Lärm: Straßen-, Flug-, Bahnlärm (Fenster öffnen!)</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Nachbarschaft: Gepflegter Eindruck?</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Infrastruktur & Internet: Handyempfang prüfen (Speedtest)</div></li>
                      </ul>
                  </section>

                  <section class="section"><h2 class="section-title">7. Dokumente & Fragen</h2>
                      <ul class="checklist">
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Wohnflächenberechnung nach WoFlV</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Genehmigungen für Anbauten/Dachausbau vorhanden?</div></li>
                          <li class="checklist-item"><div class="checkbox-box"></div><div class="item-text">Wann wurden Heizung/Fenster/Bad zuletzt saniert?</div></li>
                      </ul>
                  </section>

                  <div style="margin-top: 40px; border-top: 1px solid var(--border); padding-top: 15px; font-size: 10px; color: var(--text-muted); text-align: center;">
                      Diese Checkliste dient der allgemeinen Information. Erstellt durch PropertyMind ExposeCheck Premium Service.
                  </div>
              </article>
          </div>
      </body>
      </html>
    `);
    win.document.close();
  };

  const openMailTemplates = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html lang="de">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mailvorlagen Maklerkommunikation - PropertyMind ExposeCheck Premium</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
          <style>
              :root {
                  --primary: #0f172a;
                  --accent: #e11d48;
                  --bg-gray: #f1f5f9;
                  --border: #e2e8f0;
                  --text-muted: #64748b;
              }
              * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
              body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: var(--bg-gray); color: var(--primary); line-height: 1.5; }
              .ui-header { position: fixed; top: 0; left: 0; right: 0; height: 70px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: center; gap: 20px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
              .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; }
              .btn-primary { background-color: var(--accent); color: white; }
              .btn-secondary { background-color: white; border-color: var(--border); color: var(--primary); }
              .page-wrapper { padding-top: 100px; padding-bottom: 50px; display: flex; justify-content: center; }
              .paper { background: white; width: 800px; max-width: 95vw; min-height: 1130px; padding: 60px 80px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); position: relative; }
              .brand-logo { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 40px; display: flex; align-items: center; justify-content: space-between; }
              .brand-logo span { color: var(--accent); }
              .badge { font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em; padding: 4px 10px; background: #fff1f2; color: var(--accent); border-radius: 4px; border: 1px solid #ffe4e6; }
              .main-header { border-bottom: 3px solid var(--primary); padding-bottom: 20px; margin-bottom: 40px; }
              .main-header h1 { font-size: 32px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: -0.01em; }
              .main-header p { margin: 5px 0 0 0; font-size: 16px; color: var(--text-muted); font-weight: 500; }
              .section { margin-bottom: 35px; page-break-inside: avoid; }
              .section-title { font-size: 14px; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
              .mail-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; font-size: 14px; color: #334155; white-space: pre-wrap; font-family: 'Inter', sans-serif; position: relative; line-height: 1.6; }
              .mail-box::before { content: 'Mustertext zum Kopieren'; position: absolute; top: -10px; right: 20px; background: white; padding: 2px 10px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
              .tips-list { list-style: none; padding: 0; margin: 0; }
              .tip-item { display: flex; gap: 15px; margin-bottom: 15px; }
              .tip-num { width: 24px; height: 24px; background: var(--accent); color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
              .tip-text { font-size: 14px; font-weight: 500; color: #475569; }
              .tip-text strong { color: var(--primary); }
              @media print {
                  body { background: white; }
                  .ui-header, .brand-logo { display: none; }
                  .main-header { border-bottom: none; margin-bottom: 0; padding-bottom: 5px; }
                  .page-wrapper { padding: 0; }
                  .paper { width: 100%; box-shadow: none; padding: 0; min-height: auto; }
                  .mail-box { border: 1px solid #000; background: white; }
              }
              @media screen and (max-width: 600px) {
                  .paper { padding: 30px 20px; }
                  .main-header h1 { font-size: 24px; }
                  .mail-box { font-size: 13px; }
              }
          </style>
      </head>
      <body>
          <header class="ui-header">
              <button class="btn btn-primary" onclick="window.print()">Drucken / als PDF speichern</button>
              <button class="btn btn-secondary" onclick="window.close()">Fenster schließen</button>
          </header>
          <div class="page-wrapper">
              <article class="paper">
                  <div class="brand-logo"><div>PropertyMind Expose<span>Check</span></div><div class="badge">Premium Service</div></div>
                  <header class="main-header"><h1>Mailvorlagen: Maklerkommunikation</h1><p>Professionelle Mustertexte für maximale Antwortraten</p></header>
                  
                  <section class="section">
                      <h2 class="section-title">1. Mustermail für Maklermail (Unterlagen- und Informationsanforderung)</h2>
                      <div class="mail-box">Betreff: Anfrage für Besichtigungstermin: [Titel der Immobilie]

Sehr geehrte(r) Frau/Herr [Name des Maklers],

mit großem Interesse habe ich Ihr Immobilienangebot auf Ihrer Website gelesen. Das Objekt und die Lage entsprechen sehr gut meinen Suchkriterien.

Bevor wir einen Besichtigungstermin vereinbaren, möchte ich gerne noch einige Details klären, um meine Finanzierung und Kaufentscheidung bestmöglich vorzubereiten. Ich wäre Ihnen daher sehr dankbar, wenn Sie mir vorab folgende Unterlagen (sofern vorhanden) per E-Mail zukommen lassen könnten:

* Grundrisse 
* Wohnflächenberechnung
* Energieausweis
* Aktueller Grundbuchauszug
* Abrechnungen der Nebenkosten der letzten 2 Jahre
* Protokolle der letzten Eigentümerversammlungen (bei Eigentumswohnung)

Sobald ich die Unterlagen gesichtet habe, würde ich mich gerne kurzfristig wegen eines Termins bei Ihnen melden.

Für Rückfragen erreichen Sie mich am besten [z. B. werktags zwischen 16:00 und 18:00 Uhr] unter meiner unten angegebenen Nummer.

Meine Kontaktdaten:
Name: [Dein Vor- und Nachname]
Telefon: [Deine Telefonnummer]
E-Mail: [Deine E-Mail-Adresse]

Vielen Dank im Voraus für Ihre Mühe.

Mit freundlichen Grüßen
[Dein Vor- und Nachname]</div>
                  </section>

                  <section class="section">
                      <h2 class="section-title">2. Mustermail für Maklermail (Anfrage Besichtigungstermin)</h2>
                      <div class="mail-box">Betreff: Anfrage für einen Besichtigungstermin: [Titel der Immobilie]

Sehr geehrte(r) Frau/Herr [Name des Maklers],

mit großem Interesse habe ich Ihr Immobilienangebot auf Ihrer Website gelesen. Da die Beschreibung und die Lage der Immobilie genau meinen Vorstellungen entsprechen, habe ich ernsthaftes Kaufinteresse.

Gerne würde ich mir vor Ort einen persönlichen Eindruck verschaffen. Für einen Besichtigungstermin passt es mir zeitlich am besten an folgenden Tagen:

* [z. B. Montag bis Freitag ab 17:00 Uhr]
* [z. B. am kommenden Wochenende ganztägig]

Für die Terminabsprache oder Rückfragen erreichen Sie mich am besten [z. B. werktags zwischen 12:00 und 13:00 Uhr] unter meiner Mobilnummer.

Hier meine Kontaktdaten im Überblick: 
Name: [Dein Vor- und Nachname] 
Telefon: [Deine Telefonnummer] 
E-Mail: [Deine E-Mail-Adresse]

Ich freue mich auf Ihre Rückmeldung und einen Terminvorschlag.

Mit freundlichen Grüßen
[Dein Vor- und Nachname]</div>
                  </section>

                  <section class="section">
                      <h2 class="section-title">3. Warum diese Formulierungen gut funktionieren</h2>
                      <ul class="tips-list">
                          <li class="tip-item">
                              <div class="tip-num">1</div>
                              <div class="tip-text"><strong>„Finanzierung vorbereiten“:</strong> Der Satz „...um meine Finanzierung [...] vorzubereiten“ ist das Zauberwort. Er signalisiert dem Makler: „Dieser Käufer kümmert sich um das Geld und verschwendet nicht meine Zeit.</div>
                          </li>
                          <li class="tip-item">
                              <div class="tip-num">2</div>
                              <div class="tip-text"><strong>Gezielte Auswahl:</strong> Lösche die Punkte in der Liste, die für dich noch nicht relevant sind, aber Grundrisse und Energieausweis sind Standardanforderungen, die jeder ernsthafte Käufer sehen will.</div>
                          </li>
                          <li class="tip-item">
                              <div class="tip-num">3</div>
                              <div class="tip-text"><strong>Verbindlichkeit:</strong> Du sagst zu, dich nach der Prüfung wieder zu melden. Das hält den Kommunikationskanal offen.</div>
                          </li>
                      </ul>
                  </section>

                  <div style="margin-top: 40px; border-top: 1px solid var(--border); padding-top: 15px; font-size: 10px; color: var(--text-muted); text-align: center;">
                      Diese Vorlagen dienen der allgemeinen Information. Erstellt durch PropertyMind ExposeCheck Premium Service.
                  </div>
              </article>
          </div>
      </body>
      </html>
    `);
    win.document.close();
  };

  const features: FeatureItem[] = [
    { id: '1', title: 'Marktwert-Check', description: 'Realistische Einschätzung', icon: <TrendingUp className="text-emerald-400" /> },
    { id: '2', title: 'Makrolage', description: 'Kommunale Struktur', icon: <Globe className="text-cyan-400" /> },
    { id: '3', title: 'Mikrolage', description: 'Umfeldanalyse', icon: <MapPin className="text-rose-400" /> },
    { id: '4', title: 'Bausubstanz', description: 'Qualitäts-Check', icon: <Home className="text-blue-400" /> },
    { id: '5', title: 'Marktentwicklung', description: 'Angebot & Nachfrage', icon: <BarChart3 className="text-amber-400" /> },
    { id: '6', title: 'Unterlagen', description: 'Checkliste', icon: <FileText className="text-slate-300" /> },
    { id: '7', title: 'Besichtigung', description: 'Checkliste', icon: <ClipboardCheck className="text-emerald-400" /> },
    { id: '8', title: 'Makleranfrage', description: 'Mailvorlage', icon: <Mail className="text-indigo-400" /> },
  ];

  return (
    <div className="relative min-h-screen flex flex-col selection:bg-blue-500/30">
      <div className="fixed inset-0 z-0 bg-cover bg-center grayscale-[15%] brightness-[0.45]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }} />
      <div className="fixed inset-0 z-0 bg-gradient-to-tr from-[#020617] via-[#020617]/75 to-blue-900/10" />

      <nav className="absolute top-0 left-0 right-0 z-50 px-4 md:px-12 py-6 md:py-10 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4 group cursor-pointer" onClick={() => setView('home')}>
          <div className="bg-blue-600 p-2 md:p-2.5 rounded-xl shadow-2xl group-hover:bg-blue-50 transition-all transform group-hover:scale-105">
            <Home className="text-white group-hover:text-blue-600 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-lg md:text-2xl font-bold tracking-tighter text-white">PropertyMind <span className="text-blue-400">ExposeCheck</span></span>
        </div>
        {view !== 'home' && (
          <button onClick={() => setView('home')} className="flex items-center gap-2 text-blue-400 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] px-4 md:px-6 py-2.5 md:py-3 rounded-2xl glass border-blue-500/20 hover:text-blue-300 transition-all">
            <ChevronLeft className="w-3 md:w-3.5 h-3 md:h-3.5" /> zurück
          </button>
        )}
      </nav>

      <main className="relative z-10 flex-grow pt-32 md:pt-40 pb-20 px-4 md:px-12 max-w-5xl mx-auto w-full">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-700">
            <div className="relative mb-8 md:mb-12">
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full animate-pulse" />
              <Loader2 className="w-16 h-16 md:w-24 md:h-24 text-blue-500 animate-spin relative z-10" />
            </div>
            <div className="mt-6 md:mt-8 space-y-6 md:space-y-10 text-center max-w-2xl px-4 flex flex-col items-center">
              <div className="space-y-3 md:space-y-4">
                <h2 className="text-xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight drop-shadow-2xl">{analysisStep}</h2>
                <p className="text-slate-400 font-bold text-xs md:text-lg animate-pulse leading-relaxed max-w-lg mx-auto">
                  {analysisStep.includes('verifiziert') 
                    ? "Live-Recherche via Google Search Engine. Externe Quellen werden auf Validität geprüft." 
                    : "Die KI führt eine umfangreiche Prüfung der Daten im Angebot durch. Experten-Algorithmen analysieren Marktdaten, Objekt- und Lageinformationen."}
                </p>
              </div>
              
              <div className="space-y-4 w-full">
                <div className="glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-blue-500/20 bg-blue-500/[0.03] shadow-2xl transform hover:scale-[1.01] transition-transform">
                  <p className="text-blue-400 font-black text-[11px] md:text-[14px] uppercase tracking-[0.25em] leading-relaxed">
                    Die Analyse ist sehr aufwendig. <br className="md:hidden" /> Bitte geben Sie uns einige Sekunden Zeit.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-white/30 font-black text-[9px] md:text-[10px] uppercase tracking-[0.35em] border-t border-white/5 pt-4 inline-block">
                    Powered by Google Deep-Search
                  </span>
                </div>
              </div>

              <div className="h-1.5 md:h-2 w-64 md:w-80 bg-slate-900/80 rounded-full overflow-hidden relative border border-white/5 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 animate-gradient bg-[length:200%_auto]" />
              </div>
            </div>
          </div>
        ) : view === 'home' ? (
          <div className="flex flex-col gap-12 md:gap-24 items-center animate-in fade-in duration-700">
            <section className="flex flex-col gap-6 md:gap-10 w-full max-w-4xl">
              <div className="space-y-6 md:space-y-8 text-center">
                <div className="inline-flex items-center gap-2.5 px-4 md:px-5 py-2 rounded-full glass border-blue-500/30 text-blue-400 text-[9px] md:text-[10px] font-black tracking-[0.25em] uppercase">
                  <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 fill-blue-400/20" />ECHTZEIT KI-OBJEKTANALYSE
                </div>
                <h1 className="flex flex-col items-center">
                  <span className="text-blue-500 font-bold text-sm md:text-2xl uppercase tracking-[0.3em] md:tracking-[0.35em] mb-3 md:mb-4 drop-shadow-xl text-center">Optimieren Sie Ihre Immobiliensuche</span>
                  <span className="text-3xl sm:text-5xl md:text-7xl xl:text-8xl font-black text-white leading-[1.1] tracking-tighter max-w-5xl text-center">Analysieren Sie Online-Immobilienanzeigen <br className="hidden md:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 animate-gradient pb-2 inline-block">professionell & schnell</span></span>
                  <span className="mt-4 md:mt-6 text-slate-400 font-medium text-base md:text-xl max-w-2xl text-center">Schnäppchen oder überteuertes Angebot? Finden Sie es heraus!</span>
                </h1>
                
                <div className="w-full max-w-4xl mx-auto pt-4 md:pt-8">
                  <div className="glass rounded-[2rem] md:rounded-[2.5rem] border-blue-500/10 bg-blue-500/5 backdrop-blur-3xl overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
                      <div className="p-6 md:p-8 flex items-center gap-4 group hover:bg-white/5 transition-colors">
                        <div className="bg-blue-600/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform"><Cpu className="w-5 h-5 md:w-6 md:h-6 text-blue-400" /></div>
                        <div className="text-left"><span className="text-white font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] block mb-0.5">KI-Modelle</span><p className="text-slate-400 text-[11px] md:text-[12px] font-semibold leading-relaxed">Modernste Analysemodelle <br className="hidden lg:block"/> und Algorithmen</p></div>
                      </div>
                      <div className="p-6 md:p-8 flex items-center gap-4 group hover:bg-white/5 transition-colors">
                        <div className="bg-emerald-600/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform"><ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" /></div>
                        <div className="text-left"><span className="text-white font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] block mb-0.5">Expertenwissen</span><p className="text-slate-400 text-[11px] md:text-[12px] font-semibold leading-relaxed">Langjährige Praxiserfahrung <br className="hidden lg:block"/> vom Profi-Gutachter</p></div>
                      </div>
                      <div className="p-6 md:p-8 flex items-center gap-4 group hover:bg-white/5 transition-colors">
                        <div className="bg-cyan-600/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform"><Globe className="text-cyan-400 w-5 h-5 md:w-6 md:h-6" /></div>
                        <div className="text-left"><span className="text-white font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] block mb-0.5">Live-Daten</span><p className="text-slate-400 text-[11px] md:text-[12px] font-semibold">Echtzeit-Scans via <br className="hidden lg:block"/> Google Search Engine & KI-Power</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative border-white/10 group overflow-hidden text-left">
                <div className="space-y-8 md:space-y-10 relative z-10">
                  <div className="flex items-center gap-4 md:gap-5 text-emerald-400 bg-emerald-500/[0.03] p-4 md:p-5 rounded-[1.2rem] md:rounded-[1.5rem] border border-emerald-500/20 backdrop-blur-md">
                    <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 shadow-lg"><Info className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" /></div>
                    <p className="text-[9px] md:text-[10px] font-black leading-relaxed tracking-[0.12em] md:tracking-[0.15em] uppercase text-emerald-300/90">Kopieren Sie drei Felder aus der Portalanzeige in die nachfolgenden Eingabefelder</p>
                  </div>
                  {error && <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold text-sm"><AlertCircle className="w-5 h-5" /> {error}</div>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Objektbezeichnung</label>
                      <div className="relative group/field">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none"><Tag className="w-4 h-4 md:w-5 md:h-5 text-slate-500 group-focus-within/field:text-blue-400 transition-colors" /></div>
                        <input type="text" placeholder="z.B. Kernsanierte 3-Zimmer-Wohnung..." className="w-full pl-14 md:pl-16 pr-6 md:pr-8 py-4 md:py-5 bg-slate-950/95 border-2 border-white/15 rounded-[1.2rem] md:rounded-[1.5rem] focus:outline-none focus:border-blue-500/60 transition-all text-white text-base md:text-lg font-medium" value={inputHeadline} onChange={(e) => setInputHeadline(e.target.value)} />
                      </div>
                    </div>
                    <div className="md:col-span-2 flex flex-col md:flex-row gap-6">
                      <div className="flex-grow space-y-3">
                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Genaue Adresse (Optional)</label>
                        <div className="relative group/field">
                          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none"><Home className="w-4 h-4 md:w-5 md:h-5 text-slate-500 group-focus-within/field:text-blue-400 transition-colors" /></div>
                          <input type="text" placeholder="Straße und Hausnummer" className="w-full pl-14 md:pl-16 pr-6 md:pr-8 py-4 md:py-5 bg-slate-950/95 border-2 border-white/15 rounded-[1.2rem] md:rounded-[1.5rem] focus:outline-none focus:border-blue-500/60 transition-all text-white text-base md:text-lg font-medium" value={inputAddress} onChange={(e) => setInputAddress(e.target.value)} />
                        </div>
                      </div>
                      <div className="md:w-1/3 bg-blue-500/10 p-5 rounded-[1.2rem] md:rounded-[1.5rem] flex gap-4 border border-blue-500/20">
                        <MapIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-slate-200 leading-relaxed font-semibold"><span className="text-blue-400 block mb-1 font-black uppercase tracking-widest">Pro-Analyse Tipp:</span>Die genaue Adresse verbessert die Präzision der Lageanalyse massiv.</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Postleitzahl & Ort</label>
                      <div className="relative group/field">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none"><MapPin className="w-4 h-4 md:w-5 md:h-5 text-slate-500 group-focus-within/field:text-blue-400 transition-colors" /></div>
                        <input type="text" placeholder="z.B. 80331 München" className="w-full pl-14 md:pl-16 pr-6 md:pr-8 py-4 md:py-5 bg-slate-950/95 border-2 border-white/15 rounded-[1.2rem] md:rounded-[1.5rem] focus:outline-none focus:border-blue-500/60 transition-all text-white text-base md:text-lg font-medium" value={inputLocation} onChange={(e) => setInputLocation(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Name des Anbieters</label>
                      <div className="relative group/field">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none"><Building2 className="w-4 h-4 md:w-5 md:h-5 text-slate-500 group-focus-within/field:text-blue-400 transition-colors" /></div>
                        <input type="text" placeholder="z.B. Mustermann Immobilien" className="w-full pl-14 md:pl-16 pr-6 md:pr-8 py-4 md:py-5 bg-slate-950/95 border-2 border-white/15 rounded-[1.2rem] md:rounded-[1.5rem] focus:outline-none focus:border-blue-500/60 transition-all text-white text-base md:text-lg font-medium" value={inputBroker} onChange={(e) => setInputBroker(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Neuer roter Hinweisblock */}
                  <div className="mt-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-[1.2rem] md:rounded-[1.5rem] flex gap-4 items-start animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                    <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] md:text-sm text-rose-200 font-bold leading-relaxed">
                      <span className="text-rose-400 block mb-1 font-black uppercase tracking-widest">WICHTIGER HINWEIS:</span>
                      Die Eingaben für die drei vorstehenden Feldern müssen 100 % mit den Angaben im Portalangebot übereinstimmen. Am besten Sie kopieren die Felder und fügen sie dann hier in das Formular ein.
                    </p>
                  </div>

                </div>
                <button onClick={handlePreScan} className="w-full mt-8 md:mt-12 py-5 md:py-7 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-lg md:text-xl rounded-[1.5rem] md:rounded-[1.8rem] shadow-xl flex items-center justify-center gap-3 md:gap-4 transition-all transform hover:scale-[1.01] active:scale-[0.98]">Deep-Scan Analyse starten<ArrowRight className="w-6 h-6 md:w-7 md:h-7" /></button>
              </div>
            </section>
            
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl pb-20">
              {features.map((feature) => (
                <div key={feature.id} className="glass-card p-4 md:p-6 rounded-2xl md:rounded-3xl group border-white/5 flex flex-col items-center text-center">
                  <div className="p-2.5 md:p-3 bg-white/5 rounded-xl mb-3 md:mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-white font-black text-[11px] md:text-[13px] mb-0.5 md:mb-1 tracking-tight uppercase">{feature.title}</h3>
                  <p className="text-slate-500 text-[9px] md:text-[10px] font-bold">{feature.description}</p>
                </div>
              ))}
            </section>
          </div>
        ) : view === 'verification' && preScanData ? (
          <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-8 md:space-y-10">
            <div className="text-center space-y-3 md:space-y-4">
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass border-amber-500/30 text-amber-400 text-[9px] md:text-[10px] font-black tracking-[0.25em] uppercase">VERIFIZIERUNG</div>
              <h2 className="text-2xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight px-4">Objekt gefunden. Bitte betätigen:</h2>
              {error && <div className="max-w-md mx-auto mt-4 flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 font-bold text-xs"><AlertCircle className="w-4 h-4" /> {error}</div>}
            </div>
            <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-white/5 space-y-8 md:space-y-10 shadow-2xl text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-blue-500/5 blur-[80px] rounded-full -mr-16 md:-mr-20 -mt-16 md:-mt-20" />
              <div className="flex items-center gap-3 md:gap-4 border-b border-white/5 pb-5 md:pb-6">
                <div className="bg-blue-600/20 p-2 md:p-2.5 rounded-xl border border-blue-500/20"><Globe className="w-4 h-4 md:w-5 md:h-5 text-blue-400" /></div>
                <div>
                  <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] block">Datenquelle</span>
                  <span className="text-white font-black text-xs md:text-sm uppercase">Exposé-Verbindung hergestellt</span>
                </div>
              </div>
              <div className="space-y-8 md:space-y-10 relative z-10">
                <div className="space-y-2 md:space-y-3">
                  <span className="text-[8px] md:text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] block">Analysierte Anzeige:</span>
                  <h4 className="text-white text-xl md:text-4xl font-black leading-tight tracking-tighter">{preScanData.headline}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-slate-900/80 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 shadow-inner group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-2 md:mb-3">
                      <div className="bg-slate-800 p-1.5 rounded-lg"><Building2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" /></div>
                      <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Anbieter/Makler</span>
                    </div>
                    <span className="text-blue-400 font-black text-lg md:text-xl uppercase tracking-wide">{inputBroker}</span>
                  </div>
                  <div className="bg-slate-900/80 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 shadow-inner group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-2 md:mb-3">
                      <div className="bg-slate-800 p-1.5 rounded-lg"><Tag className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" /></div>
                      <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Angebotspreis</span>
                    </div>
                    <span className="text-emerald-400 font-black text-xl md:text-2xl tracking-tighter">{preScanData.preis || "Auf Anfrage"}</span>
                  </div>
                  <div className="bg-slate-900/80 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 shadow-inner group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-2 md:mb-3">
                      <div className="bg-slate-800 p-1.5 rounded-lg"><Home className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" /></div>
                      <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Typ</span>
                    </div>
                    <span className="text-indigo-400 font-black text-lg md:text-xl uppercase tracking-wide">{preScanData.type || "Nicht angegeben"}</span>
                  </div>
                  <div className="bg-slate-900/80 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 shadow-inner group hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-2 md:mb-3">
                      <div className="bg-slate-800 p-1.5 rounded-lg"><MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" /></div>
                      <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Ort</span>
                    </div>
                    <span className="text-cyan-400 font-black text-lg md:text-xl uppercase tracking-wide">{inputLocation}</span>
                  </div>
                </div>
                {preScanData.description && (
                  <div className="bg-white/5 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5">
                    <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] block mb-3 md:mb-4">Auszug aus der Beschreibung</span>
                    <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed italic">"{preScanData.description.length > 250 ? preScanData.description.substring(0, 250) + '...' : preScanData.description}"</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 pt-4 px-4 md:px-0">
              <button onClick={startFinalAnalysis} className="w-full sm:flex-1 py-6 md:py-8 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-lg md:text-xl rounded-2xl flex items-center justify-center gap-3 md:gap-4 transition-all shadow-2xl shadow-emerald-500/30 transform hover:scale-[1.02] active:scale-[0.98]"><ThumbsUp className="w-5 h-5 md:w-7 md:h-7" /> Ja, Analyse starten</button>
              <button onClick={() => setView('home')} className="w-full sm:flex-1 py-6 md:py-8 bg-red-950/40 text-red-400 font-black text-lg md:text-xl rounded-2xl border border-red-500/20 flex items-center justify-center gap-3 md:gap-4 transition-all hover:text-red-300 hover:bg-red-900/60"><ThumbsDown className="w-5 h-5 md:w-7 md:h-7" /> Nein, zurück</button>
            </div>
          </div>
        ) : propertyData && view === 'dashboard' ? (
          <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-8 md:space-y-12 pb-20 text-left">
            <div className="text-center space-y-3 md:space-y-4 px-4">
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass border-blue-500/30 text-blue-400 text-[9px] md:text-[10px] font-black tracking-[0.25em] uppercase">Analysebericht (Kurzfassung)</div>
              <h1 className="text-2xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">{propertyData.headline}</h1>
              <div className="flex flex-wrap justify-center items-center gap-x-4 md:gap-x-6 gap-y-2 text-slate-400 font-bold text-xs md:text-lg">
                <span>{propertyData.ort}</span><span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-blue-500/30"></span>
                <span>{propertyData.type}</span><span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-blue-500/30"></span>
                <span className="text-emerald-400">{propertyData.preis}</span>
              </div>
            </div>
            
            <div className="glass rounded-[2rem] md:rounded-[2.5rem] border-white/10 p-5 md:p-12 relative overflow-hidden shadow-2xl">
              <div className="mb-10 md:mb-16">
                <div className="glass p-6 md:p-14 rounded-[2.5rem] md:rounded-[3.5rem] border-emerald-500/20 bg-emerald-500/[0.04] shadow-[0_0_100px_rgba(16,185,129,0.1)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-500/10 blur-[100px] md:blur-[150px] rounded-full -mr-32 md:-mr-40 -mt-32 md:-mt-40 group-hover:bg-emerald-500/20 transition-all duration-1000" />
                  <div className="relative z-10 flex flex-col items-center text-center gap-6 md:gap-8">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.5rem] bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shadow-2xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-500"><Gem className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" /></div>
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-[1rem] md:rounded-[1.3rem] bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-2xl transform rotate-12 group-hover:rotate-0 transition-transform duration-500 -ml-3 md:-ml-4 mt-4 md:mt-6"><Sparkles className="w-5 h-5 md:w-7 md:h-7 text-blue-400" /></div>
                    </div>

                    <div className="space-y-3 md:space-y-4 max-w-3xl">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] md:tracking-[0.3em] mb-1">Keine Registrierung erforderlich</div>
                      <h2 className="text-2xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[1.0]">Jetzt vollständige <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Premium-Analyse</span> freischalten</h2>
                      <p className="text-sm md:text-lg text-slate-300 font-semibold leading-relaxed max-w-2xl mx-auto">Erhalten Sie eine umfangreiche Auswertung für Ihre Zwecke und zur Vorlage bei der Bank für erste Finanzierungsgespräche</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full max-w-4xl text-left">
                      {[
                        { t: "Analysebericht", d: "Ausführlichen Version" },
                        { t: "Checkliste", d: "Erforderliche Unterlagen" },
                        { t: "Checkliste", d: "Durchführung Ortsbesichtigung" },
                        { t: "Mustermail", d: "Optimale Maklerkommunikation" }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-3.5 md:p-4 rounded-[1.2rem] bg-white/[0.03] border border-white/5 group/feat hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all">
                          <div className="mt-1 flex-shrink-0"><div className="bg-emerald-500/20 rounded-lg p-1 border border-emerald-500/20"><Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-400 stroke-[3px]" /></div></div>
                          <div><h4 className="text-white font-black text-[11px] md:text-[12px] uppercase tracking-tight group-hover/feat:text-emerald-400 transition-colors">{item.t}</h4><p className="text-slate-500 text-[9px] md:text-[10px] font-bold leading-snug">{item.d}</p></div>
                        </div>
                      ))}
                    </div>

                    <div className="w-full max-w-md space-y-4">
                      <button onClick={() => setView('postActivation')} className="w-full py-5 md:py-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-lg md:text-xl rounded-[1.5rem] md:rounded-[1.8rem] shadow-[0_15px_40px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]">Premium freischalten<ArrowRight className="w-5 h-5 md:w-6 md:h-6" /></button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 mb-10 md:mb-16 p-6 md:p-10 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-[2rem] md:rounded-[2.5rem] border border-blue-500/20 relative shadow-inner">
                <div className="relative">
                  <div className="w-36 h-36 md:w-48 md:h-48 rounded-full border-[5px] md:border-[6px] border-slate-800/80 flex items-center justify-center bg-slate-950 shadow-2xl">
                    <div className="flex flex-col items-center">
                      <span className="text-5xl md:text-7xl font-black text-white tracking-tighter">{propertyData.totalScore.toFixed(1)}</span>
                      <span className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] mt-1">von 7.0</span>
                    </div>
                  </div>
                </div>
                <div className="flex-grow space-y-4 md:space-y-6 text-center lg:text-left relative z-10">
                  <div className={`inline-flex px-4 py-1.5 md:px-5 md:py-2 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] shadow-lg ${getScoreRating(propertyData.totalScore).bg} ${getScoreRating(propertyData.totalScore).color}`}>{getScoreRating(propertyData.totalScore).label}</div>
                  <h4 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">PropertyMind <span className="text-blue-400">Expert-Score</span></h4>
                  <p className="text-slate-300 text-sm md:text-lg font-medium italic leading-relaxed">"{propertyData.totalScoreExplanation}"</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-y-10 md:gap-y-12 max-w-3xl mx-auto">
                {propertyData.scores.map((score, idx) => (
                  <div key={idx} className="group/item space-y-4 md:space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-start gap-4 md:gap-6">
                        <div className={`p-3 md:p-4 rounded-[1rem] md:rounded-[1.2rem] ${score.color} ${score.glow} shadow-lg flex-shrink-0`}>{score.icon}</div>
                        <div className="space-y-1.5"><span className="text-white font-black text-base md:text-lg uppercase tracking-wide">{score.label}</span><p className="text-xs md:text-[13px] text-slate-400 font-semibold leading-relaxed max-w-xl">{score.description}</p></div>
                      </div>
                      <div className="flex flex-col items-end min-w-[70px] md:min-w-[90px] bg-white/5 p-2 md:p-3 rounded-xl md:rounded-2xl border border-white/5 self-end sm:self-center"><span className="text-2xl md:text-4xl font-black text-white">{score.value.toFixed(1)}</span><span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase -mt-0.5 md:-mt-1">Punkte</span></div>
                    </div>
                    <div className="relative h-2 md:h-3 w-full bg-slate-950/80 rounded-full overflow-hidden border border-white/5">
                      <div className={`absolute inset-y-0 left-0 h-full rounded-full ${score.color?.replace('text-', 'bg-') || 'bg-slate-500'} transition-all duration-1000 ease-out`} style={{ width: `${(score.value / 7) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8 md:space-y-12">
              <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-white/10 space-y-6 md:space-y-8 shadow-xl">
                <div className="flex items-center gap-4 md:gap-6 border-b border-white/5 pb-4 md:pb-6"><TrendingUp className="text-emerald-400 w-8 h-8 md:w-10 md:h-10" /><h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-tight">Marktanalyse & Preisvalidierung</h3></div>
                <div className="text-slate-300 leading-relaxed text-xs md:text-base">{formatText(propertyData.marketAnalysis)}</div>
              </div>
              <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-white/10 space-y-6 md:space-y-8 shadow-xl">
                <div className="flex items-center gap-4 md:gap-6 border-b border-white/5 pb-4 md:pb-6"><Globe className="text-cyan-400 w-8 h-8 md:w-10 md:h-10" /><h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-tight">Makrolage & Zukunftsindex</h3></div>
                <div className="text-slate-300 leading-relaxed text-xs md:text-base">{formatText(propertyData.macroLocation)}</div>
              </div>
              <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-white/10 space-y-6 md:space-y-8 shadow-xl">
                <div className="flex items-center gap-4 md:gap-6 border-b border-white/5 pb-4 md:pb-6"><MapPin className="text-rose-400 w-8 h-8 md:w-10 md:h-10" /><h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-tight">Mikrolage & Umfeldanalyse</h3></div>
                <div className="text-slate-300 leading-relaxed text-xs md:text-base">{formatText(propertyData.microLocation)}</div>
              </div>
              <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-white/10 space-y-6 md:space-y-8 shadow-xl">
                <div className="flex items-center gap-4 md:gap-6 border-b border-white/5 pb-4 md:pb-6"><Building2 className="text-blue-400 w-8 h-8 md:w-10 md:h-10" /><h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-tight">Bauzustand & Ausstattung</h3></div>
                <div className="text-slate-300 leading-relaxed text-xs md:text-base">{formatText(propertyData.objectCondition)}</div>
              </div>
              <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-white/10 space-y-6 md:space-y-8 shadow-xl">
                <div className="flex items-center gap-4 md:gap-6 border-b border-white/5 pb-4 md:pb-6"><Zap className="text-amber-400 w-8 h-8 md:w-10 md:h-10" /><h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-tight">Energieeffizienz & GEG</h3></div>
                <div className="text-slate-300 leading-relaxed text-xs md:text-base">{formatText(propertyData.energyEfficiency)}</div>
              </div>
              <div className="glass p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] border-blue-500/30 bg-blue-600/5 space-y-8 md:space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 md:p-8"><Quote className="w-12 h-12 md:w-20 md:h-20 text-blue-500/10" /></div>
                <div className="flex items-center gap-4 md:gap-6 border-b border-white/10 pb-4 md:pb-6"><FileCheck className="text-blue-400 w-10 h-10 md:w-12 md:h-12" /><h3 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tight">Fazit</h3></div>
                <div className="text-slate-200 font-medium text-sm md:text-base">{formatText(propertyData.fazit)}</div>
              </div>
            </div>
          </div>
        ) : view === 'postActivation' ? (
          <div className="w-full max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-700 space-y-10 md:space-y-16">
            <div className="text-center space-y-6 md:space-y-8">
              <div className="flex flex-col items-center">
                <div className="inline-flex items-center justify-center w-20 h-20 md:w-28 md:h-28 rounded-[2rem] md:rounded-3xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)] mb-6 md:mb-8 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Trophy className="w-10 h-10 md:w-14 md:h-14 text-emerald-400" />
                </div>
                <div className="space-y-3 md:space-y-4">
                  <h1 className="text-3xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[1.0] drop-shadow-2xl">
                    Gratulation!<br />
                    <span className="text-emerald-400 text-xl md:text-5xl tracking-normal mt-2 md:mt-4 block font-black leading-tight">PropertyMind Premium aktiviert.</span>
                  </h1>
                </div>
              </div>
              <div className="max-w-3xl mx-auto px-4">
                <p className="text-xs md:text-xl text-slate-400 font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] leading-relaxed">
                  Wählen Sie einen Bericht/Checkliste zur Anzeige/Ausdruck in einem neuen Fenster.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto px-4">
              {[
                { 
                  title: "Analysebericht", 
                  desc: "Ausführlichen Version zur Bankenvorlage", 
                  icon: <FileText className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />,
                  action: generateReports
                },
                { 
                  title: "Checkliste", 
                  desc: "Erforderliche Unterlagen für Ihr Objekt", 
                  icon: <ListChecks className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />,
                  action: openChecklist
                },
                { 
                  title: "Checkliste", 
                  desc: "Durchführung Ortsbesichtigung, Tipps & Tricks", 
                  icon: <ClipboardCheck className="text-amber-400 w-8 h-8 md:w-10 md:h-10" />,
                  action: openVisitChecklist
                },
                { 
                  title: "Mustermail", 
                  desc: "Unterlagenanforderung & Terminvereinbarung", 
                  icon: <Mail className="text-rose-400 w-8 h-8 md:w-10 md:h-10" />,
                  action: openMailTemplates
                }
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={item.action} 
                  className="group p-6 md:p-8 glass rounded-[2rem] md:rounded-[2.5rem] border-white/5 hover:border-emerald-500/30 hover:bg-emerald-600/5 transition-all flex flex-col items-center text-center gap-4 md:gap-6 shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="p-4 md:p-5 bg-white/5 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all duration-500">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-black text-xl md:text-2xl uppercase mb-0.5 md:mb-1 tracking-tighter group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-[11px] md:text-sm font-semibold leading-relaxed px-4">
                      {item.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex justify-center pt-4">
              <button 
                onClick={() => setView('dashboard')} 
                className="flex items-center gap-2.5 text-slate-500 hover:text-white font-black text-[10px] md:text-xs uppercase tracking-widest transition-colors py-3 md:py-4 px-6 md:px-8 rounded-2xl hover:bg-white/5"
              >
                <ChevronLeft className="w-3.5 md:w-4 h-3.5 md:h-4" /> Dashboard
              </button>
            </div>
          </div>
        ) : view === 'legal' ? (
          <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12 pb-20 text-left">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass border-blue-500/30 text-blue-400 text-[10px] font-black tracking-[0.25em] uppercase">Rechtliches</div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">Impressum & Datenschutz</h1>
            </div>
            <div className="glass p-8 md:p-12 rounded-[2.5rem] border-white/10 space-y-12 shadow-xl">
              <section className="space-y-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight border-b border-white/10 pb-4">Impressum</h2>
                <div className="text-slate-300 space-y-4 font-medium leading-relaxed">
                  <p><strong>Angaben gemäß § 5 TMG:</strong></p>
                  <p>
                    fundus crescat GmbH<br />
                    Königsallee 60 F<br />
                    40212 Düsseldorf<br />
                    Deutschland
                  </p>
                  <p>
                    <strong>Vertreten durch:</strong><br />
                    Geschäftsführer: Dr. Patrick J. G. Steiner
                  </p>
                  <p>
                    <strong>Kontakt:</strong><br />
                    E-Mail: info@funduscrescat.de
                  </p>
                  <p>
                    <strong>Registereintrag:</strong><br />
                    Eintragung im Handelsregister.<br />
                    Registergericht: Amtsgericht Düsseldorf<br />
                    Registernummer: HRB 92147
                  </p>
                  <p>
                    <strong>Umsatzsteuer-ID:</strong><br />
                    Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br />
                    DE340251781
                  </p>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight border-b border-white/10 pb-4">Datenschutzerklärung</h2>
                <div className="text-slate-300 space-y-6 font-medium leading-relaxed">
                  <div>
                    <h3 className="text-white font-bold mb-2">1. Datenschutz auf einen Blick</h3>
                    <p>Die fundus crescat GmbH nimmt den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-2">2. Datenerfassung in dieser Anwendung</h3>
                    <p>Diese Anwendung verarbeitet die von Ihnen eingegebenen Objektdaten ausschließlich zur Erstellung der Analyseberichte. Wir speichern keine Ihrer persönlichen Daten auf unseren Servern, sofern Sie dies nicht explizit veranlassen.</p>
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-2">3. Analyse & Drittanbieter</h3>
                    <p>Für die Analyse wird die Google Gemini API genutzt. Dabei werden die von Ihnen eingegebenen Objektdaten (Headline, Ort, Maklername) an Google übermittelt, um eine fundierte Bewertung zu generieren. Es werden keine privaten Nutzer-Metadaten für das Training der KI-Modelle verwendet.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : null}
      </main>
      <footer className="w-full py-8 md:py-12 border-t border-white/5 bg-[#020617]/95 backdrop-blur-3xl mt-auto relative z-10"><div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[11px] md:text-sm"><p className="opacity-60 uppercase text-center md:text-left">© 2025 PropertyMind • Powered by AI Intelligence</p><button onClick={() => setView('legal')} className="font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px] opacity-60 hover:text-blue-400 transition-colors">Impressum & Datenschutz</button></div></footer>
    </div>
  );
};

export default App;
