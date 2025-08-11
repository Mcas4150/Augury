import Image from 'next/image';
import React from 'react';

const ScrollComponent = ({ children }) => {
  return (
    <div className="relative w-full h-full">
      <Image
        src="/media/scroll.png"
        alt="Scroll background"
        layout="fill"
        objectFit="contain"
        quality={100}
        priority
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-lg h-3/5 p-4 overflow-y-auto">
          {/* The class change is on the next line */}
          <div className="flex flex-col items-center font-roman text-lg text-gray-800 text-center whitespace-pre-wrap leading-relaxed font-bold">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollComponent;