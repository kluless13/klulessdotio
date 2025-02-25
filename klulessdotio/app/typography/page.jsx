import React from 'react';
import TypographyShowcase from '../components/TypographyShowcase';

export default function TypographyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-background text-foreground">
      <div className="w-full max-w-5xl">
        <h1 className="text-primary mb-8">Font Showcase</h1>
        <p className="mb-8 text-lg">
          This page demonstrates the beautiful font pairing of <span className="font-worksans font-bold">Work Sans</span> for 
          headings and <span className="font-poppins font-medium">Poppins</span> for body text.
        </p>
        
        <TypographyShowcase />
      </div>
    </main>
  );
} 