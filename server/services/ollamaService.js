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
    const response = await axios.post(OLLAMA_URL, {
      model: MODEL_NAME,
      prompt: `${SYSTEM_PROMPT}\n\n### INPUT TEXT:\n${text}`,
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

module.exports = {
  analyzeGuidelines
};
