const MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'deepseek-r1:8b'
const API_URL = import.meta.env.VITE_OLLAMA_API_URL || 'http://localhost:11434/api/generate'

async function callOllama(prompt, options = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
        num_predict: options.maxTokens || 900
      }
    })
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    throw new Error('Ollama returned a non-JSON response. Make sure ollama serve is running on localhost:11434.')
  }

  if (!res.ok) {
    const apiMessage = data?.error || data?.message || `Ollama request failed (${res.status})`
    throw new Error(apiMessage)
  }

  const text = data?.response
  if (!text || typeof text !== 'string') {
    throw new Error('Ollama returned an unexpected response format.')
  }

  return text.replace(/```json|```/g, '').trim()
}

function parseJSON(text, fallback) {
  try { return JSON.parse(text) }
  catch { return fallback }
}

export async function scoreAnswer(question, answer, role) {
  const prompt = `You are a senior technical interviewer assessing a candidate for ${role.title} at a leading enterprise company.

Role context: ${role.jd}
Question asked: "${question.text}"
Expected key points: "${question.answer}"
Candidate's response: "${answer}"

Evaluate objectively. Return ONLY valid JSON with no markdown fences:
{"relevance":<0-10>,"depth":<0-10>,"clarity":<0-10>,"correctness":<0-10>,"overall":<0-10>,"feedback":"<2-3 sentences of specific, actionable feedback referencing the response>","strengths":"<1-2 concrete strengths in this specific answer>","improvements":"<1-2 specific, actionable improvements>"}

Scoring calibration:
- 9-10: Comprehensive, technically precise, well-structured, covers all key points with examples
- 7-8: Good coverage, mostly correct, minor gaps or imprecision
- 5-6: Partial coverage, some correct elements, notable gaps
- 3-4: Surface-level, vague, missing key concepts
- 1-2: Incorrect or irrelevant`

  const text = await callOllama(prompt, { maxTokens: 800 })
  return parseJSON(text, {
    relevance: 5, depth: 5, clarity: 6, correctness: 5, overall: 5.2,
    feedback: 'Your answer shows some understanding. Adding more technical specifics and concrete examples would strengthen it significantly.',
    strengths: 'Demonstrated awareness of the core concept.',
    improvements: 'Provide specific technical details and a real-world example from your experience.'
  })
}

export async function generateSessionSummary(qaLog, role, benchmark) {
  const transcript = qaLog.map((q, i) =>
    `Q${i + 1} [${q.stage}]: ${q.question}\nCandidate: ${q.answer}\nScores - Relevance:${q.relevance} Depth:${q.depth} Clarity:${q.clarity} Correctness:${q.correctness}`
  ).join('\n\n')

  const prompt = `You are a senior HR director writing a formal evaluation report for a ${role.title} candidate.

Benchmark expectations for this role (0-100 scale):
- Relevance: ${benchmark.relevance}%, Depth: ${benchmark.depth}%, Clarity: ${benchmark.clarity}%, Correctness: ${benchmark.correctness}%

Full interview transcript:
${transcript}

Write a professional, evidence-based evaluation. Return ONLY valid JSON with no markdown:
{
  "executiveSummary": "<4-5 sentence professional summary citing specific evidence from answers>",
  "technicalStrength": "<specific technical observation with example from answers>",
  "communicationStrength": "<communication and articulation observation>",
  "areasForGrowth": "<2 specific, evidence-based development areas>",
  "benchmarkAnalysis": "<3-4 sentences explicitly comparing candidate performance against role benchmark expectations, noting which dimensions meet/exceed/fall below bar and by how much>",
  "hiringSuggestion": "<2-3 sentence final recommendation with clear reasoning based on evidence>"
}`

  const text = await callOllama(prompt, { maxTokens: 1100 })
  return parseJSON(text, {
    executiveSummary: 'The candidate completed the structured interview across all three stages. Performance was evaluated across technical knowledge, communication clarity, and behavioral competencies.',
    technicalStrength: 'Demonstrated foundational understanding of relevant technical concepts.',
    communicationStrength: 'Responses were generally clear and structured.',
    areasForGrowth: 'Deeper technical depth and more concrete examples from past experience would strengthen the candidacy.',
    benchmarkAnalysis: 'Candidate performance was evaluated against the benchmark profile for this role. Some dimensions met expectations while others showed room for development.',
    hiringSuggestion: 'Based on the interview performance, further evaluation is recommended to confirm fit for this role.'
  })
}

export async function generateFollowUp(previousAnswer, role, stage) {
  const prompt = `You are an experienced interviewer conducting a ${stage} interview for ${role.title}.

The candidate just answered: "${previousAnswer}"

Generate ONE short, incisive follow-up question (max 25 words) that probes deeper into a specific gap or interesting point in their answer. Return ONLY the question text, no quotes, no explanation.`

  const text = await callOllama(prompt, { maxTokens: 100 })
  return text.trim().replace(/^["']|["']$/g, '')
}
