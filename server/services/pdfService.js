const pdf = require('pdf-parse');

/**
 * Extracts raw text from a PDF buffer.
 * @param {Buffer} dataBuffer - The buffer of the PDF file.
 * @returns {Promise<string>} - The extracted text.
 */
const extractTextFromBuffer = async (dataBuffer) => {
    try {
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('PDF Extraction Error:', error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
};

module.exports = {
    extractTextFromBuffer
};
