"use client";
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function MessageForm({ onMessageAdded }) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Basic validation
      if (!message.trim()) {
        setError('Please enter a message');
        setIsSubmitting(false);
        return;
      }

      // Submit the message
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Clear form
      setName('');
      setMessage('');
      setSuccess('Your message has been posted!');
      
      // Notify parent component
      if (onMessageAdded) {
        onMessageAdded(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`border ${theme.accent} rounded-lg p-6 shadow-md w-full max-w-md mx-auto`}>
      <h2 className={`text-xl font-semibold mb-4 ${theme.primary}`}>Leave a Message</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className={`block mb-2 text-sm font-medium ${theme.foreground}`}>
            Your Name (optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anonymous"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="message" className={`block mb-2 text-sm font-medium ${theme.foreground}`}>
            Your Message*
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts..."
            rows="4"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700"
            required
          ></textarea>
        </div>

        {error && (
          <div className="mb-4 text-red-500 text-sm">{error}</div>
        )}

        {success && (
          <div className="mb-4 text-green-500 text-sm">{success}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded-md ${theme.button} transition-colors duration-300 flex justify-center items-center`}
        >
          {isSubmitting ? (
            <span>Sending...</span>
          ) : (
            <span>Post Message</span>
          )}
        </button>
      </form>
    </div>
  );
} 