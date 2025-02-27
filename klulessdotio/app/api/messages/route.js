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

    // Add message with timeout and retry logic
    const addMessageWithRetry = async (retries = 3) => {
      try {
        return await addMessage(name, message);
      } catch (error) {
        if (retries > 0 && (error.code === 'unavailable' || error.code === 'deadline-exceeded')) {
          // Wait for a short time before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return addMessageWithRetry(retries - 1);
        }
        throw error;
      }
    };

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), 25000);
    });

    const messagePromise = addMessageWithRetry();
    
    try {
      const newMessage = await Promise.race([messagePromise, timeoutPromise]);
      return NextResponse.json({ success: true, message: newMessage });
    } catch (raceError) {
      if (raceError.message === 'Operation timed out') {
        return NextResponse.json(
          { error: 'Request timed out. Please try again.' },
          { status: 504 }
        );
      }
      throw raceError;
    }
  } catch (error) {
    console.error('Error adding message:', error);
    const errorMessage = error.code === 'unavailable' 
      ? 'Service temporarily unavailable. Please try again.'
      : error.code === 'deadline-exceeded'
      ? 'Request timed out. Please try again.'
      : 'Failed to add message';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error.code === 'unavailable' || error.code === 'deadline-exceeded' ? 503 : 500 }
    );
  }
}

// Helper function to get a random color for the post-it note
function getRandomColor() {
  const colors = ['yellow', 'blue', 'green', 'pink', 'orange', 'purple'];
  return colors[Math.floor(Math.random() * colors.length)];
} 