import { useState, useCallback } from 'react';
import { 
  Copy, 
  RefreshCw, 
  AlertTriangle, 
  Scroll, 
  Languages, 
  Type,
  Sparkles,
  Info,
  X,
  BookOpen,
  History
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Transliteration mapping from Python file
const REPLACEMENTS: Record<string, string> = {
  'gh': 'G',
  'ng': 'N',
  'ny': 'Y',
  'kh': 'K',
  'sy': 'H',
  'th': 'T',
  'dh': 'D',
  'ks': 'S',
  'e1': 'e',  // e pepet
  'e4': 'E'   // e taling
};

// Mapping display data
const MAPPING_DISPLAY = [
  { from: 'gh', to: 'G', desc: 'gha' },
  { from: 'ng', to: 'N', desc: 'nga' },
  { from: 'ny', to: 'Y', desc: 'nya' },
  { from: 'kh', to: 'K', desc: 'kha' },
  { from: 'sy', to: 'H', desc: 'sya' },
  { from: 'th', to: 'T', desc: 'tha' },
  { from: 'dh', to: 'D', desc: 'dha' },
  { from: 'ks', to: 'S', desc: 'ksa' },
  { from: 'e1', to: 'e', desc: 'e pepet' },
  { from: 'e4', to: 'E', desc: 'e taling' },
];

// Convert input function (from Python)
const convertInput = (inputString: string): { output: string; changes: string[] } => {
  let result = inputString;
  const changes: string[] = [];

  // Apply transliteration
  for (const [key, value] of Object.entries(REPLACEMENTS)) {
    if (result.includes(key)) {
      result = result.replaceAll(key, value);
      changes.push(`${key} → ${value}`);
    }
  }

  return { output: result, changes };
};

// Check for unspecified 'e'
const checkForUnspecifiedE = (input: string): string[] => {
  const words = input.split(/\s+/);
  return words.filter(word => 
    word.includes('e') && !word.includes('e1') && !word.includes('e4')
  );
};

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [changes, setChanges] = useState<string[]>([]);
  const [errorWords, setErrorWords] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [sampleIndex, setSampleIndex] = useState(0);
  
  const SAMPLES = ['Saya suka makan kfc', 'me1re4ka orang yang baik'];

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Convert to lowercase for alphabetic characters
    const processed = value.split('').map(char => 
      /[a-zA-Z]/.test(char) ? char.toLowerCase() : char
    ).join('');
    
    // Check for unspecified 'e'
    const unspecifiedE = checkForUnspecifiedE(processed);
    setErrorWords(unspecifiedE);
    
    // Convert
    const { output: converted, changes: changeList } = convertInput(processed);
    setOutput(converted);
    setChanges(changeList);
  }, []);

  // Clear input
  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setChanges([]);
    setErrorWords([]);
  }, []);

  // Copy to clipboard
  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Sample text - toggle between samples
  const loadSample = useCallback(() => {
    const sample = SAMPLES[sampleIndex];
    setInput(sample);
    setSampleIndex((prev) => (prev + 1) % SAMPLES.length);
    
    const processed = sample.split('').map(char => 
      /[a-zA-Z]/.test(char) ? char.toLowerCase() : char
    ).join('');
    
    const unspecifiedE = checkForUnspecifiedE(processed);
    setErrorWords(unspecifiedE);
    
    const { output: converted, changes: changeList } = convertInput(processed);
    setOutput(converted);
    setChanges(changeList);
  }, [sampleIndex]);

  return (
    <div className="min-h-screen ancient-bg">
      {/* Header */}
      <header className="relative py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Scroll className="w-8 h-8 text-[#C9A962]" />
            <h1 className="text-4xl md:text-5xl font-bold ancient-title">
              Neo-Rencong Transliterator
            </h1>
            <Sparkles className="w-8 h-8 text-[#C9A962]" />
          </div>
          <p className="ancient-subtitle text-lg mt-2">
            Transform Rumi script into ancient Rencong characters
          </p>
          <div className="section-divider mt-2 max-w-md mx-auto" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-12">
        {/* Error Banner */}
        {errorWords.length > 0 && (
          <div className="warning-banner flex items-start gap-3 animate-pulse">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Please specify your 'e' characters:</p>
              <p className="text-sm mt-1 opacity-90">
                Words with unspecified 'e': <span className="font-mono">{errorWords.join(', ')}</span>
              </p>
              <p className="text-xs mt-2 opacity-75">
                Use <code className="bg-black/20 px-1 rounded">e1</code> for e pepet and <code className="bg-black/20 px-1 rounded">e4</code> for e taling
              </p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="ornate-border corner-decoration p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-[#C9A962]" />
                <label className="io-label">Input (Rumi)</label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={loadSample}
                  className="copy-btn text-xs"
                  title="Load sample text"
                >
                  <Sparkles className="w-3 h-3" />
                  Sample
                </button>
                {input && (
                  <button
                    onClick={handleClear}
                    className="copy-btn text-xs"
                    title="Clear input"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>
            <ScrollArea className="scroll-area">
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Enter your Rumi sentence here...

Examples:
- saya makan nasi goreng
- thai food is delicious
- e1 for e pepet, e4 for e taling"
                className="io-box custom-scrollbar"
                spellCheck={false}
              />
            </ScrollArea>
            <div className="flex justify-between items-center mt-3 text-xs text-[#C9A962]/60">
              <span>{input.length} characters</span>
              <span>{input.split(/\s+/).filter(w => w).length} words</span>
            </div>
          </div>

          {/* Output Section - Transliterated */}
          <div className="ornate-border corner-decoration p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-[#C9A962]" />
                <label className="io-label">Transliterated (Latin)</label>
              </div>
              <button
                onClick={() => handleCopy(output)}
                className={`copy-btn ${copied ? 'copied' : ''}`}
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <ScrollArea className="scroll-area">
              <textarea
                value={output}
                readOnly
                placeholder="Transliterated output will appear here..."
                className="io-box custom-scrollbar bg-black/20"
                spellCheck={false}
              />
            </ScrollArea>
            <div className="flex justify-between items-center mt-3 text-xs text-[#C9A962]/60">
              <span>{output.length} characters</span>
              {changes.length > 0 && (
                <span className="text-[#C9A962]">{changes.length} conversions</span>
              )}
            </div>
          </div>
        </div>

        {/* Rencong Script Output */}
        <div className="mt-6 ornate-border corner-decoration p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scroll className="w-5 h-5 text-[#C9A962]" />
              <label className="io-label">Rencong Script Display</label>
            </div>
            <button
              onClick={() => handleCopy(output)}
              className={`copy-btn ${copied ? 'copied' : ''}`}
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          {/* Replace the entire ScrollArea section with this */}
<div 
  className={`h-[300px] w-full rounded-md border border-[rgba(201,169,98,0.3)] ${output ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}
  style={{ backgroundColor: 'rgba(245, 230, 211, 0.08)' }}
>
  {output ? (
    <div 
      className="w-full p-6"
    style={{ 
      fontFamily: "'Aksara Rencong', serif",
      fontSize: '42px',  // or whatever size you chose
      lineHeight: '1.0',
      letterSpacing: '-0.02em',
      wordSpacing: '0.15em',
      wordBreak: 'break-word',      /* Add this to force wrap */
      whiteSpace: 'normal',         /* Change from pre-wrap to normal */
      overflowWrap: 'break-word',    /* Ensure long strings break */
      color: '#F5E6D3',
      boxSizing: 'border-box'
    }}
  >
    {output}
    </div>
  ) : (
    <div className="w-full h-[300px] flex items-center justify-center">
      <span 
        className="text-[#C9A962]/40 italic text-2xl"
        style={{ fontFamily: "'Cinzel', Georgia, serif" }}
      >
        Rencong script will appear here...
      </span>
    </div>
    )}
</div>
          <p className="text-xs text-[#C9A962]/50 mt-3 text-center">
            Displayed using Aksara Rencong font
          </p>
        </div>

        {/* Special Character Mapping Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#C9A962] flex items-center gap-2">
              <Info className="w-5 h-5" />
              Special Character Mapping
            </h2>
            <Dialog open={showMapping} onOpenChange={setShowMapping}>
              <DialogTrigger asChild>
                <button className="ancient-btn text-sm">
                  View Full Reference
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-[#2C1810] border border-[#C9A962]/30">
                <DialogHeader>
                  <DialogTitle className="text-[#C9A962] text-2xl flex items-center gap-2">
                    <Scroll className="w-6 h-6" />
                    Complete Character Mapping
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  {MAPPING_DISPLAY.map((item, index) => (
                    <div key={index} className="mapping-card p-4">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="text-lg text-[#F5E6D3] font-mono">{item.from}</span>
                        <span className="text-[#C9A962]">→</span>
                        <span className="text-2xl text-[#C9A962] font-bold">{item.to}</span>
                      </div>
                      <p className="text-xs text-[#F5E6D3]/60">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-[#C9A962]/10 rounded-lg border border-[#C9A962]/20">
                  <p className="text-sm text-[#F5E6D3]/80">
                    <strong className="text-[#C9A962]">Note:</strong> Type the left column characters 
                    in your input, and they will be automatically converted to the right column characters.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quick Mapping Grid */}
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {MAPPING_DISPLAY.map((item, index) => (
              <div key={index} className="mapping-card">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-[#F5E6D3]/60 font-mono">{item.from}</span>
                  <span className="text-lg text-[#C9A962] font-bold">{item.to}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Details */}
        {changes.length > 0 && (
          <div className="mt-6 ornate-border p-4">
            <h3 className="text-sm font-semibold text-[#C9A962] mb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Conversions Applied
            </h3>
            <div className="flex flex-wrap gap-2">
              {changes.map((change, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 rounded-full text-xs bg-[#C9A962]/10 border border-[#C9A962]/30 text-[#C9A962]"
                >
                  {change}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 ornate-border">
          <h3 className="text-lg font-bold text-[#C9A962] mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            How to Use
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-[#F5E6D3]/80">
            <div>
              <h4 className="font-semibold text-[#C9A962] mb-2">Basic Usage</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A962]">1.</span>
                  Type your Rumi text in the input box
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A962]">2.</span>
                  The transliterated output appears automatically
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A962]">3.</span>
                  The Rencong script display shows the result in traditional font
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#C9A962] mb-2">Special Characters</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <code className="bg-black/30 px-1 rounded text-[#C9A962]">e1</code>
                  <span>for e pepet (schwa sound)</span>
                </li>
                <li className="flex items-start gap-2">
                  <code className="bg-black/30 px-1 rounded text-[#C9A962]">e4</code>
                  <span>for e taling (strong/closed e sound)</span>
                </li>
                <li className="flex items-start gap-2">
                  <code className="bg-black/30 px-1 rounded text-[#C9A962]">gh, ng, ny...</code>
                  <span>for special consonant clusters</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* About Us Section */}
        <div className="mt-8 p-6 ornate-border">
          <h3 className="text-lg font-bold text-[#C9A962] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            About Rencong
          </h3>
          <div className="space-y-4 text-sm text-[#F5E6D3]/80 leading-relaxed">
            <p>
              <strong className="text-[#C9A962]">Rencong</strong> is one of the oldest indigenous writing systems in the Malay world. 
              It was traditionally used to record local languages in Sumatra, especially in regions such as Bengkulu, 
              Kerinci and parts of South Sumatra. The script is characterized by its sharp, angular strokes, a feature 
              believed to have developed from writing on bamboo, bark and other natural materials. As a pre-Islamic script, 
              Rencong reflects an early stage of literacy in the region before the widespread adoption of Jawi.
            </p>
            <p>
              Historically, Rencong emerged from the broader family of Indic-influenced scripts that spread across 
              Southeast Asia through trade and cultural exchange. Over time, it evolved into distinct local variants 
              while maintaining structural similarities with other regional scripts. Communities used it for recording 
              customary laws, poetry, incantations and personal notes, making it not only a writing system but also 
              a vessel of cultural memory.
            </p>
            <p>
              Rencong is closely connected to the wider Malay civilization. Although it predates Jawi, both scripts 
              represent different phases of Malay intellectual history. Rencong illustrates the early linguistic identity 
              of Malay societies in Sumatra, while Jawi later became dominant with the arrival of Islam. Together, they 
              demonstrate the richness and continuity of Malay written tradition across centuries.
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-[#C9A962]/20">
            <h4 className="text-md font-bold text-[#C9A962] mb-3 flex items-center gap-2">
              <History className="w-4 h-4" />
              The Neo-Rencong Vision
            </h4>
            <p className="text-sm text-[#F5E6D3]/80 leading-relaxed">
              This project was initiated in <strong className="text-[#C9A962]">2024</strong> with a passionate vision: 
              to relive the Rencong script and demonstrate its enduring importance in Malay lives. I have revised the 
              traditional Rencong spelling rules to suit modern Malay spelling conventions, making this ancient script 
              accessible and practical for contemporary use. Neo-Rencong bridges the past and present, ensuring that 
              this remarkable heritage continues to thrive in the digital age.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-[#C9A962]/40 text-sm">
        <div className="section-divider max-w-xs mx-auto mb-4" />
        <p>Neo-Rencong Transliterator — Reviving Ancient Heritage</p>
      </footer>
    </div>
  );
}
