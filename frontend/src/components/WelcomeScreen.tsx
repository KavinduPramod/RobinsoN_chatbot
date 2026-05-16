import React from 'react';

interface WelcomeScreenProps {
  onStarterClick: (question: string) => void;
}

export default function WelcomeScreen({ onStarterClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-60vh text-center py-10 px-4 md:px-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center font-display font-bold text-2xl text-white mb-5 shadow-lg" style={{boxShadow: '0 0 40px rgba(124,106,255,0.3)'}}>
        R
      </div>
      
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 leading-tight bg-gradient-to-r from-text to-accent2 bg-clip-text text-transparent">
        Hey, I'm Robin
      </h1>
      
      <p className="text-text3 text-sm max-w-md md:max-w-lg leading-relaxed mb-6">
        Your smart, reliable AI assistant. Ask me anything — code, concepts, creative tasks, or just a chat.
      </p>

      <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl bg-surface border border-border rounded-2xl px-6 py-8">
        <div className="space-y-4 text-left text-text2 text-sm leading-relaxed">
          <div>
            <h3 className="font-semibold text-text mb-2">💡 What I can help with:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Explain complex concepts and topics</li>
              <li>Help with coding and development</li>
              <li>Creative writing and brainstorming</li>
              <li>General questions and advice</li>
            </ul>
          </div>
          <div className="pt-2">
            <p>Just type your question below and I'll do my best to help! 🚀</p>
          </div>
        </div>
      </div>
    </div>
  );
}
