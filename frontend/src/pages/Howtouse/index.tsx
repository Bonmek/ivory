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
      const sections = document.querySelectorAll('h1[id]')
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top
        if (sectionTop <= 150) {
          setActiveSection(section.id)
        }
      })
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
      {/* Mobile Sidebar Toggle Button - enhanced styling, consistent size */}
      <button
        className="bg-secondary-500 text-white p-3 rounded-l-md shadow-md hover:bg-secondary-600 focus:ring-2 focus:ring-secondary-400 focus:outline-none transition-colors duration-200 w-12 h-12 flex items-center justify-center"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <span className="text-2xl font-bold">{isSidebarOpen ? '✕' : '☰'}</span>
      </button>

      {/* Back to Top Button - icon only, enhanced styling, consistent size */}
      <button
        className="bg-secondary-500 text-white p-3 rounded-l-md shadow-md hover:bg-secondary-600 focus:ring-2 focus:ring-secondary-400 focus:outline-none transition-colors duration-200 w-12 h-12 flex items-center justify-center"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <span className="text-2xl font-bold">↑</span>
      </button>
    </div>

      {/* Mobile Sidebar - partial height */}
      <div
        className={`lg:hidden fixed right-0 top-1/4 h-1/2 w-3/4 bg-primary-900/95 backdrop-blur-xl border-l border-t border-b border-gray-700 rounded-l-lg p-4 z-40 overflow-auto transition-all duration-300 transform ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold font-pixel">On this page</h3>
        </div>
        <ul className="space-y-2 repo-scrollbar overflow-y-auto max-h-[calc(100%-80px)]">
          <li>
            <a
              href="#how-to-launch-website-with-us"
              className={
                activeSection === 'how-to-launch-website-with-us'
                  ? 'mt-6 flex items-center border-2 border-cyan-500 bg-black px-4 py-2 rounded-lg duration-300 w-[70%]'
                  : 'pl-4 text-gray-400'
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              How to launch website with us
            </a>
          </li>
          <li>
            <a
              href="#how-to-bind-sui-ns"
              className={
                activeSection === 'how-to-bind-sui-ns'
                  ? 'mt-6 flex items-center border-2 border-cyan-500 bg-black px-4 py-2 rounded-lg duration-300 w-[70%]'
                  : 'pl-4 text-gray-400'
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              How to bind Sui NS
            </a>
            <ul className="ml-4 mt-2 space-y-1 pl-6">
              <li>
                <a
                  href="#what-is-sui-ns"
                  className="text-gray-400 text-sm hover:underline"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  What is Sui NS?
                </a>
              </li>
              <li>
                <a
                  href="#step-1"
                  className="text-gray-400 text-sm hover:underline"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Step 1: Get a Sui Wallet
                </a>
              </li>
              <li>
                <a
                  href="#step-2"
                  className="text-gray-400 text-sm hover:underline"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Step 2: Register a Domain
                </a>
              </li>
              <li>
                <a
                  href="#step-3"
                  className="text-gray-400 text-sm hover:underline"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Step 3: Access Management
                </a>
              </li>
              <li>
                <a
                  href="#step-4"
                  className="text-gray-400 text-sm hover:underline"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Step 4: Bind Your Domain
                </a>
              </li>
              <li>
                <a
                  href="#step-5"
                  className="text-gray-400 text-sm hover:underline"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Step 5: Confirm Transaction
                </a>
              </li>
              <li>
                <a
                  href="#step-6"
                  className="text-gray-400 text-sm hover:underline"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Step 6: Verify Binding
                </a>
              </li>
              <li>
                <a
                  href="#advanced"
                  className="text-gray-400 text-sm hover:underline"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Advanced Features
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  className="text-gray-400 text-sm hover:underline"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Security Tips
                </a>
              </li>
            </ul>
          </li>
        </ul>
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
            the world. Once you've connected your project to{' '}
            <strong>Suins</strong>, your site will be ready to go.
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
            <strong>Create Project</strong> button in the top tab.
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
              users.
            </p>
          </div>

          <div className="my-8"></div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1
              id="how-to-bind-sui-ns"
              className="text-2xl sm:text-3xl md:text-4xl font-bold scroll-mt-20 font-pixel"
            >
              How to bind Sui NS
            </h1>
            <button className="mt-4 sm:mt-0 hover:bg-red-600 px-4 py-2 rounded bg-gradient-to-r from-secondary-500 to-secondary-600 text-black font-pixel">
              Dashboard
            </button>
          </div>
          <p className="text-gray-400 italic mb-6 text-sm sm:text-base">
            Secure your digital identity on the Sui blockchain with personalized
            domain names that connect to your wallet addresses and digital
            assets.
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

          {/* Sui NS Binding Guide */}
          <div>
            <h2
              id="what-is-sui-ns"
              className="text-lg sm:text-xl font-semibold mb-2"
            >
              What is Sui NS?
            </h2>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Sui Name Service (Sui NS) is a decentralized domain name system
              built on the Sui blockchain. It allows users to register
              human-readable domain names (like yourname.sui) and bind them to
              wallet addresses, making transactions more user-friendly by
              replacing complex wallet addresses with simple domain names.
            </p>

            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-secondary-500 mb-2">
                Quick Start Overview
              </h3>
              <ol className="list-decimal pl-6 text-gray-300 space-y-1 text-sm sm:text-base">
                <li>Get a Sui wallet and ensure it has enough SUI tokens</li>
                <li>Register your preferred domain name on Sui NS</li>
                <li>Access domain management through the dashboard</li>
                <li>Bind addresses or content to your domain</li>
                <li>Verify all bindings are working properly</li>
              </ol>
            </div>

            <h2
              id="step-1"
              className="text-lg sm:text-xl font-semibold mt-6 mb-2"
            >
              Step 1: Get a Sui Wallet
            </h2>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Before binding a Sui NS domain, ensure you have a Sui wallet set
              up. Popular options include Sui Wallet browser extension, Suiet
              Wallet, or Ethos Wallet. Make sure your wallet has enough SUI
              tokens for domain registration and binding fees.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900 p-3 rounded-lg text-center">
                <div className="bg-gray-800 h-24 rounded flex items-center justify-center mb-2">
                  <span className="text-gray-400 text-2xl">🔑</span>
                </div>
                <h4 className="font-medium">Sui Wallet</h4>
                <p className="text-xs text-gray-400">Browser Extension</p>
              </div>
              <div className="bg-gray-900 p-3 rounded-lg text-center">
                <div className="bg-gray-800 h-24 rounded flex items-center justify-center mb-2">
                  <span className="text-gray-400 text-2xl">💼</span>
                </div>
                <h4 className="font-medium">Suiet Wallet</h4>
                <p className="text-xs text-gray-400">Web & Mobile</p>
              </div>
              <div className="bg-gray-900 p-3 rounded-lg text-center">
                <div className="bg-gray-800 h-24 rounded flex items-center justify-center mb-2">
                  <span className="text-gray-400 text-2xl">📱</span>
                </div>
                <h4 className="font-medium">Ethos Wallet</h4>
                <p className="text-xs text-gray-400">Mobile App</p>
              </div>
            </div>

            <h2
              id="step-2"
              className="text-lg sm:text-xl font-semibold mt-6 mb-2"
            >
              Step 2: Register a Sui NS Domain
            </h2>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Visit the official Sui NS website or a supported marketplace.
              Search for your desired domain name (e.g., yourname.sui). If
              available, proceed with the registration process by connecting
              your wallet and completing the payment. Registration typically
              costs between 1-10 SUI depending on the domain name length.
            </p>

            <div className="border border-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center mr-3">
                  <span className="font-bold">💡</span>
                </div>
                <h3 className="font-semibold">Naming Tips</h3>
              </div>
              <ul className="text-gray-300 space-y-1 text-sm sm:text-base">
                <li>
                  Shorter names (3-5 characters) are typically more expensive
                </li>
                <li>Only alphanumeric characters and hyphens are allowed</li>
                <li>Names are case-insensitive (example.sui = EXAMPLE.sui)</li>
                <li>Consider registering common misspellings of your domain</li>
              </ul>
            </div>

            <h2
              id="step-3"
              className="text-lg sm:text-xl font-semibold mt-6 mb-2"
            >
              Step 3: Access Your Domain Management
            </h2>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              After registration, access the Sui NS dashboard by connecting your
              wallet. Navigate to the "My Domains" section to view all domains
              you've registered. Select the domain you want to bind to access
              its management interface.
            </p>

            <h2
              id="step-4"
              className="text-lg sm:text-xl font-semibold mt-6 mb-2"
            >
              Step 4: Binding Your Domain
            </h2>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Within your domain management interface, look for the "Bind
              Address" or "Resolver" section. Here you can bind different types
              of records to your domain:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-secondary-500 mb-2">
                  Wallet Addresses
                </h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>Primary Sui address</li>
                  <li>Ethereum (ETH) address</li>
                  <li>Bitcoin (BTC) address</li>
                  <li>Other blockchain addresses</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-secondary-500 mb-2">
                  Additional Records
                </h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>Social media profiles</li>
                  <li>IPFS content hashes</li>
                  <li>Text records & metadata</li>
                  <li>Email addresses</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg mb-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3">
                Binding Process Example
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-800 p-3 rounded flex items-center">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    <span>1</span>
                  </div>
                  <div>
                    <span className="block text-sm">
                      Select record type:{' '}
                      <span className="text-secondary-500">
                        Primary Address
                      </span>
                    </span>
                  </div>
                </div>
                <div className="bg-gray-800 p-3 rounded flex items-center">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    <span>2</span>
                  </div>
                  <div>
                    <span className="block text-sm">
                      Enter your Sui address:{' '}
                      <span className="text-gray-400">0x123...abc</span>
                    </span>
                  </div>
                </div>
                <div className="bg-gray-800 p-3 rounded flex items-center">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    <span>3</span>
                  </div>
                  <div>
                    <span className="block text-sm">
                      Click <span className="text-secondary-500">Save</span> and
                      confirm in wallet
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <h2
              id="step-5"
              className="text-lg sm:text-xl font-semibold mt-6 mb-2"
            >
              Step 5: Confirm Binding Transaction
            </h2>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              After entering the address or content you want to bind, click on
              "Confirm" or "Save." Your wallet will prompt you to sign a
              transaction. This transaction typically costs a small amount of
              SUI (0.01-0.05 SUI) as a network fee. Confirm the transaction in
              your wallet.
            </p>

            <h2
              id="step-6"
              className="text-lg sm:text-xl font-semibold mt-6 mb-2"
            >
              Step 6: Verify Your Binding
            </h2>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Once the transaction is confirmed, you can verify your binding by
              using the "Lookup" feature on the Sui NS website. Enter your
              domain name, and it should display all the records you've bound to
              it. Additionally, your domain should now be usable across
              supported Sui applications and wallets.
            </p>

            <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-secondary-500 mb-6">
              <h3 className="font-semibold mb-1">Using Your Domain</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                After binding, you can share your yourname.sui domain instead of
                your complex wallet address. When someone sends SUI or other
                tokens to yourname.sui, it will automatically route to the
                wallet address you've bound to that domain.
              </p>
            </div>

            <h2
              id="advanced"
              className="text-lg sm:text-xl font-semibold mt-6 mb-2"
            >
              Advanced Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Reverse Resolution</h4>
                <p className="text-gray-300 text-sm">
                  Enable reverse lookup so your wallet address displays your
                  domain name in supported applications.
                </p>
              </div>
              <div className="border border-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Subdomains</h4>
                <p className="text-gray-300 text-sm">
                  Create and manage subdomains (e.g., app.yourname.sui) for
                  different purposes.
                </p>
              </div>
              <div className="border border-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Domain Transfer</h4>
                <p className="text-gray-300 text-sm">
                  Transfer ownership of your domain to another wallet if needed.
                </p>
              </div>
              <div className="border border-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Domain Linking</h4>
                <p className="text-gray-300 text-sm">
                  Link your domain to NFTs or other on-chain assets.
                </p>
              </div>
            </div>

            <h2
              id="security"
              className="text-lg sm:text-xl font-semibold mt-6 mb-2"
            >
              Security Tips
            </h2>
            <div className="bg-gray-900 p-4 rounded-lg mb-6">
              <ul className="text-gray-300 space-y-3 text-sm sm:text-base">
                <li className="flex">
                  <span className="text-red-400 mr-2">⚠️</span>Double-check all
                  addresses before binding to avoid mistakes
                </li>
                <li className="flex">
                  <span className="text-red-400 mr-2">⚠️</span>Use a secure
                  wallet and keep your recovery phrase safe
                </li>
                <li className="flex">
                  <span className="text-red-400 mr-2">⚠️</span>Consider enabling
                  two-factor authentication if supported
                </li>
                <li className="flex">
                  <span className="text-red-400 mr-2">⚠️</span>Regularly check
                  your domain settings to ensure they haven't been tampered with
                </li>
              </ul>
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
                href="#how-to-bind-sui-ns"
                className={
                  activeSection === 'how-to-bind-sui-ns'
                    ? 'mt-6 flex items-center border-2 border-cyan-500 bg-black px-4 py-2 rounded-lg duration-300 w-[70%]'
                    : 'pl-4 text-gray-400'
                }
              >
                How to bind Sui NS
              </a>
              <ul className="ml-4 mt-2 space-y-1 pl-6">
                <li>
                  <a
                    href="#what-is-sui-ns"
                    className="text-gray-400 text-sm hover:underline"
                  >
                    What is Sui NS?
                  </a>
                </li>
                <li>
                  <a
                    href="#step-1"
                    className="text-gray-400 text-sm hover:underline"
                  >
                    Step 1: Get a Sui Wallet
                  </a>
                </li>
                <li>
                  <a
                    href="#step-2"
                    className="text-gray-400 text-sm hover:underline"
                  >
                    Step 2: Register a Domain
                  </a>
                </li>
                <li>
                  <a
                    href="#step-3"
                    className="text-gray-400 text-sm hover:underline"
                  >
                    Step 3: Access Management
                  </a>
                </li>
                <li>
                  <a
                    href="#step-4"
                    className="text-gray-400 text-sm hover:underline"
                  >
                    Step 4: Bind Your Domain
                  </a>
                </li>
                <li>
                  <a
                    href="#step-5"
                    className="text-gray-400 text-sm hover:underline"
                  >
                    Step 5: Confirm Transaction
                  </a>
                </li>
                <li>
                  <a
                    href="#step-6"
                    className="text-gray-400 text-sm hover:underline"
                  >
                    Step 6: Verify Binding
                  </a>
                </li>
                <li>
                  <a
                    href="#advanced"
                    className="text-gray-400 text-sm hover:underline"
                  >
                    Advanced Features
                  </a>
                </li>
                <li>
                  <a
                    href="#security"
                    className="text-gray-400 text-sm hover:underline"
                  >
                    Security Tips
                  </a>
                </li>
              </ul>
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
