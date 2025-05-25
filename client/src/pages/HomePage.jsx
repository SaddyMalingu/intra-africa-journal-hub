// src/components/HomePage.jsx
import React from "react";

const HomePage = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen font-serif">
      {/* Sidebar */}
      <aside className="bg-primary text-white p-10 md:w-1/3 flex flex-col justify-center animate-slideInUp">
        <h1 className="text-4xl font-bold leading-tight">
          Intra Africa Journal Hub
        </h1>
        <p className="mt-6 text-lg">
          Expand your Wisdom and Understanding. Discover, Connect, and Publish Excellence.
        </p>
        <a
          href="/submit"
          className="mt-10 inline-block bg-white text-primary font-bold py-3 px-6 rounded-full shadow hover:bg-gray-100 transition"
        >
          Submit your Manuscript
        </a>
      </aside>

      {/* Content */}
      <main className="md:w-2/3 p-10 space-y-12 animate-fadeIn">
        <article>
          <p className="text-gray-500">May 11, 2025</p>
          <h2 className="text-2xl font-bold text-primary">
            The Art of Connection
          </h2>
          <p className="mt-2 text-gray-800 leading-relaxed">
            In the ever-evolving world, the art of forging genuine connections remains timeless. Whether it's with colleagues, clients, or partners, establishing a genuine rapport paves the way for collaborative success.
          </p>
        </article>

        <article>
          <p className="text-gray-500">May 11, 2025</p>
          <h2 className="text-2xl font-bold text-primary">
            Beyond the Obstacle
          </h2>
          <p className="mt-2 text-gray-800 leading-relaxed">
            Challenges in business are a given, but it’s our response to them that defines our trajectory. Looking beyond the immediate obstacle, there lies a realm of opportunity and learning.
          </p>
        </article>
      </main>
    </div>
  );
};

export default HomePage;
