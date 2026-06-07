const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const generateNotes = async (req, res) => {
  try {
    const { title } = req.body;

    const model = genAI.getGenerativeModel({
model: "gemini-2.0-flash"    });

    const prompt = `
Create concise study notes for the topic:

${title}

Format:
1. Introduction
2. Key Concepts
3. Important Points
4. Examples
5. Summary

Keep it easy for students to revise.
`;

    const result = await model.generateContent(prompt);

    const notes = result.response.text();

    res.json({ notes });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to generate notes",
      error: error.message,
    });
  }
};

module.exports = {
  generateNotes,
};