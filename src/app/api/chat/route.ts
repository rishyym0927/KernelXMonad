import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    const response = await axios({
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
      },
      data: {
        contents: [
          {
            parts: [{ text: question }],
          },
        ],
      },
    });

    return NextResponse.json({ 
      response: response.data.candidates[0].content.parts[0].text 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}