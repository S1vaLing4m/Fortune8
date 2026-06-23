import { NextResponse } from 'next/server';
// @ts-ignore
import pdfParse from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    // 1. Convert the PDF into a readable format
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Rip the raw text off the PDF
    const pdfData = await pdfParse(buffer);
    const rawText = pdfData.text;

    // 3. Command local Llama 3.1 to extract the data
    const prompt = `
      Extract all financial transactions from this bank statement.
      Return ONLY a raw JSON array. Do not include any formatting, markdown, or intro text.
      Each object in the array must have exactly these keys:
      - "date": string (Format: YYYY-MM-DD)
      - "description": string (Clean up the vendor name)
      - "amount": number (Make it negative for deductions/expenses, and positive for deposits/income)

      Bank Statement Text:
      ${rawText}
    `;

    // 4. Send to your local Ollama server
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
    const transactions = JSON.parse(ollamaData.response);

    return NextResponse.json({ transactions });

  } catch (error: any) {
    console.error("PDF Parsing Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}