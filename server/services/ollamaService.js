const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_HOST ? `${process.env.OLLAMA_HOST}/api/generate` : 'http://localhost:11434/api/generate';
const MODEL_NAME = process.env.OLLAMA_MODEL || 'llama3.2';

const SYSTEM_PROMPT = `
### ROLE
You are the "AdGen Co-Pilot Technical Agent." Your purpose is to enforce retail compliance by converting unstructured PDF text into machine-readable validation rules.

### OBJECTIVE
You will receive raw text extracted from a Retail Media Guideline PDF. You must analyze this text to identify technical constraints for image creation. You must ignore marketing fluff and focus purely on "Constraint Logic."

### EXTRACTION TARGETS (THE RULES)
You must search for the following specific data points, as defined in the AdGen architecture:
1. SAFE ZONES: Look for "margin," "buffer," "clear space," or "padding".
2. DIMENSIONS: Look for "pixels," "px," "width," "height," or aspect ratios (e.g., 1:1, 1200x628).
3. FILE SPECS: Look for "KB," "MB," "JPEG," "PNG," or "max file size".
4. COLORS/BRANDING: Look for Hex codes, "contrast," or specific color rules.

### AGENT REASONING PROCESS (MUST FOLLOW)
Before generating the final JSON, you must perform an internal "Reasoning Step" to ensure accuracy:
1. SCAN: Identify all numerical values associated with "px", "kb", or "%".
2. CLASSIFY: Determine if a number is a dimension (width/height) or a restriction (margin/weight).
3. CALCULATE: If aspect ratio is not explicitly stated, calculate it by dividing width by height (e.g., 1200/628 ≈ 1.91:1). Do NOT guess "1:1" unless width equals height.
4. VERIFY: If multiple rules exist, prioritize the "strictest" rule.
5. FORMAT: Map these values to the strict JSON schema below.

### RESPONSE FORMAT
You must return ONLY a JSON object following this schema:
{
  "retailer_name": "String or null",
  "ad_formats": [
    {
      "type": "String",
      "width_px": Integer,
      "height_px": Integer,
      "aspect_ratio": "String"
    }
  ],
  "constraints": {
    "safe_zone_margin_px": Integer (default 0),
    "max_file_size_kb": Integer (default 500),
    "allowed_file_types": ["Array", "of", "Strings"],
    "forbidden_content": ["Array", "of", "Strings"],
    "recommended_colors": ["Array", "of", "Hex Codes"],
    "contrast_requirements": "String or null"
  }
}

### ERROR HANDLING
- If the text implies a rule but doesn't give a number, return null.
- Do not hallucinate values.
`;

/**
 * Analyzes text using Ollama to extract guideline rules.
 * @param {string} text - The raw text from the PDF.
 * @returns {Promise<Object>} - The structured JSON rules.
 */
const analyzeGuidelines = async (text) => {
  try {
    console.log('Analyzing text of length:', text.length);

    // 1. Pre-process: Filter text if it's too long
    const processedText = filterRelevantContent(text);
    console.log('Processed text length:', processedText.length);

    const response = await axios.post(OLLAMA_URL, {
      model: MODEL_NAME,
      prompt: `${SYSTEM_PROMPT}\n\n### INPUT TEXT:\n${processedText}`,
      stream: false,
      format: 'json'
    });

    console.log('Ollama Raw Response:', response.data.response);

    if (response.data && response.data.response) {
      return JSON.parse(response.data.response);
    } else {
      throw new Error('Invalid response from Ollama');
    }
  } catch (error) {
    console.error('Ollama Analysis Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Ollama is not running. Please start Ollama (e.g., `ollama serve`).');
    }
    throw new Error('Failed to analyze guidelines with AI');
  }
};

/**
 * Smart Content Filtering
 * Splits large text into chunks and retains only those with high relevance to technical specs.
 */
const filterRelevantContent = (text) => {
  const MAX_CONTEXT_LENGTH = 15000; // Safe limit for LLM context
  if (text.length <= MAX_CONTEXT_LENGTH) return text;

  console.log('Text too large, applying smart filtering...');

  // Expanded Keywords for Retail/Tesco contexts
  const KEYWORDS = [
    // Dimensions & Layout
    'px', 'pixels', 'dimension', 'width', 'height', 'aspect ratio', '1:1', '9:16', '16:9',
    'margin', 'padding', 'safe zone', 'clear space', 'gutter', 'bleed', 'border',
    // File Specs
    'file size', 'kb', 'mb', 'max size', 'weight', 'resolution', 'dpi', 'ppi',
    'format', 'jpeg', 'png', 'jpg', 'gif', 'html5', 'static', 'animated',
    // Branding
    'color', 'hex', 'rgb', 'cmyk', 'contrast', 'background', 'logo', 'typography', 'font',
    // Sections
    'technical spec', 'requirements', 'guidelines', 'supply', 'deliverables'
  ];

  // Regex patterns for high-value technical data (Bonus Points)
  const PATTERNS = [
    /\d{2,4}\s?[xX]\s?\d{2,4}/, // Dimensions like 300x250 or 300 x 250
    /\d+\s?(kb|mb|KB|MB)/,       // File sizes like 150KB
    /#[0-9a-fA-F]{6}/            // Hex codes
  ];

  // Split into larger chunks to preserve table rows/context
  const CHUNK_SIZE = 1500;
  const OVERLAP = 300;
  const chunks = [];

  for (let i = 0; i < text.length; i += (CHUNK_SIZE - OVERLAP)) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }

  // Score chunks
  const scoredChunks = chunks.map(chunk => {
    const lowerChunk = chunk.toLowerCase();
    let score = 0;

    // 1. Keyword Matches
    KEYWORDS.forEach(kw => {
      if (lowerChunk.includes(kw)) score += 1;
    });

    // 2. Pattern Matches (High Value)
    PATTERNS.forEach(regex => {
      const matches = chunk.match(new RegExp(regex, 'g'));
      if (matches) {
        score += (matches.length * 3); // 3x points for actual data points
      }
    });

    return { chunk, score };
  });

  // Sort by score (descending)
  scoredChunks.sort((a, b) => b.score - a.score);

  // Select top chunks until we hit the limit
  let finalContent = '';
  let currentLength = 0;

  // Always include the first chunk (often contains Title/Context) if it has any score
  if (scoredChunks.length > 0 && chunks[0]) {
    finalContent += chunks[0] + '\n\n... [INTRO END] ...\n\n';
    currentLength += chunks[0].length;
  }

  for (const item of scoredChunks) {
    if (item.chunk === chunks[0]) continue; // Already added
    if (currentLength + item.chunk.length > MAX_CONTEXT_LENGTH) break;
    if (item.score < 2) continue; // Skip low-relevance chunks

    finalContent += item.chunk + '\n\n... [SECTION BREAK] ...\n\n';
    currentLength += item.chunk.length;
  }

  return finalContent || text.slice(0, MAX_CONTEXT_LENGTH);
};

module.exports = {
  analyzeGuidelines
};
