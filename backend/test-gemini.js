import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
  const model = 'gemini-2.5-flash-lite';

  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: 'test successful' }]
        }
      ]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ ERROR:', data);
    return;
  }

  console.log('✅ SUCCESS');
  console.log(data.candidates[0].content.parts[0].text);
}

testGemini();
