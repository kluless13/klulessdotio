'use client';

import React from 'react';

const TypographyShowcase = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-card rounded-lg shadow-md">
      <h1 className="mb-6">Typography Showcase</h1>
      
      <section className="mb-10">
        <h2 className="text-primary mb-4">Headings (Work Sans)</h2>
        <div className="space-y-4">
          <h1>Heading 1 - Elegant & Bold</h1>
          <h2>Heading 2 - Creative Design</h2>
          <h3>Heading 3 - Professional Look</h3>
          <h4>Heading 4 - Refined Style</h4>
          <h5>Heading 5 - Sleek Typography</h5>
          <h6>Heading 6 - Minimal Approach</h6>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-primary mb-4">Body Text (Poppins)</h2>
        <p className="mb-4">
          This is a paragraph set in Poppins. It demonstrates the clean and modern look of this sans-serif font,
          perfect for body text. Poppins pairs excellently with Work Sans, creating a balanced and
          professional appearance that works well for a portfolio site.
        </p>
        <p className="mb-4">
          The contrast between the modern sans-serif headings and the crisp sans-serif body text creates visual
          interest while maintaining excellent readability. This pairing combines modern simplicity with
          clean design.
        </p>
        <p>
          <span className="font-normal">Normal weight text</span> &middot;
          <span className="font-normal"> Medium weight text</span> &middot;
          <span className="font-normal"> Bold text</span> &middot;
          <span className="italic"> Italic text</span> &middot;
          <span className="underline"> Underlined text</span>
        </p>
      </section>
      
      <section>
        <h2 className="text-primary mb-4">Special Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-primary/30 rounded-md">
            <h3 className="heading-accent mb-2">Featured Project</h3>
            <p>Using the special heading-accent class to highlight important information with Work Sans.</p>
          </div>
          <div className="p-4 border border-primary/30 rounded-md">
            <h3 className="heading-accent mb-2">Client Testimonial</h3>
            <p>Another example of using the heading-accent class for important headings.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TypographyShowcase; 