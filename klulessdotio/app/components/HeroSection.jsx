'use client';
import React from 'react';
import Typewriter from 'typewriter-effect';

const HeroSection = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center">
        <h1 className="text-white">Illuminated by God</h1>
        <h1>-</h1>
        <h1 className="text-orange-400">
        <Typewriter
          options={{
            strings: [
              "Filho do céu",
              "благословленный небесами",
              "विश्व रक्षक"
            ],
          autoStart: true,
          loop: true,
          }}
        />
      </h1>
    </section>
  );
}
export default HeroSection;
