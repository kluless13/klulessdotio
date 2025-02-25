"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';
import MessageForm from '../components/MessageForm';

export default function MessagesPage() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

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

  // Map color names to tailwind classes
  const colorClasses = {
    yellow: 'bg-yellow-100 dark:bg-yellow-800',
    blue: 'bg-blue-100 dark:bg-blue-800',
    green: 'bg-green-100 dark:bg-green-800',
    pink: 'bg-pink-100 dark:bg-pink-800',
    orange: 'bg-orange-100 dark:bg-orange-800',
    purple: 'bg-purple-100 dark:bg-purple-800',
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle adding a new message
  const handleMessageAdded = (newMessage) => {
    setMessages(prev => [newMessage, ...prev]);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className={`${theme.primary} hover:underline mb-6 inline-block`}>
          ← Back to Home
        </Link>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-4xl font-bold ${theme.primary}`}>Message Board</h1>
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 rounded-md ${theme.button} transition-colors duration-300`}
          >
            {showForm ? 'Hide Form' : 'Leave a Message'}
          </button>
        </div>

        {/* Message form */}
        {showForm && (
          <div className="mb-12">
            <MessageForm onMessageAdded={handleMessageAdded} />
          </div>
        )}

        {/* Messages display */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className={`${theme.foreground}`}>Loading messages...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className={`${theme.foreground} mb-4`}>There are no messages yet.</p>
            <button 
              onClick={() => setShowForm(true)}
              className={`px-4 py-2 rounded-md ${theme.button} transition-colors duration-300`}
            >
              Be the first to leave a message!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`${colorClasses[message.color] || colorClasses.yellow} rounded-lg shadow-md p-5 transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]`}
              >
                <p className="text-sm mb-4 italic">{message.message}</p>
                <div className="mt-auto">
                  <p className={`text-sm font-semibold ${theme.name === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    — {message.name}
                  </p>
                  <p className={`text-xs ${theme.name === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {formatDate(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 