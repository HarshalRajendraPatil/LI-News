import React, { useState } from 'react'
import { GoogleGenAI } from "@google/genai";
import axios from 'axios';
;

const FetchNewsData = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [error, setError] = useState('');

    const ai = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    });

    async function fetchNewsData() {
        setIsLoading(true);
        try {
            const response = await ai.models.generateContent({
                model: import.meta.env.VITE_GEMINI_MODEL,
                contents: `You are a senior tech analyst and LinkedIn content expert. Create a professional LinkedIn post about the latest tech industry updates and releases.

REQUIREMENTS:
- Write in a professional, engaging tone suitable for LinkedIn
- Keep it under 300 words for optimal engagement
- Use clear, scannable formatting
- Include specific company names, product names, and dates when available
- Make it valuable for tech professionals, managers, and business leaders

STRUCTURE:
1. Start with a compelling hook (question or bold statement)
2. Present 5 major tech updates in a clean, numbered list format
3. For each update, include:
   - Company name and product/feature
   - Brief description of what it is
   - Why it matters for businesses/professionals
   - Add a source link to the company/product/feature
   - Add a relevant emoji to the update
   - No month or year is needed
4. End with an engaging question to encourage comments
5. Add 5-7 relevant hashtags

        FORMATTING RULES:
        - Use emojis sparingly and professionally (🚀, 💡, 🔥, etc.)
        - Use line breaks for readability
        - Keep sentences concise and impactful
        - Write in plain text only - no bold, italic, or special formatting
        - Remove any unnecessary characters or formatting

CONTENT FOCUS:
- AI/ML breakthroughs and releases
- Major software updates and new features
- Cloud computing innovations
- Cybersecurity developments
- Developer tools and platforms
- Enterprise software releases
- Tech industry partnerships and acquisitions

Make sure the content is current, accurate, and provides real value to LinkedIn's professional audience.`
            });
            
            let generatedContent = response.text;
            
                            // Clean up the content for plain text formatting
                generatedContent = generatedContent
                    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
                    .replace(/`([^`]+)`/g, '$1') // Remove inline code formatting
                    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
                    .replace(/\*([^*]+)\*/g, '$1') // Remove italic formatting
                    .replace(/__([^_]+)__/g, '$1') // Remove underline formatting
                    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove link formatting, keep text
                    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
                    .replace(/^\s+|\s+$/g, '') // Trim whitespace
                    .replace(/([.!?])\s*\n/g, '$1\n\n') // Add proper spacing after sentences
                    .replace(/(\d+\.)\s*/g, '$1 ') // Fix numbered list formatting
                    .replace(/([a-zA-Z])\n([a-zA-Z])/g, '$1 $2'); // Fix broken words
            
            setContent(generatedContent);
            setEditedContent(generatedContent);
        } catch (error) {
            console.error('Error fetching news data:', error);
            setError('Error fetching news data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    const handleEdit = () => {
        setIsEditing(true);
        setEditedContent(content);
    };

    const handleSave = () => {
        setContent(editedContent);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedContent(content);
        setIsEditing(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        // You could add a toast notification here
        alert('Content copied to clipboard!');
    };

    const addSourceLink = () => {
        const url = prompt('Enter source URL:');
        if (url) {
            const sourceText = `\n\n📖 Source: ${url}`;
            setContent(prev => prev + sourceText);
            setEditedContent(prev => prev + sourceText);
        }
    };

    const handlePostOnLinkedIn = async () => {
        try {
            // First, get user info to extract the user ID via proxy
            const userResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/linkedin/userinfo`, {
                accessToken: import.meta.env.VITE_ACCESS_TOKEN
            });
            
            const userId = userResponse.data.sub;
            
            // Create the LinkedIn post data
            const postData = {
                author: `urn:li:person:${userId}`,
                lifecycleState: "PUBLISHED",
                specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                        shareCommentary: {
                            text: content
                        },
                        shareMediaCategory: "NONE"
                    }
                },
                visibility: {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            };

            // Post to LinkedIn via proxy
            const postResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/linkedin/post`, {
                accessToken: import.meta.env.VITE_ACCESS_TOKEN,
                postData: postData
            });
            
            console.log('Successfully posted to LinkedIn:', postResponse.data);
            alert('Successfully posted to LinkedIn! 🎉');
        } catch (error) {
            console.error('Error posting on LinkedIn:', error);
            setError('Error posting on LinkedIn. Please try again.');
            if (error.code === 'ECONNREFUSED') {
                alert('Backend server is not running. Please start it with: npm run server');
            } else if (error.response?.status === 401) {
                alert('LinkedIn access token expired or invalid. Please update your token.');
            } else if (error.response?.status === 403) {
                alert('Insufficient permissions. Ensure your app has posting rights.');
            } else {
                alert(`Error posting to LinkedIn: ${error.response?.data?.error || error.message}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br w-screen from-slate-50 to-blue-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        AI Tech News Generator
                    </h1>
                    <p className="text-lg text-gray-600">
                        Generate and customize professional LinkedIn posts about the latest tech industry updates
                    </p>
                </div>

                {/* Action Button */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="text-center">
                        <button
                            onClick={fetchNewsData}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-3">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    <span>Generating Content...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>Generate Tech News Post</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content Display */}
                {content && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Content Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Generated LinkedIn Post
                                </h2>
                                <div className="flex space-x-3">
                                    {!isEditing ? (
                                        <>
                                            <button
                                                onClick={handleEdit}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={addSourceLink}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                <span>Add Source</span>
                                            </button>
                                            <button
                                                onClick={handleCopy}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                <span>Copy</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleSave}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>Save</span>
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                <span>Cancel</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6">
                                               {isEditing ? (
                       <textarea
                           value={editedContent}
                           onChange={(e) => setEditedContent(e.target.value)}
                           placeholder="Edit your LinkedIn post content here..."
                           className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black focus:border-blue-500 resize-none text-sm leading-relaxed"
                           style={{ 
                               fontFamily: 'system-ui, -apple-system, sans-serif',
                               lineHeight: '1.6'
                           }}
                       />
                   ) : (
                                <div className="prose prose-lg max-w-none">
                                    <div 
                                        className="whitespace-pre-wrap text-gray-800 leading-relaxed"
                                        style={{ 
                                            lineHeight: '1.7',
                                            fontSize: '16px'
                                        }}
                                    >
                                        {content}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center space-x-4">
                                    <span className="flex items-center space-x-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>{content.length} characters</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Generated by AI</span>
                                    </span>
                                </div>
                                <button onClick={handlePostOnLinkedIn} className={`text-xs text-gray-500 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 hover:scale-105 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:${error}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Post on LinkedIn
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                {!content && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                                    How to Use
                                </h3>
                                <ol className="list-decimal list-inside space-y-2 text-blue-700">
                                    <li>Click "Generate Tech News Post" to create AI-powered content</li>
                                    <li>Review the generated LinkedIn post with proper formatting</li>
                                    <li>Use the "Edit" button to open the text editor</li>
                                    <li>Add source links with the "Add Source" button</li>
                                    <li>Copy the final content or post directly to LinkedIn</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FetchNewsData