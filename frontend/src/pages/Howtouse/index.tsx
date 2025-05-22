import ThreeJSBackground from '@/components/ThreeJsBackground'
import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'

function HowToUsePage() {
  const [activeSection, setActiveSection] = useState(
    'how-to-launch-website-with-us',
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Scroll handling for active section
  useEffect(() => {
    const handleScroll = () => {
      // Select all heading levels with id for accurate sidebar highlighting
      const sections = document.querySelectorAll(
        'h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]',
      )
      let currentSection = sections[0]?.id || ''
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top
        if (sectionTop <= 80) {
          // Lowered threshold for more accurate detection
          currentSection = section.id
        }
      })
      setActiveSection(currentSection)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="text-white font-sans min-h-screen flex flex-col relative">
      <Helmet>
        <title>How to Use - Launch and Bind Sui NS</title>
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
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col lg:flex-row p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* Left Section */}
        <div className="w-full lg:w-3/4 lg:pr-8">
          <h1
            id="how-to-launch-website-with-us"
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 scroll-mt-20 font-pixel"
          >
            How to launch website with us
          </h1>

          <h2 className="text-lg sm:text-xl font-semibold mb-2">Get Started</h2>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            When you launch your website through our platform, you'll be able to
            deploy your static website and make it accessible from anywhere in
            the world.
          </p>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            Our service is{' '}
            <strong>not designed to store .env files or secret keys</strong>,
            due to strict security policies. Therefore, our platform is ideal
            for <strong>public-facing sites</strong> like landing pages,
            documentation, or DApps that use a blockchain backend such as Sui,
            Ethereum, or Solana.
          </p>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            You’ll only be charged for{' '}
            <strong>deployment, updates, and time extensions</strong>—there are
            no additional fees regardless of how much <strong>bandwidth</strong>{' '}
            your site uses. This means we offer <strong>free bandwidth</strong>{' '}
            for your project. If you're ready, simply click the{' '}
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
              Project Setup
            </h2>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Once inside, the interface is split into two parts. On the{' '}
              <strong>left side</strong>, you can drop your static files or
              connect your GitHub account to choose a repository. On the{' '}
              <strong>right side</strong>, you’ll set your site name and
              configurations. If you haven’t built the site yet, we can handle
              that for you too. Once everything is set, just hit{' '}
              <strong>Deploy</strong> to launch.
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
              Deployment Status
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              After clicking deploy, you’ll be redirected to your{' '}
              <strong>dashboard</strong>. There, you can monitor your deployment
              status:
              <ul className="list-disc list-inside mt-2">
                <li>
                  <strong>Yellow</strong>: Build in progress
                </li>
                <li>
                  <strong>Green</strong>: Build successful – your site is live
                </li>
                <li>
                  <strong>Red</strong>: Build failed
                </li>
              </ul>
              Once the status is green, your site is ready to connect to{' '}
              <strong>Suins</strong>, making it instantly accessible to your
              users. After the deployment is complete, the user receives a
              SHOWCASE_URL to access the website we have prepared via our DNS.
              From this point, the user can UPDATE or DELETE the site as
              desired. For those who want a separate site or wish to configure
              their own DNS, please refer to the next section for instructions.
            </p>
          </div>

          <div className="my-8"></div>

          {/* How to set your own domain */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="w-full">
              <h2
                id="how-to-set-your-own-domain"
                className="text-lg sm:text-xl font-semibold mt-6 mb-2"
              >
                How to set your own domain
              </h2>
              <div className="bg-gray-900 p-4 rounded-lg mb-6">
                <ol className="list-decimal list-inside text-gray-300 space-y-3 text-sm sm:text-base">
                  <li>
                    <strong>Deploy your site</strong> on our platform (see steps
                    above).
                  </li>
                  <li>
                    Go to{' '}
                    <a
                      href="https://suins.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 underline"
                    >
                      suins.io
                    </a>{' '}
                    and purchase the SuiNS domain you want.
                  </li>
                  <li>
                    Return to your dashboard and click{' '}
                    <strong>Generate Site ID</strong> for your deployed site.
                  </li>
                  <li>
                    Copy the generated <strong>Site ID</strong>. You can now:
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Bind the domain yourself on the SuiNS website</li>
                      <li>
                        Or click <strong>Link to SuiNS</strong> on our dashboard
                        for a guided process
                      </li>
                    </ul>
                  </li>
                  <li>
                    If you use <strong>Link to SuiNS</strong>, follow the
                    prompts, pay the required fee, and complete the transaction.
                  </li>
                  <li>
                    Once done, you will receive a new URL for your custom
                    domain. Your site is now accessible via your SuiNS domain!
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
                    Double-check all addresses before binding to avoid mistakes
                  </li>
                  <li className="flex items-center gap-2 bg-gray-800/70 rounded-lg px-3 py-2 border-l-4 border-red-400 shadow-sm">
                    <span className="text-red-400 text-xl">⚠️</span>
                    Use a secure wallet and keep your recovery phrase safe
                  </li>
                  <li className="flex items-center gap-2 bg-gray-800/70 rounded-lg px-3 py-2 border-l-4 border-red-400 shadow-sm">
                    <span className="text-red-400 text-xl">⚠️</span>
                    Consider enabling two-factor authentication if supported
                  </li>
                  <li className="flex items-center gap-2 bg-gray-800/70 rounded-lg px-3 py-2 border-l-4 border-red-400 shadow-sm">
                    <span className="text-red-400 text-xl">⚠️</span>
                    Regularly check your domain settings to ensure they haven't
                    been tampered with
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
            On this page
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="#how-to-launch-website-with-us"
                className={
                  activeSection === 'how-to-launch-website-with-us'
                    ? 'mt-6 flex items-center border-2 border-cyan-500 bg-black px-4 py-2 rounded-lg duration-300 w-[70%]'
                    : 'pl-4 text-gray-400'
                }
              >
                How to launch website with us
              </a>
            </li>
            <li>
              <a
                href="#how-to-set-your-own-domain"
                className={
                  activeSection === 'how-to-set-your-own-domain'
                    ? 'mt-6 flex items-center border-2 border-cyan-500 bg-black px-4 py-2 rounded-lg duration-300 w-[70%]'
                    : 'pl-4 text-gray-400'
                }
              >
                How to set your own domain
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
              Back to top
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowToUsePage
