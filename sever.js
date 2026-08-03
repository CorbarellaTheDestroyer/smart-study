const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
// Allows your frontend to talk to this backend
app.use(cors()); 
// Allows large document text to be sent
app.use(express.json({ limit: '50mb' })); 

// Initialize the AI securely 
// This looks for the "API_KEY" variable you added in Render's settings
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.post('/api/generate-questions', async (req, res) => {
    try {
        const documentText = req.body.text;

        // 1. Tell the AI exactly how to think and format its response
        const prompt = `
        You are an expert teacher. Read the following notes and generate 5 original, 
        thought-provoking fill-in-the-blank questions based on the core concepts. 
        Do not just copy the sentences. Write new questions.
        
        Return the output STRICTLY as a JSON array in this exact format:
        [
          {
            "title": "Topic Name",
            "question": "The process by which plants make their own food is called ______.",
            "answer": "photosynthesis"
          }
        ]

        Here are the notes:
        ${documentText}
        `;

        // 2. Call the AI
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        // 3. Clean up the AI response and send it back to the frontend
        const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const questions = JSON.parse(cleanJson);

        res.json({ success: true, slides: questions });

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate questions." });
    }
});

// 4. Start the server
// Render automatically assigns a port using process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Backend server running on port ' + PORT));
