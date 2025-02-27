"use client";
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function MessageForm({ onMessageAdded }) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset scroll position when form is submitted successfully
  useEffect(() => {
    if (success) {
      window.scrollTo(0, 0);
    }
  }, [success]);

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

      // Clear form and show success
      setName('');
      setMessage('');
      setSuccess('Your message has been posted!');
      
      // Notify parent component
      if (onMessageAdded) {
        onMessageAdded(data.message);
      }

      // Reset any zoomed state on mobile
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`border ${theme.accent} rounded-lg p-4 sm:p-6 md:p-8 shadow-md w-full max-w-md mx-auto`}>
      <h2 className={`text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 md:mb-6 ${theme.primary}`}>Leave a Message</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1 sm:space-y-2">
          <label htmlFor="name" className={`block text-sm font-medium ${theme.foreground}`}>
            Your Name (optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anonymous"
            className="w-full px-3 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700"
            style={{ fontSize: '16px' }} // Prevents iOS zoom
          />
        </div>

        <div className="space-y-1 sm:space-y-2">
          <label htmlFor="message" className={`block text-sm font-medium ${theme.foreground}`}>
            Your Message*
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts..."
            rows="4"
            className="w-full px-3 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700"
            style={{ fontSize: '16px' }} // Prevents iOS zoom
            required
          ></textarea>
        </div>

        {error && (
          <div className="text-sm text-red-500 mt-2">{error}</div>
        )}

        {success && (
          <div className="text-sm text-green-500 mt-2">{success}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 text-base rounded-md ${theme.button} transition-colors duration-300 flex justify-center items-center mt-4`}
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