import { NextResponse } from 'next/server';
import { getAllMessages, addMessage } from '@/lib/db';

// GET route to fetch all messages
export async function GET() {
  try {
    const messages = await getAllMessages();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST route to add a new message
export async function POST(req) {
  try {
    const { name, message } = await req.json();
    
    // Basic validation
    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Add message to databases
    const newMessage = await addMessage(name, message);
    
    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

// Helper function to get a random color for the post-it note
function getRandomColor() {
  const colors = ['yellow', 'blue', 'green', 'pink', 'orange', 'purple'];
  return colors[Math.floor(Math.random() * colors.length)];
} 