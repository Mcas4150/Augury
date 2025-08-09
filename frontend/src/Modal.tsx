"use client";
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';

// Array of your sound file paths
const openSounds = [
  '/book_flips/book_flip.1.ogg',
  '/book_flips/book_flip.2.ogg',
  '/book_flips/book_flip.3.ogg',
  '/book_flips/book_flip.4.ogg',
  '/book_flips/book_flip.5.ogg',
  '/book_flips/book_flip.6.ogg',
  '/book_flips/book_flip.7.ogg',
  '/book_flips/book_flip.8.ogg',
  '/book_flips/book_flip.9.ogg',
  '/book_flips/book_flip.10.ogg',
];

export default function Modal({ isOpen, onClose, children }) {
  
  // This effect runs whenever the 'isOpen' prop changes
  useEffect(() => {
    if (isOpen) {
      // Select a random sound from the array
      const randomSoundSrc = openSounds[Math.floor(Math.random() * openSounds.length)];
      const audio = new Audio(randomSoundSrc);
      audio.play();
    }
  }, [isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-7xl transform transition-all">
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}