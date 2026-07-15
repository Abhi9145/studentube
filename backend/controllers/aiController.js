const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model fallback chain — tries each in order until one works
const MODEL_CHAIN = [
  "models/gemini-flash-lite-latest",
  "models/gemini-2.0-flash-lite-001",
  "models/gemini-2.0-flash-lite",
  "models/gemini-2.0-flash",
];

const generateNotes = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Video title is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "Gemini API key is not configured on the server." });
    }

    const prompt = `Create concise, well-structured study notes for a student watching a YouTube video titled:

"${title.trim()}"

Format the notes exactly as follows:

## 1. Introduction
Brief overview of the topic (2-3 sentences).

## 2. Key Concepts
- List the most important concepts or terms
- Keep each point clear and specific

## 3. Important Points
- Core facts, rules, or principles to remember
- Include any formulas or definitions if relevant

## 4. Examples
- Give 1-2 concrete, easy-to-understand examples
- Relate to real-world applications where possible

## 5. Summary
A concise 2-3 sentence recap of everything above.

Keep the language simple, student-friendly, and easy to revise.`;

    // Try each model in the fallback chain
    let lastError = null;
    for (const modelName of MODEL_CHAIN) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const notes = result.response.text();
        console.log(`Notes generated using model: ${modelName}`);
        return res.json({ notes, model: modelName });
      } catch (err) {
        console.warn(`Model ${modelName} failed:`, err.status, err.message?.substring(0, 80));
        lastError = err;
        // Only continue fallback on quota (429) or not found (404)
        if (err.status !== 429 && err.status !== 404) break;
      }
    }

    // All models exhausted
    if (lastError?.status === 429) {
      return res.status(429).json({
        message: "AI quota exceeded. Please try again in a few minutes.",
        error: "QUOTA_EXCEEDED",
      });
    }

    throw lastError;
  } catch (error) {
    console.error("Gemini error:", error.message);

    if (error.status === 429) {
      return res.status(429).json({
        message: "AI quota exceeded. Please try again in a few minutes.",
        error: "QUOTA_EXCEEDED",
      });
    }

    if (error.status === 400 || error.status === 403) {
      return res.status(403).json({
        message: "Gemini API key is invalid or unauthorized.",
        error: "INVALID_KEY",
      });
    }

    res.status(500).json({
      message: "Failed to generate notes. Please try again.",
      error: error.message,
    });
  }
};

module.exports = { generateNotes };