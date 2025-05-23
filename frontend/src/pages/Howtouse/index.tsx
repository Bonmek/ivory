import ThreeJSBackground from '@/components/ThreeJsBackground'
import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useIntl, FormattedMessage } from 'react-intl'

function HowToUsePage() {
  const [activeSection, setActiveSection] = useState(
    'how-to-launch-website-with-us',
  )
  const { formatMessage } = useIntl()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Scroll handling for active section
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    const handleScroll = () => {
      // Prevent immediate updates to allow navigation clicks to complete
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        // Select all heading levels and divs with id for accurate sidebar highlighting
        const sections = document.querySelectorAll(
          'h1[id],h2[id],h3[id],h4[id],h5[id],h6[id],div[id]',
        )
        let currentSection = sections[0]?.id || ''
        
        // Calculate dynamic thresholds based on viewport height
        const viewportHeight = window.innerHeight;
        const topThreshold = viewportHeight * 0.1; // 10% of viewport height
        const bottomThreshold = viewportHeight * 0.4; // 40% of viewport height
        
        // Find the section closest to the top of the viewport
        let closestSection = sections[0];
        let closestDistance = Infinity;
        
        sections.forEach((section) => {
          const sectionTop = section.getBoundingClientRect().top;
          const distanceFromTop = Math.abs(sectionTop);
          
          // Update if this section is closer to the top and within viewport
          if (distanceFromTop < closestDistance && sectionTop >= -topThreshold && sectionTop <= bottomThreshold) {
            closestDistance = distanceFromTop;
            closestSection = section;
          }
        });
        
        if (closestSection) {
          currentSection = closestSection.id;
        }
        
        setActiveSection(currentSection)
      }, 100); // Small delay to allow navigation clicks to complete
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="text-white font-sans min-h-screen flex flex-col relative">
      <Helmet>
        <title>{formatMessage({ id: 'howtouse.title' })}</title>
      </Helmet>

      {/* ThreeJS Background */}
      <div className="fixed inset-0 z-0">
        <ThreeJSBackground />
      </div>

      {/* Container for Mobile Buttons */}
      <div className="fixed top-1/2 right-0 transform -translate-y-1/2 flex flex-col items-end gap-2 lg:hidden">
        {/* Back to Top Button - icon only, enhanced styling, consistent size */}
        <button
          className="bg-secondary-500 text-white p-3 rounded-l-md shadow-md hover:bg-secondary-600 focus:ring-2 focus:ring-secondary-400 focus:outline-none transition-colors duration-200 w-12 h-12 flex items-center justify-center"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="text-2xl font-bold">↑</span>
          <span className="text-sm">{formatMessage({ id: 'howtouse.backToTop' })}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col lg:flex-row p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* Left Section */}
        <div className="w-full lg:w-3/4 lg:pr-8">
          <h2
            id="how-to-launch-website-with-us"
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 scroll-mt-20 font-pixel"
          >
            <FormattedMessage id="howtouse.section1.title" />
          </h2>

          <h2 className="text-lg sm:text-xl font-semibold mb-2">
            <FormattedMessage id="howtouse.section1.getStarted" />
          </h2>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            <FormattedMessage id="howtouse.section1.description1" />
          </p>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            <FormattedMessage id="howtouse.section1.description2" />
          </p>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            {formatMessage({ id: 'howtouse.section1.description3' })}
          </p>

          {/* Video Embed */}
          <div className="h-120 rounded mb-6 relative flex justify-center">
            <iframe
              width="70%"
              height="100%"
              src="https://www.youtube.com/embed/czEy7XoeVa0?si=xCJmp2tXK2CEcBTh"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded YouTube Video"
            ></iframe>
          </div>

          {/* Launch Info Text */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mt-4 mb-2">
              <FormattedMessage id="howtouse.section2.title" />
            </h2>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              <FormattedMessage id="howtouse.section2.description" />
            </p>
            <div className="flex justify-center mb-6">
              <img
                src="/images/walrus_building.png"
                alt="UI mockup: Ivory deploy interface"
                className="rounded-lg shadow-lg max-w-full w-[340px] sm:w-[480px] border border-cyan-700 bg-gray-800"
                loading="lazy"
              />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold mt-4 mb-2">
              <FormattedMessage id="howtouse.section3.title" />
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              <FormattedMessage id="howtouse.section3.description" />
            </p>
          </div>

          <div className="my-8"></div>

          {/* How to set your own domain */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="w-full">
              <h2
                id="how-to-set-your-own-domain"
                className="text-3xl sm:text-4xl md:text-5xl font-bold mt-8 mb-4 font-pixel"
              >
                {formatMessage({ id: 'howtouse.section4.title' })}
              </h2>
              <div className="bg-gray-900 p-4 rounded-lg mb-6">
                <ol className="list-decimal list-inside text-gray-300 space-y-3 text-sm sm:text-base">
                  <li>
                    {formatMessage({ id: 'howtouse.section4.step1' })}
                  </li>
                  <li>
                    {formatMessage({ id: 'howtouse.section4.step2' })}
                  </li>
                  <li>
                    {formatMessage({ id: 'howtouse.section4.step3' })}
                  </li>
                  <li>
                    {formatMessage({ id: 'howtouse.section4.step4' })}
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>{formatMessage({ id: 'howtouse.section4.step4.option1' })}</li>
                      <li>{formatMessage({ id: 'howtouse.section4.step4.option2' })}</li>
                    </ul>
                  </li>
                  <li>
                    {formatMessage({ id: 'howtouse.section4.step5' })}
                  </li>
                  <li>
                    {formatMessage({ id: 'howtouse.section4.step6' })}
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Security Tips */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="w-full">
              <h2
                id="security"
                className="text-lg sm:text-xl font-semibold mt-6 mb-4 flex items-center gap-2 text-red-300 drop-shadow-lg"
              >
                <svg
                  className="h-6 w-6 text-red-400 animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                  />
                </svg>
                Security Tips
              </h2>
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-5 rounded-xl mb-6 border border-red-400/30 shadow-lg relative overflow-hidden">
                <div className="absolute -top-4 -right-4 opacity-20 pointer-events-none select-none">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="#f87171"
                      strokeWidth="6"
                      strokeDasharray="8 8"
                    />
                  </svg>
                </div>
                <ul className="text-gray-200 space-y-4 text-base sm:text-lg font-medium">
                  <li className="flex items-center gap-2 bg-gray-800/70 rounded-lg px-3 py-2 border-l-4 border-red-400 shadow-sm">
                    <span className="text-red-400 text-xl">⚠️</span>
                    {formatMessage({ id: 'howtouse.securityTips.checkAddresses' })}
                  </li>
                  <li className="flex items-center gap-2 bg-gray-800/70 rounded-lg px-3 py-2 border-l-4 border-red-400 shadow-sm">
                    <span className="text-red-400 text-xl">⚠️</span>
                    {formatMessage({ id: 'howtouse.securityTips.secureWallet' })}
                  </li>
                  <li className="flex items-center gap-2 bg-gray-800/70 rounded-lg px-3 py-2 border-l-4 border-red-400 shadow-sm">
                    <span className="text-red-400 text-xl">⚠️</span>
                    {formatMessage({ id: 'howtouse.securityTips.twoFactor' })}
                  </li>
                  <li className="flex items-center gap-2 bg-gray-800/70 rounded-lg px-3 py-2 border-l-4 border-red-400 shadow-sm">
                    <span className="text-red-400 text-xl">⚠️</span>
                    {formatMessage({ id: 'howtouse.securityTips.checkSettings' })}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar (Desktop) */}
        <div
          className={`hidden lg:block w-full lg:w-1/4 p-4 border-l border-gray-700 fixed right-0 top-20 h-[calc(100vh-80px)] overflow-auto transition-transform duration-300`}
        >
          <h3 className="text-lg font-semibold mb-4 font-pixel">
            <FormattedMessage id="howtouse.sidebar.title" />
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="#how-to-launch-website-with-us"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection('how-to-launch-website-with-us');
                  const target = document.getElementById('how-to-launch-website-with-us');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={
                  activeSection === 'how-to-launch-website-with-us'
                    ? 'mt-6 flex items-center border-2 border-cyan-500 bg-black px-4 py-2 rounded-lg duration-300 w-[70%]'
                    : 'pl-4 text-gray-400'
                }
              >
                <FormattedMessage id="howtouse.sidebar.section1" />
              </a>
            </li>
            <li>
              <a
                href="#how-to-set-your-own-domain"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection('how-to-set-your-own-domain');
                  // Give a small delay to ensure the active section is updated before scrolling
                  setTimeout(() => {
                    const target = document.getElementById('how-to-set-your-own-domain');
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 50);
                }}
                className={
                  activeSection === 'how-to-set-your-own-domain'
                    ? 'mt-6 flex items-center border-2 border-cyan-500 bg-black px-4 py-2 rounded-lg duration-300 w-[70%]'
                    : 'pl-4 text-gray-400'
                }
              >
                {formatMessage({ id: 'howtouse.sidebar.section4' })}
              </a>
              <ul className="ml-4 mt-2 space-y-1 pl-6"></ul>
            </li>
          </ul>
          <div className="mt-6 flex items-center bg-gradient-to-r from-secondary-500 to-secondary-600 px-4 py-2 rounded-lg border-2 border-gradient-to-r from-secondary-500 to-secondary-600 hover:bg-gradient-to-r from-secondary-500/10 to-secondary-600/10 transition-all duration-300 w-[70%]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white mr-2 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 15l7-7 7 7"
              />
            </svg>
            <a href="#" className="text-white hover:text-secondary-300">
              {formatMessage({ id: 'howtouse.backToTop' })}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowToUsePage
