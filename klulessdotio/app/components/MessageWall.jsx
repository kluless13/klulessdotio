"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PostItNote from './PostItNote';
import { useTheme } from '../contexts/ThemeContext';
import MessageForm from './MessageForm';

export default function MessageWall() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDragHint, setShowDragHint] = useState(true);

  // Fetch all messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/messages');
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Select 3 random messages to display whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const getRandomMessages = () => {
        // If we have less than 3 messages, just show all of them
        if (messages.length <= 3) {
          return messages.map((message, index) => ({
            ...message,
            position: getRandomPosition(index)
          }));
        }
        
        // Otherwise, pick 3 random messages
        const shuffled = [...messages].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3).map((message, index) => ({
          ...message,
          position: getRandomPosition(index)
        }));
      };
      
      setDisplayedMessages(getRandomMessages());
    }
  }, [messages]);

  // Generate random position for a post-it note
  const getRandomPosition = (index) => {
    // Define areas of the screen to place notes
    // This ensures they don't all cluster in one spot
    const areas = [
      { top: '10%', left: '15%' },
      { top: '20%', right: '10%' },
      { bottom: '25%', left: '25%' },
    ];
    
    // Add some randomness to the predefined positions
    const position = areas[index % areas.length];
    
    // Add slight randomness to the positions
    const randomOffset = (base) => `calc(${base} + ${Math.random() * 5 - 2.5}%)`;
    
    const result = {};
    if (position.top) result.top = randomOffset(position.top);
    if (position.left) result.left = randomOffset(position.left);
    if (position.right) result.right = randomOffset(position.right);
    if (position.bottom) result.bottom = randomOffset(position.bottom);
    
    return result;
  };

  // Handle adding a new message
  const handleMessageAdded = (newMessage) => {
    setMessages(prev => [newMessage, ...prev]);
    setShowForm(false);
    // Smooth scroll to top after message is added
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle toggling the form visibility
  const toggleForm = () => {
    setShowForm(prev => !prev);
    // If closing form, reset scroll position smoothly
    if (showForm) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Hide drag hint after user interaction
  const hideDragHint = () => {
    setShowDragHint(false);
  };

  useEffect(() => {
    // Add event listeners to detect user interaction
    window.addEventListener('mousedown', hideDragHint);
    window.addEventListener('touchstart', hideDragHint);

    return () => {
      window.removeEventListener('mousedown', hideDragHint);
      window.removeEventListener('touchstart', hideDragHint);
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 mb-16 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className={`text-2xl font-semibold ${theme.primary}`}>Message Board</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/messages" className={`${theme.primary} hover:underline px-3 py-2 text-center`}>
            View All
          </Link>
          <button 
            onClick={toggleForm}
            className={`group px-4 py-2 rounded-md ${theme.button} transition-colors duration-300 flex items-center justify-center flex-1 sm:flex-auto`}
          >
            {showForm ? 'Hide Form' : (
              <>
                <span className="inline-block relative">
                  <span className="inline-block transform transition-all duration-300 group-hover:opacity-0 group-hover:scale-0">📱</span>
                  <span className="absolute left-0 top-0 transform transition-all duration-300 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100">📲</span>
                </span>
                <span className="ml-2">Leave a Message</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Drag hint */}
      {showDragHint && displayedMessages.length > 0 && (
        <div className="text-center mb-4 py-2 px-4 bg-opacity-80 dark:bg-opacity-80 bg-gray-100 dark:bg-gray-800 rounded-md transition-opacity duration-300">
          <p className={`${theme.foreground} text-sm flex items-center justify-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            Tip: You can drag the notes around to rearrange them
          </p>
        </div>
      )}

      {/* Message form - with smooth transition */}
      <div className={`transition-all duration-300 ease-in-out ${showForm ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="mb-8">
          <MessageForm onMessageAdded={handleMessageAdded} />
        </div>
      </div>

      {/* Messages display area */}
      <div className="relative w-full border border-transparent rounded-lg" style={{ height: '500px', touchAction: 'none' }}>
        {loading && (
          <div className="flex justify-center items-center h-full">
            <p className={`${theme.foreground}`}>Loading messages...</p>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && displayedMessages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <p className={`${theme.foreground}`}>No messages yet. Be the first to leave one!</p>
          </div>
        )}

        {displayedMessages.map((message) => (
          <PostItNote 
            key={message.id} 
            message={message} 
            style={message.position}
          />
        ))}
      </div>

      {/* View all messages link */}
      {messages.length > 3 && (
        <div className="text-center mt-4">
          <Link href="/messages" className={`${theme.primary} hover:underline`}>
            View all {messages.length} messages or add your own
          </Link>
        </div>
      )}
    </div>
  );
} 