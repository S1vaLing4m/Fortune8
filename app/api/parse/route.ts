import { NextResponse } from 'next/server';
// @ts-ignore
const pdfParse = require('pdf-parse');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    // 1. Convert the PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Rip the text
    const pdfData = await pdfParse(buffer);
    const rawText = pdfData.text;

    // 3. Stricter Prompting
    const prompt = `
      You are a strict data extraction API. Your ONLY job is to output a raw JSON array.
      Do NOT output any conversational text, greetings, or explanations.
      
      Extract all financial transactions from this bank statement.
      Each object in the array must have exactly these keys:
      - "date": string (Format: YYYY-MM-DD)
      - "description": string (Clean up the vendor name)
      - "amount": number (Make it negative for deductions/expenses, and positive for deposits/income)

      Bank Statement Text:
      ${rawText}
    `;

    // 4. Send to Ollama
    const ollamaRes = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1',
        prompt: prompt,
        stream: false,
        format: 'json'
      })
    });

    const ollamaData = await ollamaRes.json();
    
    // --- THE FIX: The Regex Muzzle ---
    // This finds the first '[' and the last ']' and throws away all conversational 
    // text that the AI might have accidentally included before or after it.
    let cleanResponse = ollamaData.response.trim();
    const startIndex = cleanResponse.indexOf('[');
    const endIndex = cleanResponse.lastIndexOf(']');
    
    if (startIndex !== -1 && endIndex !== -1) {
      cleanResponse = cleanResponse.substring(startIndex, endIndex + 1);
    }

    // 5. Safely Parse the Cleaned Data
    const transactions = JSON.parse(cleanResponse);

    return NextResponse.json({ transactions });

  } catch (error: any) {
    console.error("PDF Parsing Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}