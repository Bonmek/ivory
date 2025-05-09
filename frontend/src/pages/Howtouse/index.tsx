import ThreeJSBackground from '@/components/ThreeJsBackground'
import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'

function HowToUsePage() {
  const [activeSection, setActiveSection] = useState(
    'how-to-launch-website-with-us',
  )

  // Function to check which section is in view
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('h1[id]')

      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top

        // If the section is near the top of the viewport, set it as active
        if (sectionTop <= 100) {
          setActiveSection(section.id)
        }
      })
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll)

    // Initial check on page load
    handleScroll()

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="text-white font-sans min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="mt-20 flex p-8">
        {/* Left Section */}
        <div className="w-3/4 pr-8">
          <h1
            id="how-to-launch-website-with-us"
            className="text-4xl font-bold mb-4"
          >
            How to launch website with us
          </h1>

          <h2 className="text-xl font-semibold mb-2">Get Started</h2>
            <p className="text-gray-300 mb-4">
              When you launch your website through our platform, you'll be able to deploy your static website and make it accessible from anywhere in the world. Once you've connected your project to <strong>Suins</strong>, your site will be ready to go.
            </p>
            <p className="text-gray-300 mb-4">
              Our service is <strong>not designed to store .env files or secret keys</strong>, due to strict security policies. Therefore, our platform is ideal for <strong>public-facing sites</strong> like landing pages, documentation, or DApps that use a blockchain backend such as Sui, Ethereum, or Solana.
            </p>
            <p className="text-gray-300 mb-4">
              You’ll only be charged for <strong>deployment, updates, and time extensions</strong>—there are no additional fees regardless of how much <strong>bandwidth</strong> your site uses. This means we offer <strong>free bandwidth</strong> for your project.
              If you're ready, simply click the <strong>Create Project</strong> button in the top tab.
            </p>

          {/* Video Placeholder - Replaced with YouTube Embed */}
          <div className="h-120 rounded mb-6 relative flex justify-center">
            <iframe
              width="70%"
              height="100%"
              src="https://www.youtube.com/embed/YmS8WSapXBo?si=pIE37D18TjRBtfKK"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded YouTube Video"
            ></iframe>
          </div>

          {/* Launch Info Text */}
          <div>
            
          <h2 className="text-xl font-semibold mt-4 mb-2">Project Setup</h2>
            <p className="text-gray-300 mb-4">
              Once inside, the interface is split into two parts. On the <strong>left side</strong>, you can drop your static files or connect your GitHub account to choose a repository. On the <strong>right side</strong>, you’ll set your site name and configurations.
              If you haven’t built the site yet, we can handle that for you too. Once everything is set, just hit <strong>Deploy</strong> to launch.
            </p>
            <h2 className="text-xl font-semibold mt-4 mb-2">Deployment Status</h2>
            <p className="text-gray-300">
              After clicking deploy, you’ll be redirected to your <strong>dashboard</strong>. There, you can monitor your deployment status:
              <ul className="list-disc list-inside mt-2">
                <li><strong>Yellow</strong>: Build in progress</li>
                <li><strong>Green</strong>: Build successful – your site is live</li>
                <li><strong>Red</strong>: Build failed</li>
              </ul>
              Once the status is green, your site is ready to connect to <strong>Suins</strong>, making it instantly accessible to your users.
            </p>
          </div>

          <br />
          <br />
          <br />
          <div className="flex justify-between items-center mb-6">
            <h1 id="how-to-bind-sui-ns" className="text-4xl font-bold">
              How to bind Sui NS
            </h1>
            <button
              className="hover:bg-red-600 px-4 py-2 rounded 
            bg-gradient-to-r from-secondary-500 to-secondary-600 text-black"
            >
              Dashboard
            </button>
          </div>
          <p className="text-gray-400 italic mb-6">
            Secure your digital identity on the Sui blockchain with personalized domain names that connect
            to your wallet addresses and digital assets.
          </p>

          {/* Video Placeholder */}
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

          {/* Sui NS binding guide content */}
          <div>
            <h2 className="text-xl font-semibold mb-2">What is Sui NS?</h2>
            <p className="text-gray-300 mb-4">
              Sui Name Service (Sui NS) is a decentralized domain name system built on the Sui blockchain.
              It allows users to register human-readable domain names (like yourname.sui) and bind them to
              wallet addresses, making transactions more user-friendly by replacing complex wallet addresses
              with simple domain names.
            </p>

            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-secondary-500 mb-2">Quick Start Overview</h3>
              <ol className="list-decimal pl-6 text-gray-300 space-y-1">
                <li>Get a Sui wallet and ensure it has enough SUI tokens</li>
                <li>Register your preferred domain name on Sui NS</li>
                <li>Access domain management through the dashboard</li>
                <li>Bind addresses or content to your domain</li>
                <li>Verify all bindings are working properly</li>
              </ol>
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-2">Step 1: Get a Sui Wallet</h2>
            <p className="text-gray-300 mb-4">
              Before binding a Sui NS domain, ensure you have a Sui wallet set up.
              Popular options include Sui Wallet browser extension, Suiet Wallet, or Ethos Wallet.
              Make sure your wallet has enough SUI tokens for domain registration and binding fees.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
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

            <h2 className="text-xl font-semibold mt-6 mb-2">Step 2: Register a Sui NS Domain</h2>
            <p className="text-gray-300 mb-4">
              Visit the official Sui NS website or a supported marketplace. Search for your desired domain
              name (e.g., yourname.sui). If available, proceed with the registration process by connecting
              your wallet and completing the payment. Registration typically costs between 1-10 SUI depending
              on the domain name length.
            </p>

            <div className="border border-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center mr-3">
                  <span className="font-bold">💡</span>
                </div>
                <h3 className="font-semibold">Naming Tips</h3>
              </div>
              <ul className="text-gray-300 space-y-1">
                <li>• Shorter names (3-5 characters) are typically more expensive</li>
                <li>• Only alphanumeric characters and hyphens are allowed</li>
                <li>• Names are case-insensitive (example.sui = EXAMPLE.sui)</li>
                <li>• Consider registering common misspellings of your domain</li>
              </ul>
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-2">Step 3: Access Your Domain Management</h2>
            <p className="text-gray-300 mb-4">
              After registration, access the Sui NS dashboard by connecting your wallet. Navigate to the
              "My Domains" section to view all domains you've registered. Select the domain you want to
              bind to access its management interface.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Step 4: Binding Your Domain</h2>
            <p className="text-gray-300 mb-4">
              Within your domain management interface, look for the "Bind Address" or "Resolver" section.
              Here you can bind different types of records to your domain:
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-secondary-500 mb-2">Wallet Addresses</h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Primary Sui address</li>
                  <li>• Ethereum (ETH) address</li>
                  <li>• Bitcoin (BTC) address</li>
                  <li>• Other blockchain addresses</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-secondary-500 mb-2">Additional Records</h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Social media profiles</li>
                  <li>• IPFS content hashes</li>
                  <li>• Text records & metadata</li>
                  <li>• Email addresses</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-3">Binding Process Example</h3>
              <div className="space-y-4">
                <div className="bg-gray-800 p-3 rounded flex items-center">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    <span>1</span>
                  </div>
                  <div>
                    <span className="block text-sm">Select record type: <span className="text-secondary-500">Primary Address</span></span>
                  </div>
                </div>
                <div className="bg-gray-800 p-3 rounded flex items-center">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    <span>2</span>
                  </div>
                  <div>
                    <span className="block text-sm">Enter your Sui address: <span className="text-gray-400">0x123...abc</span></span>
                  </div>
                </div>
                <div className="bg-gray-800 p-3 rounded flex items-center">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    <span>3</span>
                  </div>
                  <div>
                    <span className="block text-sm">Click <span className="text-secondary-500">Save</span> and confirm in wallet</span>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-2">Step 5: Confirm Binding Transaction</h2>
            <p className="text-gray-300 mb-4">
              After entering the address or content you want to bind, click on "Confirm" or "Save." Your wallet
              will prompt you to sign a transaction. This transaction typically costs a small amount of SUI
              (0.01-0.05 SUI) as a network fee. Confirm the transaction in your wallet.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Step 6: Verify Your Binding</h2>
            <p className="text-gray-300 mb-4">
              Once the transaction is confirmed, you can verify your binding by using the "Lookup" feature on
              the Sui NS website. Enter your domain name, and it should display all the records you've bound
              to it. Additionally, your domain should now be usable across supported Sui applications and wallets.
            </p>

            <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-secondary-500 mb-6">
              <h3 className="font-semibold mb-1">Using Your Domain</h3>
              <p className="text-gray-300 text-sm">
                After binding, you can share your yourname.sui domain instead of your complex wallet address.
                When someone sends SUI or other tokens to yourname.sui, it will automatically route to the wallet
                address you've bound to that domain.
              </p>
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-2">Advanced Features</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Reverse Resolution</h4>
                <p className="text-gray-300 text-sm">
                  Enable reverse lookup so your wallet address displays your domain name in supported applications.
                </p>
              </div>
              <div className="border border-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Subdomains</h4>
                <p className="text-gray-300 text-sm">
                  Create and manage subdomains (e.g., app.yourname.sui) for different purposes.
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

            <h2 className="text-xl font-semibold mt-6 mb-2">Security Tips</h2>
            <div className="bg-gray-900 p-4 rounded-lg mb-6">
              <ul className="text-gray-300 space-y-3">
                <li className="flex">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <span>Double-check all addresses before binding to avoid mistakes</span>
                </li>
                <li className="flex">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <span>Use a secure wallet and keep your recovery phrase safe</span>
                </li>
                <li className="flex">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <span>Consider enabling two-factor authentication if supported</span>
                </li>
                <li className="flex">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <span>Regularly check your domain settings to ensure they haven't been tampered with</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-1/4 p-4 border-l border-gray-700 sticky top-20 self-start h-[calc(100vh-72px)] overflow-auto">
          <h3 className="text-lg font-semibold mb-4">On this page</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="#how-to-launch-website-with-us"
                className={`hover:underline ${activeSection === 'how-to-launch-website-with-us'
                    ? 'text-white font-bold'
                    : 'text-gray-400'
                  }`}
              >
                How to launch website with us
              </a>
            </li>
            <li>
              <a
                href="#how-to-bind-sui-ns"
                className={`hover:underline ${activeSection === 'how-to-bind-sui-ns'
                    ? 'text-white font-bold'
                    : 'text-gray-400'
                  }`}
              >
                How to bind Sui NS
              </a>
              {activeSection === 'how-to-bind-sui-ns' && (
                <ul className="ml-4 mt-2 space-y-1">
                  <li>
                    <a href="#what-is-sui-ns" className="text-gray-400 text-sm hover:underline">
                      What is Sui NS?
                    </a>
                  </li>
                  <li>
                    <a href="#step-1" className="text-gray-400 text-sm hover:underline">
                      Step 1: Get a Sui Wallet
                    </a>
                  </li>
                  <li>
                    <a href="#step-2" className="text-gray-400 text-sm hover:underline">
                      Step 2: Register a Domain
                    </a>
                  </li>
                  <li>
                    <a href="#step-3" className="text-gray-400 text-sm hover:underline">
                      Step 3: Access Management
                    </a>
                  </li>
                  <li>
                    <a href="#step-4" className="text-gray-400 text-sm hover:underline">
                      Step 4: Bind Your Domain
                    </a>
                  </li>
                  <li>
                    <a href="#step-5" className="text-gray-400 text-sm hover:underline">
                      Step 5: Confirm Transaction
                    </a>
                  </li>
                  <li>
                    <a href="#step-6" className="text-gray-400 text-sm hover:underline">
                      Step 6: Verify Binding
                    </a>
                  </li>
                  <li>
                    <a href="#advanced" className="text-gray-400 text-sm hover:underline">
                      Advanced Features
                    </a>
                  </li>
                  <li>
                    <a href="#security" className="text-gray-400 text-sm hover:underline">
                      Security Tips
                    </a>
                  </li>
                </ul>
              )}
            </li>
          </ul>
          <div className="mt-6 flex items-center">
            <span className="text-gray-400 mr-2">⬆</span>
            <a href="#" className="text-gray-400 hover:underline">
              Back to top
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowToUsePage