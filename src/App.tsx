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
  History,
  Printer,
  Download  
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

// Check for unspecified 'e' (only lowercase e, not uppercase E)
const checkForUnspecifiedE = (input: string): string[] => {
  const words = input.split(/\s+/);
  return words.filter(word => {
    // First, replace all valid e1 and e4 sequences with placeholders
    // so they don't trigger the warning
    const cleaned = word
      .replace(/e1/g, 'XX')  // Replace e1 with placeholder
      .replace(/e4/g, 'XX'); // Replace e4 with placeholder
    
    // Now check if there's any standalone 'e' left (lowercase only)
    // Also ignore uppercase 'E' entirely
    return cleaned.includes('e');
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
  
  const SAMPLES = ['Saya suka makan kfc', 'me1re4ka orang yang baik'];

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInput(value);
      
      // Letters that should stay uppercase: B,C,D,E,G,H,J,K,N,O,P,R,S,T,Y
      const preserveUppercase = ['B', 'C', 'D', 'E', 'G', 'H', 'J', 'K', 'N', 'O', 'P', 'R', 'S', 'T', 'Y'];
      
      // Convert to lowercase except for preserved uppercase letters
      const processed = value.split('').map(char => {
        if (preserveUppercase.includes(char)) {
          return char; // Keep as uppercase
        }
        if (/[a-zA-Z]/.test(char)) {
          return char.toLowerCase(); // Lowercase everything else
        }
        return char; // Non-letters stay same
      }).join('');
    
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

      // Print Rencong to PDF/PNG with alignment options
  const handlePrintRencong = useCallback(() => {
    if (!output) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Neo-Rencong Output</title>
          <style>
            @font-face {
              font-family: 'Aksara Rencong';
              src: url('data:font/woff2;charset=utf-8;base64,d09GMgABAAAAABl0AA8AAAAALGAAABkYAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP0ZGVE0cGh4GYACDNggEEQgKxnC2DQt4AAE2AiQDgWwEIAWGDAeBIAwHG4Eio6KM1crJ/iqBmwOaR3uACAlhdWpYd9OJxIK4LvqRn5h3CaZWjJBkdnh+m733fiSfD62iAhbiUBEjN7Owe2XmItJF6865SrfrVV9k71qeJ2/v/+06n2ikkUUWCOWBJZtXZ760SqttBVrOUVMCMPz/8oFLY4clXpNVlmwH2/pi3+WIc2X6Bq2fAPrv79lcvUc/xdJ4kPDqWa3/IOX6H8C+MIV6L9JkOiA7wcJgR9OazT21KM7RluYQviqEbsZkZ5P/nd3k2d98283XHC05au4orVgsGoVQf0dp1TUjEQopkViNslVlOF8omdnFmFW2SVfTPfrJRZkm5RtFAADMwCePhmXb5GP7C4CdinwoqA0CgeEk8UM7AoCXhBsQbJ5erYI129eHL2sQAAgxwHxRzHPFXUk5IJrEfkw/vVNJR0ERivDLJqk/FGIrqWMTADglYW8CbotREosC/j0l9GbwFaZEv/3TgFOm+YtRfVu47w9ve8ubHgWmGz3IfCTJyPhcQkvxidX8+HNgFUDHmU2gIAbBQoTy4MmLSRgzAA9QVgQr9kHmS0AAt4FAoqLtaBFsLVsKpUqtuSF2DYPRzd3D08vkbT5vgHOGxVft5+9gDbjNaQsMMgSHhDphPxBb/OGsoX0kKW2kxaCIQrdTWc0vACS/QtKMRr84HdhBTJb49gQISbwr4SHJdyU6PcSOe6zpWGOXFV7vlwTwKfpo1TaLJcAvIihCpTE5GnlBWlHooNL4mJ3maR1438gYqyneW+QFjhd4icDyEqmTo4/gIgq8i0IttflLPaIz3STypCAvhU5njnDzkykcnDxdNA6iH0dI8AKOUDyowLE1ULEZoNYhjYKJjWUL2BsFaFuQbBaVQXZw7EmPkrKBA5wc0N8PFnxsl5V28Mg056F2M6a4cBpXedkCJBqpQarZgowagvCCaXCr6D+V2niLHjFHA4ACluzI/VhSnvWxA2ct0lTxBZLNI19zbH//vBzvu1fcS6OtEarCTMLPiAs+hME72c6U7QsLiskgN7kTQfoIc2oEaPNdcZ9lAVs9hbVaSrL79c+QSrYiDO6PwLcrvc0jYImdslGVFmR5A7K7hbozAJY6Al4140Ky4gDvEH5L9h3WRhspII3VldLWqRxVvWs+w69j+KLH5yLLCTcahH+tqx0cLOFviE+5gaU1oFnmXRWmMD1JUCXvYi9QPZ7CMUXDC1LMIvcDSyK10zvcbEZZ0Ccy+seaUOoQbJ+zznIseXxdjCWNJZUKERBu0tf/KG3F89sB8jCQoyWFjUCSTIKWbhzbSG1pLEWb6TOzvAHkrtc80C4wVInOSQGwbwB7pALJjOgcu+vVJrtmYzu9rRSM14eIb4sRgDWEwLEsuahGVVR4GuIuqhpNqaKKE98o/6267f1DEgF15+1IBavF33ewTgwEI+2u0sAOVA3eBujD8PjkfSEGSwHQZ5UJh08XdREYwAdmwWCoXqts9aRuXqXFje7hpgUkiWV77B8sRUB6GGe8+2UWc6Uiv34QQg6YnEC7pkZ4m/TobMRV3F3BeSvjcAHPja8aMoHXqmrakfdLV0Isot1yMzdTV1Dfk/QJhSUpunYt3ztnKxCB1cZFi/J8vhqyOSkXOK5oP/j6TbkPo7tShbku6sk5u1s6mjcMn3r4uusGpsuzDxqQjHtf5zjTXfMxIDX3LqLqboaMlf9z7KUBhzcTRDt37WY3qeCpCLeWxsMy1ugcCCGHB+E75FlI0ht32Z3Ok6AasmEUIsRSclmrtQe6bI2L5LAJBE4KPVeIRXu1yVnKPaKHWyapO6VSj0qeRKlcU1YZs6GORSU7522Np') format('woff2');
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
              padding: 40px;
              background: white;
              font-family: 'Aksara Rencong', serif;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }
            .controls {
              position: fixed;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: #f5f5f5;
              padding: 15px 25px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              z-index: 1000;
              display: flex;
              gap: 15px;
              align-items: center;
              flex-wrap: wrap;
              justify-content: center;
            }
            .control-group {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .control-group label {
              font-family: 'Georgia', serif;
              font-size: 13px;
              color: #555;
              font-weight: 600;
            }
            .control-group select,
            .control-group button {
              padding: 6px 12px;
              font-size: 13px;
              border: 1px solid #ccc;
              border-radius: 4px;
              background: white;
              cursor: pointer;
              font-family: 'Georgia', serif;
            }
            .control-group button {
              background: #C9A962;
              color: white;
              border-color: #C9A962;
              font-weight: 600;
            }
            .control-group button:hover {
              background: #b8984f;
            }
                        .content-wrapper {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 100px 40px 80px;
              min-height: calc(100vh - 180px);
            }
              .rencong-output {
              font-family: 'Aksara Rencong', serif;
              font-size: 48px;
              line-height: 1.6;
              color: #2C1810;
              width: 100%;
              max-width: 100%;
            }
              /* Each line is a block */
            .line {
              width: 100%;
              min-height: 1.2em;
            }
            /* Alignment classes */
            .align-left .line {
              text-align: left;
            }
            .align-center .line {
              text-align: center;
            }
            .align-right .line {
              text-align: right;
            }
            .align-justify .line {
              text-align: justify;
            }
              @media print {
              body { padding: 0; }
              .controls { display: none; }
              .content-wrapper { 
                padding: 40px; 
                min-height: 100vh;
              }
            }
          </style>
        </head>
        <body>
          <div class="controls no-print">
            <div class="control-group">
              <label>Alignment:</label>
              <select id="alignSelect" onchange="updateAlignment()">
                <option value="align-center" selected>Center</option>
                <option value="align-left">Left</option>
                <option value="align-right">Right</option>
                <option value="align-justify">Justify</option>
              </select>
            </div>
            
            <div class="control-group">
              <button onclick="window.print()">🖨️ Print / Save PDF</button>
            </div>
          </div>
          
          <div class="content-wrapper" id="contentWrapper">
            <div class="rencong-output align-center" id="output">
              ${output.split('\n').map(line => `<div class="line">${line || '&nbsp;'}</div>`).join('')}
            </div>
          </div>

          <script>
            function updateAlignment() {
              const output = document.getElementById('output');
              const select = document.getElementById('alignSelect');
              output.className = 'rencong-output ' + select.value;
            }
            
            
          </script>
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
              Copy this text and use with downloaded Rencong font for perfect alignment
            </p>
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
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Create font file content with custom settings
                    const fontCss = `@font-face {
  font-family: 'Aksara Rencong';
  src: url('data:font/woff2;charset=utf-8;base64,d09GMgABAAAAABl0AA8AAAAALGAAABkYAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP0ZGVE0cGh4GYACDNggEEQgKxnC2DQt4AAE2AiQDgWwEIAWGDAeBIAwHG4Eio6KM1crJ/iqBmwOaR3uACAlhdWpYd9OJxIK4LvqRn5h3CaZWjJBkdnh+m733fiSfD62iAhbiUBEjN7Owe2XmItJF6865SrfrVV9k71qeJ2/v/+06n2ikkUUWCOWBJZtXZ760SqttBVrOUVMCMPz/8oFLY4clXpNVlmwH2/pi3+WIc2X6Bq2fAPrv79lcvUc/xdJ4kPDqWa3/IOX6H8C+MIV6L9JkOiA7wcJgR9OazT21KM7RluYQviqEbsZkZ5P/nd3k2d98283XHC05au4orVgsGoVQf0dp1TUjEQopkViNslVlOF8omdnFmFW2SVfTPfrJRZkm5RtFAADMwCePhmXb5GP7C4CdinwoqA0CgeEk8UM7AoCXhBsQbJ5erYI129eHL2sQAAgxwHxRzHPFXUk5IJrEfkw/vVNJR0ERivDLJqk/FGIrqWMTADglYW8CbotREosC/j0l9GbwFaZEv/3TgFOm+YtRfVu47w9ve8ubHgWmGz3IfCTJyPhcQkvxidX8+HNgFUDHmU2gIAbBQoTy4MmLSRgzAA9QVgQr9kHmS0AAt4FAoqLtaBFsLVsKpUqtuSF2DYPRzd3D08vkbT5vgHOGxVft5+9gDbjNaQsMMgSHhDphPxBb/OGsoX0kKW2kxaCIQrdTWc0vACS/QtKMRr84HdhBTJb49gQISbwr4SHJdyU6PcSOe6zpWGOXFV7vlwTwKfpo1TaLJcAvIihCpTE5GnlBWlHooNL4mJ3maR1438gYqyneW+QFjhd4icDyEqmTo4/gIgq8i0IttflLPaIz3STypCAvhU5njnDzkykcnDxdNA6iH0dI8AKOUDyowLE1ULEZoNYhjYKJjWUL2BsFaFuQbBaVQXZw7EmPkrKBA5wc0N8PFnxsl5V28Mg056F2M6a4cBpXedkCJBqpQarZgowagvCCaXCr6D+V2niLHjFHA4ACluzI/VhSnvWxA2ct0lTxBZLNI19zbH//vBzvu1fcS6OtEarCTMLPiAs+hME72c6U7QsLiskgN7kTQfoIc2oEaPNdcZ9lAVs9hbVaSrL79c+QSrYiDO6PwLcrvc0jYImdslGVFmR5A7K7hbozAJY6Al4140Ky4gDvEH5L9h3WRhspII3VldLWqRxVvWs+w69j+KLH5yLLCTcahH+tqx0cLOFviE+5gaU1oFnmXRWmMD1JUCXvYi9QPZ7CMUXDC1LMIvcDSyK10zvcbEZZ0Ccy+seaUOoQbJ+zznIseXxdjCWNJZUKERBu0tf/KG3F89sB8jCQoyWFjUCSTIKWbhzbSG1pLEWb6TOzvAHkrtc80C4wVInOSQGwbwB7pALJjOgcu+vVJrtmYzu9rRSM14eIb4sRgDWEwLEsuahGVVR4GuIuqhpNqaKKE98o/6267f1DEgF15+1IBavF33ewTgwEI+2u0sAOVA3eBujD8PjkfSEGSwHQZ5UJh08XdREYwAdmwWCoXqts9aRuXqXFje7hpgUkiWV77B8sRUB6GGe8+2UWc6Uiv34QQg6YnEC7pkZ4m/TobMRV3F3BeSvjcAHPja8aMoHXqmrakfdLV0Isot1yMzdTV1Dfk/QJhSUpunYt3ztnKxCB1cZFi/J8vhqyOSkXOK5oP/j6TbkPo7tShbku6sk5u1s6mjcMn3r4uusGpsuzDxqQjHtf5zjTXfMxIDX3LqLqboaMlf9z7KUBhzcTRDt37WY3qeCpCLeWxsMy1ugcCCGHB+E75FlI0ht32Z3Ok6AasmEUIsRSclmrtQe6bI2L5LAJBE4KPVeIRXu1yVnKPaKHWyapO6VSj0qeRKlcU1YZs6GORSU7522Np') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* Neo-Rencong Custom Settings */
.rencong-text {
  font-family: 'Aksara Rencong', serif;
  font-size: 42px;
  line-height: 1.0;
  letter-spacing: -0.02em;
  word-spacing: 0.15em;
  word-break: break-word;
  white-space: normal;
  overflow-wrap: break-word;
}

.rencong-align-left { text-align: left; }
.rencong-align-center { text-align: center; }
.rencong-align-right { text-align: right; }
.rencong-align-justify { text-align: justify; }`;

                    const blob = new Blob([fontCss], { type: 'text/css' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'Aksara Neo-Rencong.css';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="copy-btn"
                  title="Download Rencong font CSS"
                >
                  <Download className="w-4 h-4" />
                  Font
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
