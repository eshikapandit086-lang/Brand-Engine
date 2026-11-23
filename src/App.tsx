import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  History, 
  Globe, 
  Mail, 
  Linkedin, 
  Info,
  Layers,
  RefreshCw,
  Clock,
  ChevronRight,
  BookOpen,
  BarChart3,
  Sliders,
  TrendingUp,
  Zap,
  Layout,
  ArrowRight,
  CheckCircle2,
  Rocket
} from "lucide-react";
import { LaunchKit, HistoryItem } from "./types";
import { 
  INITIAL_HISTORY, 
  SUGGESTIONS, 
  FRAMEWORK_TEMPLATES, 
  FrameworkTemplate 
} from "./data";

export default function App() {
  const [businessIdea, setBusinessIdea] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Storage for history list
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // State for the currently displayed launch kit on the workspace
  const [currentKit, setCurrentKit] = useState<LaunchKit | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // Tab switching state: "ideation" | "workspace" | "analytics" | "templates"
  const [activeTab, setActiveTab] = useState<"ideation" | "workspace" | "analytics" | "templates">("ideation");

  // Template Search / Filter
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<"All" | "Frameworks" | "Headlines" | "Cold Email">("All");

  // Simulation parameters inside Analytics Tab
  const [targetSignupsGoal, setTargetSignupsGoal] = useState(1000);

  // States to handle copy confirmation feedback
  const [copyFeedback, setCopyFeedback] = useState<{
    hook: boolean;
    email: boolean;
    post: boolean;
    templateFormula: string | null;
  }>({
    hook: false,
    email: false,
    post: false,
    templateFormula: null
  });

  // Success indicator for suggestion injections
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial history and current display
  useEffect(() => {
    const saved = localStorage.getItem("brand_engine_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
        if (parsed.length > 0) {
          setCurrentKit(parsed[0].launchKit);
          setActiveHistoryId(parsed[0].id);
        }
      } catch (e) {
        setHistory(INITIAL_HISTORY);
        setCurrentKit(INITIAL_HISTORY[0].launchKit);
        setActiveHistoryId(INITIAL_HISTORY[0].id);
      }
    } else {
      setHistory(INITIAL_HISTORY);
      setCurrentKit(INITIAL_HISTORY[0].launchKit);
      setActiveHistoryId(INITIAL_HISTORY[0].id);
      localStorage.setItem("brand_engine_history", JSON.stringify(INITIAL_HISTORY));
    }
  }, []);

  // Save history helper
  const saveHistoryToStorage = (updatedList: HistoryItem[]) => {
    setHistory(updatedList);
    localStorage.setItem("brand_engine_history", JSON.stringify(updatedList));
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const selectTabAndScroll = (tab: "ideation" | "workspace" | "templates" | "analytics") => {
    setActiveTab(tab);
  };

  const selectHistoryItem = (item: HistoryItem) => {
    setCurrentKit(item.launchKit);
    setActiveHistoryId(item.id);
    // Autofill form inputs for convenient customization
    setBusinessIdea(item.businessIdea);
    setTargetAudience(item.targetAudience);
    triggerToast("Loaded concept from archive");
    setActiveTab("workspace");
  };

  const handleApplySuggestion = (suggestion: typeof SUGGESTIONS[0]) => {
    setBusinessIdea(suggestion.idea);
    setTargetAudience(suggestion.audience);
    triggerToast(`Concept applied: ${suggestion.title}`);
    setActiveTab("ideation");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const filtered = history.filter(item => item.id !== id);
    saveHistoryToStorage(filtered);
    if (activeHistoryId === id) {
      if (filtered.length > 0) {
        setCurrentKit(filtered[0].launchKit);
        setActiveHistoryId(filtered[0].id);
      } else {
        setCurrentKit(null);
        setActiveHistoryId(null);
      }
    }
    triggerToast("Removed history record");
  };

  const handleClearHistory = () => {
    saveHistoryToStorage([]);
    setCurrentKit(null);
    setActiveHistoryId(null);
    triggerToast("Cleared local history list");
  };

  // Generate Launch Kit via server API
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessIdea.trim() || !targetAudience.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          businessIdea: businessIdea.trim(),
          targetAudience: targetAudience.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned status ${response.status}`);
      }

      const launchKit: LaunchKit = await response.json();
      
      // Prep new history item
      const newItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        businessIdea: businessIdea.trim(),
        targetAudience: targetAudience.trim(),
        timestamp: "Just now",
        launchKit
      };

      const updatedHistory = [newItem, ...history];
      saveHistoryToStorage(updatedHistory);
      setCurrentKit(launchKit);
      setActiveHistoryId(newItem.id);
      triggerToast("Brand Launch Kit Generated!");
      setActiveTab("workspace");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected issue occurred while requesting copy from Gemini.");
    } finally {
      setLoading(false);
    }
  };

  const handleInstantGenerate = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!businessIdea.trim() || !targetAudience.trim()) {
      triggerToast("Please provide both dynamic settings before generating!");
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        const launchKit = generateInstantLaunchKit(businessIdea.trim(), targetAudience.trim());
        const newItem: HistoryItem = {
          id: `hist-${Date.now()}`,
          businessIdea: businessIdea.trim(),
          targetAudience: targetAudience.trim(),
          timestamp: "Just now",
          launchKit
        };

        const updatedHistory = [newItem, ...history];
        saveHistoryToStorage(updatedHistory);
        setCurrentKit(launchKit);
        setActiveHistoryId(newItem.id);
        triggerToast("Instant Template Built Successfully!");
        setActiveTab("workspace");
      } catch (err: any) {
        console.error(err);
        setError("An error occurred compiling your instant blueprint.");
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleInstantGeneratePreset = (e: React.MouseEvent, s: typeof SUGGESTIONS[0]) => {
    e.stopPropagation();
    setBusinessIdea(s.idea);
    setTargetAudience(s.audience);
    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        const launchKit = generateInstantLaunchKit(s.idea, s.audience);
        const newItem: HistoryItem = {
          id: `hist-${Date.now()}`,
          businessIdea: s.idea,
          targetAudience: s.audience,
          timestamp: "Just now",
          launchKit
        };

        const updatedHistory = [newItem, ...history];
        saveHistoryToStorage(updatedHistory);
        setCurrentKit(launchKit);
        setActiveHistoryId(newItem.id);
        triggerToast(`Instant Template Built for ${s.title}!`);
        setActiveTab("workspace");
      } catch (err: any) {
        console.error(err);
        triggerToast("Error building instant template");
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const copyToClipboard = (text: string, cardType: "hook" | "email" | "post") => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(prev => ({ ...prev, [cardType]: true }));
      setTimeout(() => {
        setCopyFeedback(prev => ({ ...prev, [cardType]: false }));
      }, 2000);
    });
  };

  const copyTemplateFormula = (text: string, name: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(prev => ({ ...prev, templateFormula: name }));
      setTimeout(() => {
        setCopyFeedback(prev => ({ ...prev, templateFormula: null }));
      }, 2000);
    });
  };

  const handleInjectTemplate = (template: FrameworkTemplate) => {
    setBusinessIdea(template.examplePrompt.idea);
    setTargetAudience(template.examplePrompt.audience);
    triggerToast(`Injected template: ${template.name.split(" ")[0]}! Click on Generate.`);
    setActiveTab("ideation");
  };

  // Structured string layouts for standard programmatic copying
  const getHookCopyText = () => {
    if (!currentKit) return "";
    const h = currentKit.landingPageHook;
    return `[Landing Page Hook]\nHeadline: ${h.headline}\nSubheadline: ${h.subheadline}\nCTA Button: ${h.ctaText}`;
  };

  const getEmailCopyText = () => {
    if (!currentKit) return "";
    const em = currentKit.productLaunchEmail;
    return `Subject: ${em.subject}\n\n${em.body}\n\nCTA Button: ${em.cta}`;
  };

  const getPostCopyText = () => {
    if (!currentKit) return "";
    return currentKit.viralLinkedInPost.text;
  };

  // CALCULATE LIVE ANALYTICS METRICS FROM CURRENT ACTIVE KIT FOR REAL-TIME SIMULATION
  const getComputedMetrics = () => {
    if (!currentKit) {
      return {
        ctr: 2.5,
        emailOpenRate: 18.0,
        readabilityScore: 65,
        estimatedVirality: 50,
        powerLevel: "Medium",
        hasEmoji: false,
        wordCount: 0
      };
    }

    // Inspect variables dynamically
    const headline = currentKit.landingPageHook.headline || "";
    const subheadline = currentKit.landingPageHook.subheadline || "";
    const emailSubject = currentKit.productLaunchEmail.subject || "";
    const linkedinText = currentKit.viralLinkedInPost.text || "";

    const fullText = (headline + " " + subheadline + " " + emailSubject + " " + linkedinText).toLowerCase();
    
    // Check elements
    const hasEmoji = /[\uD800-\uDFFF\u2600-\u27BF]/.test(emailSubject + headline);
    const hasQuestionMark = fullText.includes("?") || fullText.includes("!");
    
    // Check strong copywriting trigger keywords
    const triggers = ["premium", "free", "faster", "instantly", "optimize", "eliminate", "save", "launch", "ritual", "solve", "now", "stop", "guarantee"];
    let matchedTriggers = 0;
    triggers.forEach(word => {
      if (fullText.includes(word)) matchedTriggers++;
    });

    // Dynamic CTR calculation formula (bounded between 3.5% and 9.4%)
    let computedCTR = 3.8;
    if (hasEmoji) computedCTR += 1.4;
    if (hasQuestionMark) computedCTR += 0.8;
    computedCTR += Math.min(matchedTriggers * 0.4, 2.5);
    computedCTR = Math.min(Math.max(computedCTR, 3.5), 9.4);

    // Dynamic Email Open Rate calculation formula (bounded between 18.5% and 42%)
    let computedOpenRate = 20.0;
    if (emailSubject.includes("🚀") || emailSubject.includes("🍩") || hasEmoji) {
      computedOpenRate += 6.5;
    }
    // Subject lines of medium length convert best (40-60 chars)
    const slength = emailSubject.length;
    if (slength > 20 && slength < 65) {
      computedOpenRate += 4.5;
    } else {
      computedOpenRate -= 2.0;
    }
    computedOpenRate += matchedTriggers * 0.5;
    computedOpenRate = Math.min(Math.max(computedOpenRate, 18.5), 44.0);

    // Readability Score (based on average length)
    const words = fullText.split(/\s+/).filter(Boolean).length;
    let computedReadability = 85 - Math.min(Math.floor(words / 15), 30);
    if (matchedTriggers > 3) computedReadability += 5;
    computedReadability = Math.min(Math.max(computedReadability, 45), 98);

    // LinkedIn virality rating (based on structural spaces, spacing, tags)
    const paragraphCount = linkedinText.split("\n\n").length;
    const hasHashtags = linkedinText.includes("#");
    let computedVirality = 45;
    if (paragraphCount > 4) computedVirality += 15;
    if (hasHashtags) computedVirality += 10;
    computedVirality += Math.min(matchedTriggers * 3, 15);
    computedVirality = Math.min(Math.max(computedVirality, 40), 95);

    let powerLevel = "Balanced";
    if (computedCTR > 7.0 && computedVirality > 80) powerLevel = "Hyper-Viral";
    else if (computedCTR > 5.5) powerLevel = "High Conversion";
    else if (computedReadability > 85) powerLevel = "High Clarity";

    return {
      ctr: parseFloat(computedCTR.toFixed(1)),
      emailOpenRate: parseFloat(computedOpenRate.toFixed(1)),
      readabilityScore: computedReadability,
      estimatedVirality: computedVirality,
      powerLevel,
      hasEmoji,
      wordCount: words
    };
  };

  const metrics = getComputedMetrics();

  // Funnel calculations derived from target goal slider & dynamic formulas
  const viewsRequiredForGoal = Math.round(targetSignupsGoal / (metrics.ctr / 100));
  // Assume average Social Conversion rate from click to read: 12%
  const impressionsSocialRequired = Math.round(viewsRequiredForGoal / 0.12);
  // Assume average Email engagement conversion rate: clicks on internal CTA: 15%
  const emailsRequiredToSend = Math.round(viewsRequiredForGoal / (metrics.emailOpenRate / 100 * 0.15));

  // Filter framework templates
  const filteredTemplates = FRAMEWORK_TEMPLATES.filter(item => {
    const matchesCategory = templateCategoryFilter === "All" || item.category === templateCategoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(templateSearch.toLowerCase()) || 
                          item.description.toLowerCase().includes(templateSearch.toLowerCase()) ||
                          item.layoutPattern.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#030303] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] text-white/90 flex flex-col font-sans transition-all selection:bg-white/10 selection:text-white">
      
      {/* Visual notification toasts */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161618] border border-white/10 text-white text-xs py-3 px-4 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold tracking-wide uppercase">{toastMessage}</span>
        </div>
      )}

      {/* Premium Header Bar matching "Sophisticated Dark" with a cute Rocket icon */}
      <header className="sticky top-0 z-50 bg-[#030303]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center rounded-xl shadow-lg ring-1 ring-white/10">
            <Rocket className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-md font-sans font-bold text-white tracking-wider uppercase">
                Brand Engine
              </h1>
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                v2.0
              </span>
            </div>
            <p className="text-[9px] text-white/45 font-mono tracking-tight mt-0.5">LAUNCH MODULE ACTIVE</p>
          </div>
        </div>

        {/* Dynamic Nav tabs for the clean Multi-step Tab Interface */}
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("ideation")}
            id="navIdeationTab"
            className={`cursor-pointer uppercase tracking-widest text-[10px] px-1 py-1 transition-all border-b-2 ${
              activeTab === "ideation" 
                ? "text-indigo-400 border-indigo-400 font-semibold text-white" 
                : "text-white/40 hover:text-white/80 border-transparent"
            }`}
          >
            1. Ideation
          </button>
          <button
            onClick={() => setActiveTab("workspace")}
            id="navWorkspaceTab"
            className={`cursor-pointer uppercase tracking-widest text-[10px] px-1 py-1 transition-all border-b-2 ${
              activeTab === "workspace" 
                ? "text-indigo-400 border-indigo-400 font-semibold text-white" 
                : "text-white/40 hover:text-white/80 border-transparent"
            }`}
          >
            2. Workspace Copy
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            id="navAnalyticsTab"
            className={`cursor-pointer uppercase tracking-widest text-[10px] px-1 py-1 transition-all border-b-2 ${
              activeTab === "analytics" 
                ? "text-indigo-400 border-indigo-400 font-semibold text-white" 
                : "text-white/40 hover:text-white/80 border-transparent"
            }`}
          >
            3. Analytics
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            id="navTemplatesTab"
            className={`cursor-pointer uppercase tracking-widest text-[10px] px-1 py-1 transition-all border-b-2 ${
              activeTab === "templates" 
                ? "text-indigo-400 border-indigo-400 font-semibold text-white" 
                : "text-white/40 hover:text-white/80 border-transparent"
            }`}
          >
            4. Blueprints
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10 hidden sm:block"></div>
        </nav>
      </header>

      {/* Main Multi-step Tab Layout Panel - Single Clean Column layout */}
      <div className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        
        {/* ==================== STEP 1: IDEATION PARAMETERS ==================== */}
        {activeTab === "ideation" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in w-full">
            
            {/* Left Box: Creative Settings Form */}
            <div className="lg:col-span-7 bg-[#09090b]/80 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
            
            {/* Engine Inputs Form */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">
                  Engine Inputs
                </h2>
                <span className="inline-flex items-center text-[10px] font-mono text-white/20 uppercase tracking-widest">
                  {loading ? "Generating..." : "Diagnostics Active"}
                </span>
              </div>

              <form onSubmit={handleGenerate} className="space-y-5">
                
                {/* Raw Business Idea Field */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 flex items-center justify-between">
                    <span>Raw Business Idea</span>
                    <span className="text-[10px] text-white/30 hidden sm:inline">Value text prompt</span>
                  </label>
                  <textarea
                    value={businessIdea}
                    onChange={(e) => setBusinessIdea(e.target.value)}
                    placeholder="E.g. Subscription premium organic dessert box delivering artisan French pastries..."
                    rows={3}
                    id="businessIdeaInput"
                    className="w-full bg-[#111113] border border-white/5 rounded-xl p-3 text-sm h-24 placeholder-white/20 text-white/95 leading-relaxed font-sans focus:outline-none focus:border-white/20 transition-all"
                    required
                  />
                </div>

                {/* Target Audience Field */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 flex items-center justify-between">
                    <span>Target Audience</span>
                    <span className="text-[10px] text-white/30 hidden sm:inline">Audience target</span>
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="E.g. Busy urban foodies & sweet connoisseurs"
                    id="targetAudienceInput"
                    className="w-full bg-[#111113] border border-white/5 rounded-xl p-3 placeholder-white/20 text-sm text-white/95 focus:outline-none focus:border-white/20 transition-all"
                    required
                  />
                </div>

                {/* Inspiration list inside left column parameter control */}
                <div className="space-y-2.5 pt-1">
                  <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">Concept Presets</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                    {SUGGESTIONS.map((s, idx) => (
                      <div
                        key={idx}
                        className="group flex items-center gap-1.5 bg-[#161618]/60 hover:bg-[#1d1d20]/80 p-1 rounded-xl transition-all border border-white/5"
                      >
                        <button
                          type="button"
                          onClick={() => handleApplySuggestion(s)}
                          id={`suggestion-${idx}`}
                          className="flex-1 text-left text-xs text-white/75 hover:text-white p-2.5 transition-all cursor-pointer font-medium truncate"
                          title="Click to load and manually edit details"
                        >
                          {s.title}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleInstantGeneratePreset(e, s)}
                          id={`instant-preset-${idx}`}
                          className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer border border-indigo-500/20"
                          title="Instantly generate templates without API credentials"
                        >
                          <Zap className="h-3 w-3 text-yellow-300" />
                          <span>Instant</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secure error banner */}
                {error && (
                  <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-lg text-xs text-red-300 flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-semibold text-red-400">
                      <Info className="h-4 w-4 shrink-0" />
                      <span>Generator Failed</span>
                    </div>
                    <p className="leading-relaxed text-red-200/80">{error}</p>
                  </div>
                )}

                {/* Action Premium Submit buttons for AI & Instant Templates */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    id="generateButton"
                    className={`flex-1 py-3 px-4 font-semibold rounded-xl text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      loading 
                        ? "bg-white/10 text-white/40 cursor-not-allowed" 
                        : "bg-white text-black hover:bg-slate-200 active:scale-[0.99] shadow-md shadow-white/5"
                    }`}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate (AI)</span>
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleInstantGenerate}
                    disabled={loading}
                    id="instantGenerateButton"
                    className={`flex-1 py-3 px-4 font-semibold rounded-xl text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white active:scale-[0.99] border border-indigo-400/20 shadow-lg shadow-indigo-500/10 ${
                      loading ? "opacity-55 cursor-not-allowed" : ""
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
                    <span>Instant Template</span>
                  </button>
                </div>
              </form>
            </section>

            </div>

            {/* Right Box: Concept Presets and Past Ideas History */}
            <div className="lg:col-span-5 bg-[#09090b]/80 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6">
              
              <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest font-mono">
                  Concept Presets & History
                </h3>
                <p className="text-[10px] text-white/33 font-mono">SELECT TO LOAD</p>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">
                  Past Ideas History
                </h2>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    id="clearHistoryBtn"
                    className="text-[10px] font-mono text-white/30 hover:text-red-400 uppercase tracking-widest transition"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/5 rounded-lg">
                  <History className="h-6 w-6 text-white/10 mx-auto mb-2" />
                  <p className="text-xs text-white/30 italic">No past historical ideas yet.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                  {history.map((item) => {
                    const isActive = activeHistoryId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => selectHistoryItem(item)}
                        id={`history-item-${item.id}`}
                        className={`group p-2.5 rounded-lg border transition-all cursor-pointer flex justify-between items-start select-none ${
                          isActive
                            ? "bg-white/5 border-white/15 text-white"
                            : "bg-[#111113]/40 hover:bg-[#111113]/80 border-white/5 text-white/60"
                        }`}
                      >
                        <div className="flex flex-col space-y-0.5 w-[85%]">
                          <span className="text-xs font-semibold truncate text-white/95">
                            {item.businessIdea}
                          </span>
                          <span className="text-[10px] text-white/40 truncate">
                            {item.targetAudience}
                          </span>
                        </div>
                        
                        <div className="flex items-center shrink-0 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHistory(e, item.id);
                            }}
                            title="Delete old idea"
                            id={`delete-history-${item.id}`}
                            className="bg-red-400/10 hover:bg-red-400/20 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer shadow-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        )}

        {/* ==================== STEP 2: ACTIVE WORKSPACE COPY ==================== */}
        {activeTab === "workspace" && (
          <div id="section-output" className="space-y-6 scroll-mt-6 max-w-4xl mx-auto w-full animate-fade-in bg-[#09090b]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md pb-10">
            {/* Header section matching precisely the italic serif style instructions */}
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="space-y-1">
                <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase block font-semibold">
                  Section 01 // Active Launch Kit
                </span>
                <h1 className="text-2xl font-light italic tracking-tight text-white/95">
                  Ready to Launch
                </h1>
                <p className="text-xs text-white/40 font-mono tracking-wide uppercase">
                  {currentKit ? "Brand Copywriter Output" : "Workspace Engine Diagnostics"}
                </p>
              </div>
              
              {currentKit && (
                <button 
                  onClick={() => selectTabAndScroll("analytics")}
                  id="workspaceToAnalyticsBtn"
                  className="inline-flex items-center bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white text-xs px-3 py-1.5 rounded-md font-mono transition"
                >
                  View Predictions <ArrowRight className="h-3 w-3 ml-1" />
                </button>
              )}
            </div>

            {/* Setup default preview warning if current workspace is fully empty */}
            {!currentKit && (
              <div className="py-20 text-center border border-dashed border-white/5 rounded-2xl max-w-lg mx-auto w-full space-y-4">
                <Layers className="h-10 w-10 text-white/10 mx-auto animate-pulse" />
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-white/75">Workspace Engine Dormant</h3>
                  <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
                    Generate a launching kit or select customized historical setups from the left side panel parameters to initialize copy templates immediately.
                  </p>
                </div>
              </div>
            )}

            {/* Three copywriting placeholder or content cards matching layout specs */}
            {currentKit && (
              <div className="grid grid-cols-1 gap-8">
                
                {/* Card 1: Landing Page Hook */}
                <div 
                  id="landingPageHookCard"
                  className="bg-[#111113] rounded-xl border border-white/5 p-6 flex flex-col relative overflow-hidden transition-colors hover:border-white/10"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xs font-semibold tracking-widest text-white/40 uppercase">
                      1. Landing Page Hook
                    </h3>
                    
                    <button
                      onClick={() => copyToClipboard(getHookCopyText(), "hook")}
                      id="copyHookButton"
                      className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 border border-indigo-400/30 px-2 py-1 rounded hover:bg-indigo-400/10 transition-all cursor-pointer"
                    >
                      {copyFeedback.hook ? "COPIED" : "COPY CODE"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2 border-b border-white/5 pb-4">
                      <h2 className="text-[10px] tracking-wider uppercase font-mono text-indigo-400/80">Headline</h2>
                      <span className="text-lg font-medium text-white tracking-snug block">
                        {currentKit.landingPageHook.headline}
                      </span>
                      <p className="text-sm text-white/60 font-sans leading-relaxed">
                        {currentKit.landingPageHook.subheadline}
                      </p>
                      <div className="pt-2">
                        <span className="inline-flex items-center text-xs text-indigo-300 font-medium tracking-wide">
                          Button Action ⚡ {currentKit.landingPageHook.ctaText}
                        </span>
                      </div>
                    </div>

                    {/* Mock Landing Preview display */}
                    <div className="bg-[#080809] border border-white/5 rounded-lg p-5 text-center relative overflow-hidden">
                      <span className="absolute top-1.5 right-2 text-[8px] font-mono text-white/20 tracking-widest">LIVE MOCK HERO</span>
                      <div className="space-y-2">
                        <h4 className="text-md font-semibold text-white/90">
                          {currentKit.landingPageHook.headline}
                        </h4>
                        <p className="text-[11px] text-white/50 max-w-md mx-auto line-clamp-2">
                          {currentKit.landingPageHook.subheadline}
                        </p>
                        <div className="pt-2">
                          <button type="button" className="px-4 py-1.5 bg-indigo-600 rounded text-[10px] font-bold text-white hover:bg-indigo-500 transition-colors">
                            {currentKit.landingPageHook.ctaText}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Product Launch Email */}
                <div 
                  id="productLaunchEmailCard"
                  className="bg-[#111113] rounded-xl border border-white/5 p-6 flex flex-col relative overflow-hidden transition-colors hover:border-white/10"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50"></div>

                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xs font-semibold tracking-widest text-white/40 uppercase">
                      2. Product Launch Email
                    </h3>
                    
                    <button
                      onClick={() => copyToClipboard(getEmailCopyText(), "email")}
                      id="copyEmailButton"
                      className="text-[10px] font-bold uppercase tracking-widest text-purple-400 border border-purple-400/30 px-2 py-1 rounded hover:bg-purple-400/10 transition-all cursor-pointer"
                    >
                      {copyFeedback.email ? "COPIED" : "COPY TEXT"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#161618] border border-white/5 rounded-lg overflow-hidden text-xs">
                      <div className="bg-[#0e0e0f] px-4 py-2.5 border-b border-white/5 flex flex-col gap-1 font-mono text-[10px] text-white/40">
                        <div><span className="text-white/60 font-semibold">Subject:</span> <span className="text-purple-300 font-medium">{currentKit.productLaunchEmail.subject}</span></div>
                        <div><span className="text-white/60 font-semibold">Recipient:</span> <span className="text-white/50">{targetAudience || "Target Segment"}</span></div>
                      </div>
                      <div className="p-4 space-y-3 leading-relaxed text-white/70 whitespace-pre-wrap font-sans">
                        {currentKit.productLaunchEmail.body}
                        
                        <div className="pt-3 text-center">
                          <span className="inline-block px-5 py-2 bg-purple-600 text-[11px] font-bold text-white uppercase tracking-wider rounded">
                            {currentKit.productLaunchEmail.cta}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Viral LinkedIn Post */}
                <div 
                  id="viralLinkedInPostCard"
                  className="bg-[#111113] rounded-xl border border-white/5 p-6 flex flex-col relative overflow-hidden transition-colors hover:border-white/10"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>

                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xs font-semibold tracking-widest text-white/40 uppercase">
                      3. Viral LinkedIn Post
                    </h3>
                    
                    <button
                      onClick={() => copyToClipboard(getPostCopyText(), "post")}
                      id="copyPostButton"
                      className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 border border-emerald-400/30 px-2 py-1 rounded hover:bg-emerald-400/10 transition-all cursor-pointer"
                    >
                      {copyFeedback.post ? "COPIED" : "COPY POST"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#161618]/90 border border-white/5 rounded-lg p-4 space-y-3 text-xs">
                      <div className="flex items-center space-x-2 pb-2.5 border-b border-white/5">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {businessIdea ? businessIdea.charAt(0).toUpperCase() : "B"}
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-white/90">Startup Founder</div>
                          <div className="text-[9px] text-white/30 font-mono">Brand Engine active instance</div>
                        </div>
                      </div>
                      
                      <p className="whitespace-pre-line text-white/80 leading-relaxed font-sans p-2 rounded bg-black/15 border border-white/[0.02]">
                        {currentKit.viralLinkedInPost.text}
                      </p>

                      <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[10px] text-white/40 font-mono">
                        <div className="flex space-x-4">
                          <span>👍 like</span>
                          <span>💬 comment</span>
                          <span>🔄 share</span>
                        </div>
                        <span>💬 3 high intent remarks</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ==================== STEP 3: ANALYTICS SUITE ==================== */}
        {activeTab === "analytics" && (
          <div id="section-analytics" className="space-y-8 scroll-mt-6 max-w-4xl mx-auto w-full animate-fade-in bg-[#09090b]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md pb-10">
            {/* Header block */}
            <div className="border-b border-white/5 pb-6">
              <div className="space-y-1">
                <span className="text-[10px] text-purple-400 font-mono tracking-widest uppercase block font-semibold">
                  Section 02 // Analytics & Conversions
                </span>
                <h1 className="text-2xl font-light italic tracking-tight text-white/95">
                  Launch Analytics Suite
                </h1>
                <p className="text-xs text-white/40 font-mono tracking-wide">
                  Performance forecaster & dynamic funnel simulator
                </p>
              </div>
            </div>

            {/* 1. Dynamic Copy Scorecard Overlay - uses dynamic calculation helper */}
            <section className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
                Dynamic Copy Scorecard Overlay
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Metric 1 - Landing Page CTR */}
                <div className="bg-[#111113] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                  <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider block">Landing CTR</span>
                  <div className="py-2.5">
                    <span className="text-xl sm:text-2xl font-extrabold text-indigo-400 tracking-tight">{metrics.ctr}%</span>
                  </div>
                  <div className="text-[9px] text-white/30 border-t border-white/5 pt-1.5 font-mono">
                    {metrics.ctr > 6.5 ? "★ Top Tier Rating" : "Normal Segment"}
                  </div>
                </div>

                {/* Metric 2 - Email Open Rate */}
                <div className="bg-[#111113] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                  <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider block">Email open rate</span>
                  <div className="py-2.5">
                    <span className="text-xl sm:text-2xl font-extrabold text-purple-400 tracking-tight">{metrics.emailOpenRate}%</span>
                  </div>
                  <div className="text-[9px] text-white/30 border-t border-white/5 pt-1.5 font-mono">
                    Subject impact: Good
                  </div>
                </div>

                {/* Metric 3 - Readability Index */}
                <div className="bg-[#111113] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                  <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider block">Readability Index</span>
                  <div className="py-2.5">
                    <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 tracking-tight">{metrics.readabilityScore}</span>
                    <span className="text-xs text-white/20 font-mono">/100</span>
                  </div>
                  <div className="text-[9px] text-white/30 border-t border-white/5 pt-1.5 font-mono">
                    {metrics.readabilityScore > 80 ? "Ultra clear copy" : "Professional density"}
                  </div>
                </div>

                {/* Metric 4 - LinkedIn Virality */}
                <div className="bg-[#111113] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                  <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider block">Viral social score</span>
                  <div className="py-2.5">
                    <span className="text-xl sm:text-2xl font-extrabold text-amber-400 tracking-tight">{metrics.estimatedVirality}%</span>
                  </div>
                  <div className="text-[9px] text-white/30 border-t border-white/5 pt-1.5 font-mono">
                    Includes hashtags
                  </div>
                </div>
              </div>

              {/* Score Indicators Analysis block */}
              <div className="p-4 bg-[#111113] border border-white/5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white/90">Copywriting Sequence Quality Diagnostic: <span className="text-indigo-400 font-bold">{metrics.powerLevel}</span></div>
                  <p className="text-xs text-white/40 leading-normal">
                    Based on word variety, direct call-to-actions, paragraph density, and emoji hook points parsed dynamically.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-[#161618] border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono shrink-0">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>Total length: {metrics.wordCount} words</span>
                </div>
              </div>
            </section>

            {/* 2. Interactive Conversion Funnel Simulator */}
            <section className="bg-[#111113] p-5 sm:p-6 rounded-xl border border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">Goals Tool</span>
                  <h3 className="text-sm font-semibold text-white/95">Tactical Launch Goal Simulator</h3>
                </div>
                <Sliders className="h-4 w-4 text-white/30" />
              </div>

              {/* Range Slider for target signups */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-white/60">Target Confirmed Signups:</span>
                  <span className="text-white font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded text-sm tracking-wide">
                    {targetSignupsGoal.toLocaleString()} subscribers
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={targetSignupsGoal}
                  onChange={(e) => setTargetSignupsGoal(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#161618] rounded-lg appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-[10px] font-mono text-white/20">
                  <span>100 signups</span>
                  <span>10,000 signups</span>
                </div>
              </div>

              {/* Dynamic Calculated Funnel Pipeline with simulated conversion metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                
                {/* Social impressions needed */}
                <div className="bg-[#161618] p-4 rounded-lg border border-white/5 space-y-1 text-center font-mono">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block">Social Impressions</span>
                  <div className="text-lg font-bold text-amber-300">
                    {impressionsSocialRequired.toLocaleString()}
                  </div>
                  <p className="text-[9px] text-white/30 font-sans">Needed on LinkedIn organic posts</p>
                </div>

                {/* Web traffic needed */}
                <div className="bg-[#161618] p-4 rounded-lg border border-white/5 space-y-1 text-center font-mono">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block">Landing Visitors</span>
                  <div className="text-lg font-bold text-indigo-300">
                    {viewsRequiredForGoal.toLocaleString()}
                  </div>
                  <p className="text-[9px] text-white/30 font-sans">Target visits utilizing {metrics.ctr}% CTR</p>
                </div>

                {/* Newsletter list needed */}
                <div className="bg-[#161618] p-4 rounded-lg border border-white/5 space-y-1 text-center font-mono">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block">Email Dispatches Needed</span>
                  <div className="text-lg font-bold text-purple-300">
                    {emailsRequiredToSend.toLocaleString()}
                  </div>
                  <p className="text-[9px] text-white/30 font-sans">Total lists at {metrics.emailOpenRate}% Open Rate</p>
                </div>

              </div>
            </section>

            {/* 3. Simulated Marketing Performance Charts - implemented in pure gorgeous SVG */}
            <section className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Simulated Weekly Launch Analytics Diagram (Month 1 Forecast)
              </h2>

              <div className="bg-[#111113] rounded-xl border border-white/5 p-6 space-y-6">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    <span className="text-white/60">Estimated Landing Page Visits</span>
                  </div>
                  <span className="text-white/40 font-mono">Projected over 4 weeks</span>
                </div>

                {/* SVG Line & Bar Diagram Chart representation */}
                <div className="w-full h-44 relative">
                  <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
                    {/* Grid background lines */}
                    <line x1="10" y1="20" x2="490" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="10" y1="60" x2="490" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="10" y1="100" x2="490" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="10" y1="140" x2="490" y2="140" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                    {/* Bar 1 (Week 1) */}
                    <rect x="50" y="100" width="30" height="50" rx="3" fill="rgba(99, 102, 241, 0.15)" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1" />
                    {/* Bar 2 (Week 2) */}
                    <rect x="170" y="70" width="30" height="80" rx="3" fill="rgba(99, 102, 241, 0.25)" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="1" />
                    {/* Bar 3 (Week 3) */}
                    <rect x="290" y="45" width="30" height="105" rx="3" fill="rgba(168, 85, 247, 0.25)" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="1" />
                    {/* Bar 4 (Week 4) */}
                    <rect x="410" y="15" width="30" height="135" rx="3" fill="rgba(168, 85, 247, 0.35)" stroke="rgba(168, 85, 247, 0.7)" strokeWidth="1" />

                    {/* Cumulative trend path */}
                    <path 
                      d="M 65 110 L 185 85 L 305 50 L 425 25" 
                      fill="none" 
                      stroke="url(#gradient-indigo-purple)" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                    />

                    {/* Definitions for gradient */}
                    <defs>
                      <linearGradient id="gradient-indigo-purple" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>

                    {/* Circle dot indicators */}
                    <circle cx="65" cy="110" r="5" fill="#6366f1" stroke="#0e0e0f" strokeWidth="2" />
                    <circle cx="185" cy="85" r="5" fill="#6366f1" stroke="#0e0e0f" strokeWidth="2" />
                    <circle cx="305" cy="50" r="5" fill="#a855f7" stroke="#0e0e0f" strokeWidth="2" />
                    <circle cx="425" cy="25" r="5" fill="#ec4899" stroke="#0e0e0f" strokeWidth="2" />

                    {/* Labels */}
                    <text x="65" y="165" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" fontFamily="monospace">WEEK 1</text>
                    <text x="185" y="165" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" fontFamily="monospace">WEEK 2</text>
                    <text x="305" y="165" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" fontFamily="monospace">WEEK 3</text>
                    <text x="425" y="165" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" fontFamily="monospace">LAUNCH</text>
                  </svg>
                </div>
              </div>
            </section>

            {/* Secure simulation parameters advice info */}
            <p className="text-[10.5px] text-white/30 text-center font-mono leading-relaxed bg-white/[0.01] p-2 rounded-lg border border-white/[0.02]">
              *Forecasts are generated in real-time derived from copy elements count, structural bullet-scoring, and target sign-up milestones under sandbox testing environment specs.
            </p>
          </div>
        )}

        {/* ==================== STEP 4: BLUEPRINT TEMPLATES ==================== */}
        {activeTab === "templates" && (
          <div id="section-templates" className="space-y-6 scroll-mt-6 max-w-4xl mx-auto w-full animate-fade-in bg-[#09090b]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            
            {/* Header block */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/5 pb-6 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase block font-semibold">
                  Section 03 // Copywriting Blueprints
                </span>
                <h1 className="text-2xl font-light italic tracking-tight text-white/95">
                  Copywriting Blueprint Library
                </h1>
                <p className="text-xs text-white/40 font-mono tracking-wide font-semibold">
                  Curated framework recipes to inject as active prompts
                </p>
              </div>

              {/* Inline category selector pills */}
              <div className="flex flex-wrap gap-1.5">
                {(["All", "Frameworks", "Headlines", "Cold Email"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTemplateCategoryFilter(cat)}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded transition uppercase tracking-wider border cursor-pointer ${
                      templateCategoryFilter === cat
                        ? "bg-white text-black border-white"
                        : "bg-[#111113] text-white/50 border-white/5 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Live search input box */}
            <div className="relative">
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search copy formulas or mental frameworks..."
                className="w-full bg-[#111113] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-all placeholder-white/20 text-white/90"
              />
              {templateSearch && (
                <button 
                  onClick={() => setTemplateSearch("")}
                  className="absolute right-3 top-3 text-xs text-white/40 hover:text-white transition cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Render dynamic templates grid */}
            {filteredTemplates.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-white/5 rounded-xl">
                <BookOpen className="h-8 w-8 text-white/10 mx-auto mb-2" />
                <p className="text-xs text-white/40">No formulas matching your search keywords.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredTemplates.map((tpl, i) => (
                  <div 
                    key={i}
                    className="bg-[#111113] rounded-xl border border-white/5 p-5 hover:border-white/10 transition-all relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Decorative colored badge based on category */}
                    <div className="absolute top-0 right-0 px-3 py-1 bg-white/5 text-[9px] font-mono tracking-widest uppercase border-l border-b border-white/5 text-white/60">
                      {tpl.category}
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-bold text-white/95">{tpl.name}</h3>
                        <p className="text-xs text-white/55 leading-relaxed font-sans">{tpl.description}</p>
                      </div>

                      {/* Format visual layout pattern schema */}
                      <div className="bg-black/40 border border-white/[0.04] p-3 rounded-lg font-mono text-[10.5px] text-indigo-300 text-center leading-normal">
                        <span className="text-white/30 mr-1.5 uppercase font-bold text-[9px] tracking-wider block sm:inline">Structure:</span>
                        {tpl.layoutPattern}
                      </div>

                      {/* Prompt example trigger preview */}
                      <div className="border border-white/5 p-3 rounded-lg space-y-1.5 bg-[#0e0e0f]">
                        <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest font-bold">Injectable Experiment Data</div>
                        <div className="text-xs font-semibold text-white/85">Idea: <span className="text-white/60 font-medium font-sans italic">"{tpl.examplePrompt.idea}"</span></div>
                        <div className="text-xs font-semibold text-white/85">Audience: <span className="text-white/60 font-medium font-sans">"{tpl.examplePrompt.audience}"</span></div>
                      </div>
                    </div>

                    {/* Action blocks to directly interact with template workflow */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/5 pt-4 mt-4 gap-4">
                      <span className="text-[10px] text-white/30 italic flex items-center gap-1 font-mono">
                        <TrendingUp className="h-3 w-3 shrink-0" />
                        {tpl.metricsSimulatedText}
                      </span>

                      <div className="flex items-center space-x-2 self-end">
                        <button
                          onClick={() => copyTemplateFormula(tpl.layoutPattern, tpl.name)}
                          type="button"
                          className="text-[10px] font-bold uppercase tracking-widest text-white/40 border border-white/10 px-2.5 py-1.5 rounded hover:bg-white/5 transition cursor-pointer"
                        >
                          {copyFeedback.templateFormula === tpl.name ? "COPIED" : "COPY FORMULA"}
                        </button>

                        <button
                          onClick={() => handleInjectTemplate(tpl)}
                          type="button"
                          className="text-[10px] font-bold uppercase tracking-widest text-[#0a0a0a] bg-white border border-white px-2.5 py-1.5 rounded hover:bg-slate-200 transition text-center shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Load Concept</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Blueprint Copywriting tips */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-white/80 flex items-center gap-1.5 uppercase tracking-widest font-mono">
                <Info className="h-4 w-4 text-indigo-400" />
                How to leverage formulas effectively
              </h4>
              <p className="text-xs text-white/50 leading-relaxed font-sans">
                The copy models displayed represent decades of direct response testing. Injecting these startup ideas loads real-world pain formulas that help the Gemini model write significantly more compelling subheadlines and engaging, conversion-oriented copy layouts.
              </p>
            </div>

          </div>
        )}

      </div>

      {/* Footer bar styled in dark parameters */}
      <footer className="mt-auto border-t border-white/5 bg-[#0e0e0f] py-4 px-6 text-xs text-white/30 font-mono flex items-center justify-between shrink-0">
        <div>© 2026 Brand Engine. Pure secure local workspace configuration.</div>
        <div className="flex items-center space-x-1.5 text-white/40">
          <Clock className="h-3.5 w-3.5" />
          <span>Active Session: {new Date().toISOString().substring(0, 10)}</span>
        </div>
      </footer>

    </div>
  );
}

// Client-side Direct Response Instant Copy Template generator
function generateInstantLaunchKit(idea: string, audience: string): LaunchKit {
  const rawIdea = idea.trim();
  const rawAudience = audience.trim();
  
  const capAudience = rawAudience.charAt(0).toUpperCase() + rawAudience.slice(1);
  const capIdea = rawIdea.charAt(0).toUpperCase() + rawIdea.slice(1);

  // Analyze the idea for smart categorization
  const ideaLower = rawIdea.toLowerCase();
  const isSaaSOrTech = ideaLower.includes("ai") || ideaLower.includes("software") || ideaLower.includes("tool") || ideaLower.includes("app") || ideaLower.includes("platform") || ideaLower.includes("automated") || ideaLower.includes("api");
  const isFoodOrPhysical = ideaLower.includes("organic") || ideaLower.includes("delivery") || ideaLower.includes("subscription") || ideaLower.includes("box") || ideaLower.includes("food") || ideaLower.includes("bakery") || ideaLower.includes("pastry") || ideaLower.includes("gourmet");
  const isServiceOrConsulting = ideaLower.includes("service") || ideaLower.includes("agency") || ideaLower.includes("consulting") || ideaLower.includes("coach") || ideaLower.includes("expert");

  let headline = `Supercharge Your Entire Startup Journey.`;
  let subheadline = `Stop wasting hundreds of hours on repetitive manual setup. Unlock elite, high-converting copy built specifically for ${rawAudience}.`;
  let ctaText = `Get Instant Blueprint Access`;
  
  let emailSubject = `🚀 Something game-changing is waiting for you...`;
  let emailBody = `Hey fellow builders,\n\nWe all face the exact same barrier: you have an incredible vision, but you spend the first weeks crafting copy, building templates, and struggling with layout styling configurations from scratch.\n\nThat's why we're proud to preview this initiative: "${capIdea}".\n\nIt is custom-built to help ${rawAudience} eliminate technical friction and realize value instantly.\n\nHere are 3 core pillars we automated for your workflow:\n• High performance built to scale gracefully\n• Intuitively optimized for clean design aesthetics\n• 100% focused on immediate, measurable feedback loops\n\nBe among the first to experience the upgrade. Get started with us today!\n\nWarm wishes,\nThe Brand Engine Team`;
  let emailCta = `Claim Your Custom Onboarding Spot`;
  
  let linkedinText = `Let's admit a harsh truth about most startups today. 🚨\n\nWe consume 90% of our precious hours preparing dashboards, configuring settings, and writing placeholder text instead of proving real core value to our users.\n\nWe've been talking directly with ${rawAudience}, and the message is crystal clear: people want frictionless value, not complex, bloated overhead.\n\nThat's why we engineered: "${capIdea}".\n\nHere's our simple 3-step blueprint to scale your operations:\n1️⃣ Eliminate repetitive manual overhead immediately\n2️⃣ Establish robust, automated workflows\n3️⃣ Deliver elite results with absolute consistency\n\nWhat is your biggest operational bottleneck right now? Let's discuss in the comments! 👇\n\n#entrepreneurship #productivity #buildinpublic`;

  if (isSaaSOrTech) {
    headline = `Automate Your Entire Core Workflow, Instantly.`;
    subheadline = `The next-generation intelligent engine built custom for ${rawAudience}. Optimize complex pipelines, trim manual costs, and launch faster than ever.`;
    ctaText = `Start Your 14-Day Free Trial`;
    
    emailSubject = `⚡ Save 15+ complex engineering hours each week with ${capIdea.split(" ")[0] || "us"}`;
    emailBody = `Hello Tech Pioneer,\n\nLegacy platforms are slow, fragmented, and demand intense developer hours to maintain. \n\nWe engineered "${capIdea}" to provide ${rawAudience} with a slick, automated system that eliminates styling and boilerplate configuration from day one.\n\nHere's what our early builders are seeing:\n✔ 10x faster startup deployment cycles\n✔ Clean, robust APIs with total type safety\n✔ Automated, eye-catching launch kit configurations on autopilot\n\nWhy write manual boilerplate when you can deploy instantly?\n\nBest regards,\nThe Technical Launch Team`;
    emailCta = `Deploy Your Instant Container Now`;
  } else if (isFoodOrPhysical) {
    headline = `Handcrafted Artisan Rituals, Delivered Straight to Your Sanctuary.`;
    subheadline = `Strictly pure ingredients, exquisite culinary combinations, and organic loose-leaf tea pairings curated exclusively for ${rawAudience}.`;
    ctaText = `Reserve Your Custom Batch Box`;
    
    emailSubject = `🥐 Freshly-baked lavender rituals and loose-leaf teas await you...`;
    emailBody = `Hello Connoisseur,\n\nWe believe exceptional dining pairing is a sacred ritual that belongs in the peaceful comfort of your sanctuary, not in a chaotic boutique queue.\n\nIntroducing our artisan subscription: "${capIdea}". We curate physical batches of seasonal delicacies specifically paired with premium loose-leaf teas, delivered warm right to your doorstep.\n\nOnly 150 limited spaces are available for the upcoming season.\n\nWarmest regards,\nFounder, ${capIdea.split(" ")[0] || "Brand Engine"}`;
    emailCta = `Lock In My Seasonal Subscription Space`;
    
    linkedinText = `Can a physical subscription box deliver genuine sanctuary? 🧁\n\nMost modern retail brands obsess strictly over logistics, unit sizes, and shipping weights.\n\nBut elite brands specialize in the curation of ritual.\n\nBy uniting rare artisan food crafts with premium hand-blended teas for ${rawAudience}, client satisfaction metrics surged by an astonishing 72%.\n\nLesson learned: Don't sell the item. Sell the beautiful ritual that honors the craft.\n\nWould you sign up for these elevated culinary rituals? Let me know below!\n\n#creativestartup #customerexperience #artisanbranding`;
  } else if (isServiceOrConsulting) {
    headline = `Strategic Growth Audits, Crafted for Relentless Execution.`;
    subheadline = `We relieve the intense manual burden of operational setup for ${rawAudience}, empowering you to focus purely on high-leverage client growth.`;
    ctaText = `Schedule Your Strategic Discovery Call`;
    
    emailSubject = `📈 Elevate your premium client throughput starting today`;
    emailBody = `Hello Operator,\n\nIf you're still tracking high-end client pipelines with manual spreadsheets, you are leaving thousands of dollars in high-leverage revenue on the floor.\n\nWe launched "${capIdea}" to assist ${rawAudience} in building bulletproof client onboarding flows and automated followups on autopilot.\n\nNo complexity. No loose ends. Just high-impact delivery.\n\nBook your free 15-minute operational audit with our leadership team today.\n\nTo your continuous scale,\nThe Advisory Team`;
    emailCta = `Book Your Free Strategic Audit`;
  }

  return {
    landingPageHook: { headline, subheadline, ctaText },
    productLaunchEmail: { subject: emailSubject, body: emailBody, cta: emailCta },
    viralLinkedInPost: { text: linkedinText }
  };
}
