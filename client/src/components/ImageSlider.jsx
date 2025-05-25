import React, { useState, useEffect } from "react";

const titlesAndDescriptions = [
  { title: "Explore New Ideas", description: "Discover a vibrant world of creativity and innovation." },
  { title: "Empower Your Journey", description: "Unlock opportunities with dynamic experiences." },
  { title: "Create the Future", description: "Shape tomorrow with bold and fresh perspectives." },
];

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === titlesAndDescriptions.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? titlesAndDescriptions.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Switch every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 animate-gradient opacity-90"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full text-white text-center px-6">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 animate-fadeInDown">
          {titlesAndDescriptions[currentIndex].title}
        </h2>
        <p className="text-sm sm:text-lg md:text-2xl max-w-2xl animate-fadeInUp">
          {titlesAndDescriptions[currentIndex].description}
        </p>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-0 flex items-center justify-between px-4 md:px-8 z-20">
        <button
          onClick={prevSlide}
          className="bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full p-3 transition"
        >
          ◀
        </button>
        <button
          onClick={nextSlide}
          className="bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full p-3 transition"
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default ImageSlider;
