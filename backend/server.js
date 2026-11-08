// Simple Express proxy for AI interview using OpenAI
// Loads environment variables from backend/.env when present (development only)
try { require('dotenv').config({ path: __dirname + '/.env' }); } catch (e) { /* dotenv optional */ }
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set. Remote AI generation/evaluation will use safe fallbacks.');
  console.warn('Set OPENAI_API_KEY in your environment or create backend/.env (see .env.example)');
}

function buildQuestionPrompt({jobType, level, sector, interviewType, difficulty, prevQuestion, prevAnswer}) {
  let prompt = `You are an experienced recruiter conducting an interview.`;
  prompt += `\nPoste: ${jobType}, niveau: ${level}`;
  if (sector) prompt += `, secteur: ${sector}`;
  prompt += `, type: ${interviewType}, difficulte: ${difficulty}`;
  if (prevQuestion && prevAnswer) {
    prompt += `\nQuestion precedente: ${prevQuestion}`;
    prompt += `\nReponse du candidat: ${prevAnswer}`;
    prompt += `\nGenerate a follow-up question or a new question appropriate for the context.`;
  } else {
    prompt += `\nGenerate a first interview question.`;
  }
  return prompt;
}

function buildEvaluationPrompt({question, answer, jobType}) {
  return `Analyse the following interview response.\nQuestion: ${question}\nAnswer: ${answer}\nPoste: ${jobType}\nEvaluate using criteria: content 40%, structure 25%, technical 20%, soft 15%. Provide a JSON object with score (0-10), strengths array, improvements array, suggestion string, and detail scores for each criterion.`;
}

async function callOpenAI(prompt) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt}],
      temperature: 0.7,
      max_tokens: 500
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.choices[0].message.content;
  return text;
}

app.post('/api/ai-interview/next-question', async (req, res) => {
  const cfg = req.body;
  try {
    const prompt = buildQuestionPrompt(cfg);
    const text = API_KEY ? await callOpenAI(prompt) : 'Quelles sont vos attentes pour ce poste?';
    // wrap in InterviewQuestion-like structure
    const question = { id: Date.now(), text: text.trim(), type: 'behavioral' };
    res.json(question);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/ai-interview/evaluate', async (req, res) => {
  const { question, answer, jobType } = req.body;
  try {
    const prompt = buildEvaluationPrompt({question, answer, jobType});
    const text = API_KEY ? await callOpenAI(prompt) : JSON.stringify({ score: 5, strengths: [], improvements: [], suggestion: '', details: {content:5,structure:5,technical:5,soft:5} });
    // try parse as json
    let result;
    try { result = JSON.parse(text); } catch {
      result = { score: 5, strengths: [], improvements: [], suggestion: text, details: {content:5,structure:5,technical:5,soft:5} };
    }
    // ensure expected fields exist
    if (!result.details) result.details = {content:0,structure:0,technical:0,soft:0};
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => console.log(`AI interview proxy listening on ${port}`));
