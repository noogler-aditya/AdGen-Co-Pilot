/**
 * Ollama AI Service
 * Handles communication with local Ollama LLM for PDF guideline analysis.
 */

const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_HOST
  ? `${process.env.OLLAMA_HOST}/api/generate`
  : 'http://localhost:11434/api/generate';
const MODEL_NAME = process.env.OLLAMA_MODEL || 'llama3.2';
const MAX_CONTEXT_LENGTH = 15000;

const SYSTEM_PROMPT = `
### ROLE
You are the "AdGen Co-Pilot Technical Agent." Your purpose is to enforce retail compliance by converting unstructured PDF text into machine-readable validation rules.

### OBJECTIVE
You will receive raw text extracted from a Retail Media Guideline PDF. You must analyze this text to identify technical constraints for image creation. Focus purely on "Constraint Logic."

### EXTRACTION TARGETS
1. SAFE ZONES: Look for "margin," "buffer," "clear space," or "padding".
2. DIMENSIONS: Look for "pixels," "px," "width," "height," or aspect ratios (e.g., 1:1, 1200x628).
3. FILE SPECS: Look for "KB," "MB," "JPEG," "PNG," or "max file size".
4. COLORS/BRANDING: Look for Hex codes, "contrast," or specific color rules.

### RESPONSE FORMAT
Return ONLY a JSON object following this schema:
{
  "retailer_name": "String or null",
  "ad_formats": [
    { "type": "String", "width_px": Integer, "height_px": Integer, "aspect_ratio": "String" }
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

// Keywords for relevance scoring
const KEYWORDS = [
  'px', 'pixels', 'dimension', 'width', 'height', 'aspect ratio',
  'margin', 'padding', 'safe zone', 'clear space', 'gutter', 'bleed',
  'file size', 'kb', 'mb', 'max size', 'resolution', 'dpi',
  'format', 'jpeg', 'png', 'jpg', 'html5', 'static', 'animated',
  'color', 'hex', 'rgb', 'contrast', 'background', 'logo', 'font',
  'technical spec', 'requirements', 'guidelines', 'deliverables'
];

// Regex patterns for technical data
const PATTERNS = [
  /\d{2,4}\s?[xX]\s?\d{2,4}/,
  /\d+\s?(kb|mb|KB|MB)/,
  /#[0-9a-fA-F]{6}/
];

/**
 * Filters large text to retain only relevant technical content
 * @param {string} text - Raw PDF text
 * @returns {string} - Filtered text within context limits
 */
const filterRelevantContent = (text) => {
  if (text.length <= MAX_CONTEXT_LENGTH) return text;

  const CHUNK_SIZE = 1500;
  const OVERLAP = 300;
  const chunks = [];

  for (let i = 0; i < text.length; i += (CHUNK_SIZE - OVERLAP)) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }

  const scoredChunks = chunks.map(chunk => {
    const lowerChunk = chunk.toLowerCase();
    let score = 0;

    KEYWORDS.forEach(kw => {
      if (lowerChunk.includes(kw)) score += 1;
    });

    PATTERNS.forEach(regex => {
      const matches = chunk.match(new RegExp(regex, 'g'));
      if (matches) score += matches.length * 3;
    });

    return { chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  let finalContent = '';
  let currentLength = 0;

  // Include first chunk for context
  if (chunks[0]) {
    finalContent += chunks[0] + '\n\n';
    currentLength += chunks[0].length;
  }

  for (const item of scoredChunks) {
    if (item.chunk === chunks[0]) continue;
    if (currentLength + item.chunk.length > MAX_CONTEXT_LENGTH) break;
    if (item.score < 2) continue;

    finalContent += item.chunk + '\n\n';
    currentLength += item.chunk.length;
  }

  return finalContent || text.slice(0, MAX_CONTEXT_LENGTH);
};

/**
 * Analyzes PDF text using Ollama AI to extract structured guideline rules
 * @param {string} text - Raw text extracted from PDF
 * @returns {Promise<Object>} - Structured JSON rules
 */
const analyzeGuidelines = async (text) => {
  try {
    const processedText = filterRelevantContent(text);

    const response = await axios.post(OLLAMA_URL, {
      model: MODEL_NAME,
      prompt: `${SYSTEM_PROMPT}\n\n### INPUT TEXT:\n${processedText}`,
      stream: false,
      format: 'json'
    });

    if (response.data?.response) {
      return JSON.parse(response.data.response);
    }

    throw new Error('Invalid response from Ollama');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Ollama is not running. Start with: ollama serve');
    }
    throw new Error('Failed to analyze guidelines with AI');
  }
};

module.exports = { analyzeGuidelines };
