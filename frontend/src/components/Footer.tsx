import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center py-5">
      {/* Social Media Section */}
      <div className="container mx-auto px-4 pb-4">
        <div className="flex justify-center space-x-2 mb-4">
          {/* Facebook */}
          <a
            href="#!"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white text-white hover:bg-white hover:text-gray-800 transition"
          >
            <i className="fab fa-facebook-f"></i>
          </a>
          {/* Twitter */}
          <a
            href="#!"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white text-white hover:bg-white hover:text-gray-800 transition"
          >
            <i className="fab fa-twitter"></i>
          </a>
          {/* Google */}
          <a
            href="#!"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white text-white hover:bg-white hover:text-gray-800 transition"
          >
            <i className="fab fa-google"></i>
          </a>
          {/* Instagram */}
          <a
            href="#!"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white text-white hover:bg-white hover:text-gray-800 transition"
          >
            <i className="fab fa-instagram"></i>
          </a>
          {/* LinkedIn */}
          <a
            href="#!"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white text-white hover:bg-white hover:text-gray-800 transition"
          >
            <i className="fab fa-linkedin-in"></i>
          </a>
          {/* GitHub */}
          <a
            href="#!"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white text-white hover:bg-white hover:text-gray-800 transition"
          >
            <i className="fab fa-github"></i>
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