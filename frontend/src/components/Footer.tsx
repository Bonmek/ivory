import React from 'react';
// TODO: Update social media links and replace logos/icons to match the actual project in the future.

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center py-5">
      {/* Social Media Section */}
      <div className="container mx-auto px-4 pb-4">
        <div className="flex justify-center space-x-2 mb-4">
          {/* Twitter or X*/}
          <a
            href="https://x.com/?lang=th"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white text-white hover:bg-white hover:text-gray-800 transition"
          >
          {/* Instagram */}
          <a
            href="https://www.instagram.com/"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white text-white hover:bg-white hover:text-gray-800 transition"
          >
            <i className="fab fa-instagram"></i>
          </a>
            <i className="fab fa-twitter"></i>
          </a>
          {/* Discord */}
          <a
            href="https://discord.com/"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white text-white hover:bg-white hover:text-gray-800 transition"
          >
            <i className="fab fa-discord"></i>
          </a>
          {/* Telegram */}
          <a
            href="https://web.telegram.org/"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white text-white hover:bg-white hover:text-gray-800 transition"
          >
            <i className="fab fa-telegram"></i>
          </a>
        </div>
      </div>
      {/* Copyright Section */}
      <div className="bg-black bg-opacity-20 py-3">
        © 2020 Copyright:{' '}
        <a href="https://mdbootstrap.com/" className="text-white hover:underline">
          MDBootstrap.com
        </a>
      </div>
    </footer>
  );
};

export default Footer;