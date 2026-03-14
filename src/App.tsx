import { useState, useCallback, useEffect } from 'react';
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
  History,
  Printer,
  FileArchive
} from 'lucide-react';
import { ChevronLeft, ChevronRight, Landmark } from 'lucide-react';
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
  'e1': 'e',   // e pepet
  'e4': 'E',   // e taling
  '-': 'O'    // dash to capital O
};

const RENCONG_FACTS = [
  {
    id: 1,
    title: "Austronesian Roots",
    content: "Rencong is a native 'Surat Ulu' script of Sumatra, evolving from ancient Brahmi influences into a unique Malay-Polynesian writing system used long before colonial contact."
  },
  {
    id: 2,
    title: "The Kerinci Connection",
    content: "While the name mirrors the famous Acehnese dagger, the Rencong script is the soul of the Kerinci highlands in Jambi, used by the Malay-Minangkabau people to record their history."
  },
  {
    id: 3,
    title: "Organic Mediums",
    content: "Ancient Malays carved Rencong into 'gelumpai' (bamboo strips), 'nipah' leaves, and buffalo horn, using sharp knives or 'kalam' to etch the angular characters."
  },
  
  {
    id: 4,
    title: "The Ulu Script Family",
    content: "It is part of the distinct 'Surat Ulu' (Upstream Script) family, alongside Rejang and Lampung, representing the high literacy of inland Malay civilizations."
  },
  {
    id: 5,
    title: "The Jawi Transition",
    content: "As Islam spread through the Malay Archipelago, Rencong was gradually replaced by Jawi (Arabic-Malay) for religious texts, though it remained a secret script for local lore."
  },
  {
    id: 6,
    title: "Identity Revival",
    content: "Today, Rencong is a symbol of regional Malay pride. Local governments in Jambi and Sumatra are digitizing these ancient texts to preserve them for the next generation."
  },
  {
    id: 7,
    title: "Pre-Islamic Literacy",
    content: "Rencong proves that Malay society possessed a sophisticated writing system for laws and poetry centuries before the adoption of Latin or Arabic alphabets."
  },
  {
    id: 8,
    title: "Sacred Manuscripts",
    content: "The script was used for 'Tambo' (histories) and 'Mantera' (incantations), acting as a sacred vessel for the ancestral wisdom of the Malay world."
  }
];

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

// Check for unspecified 'e' (ONLY lowercase e, NEVER uppercase E)
const checkForUnspecifiedE = (input: string): string[] => {
  const words = input.split(/\s+/);
  return words.filter(word => {
    // First, replace all valid e1 and e4 sequences with placeholders
    // so they don't trigger the warning
    const cleaned = word
      .replace(/e1/g, 'XX')  // Replace e1 with placeholder
      .replace(/e4/g, 'XX'); // Replace e4 with placeholder
    
    // Only check for lowercase 'e' - uppercase 'E' is always valid
    // Use a loop to check each character to be explicit
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === 'e') {
        return true; // Found lowercase e that's not part of e1/e4
      }
    }
    return false;
  });
};

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [changes, setChanges] = useState<string[]>([]);
  const [errorWords, setErrorWords] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [forceLowercase, setForceLowercase] = useState(true); // Toggle state
  const [isBlocked, setIsBlocked] = useState(false); // Block output when unspecified e exists
  const SAMPLES = ['Saya suka makan kfc', 'me1re4ka orang yang baik'];
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isFactTransitioning, setIsFactTransitioning] = useState(false);

  // Auto-advance facts every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNextFact();
    }, 6000);
    
    return () => clearInterval(interval);
  }, [currentFactIndex]);

  const handleNextFact = useCallback(() => {
    setIsFactTransitioning(true);
    setTimeout(() => {
      setCurrentFactIndex((prev) => (prev + 1) % RENCONG_FACTS.length);
      setIsFactTransitioning(false);
    }, 300);
  }, []);

  const handlePrevFact = useCallback(() => {
    setIsFactTransitioning(true);
    setTimeout(() => {
      setCurrentFactIndex((prev) => (prev - 1 + RENCONG_FACTS.length) % RENCONG_FACTS.length);
      setIsFactTransitioning(false);
    }, 300);
  }, []);

  const goToFact = useCallback((index: number) => {
    if (index === currentFactIndex) return;
    setIsFactTransitioning(true);
    setTimeout(() => {
      setCurrentFactIndex(index);
      setIsFactTransitioning(false);
    }, 300);
  }, [currentFactIndex]);

  // Separate processing function that can be called from multiple places
const processInput = useCallback((value: string, lowercaseMode: boolean) => {
  let processed: string;
  
  if (lowercaseMode) {
    // When toggle is ON: Force everything to lowercase except 'O' (from dash) and 'E'
    processed = value.split('').map(char => {
      if (char === '-') {
        return 'O'; // Dash becomes O (preserve as uppercase)
      }
      if (char === 'E') {
        return 'E'; // Capital E always stays as E (not affected by toggle)
      }
      if (/[a-zA-Z]/.test(char)) {
        return char.toLowerCase(); // Everything else lowercase
      }
      return char; // Non-letters stay same
    }).join('');
  } else {
    // When toggle is OFF: Keep all letters as-is (allow uppercase)
    processed = value.split('').map(char => {
      if (char === '-') {
        return 'O'; // Dash still becomes O
      }
      return char;
    }).join('');
  }

  // Check for unspecified 'e'
  const unspecifiedE = checkForUnspecifiedE(processed);
  setErrorWords(unspecifiedE);
  
  // BLOCK OUTPUT if there are unspecified e
  if (unspecifiedE.length > 0) {
    setIsBlocked(true);
    setOutput('');
    setChanges([]);
    return; // Stop here - don't process further
  }
  
  setIsBlocked(false);

  // Convert (apply other transliterations)
  const { output: converted, changes: changeList } = convertInput(processed);
  setOutput(converted);
  setChanges(changeList);
}, []);

  // Handle input change
const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const value = e.target.value;
  setInput(value);
  processInput(value, forceLowercase);
}, [forceLowercase, processInput]);

// Handle toggle switch change - re-process existing input
const handleToggleChange = useCallback(() => {
  const newValue = !forceLowercase;
  setForceLowercase(newValue);
  // Re-process existing input with new toggle state
  if (input) {
    processInput(input, newValue);
  }
}, [forceLowercase, input, processInput]);

  // Clear input
  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setChanges([]);
    setErrorWords([]);
    setIsBlocked(false); 
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

  // Print Rencong to PDF with alignment options - FIXED VERSION
  const handlePrintRencong = useCallback(async () => {
    if (!output) return;

    // Open new window for print preview
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to use the print feature');
      return;
    }

    // Write complete HTML document to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Neo-Rencong Output</title>
          <meta charset="UTF-8">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
          <style>
            @font-face {
              font-family: 'Aksara Rencong';
              src: url('/fonts/AksaraRencong-Regular.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              margin: 0;
              padding: 20px;
              background: #525659;
              font-family: 'Segoe UI', Arial, sans-serif;
              min-height: 100vh;
            }
            
            .main-container {
              display: flex;
              gap: 20px;
              max-width: 1400px;
              margin: 0 auto;
              min-height: calc(100vh - 40px);
            }
            
            .control-panel {
              width: 280px;
              flex-shrink: 0;
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.15);
              padding: 24px;
              position: sticky;
              top: 20px;
              height: fit-content;
              max-height: calc(100vh - 40px);
              overflow-y: auto;
              border: 1px solid #e0e0e0;
            }
            
            .control-panel h3 {
              font-family: 'Segoe UI', Arial, sans-serif;
              font-size: 18px;
              font-weight: 600;
              color: #2c3e50;
              margin-bottom: 20px;
              padding-bottom: 12px;
              border-bottom: 2px solid #3498db;
            }
            
            .control-group {
              margin-bottom: 24px;
            }
            
            .control-group label {
              display: block;
              font-family: 'Segoe UI', Arial, sans-serif;
              font-size: 12px;
              font-weight: 600;
              color: #555;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .orientation-group {
              display: flex;
              gap: 10px;
            }
            
            .orientation-btn {
              flex: 1;
              padding: 12px 8px;
              border: 2px solid #e0e0e0;
              background: #f8f9fa;
              border-radius: 8px;
              cursor: pointer;
              font-family: 'Segoe UI', Arial, sans-serif;
              font-size: 13px;
              font-weight: 500;
              color: #555;
              transition: all 0.2s;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 6px;
            }
            
            .orientation-btn:hover {
              border-color: #3498db;
              background: #ebf5fb;
            }
            
            .orientation-btn.active {
              border-color: #3498db;
              background: #3498db;
              color: white;
            }
            
            .orientation-btn svg {
              width: 24px;
              height: 24px;
            }
            
            .alignment-group {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
            }
            
            .alignment-btn {
              padding: 10px;
              border: 2px solid #e0e0e0;
              background: #f8f9fa;
              border-radius: 6px;
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .alignment-btn:hover {
              border-color: #3498db;
              background: #ebf5fb;
            }
            
            .alignment-btn.active {
              border-color: #3498db;
              background: #3498db;
            }
            
            .alignment-btn svg {
              width: 20px;
              height: 20px;
              stroke: #555;
              stroke-width: 2;
              fill: none;
            }
            
            .alignment-btn.active svg {
              stroke: white;
            }
            
            .slider-container {
              background: #f8f9fa;
              padding: 16px;
              border-radius: 8px;
              border: 1px solid #e0e0e0;
            }
            
            .slider-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            
            .slider-value {
              font-family: 'Segoe UI', Arial, sans-serif;
              font-size: 14px;
              font-weight: 600;
              color: #3498db;
              background: white;
              padding: 4px 10px;
              border-radius: 4px;
              border: 1px solid #3498db;
              min-width: 50px;
              text-align: center;
            }
            
            input[type="range"] {
              width: 100%;
              height: 6px;
              background: #e0e0e0;
              border-radius: 3px;
              outline: none;
              cursor: pointer;
              -webkit-appearance: none;
            }
            
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              width: 20px;
              height: 20px;
              background: #3498db;
              border-radius: 50%;
              cursor: grab;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }
            
            input[type="range"]::-webkit-slider-thumb:hover {
              background: #2980b9;
              transform: scale(1.1);
            }
            
            .toggle-container {
              display: flex;
              align-items: center;
              justify-content: space-between;
              background: #f8f9fa;
              padding: 14px;
              border-radius: 8px;
              border: 1px solid #e0e0e0;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .toggle-container:hover {
              border-color: #3498db;
              background: #ebf5fb;
            }
            
            .toggle-switch {
              position: relative;
              width: 48px;
              height: 26px;
              background: #ccc;
              border-radius: 13px;
              transition: background 0.3s;
            }
            
            .toggle-switch.active {
              background: #3498db;
            }
            
            .toggle-thumb {
              position: absolute;
              top: 3px;
              left: 3px;
              width: 20px;
              height: 20px;
              background: white;
              border-radius: 50%;
              transition: transform 0.3s;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            
            .toggle-switch.active .toggle-thumb {
              transform: translateX(22px);
            }
            
            .save-pdf-btn {
              width: 100%;
              padding: 14px;
              background: #3498db;
              color: white;
              border: none;
              border-radius: 8px;
              font-family: 'Segoe UI', Arial, sans-serif;
              font-size: 15px;
              font-weight: 600;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              transition: all 0.2s;
              box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
              margin-top: 10px;
            }
            
            .save-pdf-btn:hover {
              background: #2980b9;
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
            }
            
            .save-pdf-btn:active {
              transform: translateY(0);
            }
            
            .pages-container {
              flex: 1;
              display: none;
              flex-direction: column;
              align-items: center;
              gap: 40px;
              padding-bottom: 40px;
            }
            
            .pages-container.visible {
              display: flex;
            }
            
            .page-wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 8px;
            }
            
            .page {
              width: 210mm;
              height: 297mm;
              background: white;
              box-shadow: 0 4px 20px rgba(0,0,0,0.3);
              position: relative;
              overflow: hidden;
              page-break-after: always;
              page-break-inside: avoid;
              display: flex;
              flex-direction: column;
            }
            
            .page.landscape {
              width: 297mm;
              height: 210mm;
            }
            
            .page-number {
              font-family: 'Segoe UI', Arial, sans-serif;
              font-size: 12px;
              color: #999;
              background: #f5f5f5;
              padding: 6px 16px;
              border-radius: 12px;
              border: 1px solid #ddd;
            }
            
            .page-content {
              flex: 1;
              width: 100%;
              padding: 25.4mm;
              overflow-wrap: break-word;
              word-wrap: break-word;
              hyphens: auto;
              display: flex;
              flex-direction: column;
            }
            
            .page.landscape .page-content {
              padding: 25.4mm;
            }
            
            .rencong-text {
              font-family: 'Aksara Rencong', serif;
              font-size: 42px;
              line-height: 1.0;
              color: #000;
              white-space: pre-wrap;
              overflow-wrap: break-word;
              word-wrap: break-word;
              word-break: break-word;
              width: 100%;
            }
            
            .align-left {
              text-align: left;
            }
            
            .align-center {
              text-align: center;
            }
            
            .align-right {
              text-align: right;
            }
            
            .align-justify {
              text-align: justify;
              text-justify: inter-word;
            }
            
            .valign-center {
              justify-content: center;
            }
            
            .valign-top {
              justify-content: flex-start;
            }
            
            .initial-message {
              position: absolute;
              top: 50%;
              left: calc(50% + 140px);
              transform: translate(-50%, -50%);
              text-align: center;
              color: #666;
              font-family: 'Segoe UI', Arial, sans-serif;
              padding: 40px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              max-width: 400px;
              z-index: 1000;
            }
            
            @media screen and (max-width: 1200px) {
              .main-container {
                flex-direction: column;
              }
              
              .control-panel {
                width: 100%;
                position: relative;
                top: 0;
                max-height: none;
              }
              
              .page {
                transform: scale(0.7);
                transform-origin: top center;
              }
              
              .initial-message {
                left: 50%;
                position: relative;
                transform: translate(-50%, 0);
                margin-top: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="main-container">
            <!-- Left Control Panel -->
            <div class="control-panel no-print">
              <h3>Page Settings</h3>
              
              <!-- Orientation -->
              <div class="control-group">
                <label>Orientation</label>
                <div class="orientation-group">
                  <button class="orientation-btn" id="portraitBtn" onclick="setOrientation('portrait')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/></svg>
                    Portrait
                  </button>
                  <button class="orientation-btn" id="landscapeBtn" onclick="setOrientation('landscape')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
                    Landscape
                  </button>
                </div>
              </div>
              
              <!-- Alignment -->
              <div class="control-group">
                <label>Text Alignment</label>
                <div class="alignment-group">
                  <button class="alignment-btn" id="alignLeft" onclick="setAlignment('left')" title="Left">
                    <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h16"/></svg>
                  </button>
                  <button class="alignment-btn active" id="alignCenter" onclick="setAlignment('center')" title="Center">
                    <svg viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M4 18h16"/></svg>
                  </button>
                  <button class="alignment-btn" id="alignRight" onclick="setAlignment('right')" title="Right">
                    <svg viewBox="0 0 24 24"><path d="M4 6h16M10 12h10M4 18h16"/></svg>
                  </button>
                  <button class="alignment-btn" id="alignJustify" onclick="setAlignment('justify')" title="Justify">
                    <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                  </button>
                </div>
              </div>
              
              <!-- Font Size -->
              <div class="control-group">
                <label>Font Size</label>
                <div class="slider-container">
                  <div class="slider-header">
                    <span>Size</span>
                    <span class="slider-value" id="fontSizeValue">42px</span>
                  </div>
                  <input type="range" id="fontSizeSlider" min="12" max="120" value="42" oninput="updateFontSize()">
                </div>
              </div>
              
              <!-- Line Spacing -->
              <div class="control-group">
                <label>Line Spacing</label>
                <div class="slider-container">
                  <div class="slider-header">
                    <span>Spacing</span>
                    <span class="slider-value" id="lineSpacingValue">1.0</span>
                  </div>
                  <input type="range" id="lineSpacingSlider" min="0.8" max="3.0" step="0.1" value="1.0" oninput="updateLineSpacing()">
                </div>
              </div>
              
              <!-- Vertical Align Toggle -->
              <div class="control-group">
                <label>Vertical Position</label>
                <div class="toggle-container" onclick="toggleVerticalAlign()">
                  <span style="font-size: 14px; color: #555;">Center vertically</span>
                  <div class="toggle-switch active" id="vAlignToggle">
                    <div class="toggle-thumb"></div>
                  </div>
                </div>
              </div>
              
              <!-- Save As PDF Button -->
              <button class="save-pdf-btn" id="savePdfBtn" onclick="generatePDF()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Save As PDF
              </button>
            </div>
            
            <!-- Pages Container -->
            <div class="pages-container" id="pagesContainer">
              <!-- Pages will be generated here -->
            </div>
            
            <!-- Initial State Message -->
            <div class="initial-message" id="initialMessage">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="1.5" style="margin-bottom: 16px;">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <h3 style="margin: 0 0 12px 0; color: #2c3e50; font-size: 18px; font-weight: 600;">Select Orientation First</h3>
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
                Please choose either <strong style="color: #3498db;">Portrait</strong> or <strong style="color: #3498db;">Landscape</strong> orientation to preview your document.
              </p>
            </div>
          </div>

          <script>
            // Wait for libraries to load
            window.onload = function() {
              init();
            };
            
            // Configuration
            let currentOrientation = 'portrait';
            let currentAlignment = 'center';
            let currentFontSize = 42;
            let currentLineSpacing = 1.0;
            let isVerticallyCentered = true;
            let orientationSelected = false;
            
            const output = ${JSON.stringify(output)};
            
            // Page dimensions (in mm)
            const PAGE_WIDTH = 210;
            const PAGE_HEIGHT = 297;
            const MARGIN = 25.4;
            
            function init() {
              // Set initial active states
              document.getElementById('alignCenter').classList.add('active');
              document.getElementById('vAlignToggle').classList.add('active');
            }
            
            function setOrientation(orientation) {
              currentOrientation = orientation;
              
              // Update button styles
              document.getElementById('portraitBtn').classList.toggle('active', orientation === 'portrait');
              document.getElementById('landscapeBtn').classList.toggle('active', orientation === 'landscape');
              
              if (!orientationSelected) {
                orientationSelected = true;
                document.getElementById('initialMessage').style.display = 'none';
                document.getElementById('pagesContainer').classList.add('visible');
              }
              
              renderPages();
            }
            
            function setAlignment(alignment) {
              currentAlignment = alignment;
              
              // Remove active from all
              document.querySelectorAll('.alignment-btn').forEach(btn => {
                btn.classList.remove('active');
              });
              
              // Add active to selected
              const btnId = 'align' + alignment.charAt(0).toUpperCase() + alignment.slice(1);
              document.getElementById(btnId).classList.add('active');
              
              renderPages();
            }
            
            function updateFontSize() {
              currentFontSize = parseInt(document.getElementById('fontSizeSlider').value);
              document.getElementById('fontSizeValue').textContent = currentFontSize + 'px';
              renderPages();
            }
            
            function updateLineSpacing() {
              currentLineSpacing = parseFloat(document.getElementById('lineSpacingSlider').value);
              document.getElementById('lineSpacingValue').textContent = currentLineSpacing.toFixed(1);
              renderPages();
            }
            
            function toggleVerticalAlign() {
              isVerticallyCentered = !isVerticallyCentered;
              document.getElementById('vAlignToggle').classList.toggle('active', isVerticallyCentered);
              renderPages();
            }
            
            function renderPages() {
              if (!orientationSelected) return;
              
              const container = document.getElementById('pagesContainer');
              container.innerHTML = '';
              
              const isLandscape = currentOrientation === 'landscape';
              const contentWidthMm = isLandscape ? (PAGE_HEIGHT - (MARGIN * 2)) : (PAGE_WIDTH - (MARGIN * 2));
              const contentHeightMm = isLandscape ? (PAGE_WIDTH - (MARGIN * 2)) : (PAGE_HEIGHT - (MARGIN * 2));
              
              const mmToPx = 96 / 25.4;
              const contentWidthPx = contentWidthMm * mmToPx;
              const contentHeightPx = contentHeightMm * mmToPx;
              
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              ctx.font = currentFontSize + 'px "Aksara Rencong", serif';
              
              const lineHeightPx = currentFontSize * currentLineSpacing;
              
              // Split by newlines first, then process each paragraph
              const paragraphs = output.split('\\n');
              const allLines = [];
              
              paragraphs.forEach((paragraph, pIndex) => {
                const words = paragraph.trim().split(/\\s+/).filter(w => w.length > 0);
                let currentLine = '';
                
                for (let i = 0; i < words.length; i++) {
                  const word = words[i];
                  const testLine = currentLine ? currentLine + ' ' + word : word;
                  const metrics = ctx.measureText(testLine);
                  
                  if (metrics.width > contentWidthPx && currentLine !== '') {
                    allLines.push(currentLine);
                    currentLine = word;
                  } else {
                    currentLine = testLine;
                  }
                }
                
                if (currentLine) {
                  allLines.push(currentLine);
                }
                
                // Only add empty line if user actually entered an empty paragraph (double Enter)
                if (pIndex < paragraphs.length - 1 && paragraph === '') {
                  allLines.push('');
                }
              });
              
              const pages = [];
              let currentPageLines = [];
              let currentPageHeight = 0;
              
              for (let i = 0; i < allLines.length; i++) {
                const lineHeight = lineHeightPx;
                const projectedHeight = currentPageHeight + lineHeight;
                const maxHeightWithBuffer = contentHeightPx * 0.95;
                
                if (projectedHeight > maxHeightWithBuffer && currentPageLines.length > 0) {
                  pages.push(currentPageLines);
                  currentPageLines = [allLines[i]];
                  currentPageHeight = lineHeight;
                } else {
                  currentPageLines.push(allLines[i]);
                  currentPageHeight += lineHeight;
                }
              }
              
              if (currentPageLines.length > 0) {
                pages.push(currentPageLines);
              }
              
              if (pages.length === 0) {
                pages.push([]);
              }
              
              pages.forEach((pageLines, index) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'page-wrapper';
                
                const pageNumber = document.createElement('div');
                pageNumber.className = 'page-number';
                pageNumber.textContent = 'Page ' + (index + 1) + ' of ' + pages.length;
                
                const page = document.createElement('div');
                page.className = 'page ' + currentOrientation;
                
                const content = document.createElement('div');
                content.className = 'page-content ' + (isVerticallyCentered ? 'valign-center' : 'valign-top');
                
                const textDiv = document.createElement('div');
                textDiv.className = 'rencong-text align-' + currentAlignment;
                textDiv.style.fontSize = currentFontSize + 'px';
                textDiv.style.lineHeight = currentLineSpacing;
                textDiv.innerHTML = pageLines.map(line => line || '<br>').join('<br>');
                
                content.appendChild(textDiv);
                page.appendChild(content);
                wrapper.appendChild(pageNumber);
                wrapper.appendChild(page);
                container.appendChild(wrapper);
              });
            }
            
            async function generatePDF() {
              if (!orientationSelected) {
                alert('Please select an orientation first');
                return;
              }
              
              if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
                alert('Libraries still loading. Please wait a moment and try again.');
                return;
              }
              
              const { jsPDF } = window.jspdf;
              const pages = document.querySelectorAll('.page');
              
              if (pages.length === 0) return;
              
              const isLandscape = currentOrientation === 'landscape';
              const pdf = new jsPDF({
                orientation: isLandscape ? 'landscape' : 'portrait',
                unit: 'mm',
                format: 'a4'
              });
              
              for (let i = 0; i < pages.length; i++) {
                if (i > 0) pdf.addPage();
                
                const canvas = await html2canvas(pages[i], {
                  scale: 2,
                  useCORS: true,
                  allowTaint: true,
                  backgroundColor: '#ffffff'
                });
                
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = isLandscape ? 297 : 210;
                const imgHeight = isLandscape ? 210 : 297;
                
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
              }
              
              pdf.save('rencong-document.pdf');
            }
          <\/script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  }, [output]);

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
  <div className="flex gap-2 items-center">
    {/* Toggle Switch */}
    <div className="flex items-center gap-2 mr-2">
      <span className="text-xs text-[#C9A962]/70">Lowercase</span>
      <button
  onClick={handleToggleChange}
  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
    forceLowercase ? 'bg-[#C9A962]' : 'bg-[#C9A962]/30'
  }`}
  title={forceLowercase ? "Force lowercase ON" : "Force lowercase OFF"}
>
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            forceLowercase ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
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
              {/* Facts Carousel */}
                <div className="mt-4 p-4 bg-[#C9A962]/5 rounded-lg border border-[#C9A962]/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Landmark className="w-4 h-4 text-[#C9A962]" />
                    <span className="text-xs font-semibold text-[#C9A962] uppercase tracking-wider">Did You Know?</span>
                  </div>
                  
                  <div className="relative overflow-hidden min-h-[80px]">
                    <div 
                      className={`transition-all duration-300 ease-in-out ${
                        isFactTransitioning 
                          ? 'opacity-0 translate-x-4' 
                          : 'opacity-100 translate-x-0'
                      }`}
                    >
                      <h4 className="text-sm font-bold text-[#F5E6D3] mb-1">
                        {RENCONG_FACTS[currentFactIndex].title}
                      </h4>
                      <p className="text-xs text-[#F5E6D3]/70 leading-relaxed">
                        {RENCONG_FACTS[currentFactIndex].content}
                      </p>
                    </div>
                  </div>
                  
                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#C9A962]/10">
                    {/* Dots */}
                    <div className="flex gap-1.5">
                      {RENCONG_FACTS.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => goToFact(idx)}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            idx === currentFactIndex 
                              ? 'bg-[#C9A962] w-4' 
                              : 'bg-[#C9A962]/30 hover:bg-[#C9A962]/50'
                          }`}
                          aria-label={`Go to fact ${idx + 1}`}
                        />
                      ))}
                    </div>
                    
                    {/* Arrows */}
                    <div className="flex gap-1">
                      <button
                        onClick={handlePrevFact}
                        className="p-1 rounded hover:bg-[#C9A962]/20 transition-colors"
                        aria-label="Previous fact"
                      >
                        <ChevronLeft className="w-4 h-4 text-[#C9A962]" />
                      </button>
                      <button
                        onClick={handleNextFact}
                        className="p-1 rounded hover:bg-[#C9A962]/20 transition-colors"
                        aria-label="Next fact"
                      >
                        <ChevronRight className="w-4 h-4 text-[#C9A962]" />
                      </button>
                    </div>
                  </div>
                </div>
          </div>

            {/* Output Section - Transliterated */}
                    <div className="ornate-border corner-decoration p-6">
            <div className="flex items-center justify-between mb-2">
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
            <p className="text-xs text-[#C9A962]/60 mb-3 italic">
  Copy this transliterated Latin text, then paste it into any word processor 
  (Microsoft Word, Google Docs, etc.) and apply the downloaded Rencong font 
  to display it in proper Neo-Rencong script
</p>
<ScrollArea className="scroll-area">
  {isBlocked ? (
    <div 
      className="io-box custom-scrollbar bg-black/20 flex items-center justify-center"
      style={{ height: '380px' }}
    >
      <span className="text-[#CC7722] text-center">
        ⚠️ Output Blocked!<br/>
        <span className="text-sm">Please specify all 'e' characters using e1 or e4</span>
      </span>
    </div>
  ) : (
    <textarea
      value={output}
      readOnly
      placeholder="Transliterated output will appear here..."
      className="io-box custom-scrollbar bg-black/20"
      style={{ height: '380px', resize: 'none' }}
      spellCheck={false}
    />
  )}
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
    
    {/* All buttons wrapped in a single flex container */}
    <div className="flex gap-2">
      <button
        onClick={async () => {
          try {
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            
            // 1. Add the TTF font file
            const fontResponse = await fetch('/fonts/AksaraRencong-Regular.ttf');
            const fontBlob = await fontResponse.blob();
            zip.file('Aksara Neo-Rencong.ttf', fontBlob);
            
            // 2. Create comprehensive CSS file
            const cssContent = `/* ============================================
       AKSAKA NEO-RENCONG - COMPLETE TYPOGRAPHY SYSTEM
       Generated from Neo-Rencong Transliterator
       https://rencong-transliterator.vercel.app/
       ============================================ */

    /* Font Face Declaration */
    @font-face {
      font-family: 'Aksara Rencong';
      src: url('Aksara Neo-Rencong.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }

                /* ============================================
                  QUICK START
                  ============================================
                  
                  1. Link this CSS file in your HTML:
                      <link rel="stylesheet" href="Aksara Neo-Rencong.css">
                  
                  2. Apply the base class to any element:
                      <p class="rencong-text">Your text here</p>
                  
                  3. Add modifier classes for alignment, size, etc:
                      <p class="rencong-text rencong-align-center rencong-size-lg">
                        Centered large text
                      </p>
                */

                /* ============================================
                  BASE CONFIGURATION
                  ============================================ */

                .rencong-text {
                  font-family: 'Aksara Rencong', serif;
                  font-size: 42px;
                  line-height: 1.6;
                  letter-spacing: 0.02em;
                  word-spacing: 0.1em;
                  color: #2C1810;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                  hyphens: auto;
                }

                /* ============================================
                  SIZE SCALE
                  ============================================ */

                .rencong-size-xs { font-size: 18px; }
                .rencong-size-sm { font-size: 24px; }
                .rencong-size-base { font-size: 32px; }
                .rencong-size-md { font-size: 42px; }
                .rencong-size-lg { font-size: 56px; }
                .rencong-size-xl { font-size: 72px; }
                .rencong-size-2xl { font-size: 96px; }
                .rencong-size-3xl { font-size: 120px; }

                /* ============================================
                  ALIGNMENT OPTIONS
                  ============================================ */

                .rencong-align-left { text-align: left; }
                .rencong-align-center { text-align: center; }
                .rencong-align-right { text-align: right; }
                .rencong-align-justify { 
                  text-align: justify;
                  text-justify: inter-word;
                }

                /* Vertical Writing (Traditional) */
                .rencong-vertical {
                  writing-mode: vertical-rl;
                  text-orientation: upright;
                  height: 100%;
                }

                .rencong-vertical-left {
                  writing-mode: vertical-lr;
                  text-orientation: upright;
                }

                /* ============================================
                  SPACING SYSTEM
                  ============================================ */

                /* Line Height */
                .rencong-leading-tight { line-height: 1.2; }
                .rencong-leading-normal { line-height: 1.6; }
                .rencong-leading-relaxed { line-height: 2.0; }
                .rencong-leading-loose { line-height: 2.4; }

                /* Letter Spacing */
                .rencong-tracking-tight { letter-spacing: -0.02em; }
                .rencong-tracking-normal { letter-spacing: 0.02em; }
                .rencong-tracking-wide { letter-spacing: 0.05em; }

                /* Word Spacing */
                .rencong-word-tight { word-spacing: 0.02em; }
                .rencong-word-normal { word-spacing: 0.1em; }
                .rencong-word-wide { word-spacing: 0.2em; }

                /* ============================================
                  DECORATION & COLORS
                  ============================================ */

                .rencong-gold { color: #C9A962; }
                .rencong-ink { color: #2C1810; }
                .rencong-crimson { color: #8B0000; }

                .rencong-shadow-gold {
                  text-shadow: 0 0 10px rgba(201, 169, 98, 0.5);
                }

                /* ============================================
                  LAYOUT HELPERS
                  ============================================ */

                .rencong-container-narrow { max-width: 600px; margin: 0 auto; }
                .rencong-container-medium { max-width: 900px; margin: 0 auto; }
                .rencong-container-wide { max-width: 1200px; margin: 0 auto; }

                .rencong-indent { text-indent: 2em; }

                /* ============================================
                  PRESET STYLES
                  ============================================ */

                /* Traditional Manuscript */
                .rencong-manuscript {
                  font-family: 'Aksara Rencong', serif;
                  font-size: 42px;
                  line-height: 1.0;
                  letter-spacing: 0.02em;
                  word-spacing: 0.15em;
                  text-align: justify;
                  color: #2C1810;
                  text-indent: 2em;
                }

                /* Display/Heading */
                .rencong-display {
                  font-family: 'Aksara Rencong', serif;
                  font-size: 72px;
                  line-height: 1.2;
                  letter-spacing: 0.05em;
                  text-align: center;
                  color: #C9A962;
                }

                /* Poetry */
                .rencong-poetry {
                  font-family: 'Aksara Rencong', serif;
                  font-size: 36px;
                  line-height: 2.0;
                  text-align: center;
                  color: #2C1810;
                  white-space: pre-line;
                }

                /* ============================================
                  RESPONSIVE
                  ============================================ */

                @media (max-width: 768px) {
                  .rencong-text { font-size: 32px; line-height: 1.8; }
                  .rencong-size-lg { font-size: 42px; }
                  .rencong-size-xl { font-size: 56px; }
                  .rencong-vertical { writing-mode: horizontal-tb; }
                }

                @media print {
                  .rencong-text, [class*="rencong-"] {
                    color: #000 !important;
                    text-shadow: none !important;
                  }
                }`;

                      zip.file('Aksara Neo-Rencong.css', cssContent);
                      
                      // 3. Create README file
                      const readmeContent = `# Aksara Neo-Rencong Font Package

                ## Contents

                This package contains everything you need to use the Neo-Rencong script in your projects:

                - \`Aksara Neo-Rencong.ttf\` - The font file
                - \`Aksara Neo-Rencong.css\` - Complete CSS typography system
                - \`README.md\` - This file

                ## Quick Start

                ### 1. Installation

                Place all files in your project folder (keep them in the same directory).

                ### 2. HTML Setup

                Link the CSS file in your HTML \`<head>\`:

                \`\`\`html
                <link rel="stylesheet" href="Aksara Neo-Rencong.css">
                \`\`\`

                ### 3. Basic Usage

                Apply the base class to any element:

                \`\`\`html
                <p class="rencong-text">Your Rencong text here</p>
                \`\`\`

                ## CSS Classes Reference

                ### Base Class
                - \`.rencong-text\` - Base font family and sizing

                ### Size Modifiers
                - \`.rencong-size-xs\` (18px)
                - \`.rencong-size-sm\` (24px)
                - \`.rencong-size-base\` (32px)
                - \`.rencong-size-md\` (42px) - Default
                - \`.rencong-size-lg\` (56px)
                - \`.rencong-size-xl\` (72px)
                - \`.rencong-size-2xl\` (96px)
                - \`.rencong-size-3xl\` (120px)

                ### Alignment
                - \`.rencong-align-left\`
                - \`.rencong-align-center\`
                - \`.rencong-align-right\`
                - \`.rencong-align-justify\`
                - \`.rencong-vertical\` - Vertical writing mode

                ### Spacing
                - \`.rencong-leading-tight\` / \`normal\` / \`relaxed\` / \`loose\`
                - \`.rencong-tracking-tight\` / \`normal\` / \`wide\`
                - \`.rencong-word-tight\` / \`normal\` / \`wide\`

                ### Preset Styles
                - \`.rencong-manuscript\` - Traditional manuscript style
                - \`.rencong-display\` - Large display text
                - \`.rencong-poetry\` - Poetry formatting

                ## Examples

                ### Centered Title
                \`\`\`html
                <h1 class="rencong-text rencong-align-center rencong-size-xl">
                  Title Text
                </h1>
                \`\`\`

                ### Justified Paragraph
                \`\`\`html
                <p class="rencong-text rencong-align-justify rencong-indent">
                  Your paragraph text here...
                </p>
                \`\`\`

                ### Vertical Text (Traditional)
                \`\`\`html
                <div class="rencong-text rencong-vertical" style="height: 400px;">
                  Vertical text content
                </div>
                \`\`\`

                ### Poetry Style
                \`\`\`html
                <div class="rencong-poetry">
                  Line one
                  Line two
                  Line three
                </div>
                \`\`\`

                ## How to Get Rencong Text

                1. Visit: https://rencong-transliterator.vercel.app/
                2. Type your text in Latin/Rumi script
                3. Copy the transliterated output
                4. Paste into your HTML with the rencong-text class applied

                ## Special Characters

                When typing in the transliterator, use these special codes:

                | Type | Result | Description |
                |------|--------|-------------|
                | e1 | e | E pepet (schwa) |
                | e4 | E | E taling (closed e) |
                | gh | G | Gha |
                | ng | N | Nga |
                | ny | Y | Nya |
                | kh | K | Kha |
                | sy | H | Sya |
                | th | T | Tha |
                | dh | D | Dha |
                | - | O | Separator becomes O |

                ## Browser Support

                Works in all modern browsers that support:
                - WOFF2/TTF fonts
                - CSS Custom Properties
                - Flexbox/Grid

                ## License

                This font is part of the Neo-Rencong project aimed at reviving traditional Malay scripts.

                Project: https://rencong-transliterator.vercel.app/
                Initiated: 2024

                ## Troubleshooting

                **Font not displaying?**
                - Ensure the TTF file is in the same folder as the CSS
                - Check that the font file path in the CSS @font-face rule matches your folder structure
                - Try clearing browser cache

                **Text looks too small/large?**
                - Use the size modifier classes (rencong-size-lg, etc.)
                - Or override font-size in your own CSS

                **Vertical text not working?**
                - Ensure the container has a defined height
                - Some mobile browsers may not support vertical writing modes

                ## Support

                For issues or questions about the transliterator:
                Visit: https://rencong-transliterator.vercel.app/

                ---

                Generated by Neo-Rencong Transliterator
                Preserving Ancient Malay Heritage through Digital Innovation
                `;

                      zip.file('README.md', readmeContent);
                      
                      
                      // Generate the ZIP file
                      const zipBlob = await zip.generateAsync({ type: 'blob' });
                      
                      // Trigger download
                      const url = URL.createObjectURL(zipBlob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'Aksara Neo-Rencong Complete Package.zip';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      
                    } catch (error) {
                      console.error('Error creating ZIP:', error);
                      alert('Failed to create ZIP file. Please try again.');
                    }
                  }}
                  className="copy-btn"
                  title="Download complete font package (ZIP)"
                >
                  <FileArchive className="w-4 h-4" />
                  Download Font
                </button>
                
                <button
                  onClick={() => handleCopy(output)}
                  className={`copy-btn ${copied ? 'copied' : ''}`}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                
                <button
                  onClick={handlePrintRencong}
                  className="copy-btn"
                  title="Print or save as PDF/PNG"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          {/* Replace the entire ScrollArea section with this */}
          <div 
  className={`h-[300px] w-full rounded-md border border-[rgba(201,169,98,0.3)] ${output && !isBlocked ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}
  style={{ backgroundColor: 'rgba(245, 230, 211, 0.08)' }}
>
  {isBlocked ? (
    <div className="w-full h-[300px] flex items-center justify-center">
      <span className="text-[#CC7722] text-center text-lg">
        ⚠️ Output Blocked!<br/>
        <span className="text-sm">Please specify all 'e' characters using e1 or e4</span>
      </span>
    </div>
  ) : output ? (
    <div 
      className="w-full p-6"
      style={{ 
        fontFamily: "'Aksara Rencong', serif",
        fontSize: '42px',
        lineHeight: '1.0',
        letterSpacing: '-0.02em',
        wordSpacing: '0.15em',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
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
                    Special Character Reference
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

                                {/* Complete Character Mapping Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#C9A962] flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Complete Character Mapping
            </h2>
            <span className="text-xs text-[#C9A962]/60 italic">
              All characters to Rencong script
            </span>
          </div>

          {/* Section: Lowercase a-z */}
          <div className="mb-4">
            <h4 className="text-xs text-[#C9A962]/80 uppercase tracking-wider mb-2 font-semibold">Lowercase Letters (a-z)</h4>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'].map((char) => (
                <div key={char} className="mapping-card p-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-[#F5E6D3]/60 font-mono mb-1">{char}</span>
                    <span 
                      className="text-4xl text-[#C9A962] font-bold leading-none"
                      style={{ fontFamily: "'Aksara Rencong', serif" }}
                    >
                      {char}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Uppercase A-Z */}
          <div className="mb-4">
            <h4 className="text-xs text-[#C9A962]/80 uppercase tracking-wider mb-2 font-semibold">Uppercase Letters (A-Z)</h4>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map((char) => (
                <div key={char} className="mapping-card p-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-[#F5E6D3]/60 font-mono uppercase mb-1">{char}</span>
                    <span 
                      className="text-4xl text-[#C9A962] font-bold leading-none"
                      style={{ fontFamily: "'Aksara Rencong', serif" }}
                    >
                      {char}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Numbers */}
          <div className="mb-4">
            <h4 className="text-xs text-[#C9A962]/80 uppercase tracking-wider mb-2 font-semibold">Numbers</h4>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {['0','1','2','3','4','5','6','7','8','9'].map((char) => (
                <div key={char} className="mapping-card p-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-[#F5E6D3]/60 font-mono mb-1">{char}</span>
                    <span 
                      className="text-4xl text-[#C9A962] font-bold leading-none"
                      style={{ fontFamily: "'Aksara Rencong', serif" }}
                    >
                      {char}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Punctuation */}
          <div className="mb-4">
            <h4 className="text-xs text-[#C9A962]/80 uppercase tracking-wider mb-2 font-semibold">Punctuation</h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {[
                { from: '.', label: 'Fullstop' },
                { from: ',', label: 'Comma' },
              ].map((item) => (
                <div key={item.from} className="mapping-card p-3 bg-[#C9A962]/5 border-[#C9A962]/20">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-[#F5E6D3]/60 font-mono mb-1">{item.label}</span>
                    <span 
                      className="text-4xl text-[#C9A962] font-bold leading-none"
                      style={{ fontFamily: "'Aksara Rencong', serif" }}
                    >
                      {item.from}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Special Transliterations */}
          <div className="mb-4">
            <h4 className="text-xs text-[#C9A962]/80 uppercase tracking-wider mb-2 font-semibold">Special Transliterations</h4>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2">
              {[
                { from: 'gh', to: 'G' },
                { from: 'ng', to: 'N' },
                { from: 'ny', to: 'Y' },
                { from: 'kh', to: 'K' },
                { from: 'sy', to: 'H' },
                { from: 'th', to: 'T' },
                { from: 'dh', to: 'D' },
                { from: 'ks', to: 'S' },
                { from: 'e1', to: 'e' },
                { from: 'e4', to: 'E' },
              ].map((item) => (
                <div key={item.from} className="mapping-card p-3 bg-[#C9A962]/10 border-[#C9A962]/40">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-[#F5E6D3]/80 font-mono mb-1">{item.from}</span>
                    <span 
                      className="text-4xl text-[#C9A962] font-bold leading-none"
                      style={{ fontFamily: "'Aksara Rencong', serif" }}
                    >
                      {item.to}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#C9A962]/50 mt-3 text-center">
            Note: Type the left column to get the right column Rencong output.
          </p>
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
            <div className="mt-4 p-3 bg-[#C9A962]/10 rounded-lg border border-[#C9A962]/20">
  <p className="text-xs text-[#F5E6D3]/70">
    <strong className="text-[#C9A962]">Note:</strong> Capital letters 
    <span className="font-mono text-[#C9A962]"> (B, C, D, E, G, H, J, K, N, O, P, R, S, T, Y) </span> 
    are used in this transliterator to represent specific Neo-Rencong characters, 
    but these are variant forms not typically used in standard Neo-Rencong script. 
    Use the toggle switch above to allow uppercase input when needed.
  </p>
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
        <p className="mt-2 text-[#C9A962]/60">Developed by <span className="text-[#C9A962]">Tengku Lafuan</span></p>
      </footer>
    </div>
  );
}
