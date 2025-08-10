import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

// The component now accepts a "continueLink" prop
const ScrollComponent = ({ children, continueLink = "/" }) => {
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg h-3/5 p-4 overflow-y-auto">
          <div className="font-roman text-lg text-gray-800 text-left whitespace-pre-wrap leading-relaxed font-bold">
            {children}
          </div>
        </div>
        <div className="mt-4">
          <Link href={continueLink} className="font-roman text-xl text-black hover:underline font-bold">
            Continue your journey 
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ScrollComponent;