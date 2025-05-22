import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";

export default function AboutUs() {
  const [glitch, setGlitch] = useState(false);
  
  // Create a glitch effect at random intervals
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, Math.random() * 5000 + 3000);
    
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <>
      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
        <style>{`
          /* Define animations with unique names to avoid collisions */
          @keyframes ivory-float {
            0% { transform: translateY(0px) rotate(0deg) !important; }
            25% { transform: translateY(-10px) rotate(1deg) !important; }
            50% { transform: translateY(0px) rotate(0deg) !important; }
            75% { transform: translateY(10px) rotate(-1deg) !important; }
            100% { transform: translateY(0px) rotate(0deg) !important; }
          }
          
          @keyframes ivory-glow {
            0%, 100% { 
              text-shadow: 0 0 10px rgba(4, 217, 255, 0.8),
                         0 0 20px rgba(4, 217, 255, 0.8),
                         0 0 30px rgba(4, 217, 255, 0.6),
                         0 0 40px rgba(4, 217, 255, 0.4) !important; 
            }
            50% { 
              text-shadow: 0 0 15px rgba(4, 217, 255, 0.9),
                         0 0 25px rgba(4, 217, 255, 0.9),
                         0 0 35px rgba(4, 217, 255, 0.7),
                         0 0 45px rgba(4, 217, 255, 0.5) !important; 
            }
          }
          
          @keyframes ivory-scanline {
            0% { transform: translateY(-100%) !important; }
            100% { transform: translateY(100%) !important; }
          }
          
          @keyframes ivory-glitchEffect {
            0% { transform: translate(0) !important; }
            20% { transform: translate(-5px, 5px) !important; }
            40% { transform: translate(-5px, -5px) !important; }
            60% { transform: translate(5px, 5px) !important; }
            80% { transform: translate(5px, -5px) !important; }
            100% { transform: translate(0) !important; }
          }
          
          @keyframes ivory-textFlicker {
            0% { opacity: 1 !important; }
            5% { opacity: 0.7 !important; }
            10% { opacity: 1 !important; }
            15% { opacity: 0.8 !important; }
            20% { opacity: 1 !important; }
            70% { opacity: 1 !important; }
            75% { opacity: 0.7 !important; }
            80% { opacity: 1 !important; }
          }
          
          @keyframes ivory-digitalRain {
            0% { background-position: 0% 0% !important; }
            100% { background-position: 0% 100% !important; }
          }
          
          /* Prefixed class names to avoid collisions */
          .ivory-title-float {
            animation: ivory-float 6s ease-in-out infinite !important;
            display: inline-block !important;
            transform-style: preserve-3d !important;
            will-change: transform !important;
          }
          
          .ivory-title-glow {
            animation: ivory-glow 3s ease-in-out infinite !important;
            display: inline-block !important;
          }
          
          .ivory-title-container {
            position: relative !important;
            overflow: hidden !important;
            padding: 2rem 0 !important;
            z-index: 10 !important;
          }
          
          .ivory-scanline {
            position: absolute !important;
            width: 100% !important;
            height: 10px !important;
            background: linear-gradient(to bottom, 
              rgba(4, 217, 255, 0) 0%,
              rgba(4, 217, 255, 0.5) 50%,
              rgba(4, 217, 255, 0) 100%) !important;
            opacity: 0.7 !important;
            animation: ivory-scanline 4s linear infinite !important;
            pointer-events: none !important;
            z-index: 20 !important;
          }
          
          .ivory-glitch {
            animation: ivory-glitchEffect 0.3s ease !important;
          }
          
          .ivory-text-flicker {
            animation: ivory-textFlicker 4s infinite !important;
          }
          
          .ivory-digital-rain-bg {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: linear-gradient(180deg, 
              rgba(0, 255, 235, 0.05) 10%, 
              rgba(0, 255, 179, 0.03) 30%) !important;
            animation: ivory-digitalRain 15s linear infinite !important;
            z-index: 5 !important;
            pointer-events: none !important;
          }
          
          .ivory-web3-card {
            transition: all 0.3s ease !important;
            border: 1px solid rgba(4, 217, 255, 0.3) !important;
            position: relative !important;
            overflow: hidden !important;
            transform: translateZ(0) !important;
          }
          
          .ivory-web3-card:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 10px 25px -5px rgba(4, 217, 255, 0.3) !important;
            border: 1px solid rgba(4, 217, 255, 0.6) !important;
          }
          
          .ivory-web3-card::after {
            content: '' !important;
            position: absolute !important;
            top: -50% !important;
            left: -50% !important;
            width: 200% !important;
            height: 200% !important;
            background: linear-gradient(
              to bottom right,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0) 40%,
              rgba(255, 255, 255, 0.2) 50%,
              rgba(255, 255, 255, 0) 60%,
              rgba(255, 255, 255, 0) 100%
            ) !important;
            transform: rotate(45deg) !important;
            transition: all 0.8s !important;
            opacity: 0 !important;
            z-index: 2 !important;
          }
          
          .ivory-web3-card:hover::after {
            left: 100% !important;
            top: 100% !important;
            opacity: 0.3 !important;
          }
          
          /* Font family enforcement */
          .ivory-pixel-font {
            font-family: 'Press Start 2P', cursive !important;
            letter-spacing: 1px !important;
          }
        `}</style>
      </Helmet>
      <div className="min-h-screen text-white">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
          <div className="relative text-center space-y-8">
            <div className="relative z-10">
              <h1 className="font-bold tracking-tight bg-gradient-to-r from-cyan-300 to-green-400 text-transparent bg-clip-text ivory-pixel-font w-full px-4 sm:px-0 whitespace-nowrap overflow-x-auto text-[1.1rem] xs:text-[1.35rem] sm:text-5xl md:text-6xl lg:text-7xl text-center">
                About Ivory
              </h1>
              {/* SVG blockchain animation under the title, not behind */}
              <div className="flex justify-center mt-2">
                <svg width="900" height="120" viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="blockchain-cyan-green" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#22d3ee" />
                      <stop offset="1" stopColor="#22c55e" />
                    </linearGradient>
                    <radialGradient id="blockchain-dot" cx="0.5" cy="0.5" r="0.5">
                      <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <g>
                    {[...Array(10)].map((_, i) => (
                      <rect
                        key={i}
                        x={i * 110 + 40}
                        y={50 + (i % 2 === 0 ? 0 : 18)}
                        rx="16"
                        width="70"
                        height="20"
                        fill="url(#blockchain-cyan-green)"
                        opacity="0.7"
                        style={{ filter: 'drop-shadow(0 0 8px #22d3ee)' }}
                      >
                        <animate
                          attributeName="x"
                          values={`${i * 110 + 40};${i * 110 + 60};${i * 110 + 40}`}
                          dur="3.5s"
                          repeatCount="indefinite"
                          begin={`${i * 0.18}s`}
                        />
                      </rect>
                    ))}
                  </g>
                  <g>
                    {[...Array(14)].map((_, i) => (
                      <circle
                        key={i}
                        cx={i * 85 + 60}
                        cy={80 + Math.sin(i / 2) * 12}
                        r={5 + (i % 3)}
                        fill="url(#blockchain-dot)"
                        opacity="0.7"
                      >
                        <animate
                          attributeName="cx"
                          values={`${i * 85 + 60};${i * 85 + 80};${i * 85 + 60}`}
                          dur="2.2s"
                          repeatCount="indefinite"
                          begin={`${i * 0.12}s`}
                        />
                        <animate
                          attributeName="cy"
                          values={`${80 + Math.sin(i / 2) * 12};${90 + Math.sin(i / 2) * 12};${80 + Math.sin(i / 2) * 12}`}
                          dur="2.2s"
                          repeatCount="indefinite"
                          begin={`${i * 0.12}s`}
                        />
                      </circle>
                    ))}
                  </g>
                </svg>
              </div>
            </div>

            <p className="text-lg sm:text-xl md:text-2xl text-cyan-200 max-w-3xl mx-auto leading-relaxed relative z-10 font-medium drop-shadow-[0_2px_12px_rgba(34,213,238,0.25)]">
              Empowering the future of <span className="text-cyan-400 font-bold">Web3</span> with seamless static site deployment on <span className="text-green-400 font-bold">Walrus</span> storage.
            </p>
            <div className="flex justify-center gap-4 mt-6 z-10 relative">
              <a href="#project" className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-green-400 text-black font-bold shadow-lg hover:scale-105 transition-transform duration-200 border-2 border-cyan-400/60 hover:border-green-400/80">
                Learn More
              </a>
              <a href="/create-website" className="px-6 py-2 rounded-full bg-black/80 text-cyan-300 font-bold border-2 border-cyan-400/60 hover:bg-cyan-500/10 hover:text-green-400 hover:border-green-400/80 transition-colors duration-200">
                Get Started
              </a>
            </div>
          </div>
        </section>

        {/* Project Definition */}
        <section className="container mx-auto px-4 sm:px-6 py-12">
          <Card className="bg-gray-800/70 border-cyan-500/30 backdrop-blur-sm ivory-web3-card">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-cyan-400">Project Definition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Ivory is a cutting-edge deployment platform designed to simplify static website hosting using Walrus
                storage. Our mission is to make Web3 hosting accessible, cost-effective, and efficient for developers
                worldwide.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Technology Stack */}
        <section className="container mx-auto px-4 sm:px-6 py-12">
          <Card className="bg-gray-800/70 border-cyan-500/30 backdrop-blur-sm ivory-web3-card">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-cyan-400">Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-300 text-sm sm:text-base space-y-3">
                <li>Next.js: React framework for scalable web applications</li>
                <li>TypeScript: Type-safe JavaScript for robust code</li>
                <li>Tailwind CSS: Utility-first CSS for rapid UI development</li>
                <li>shadcn/ui: Accessible and customizable UI components</li>
                <li>Sui Blockchain: High-performance layer-1 blockchain</li>
                <li>Walrus: Decentralized storage solution for static assets</li>
                <li>Google Cloud: Used for background job processing</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Milestones */}
        <section className="container mx-auto px-4 sm:px-6 py-12">
          <Card className="bg-gray-800/70 border-cyan-500/30 backdrop-blur-sm ivory-web3-card">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-cyan-400">Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside text-gray-300 text-sm sm:text-base space-y-4">
                <li>Launch of the initial website deployment platform.</li>
                <li>Participation in Sui Overflow 2025 competition to showcase our solution.</li>
                <li>Financial planning phase (ongoing, no concrete plan yet).</li>
                <li>Integration of AI-generated content for enhanced user experience.</li>
                <li>Transfer ownership of static sites to our client.</li>
                <li>Provide extension capabilities and API for developers.</li>
              </ol>
              <p className="mt-4 text-gray-400 italic text-sm sm:text-base">
                Note: AI generation, extensions, and financial planning are in progress.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Goals */}
        <section className="container mx-auto px-4 sm:px-6 py-12">
          <Card className="bg-gray-800/70 border-cyan-500/30 backdrop-blur-sm ivory-web3-card">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-cyan-400">Our Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-300 text-sm sm:text-base space-y-3">
                <li>Increase user adoption on Sui and Walrus ecosystems.</li>
                <li>Capture a significant share of the Web hosting market.</li>
                <li>Reduce complexity and costs associated with deploying static websites.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Team */}
        <section className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-green-400 mb-6 ivory-title-glow ivory-pixel-font">
            By Kursui Team
          </h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            We are a passionate team of developers dedicated to revolutionizing Web3 deployment with innovative solutions.
          </p>
        </section>

        {/* Contact */}
        <section className="container mx-auto px-4 sm:px-6 py-12">
          <Card className="bg-gray-800/70 border-cyan-500/30 backdrop-blur-sm ivory-web3-card">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-cyan-400">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="outline"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 text-sm sm:text-base"
                asChild
              >
                <a href="mailto:contact@ivory.com">
                  <Mail className="mr-2 h-4 w-4" /> Email
                </a>
              </Button>
              <Button
                variant="outline"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 text-sm sm:text-base"
                asChild
              >
                <a href="https://github.com/ivory" target="_blank" rel="noopener noreferrer">
                  <span className="mr-2 h-4 w-4 inline-block align-middle">
                    {/* GitHub SVG from simpleicons.org */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.241 2.873.12 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.804 5.624-5.475 5.92.43.372.823 1.104.823 2.227 0 1.607-.014 2.903-.014 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.298 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </span>
                  GitHub
                </a>
              </Button>
              <Button
                variant="outline"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 text-sm sm:text-base"
                asChild
              >
                <a href="https://twitter.com/ivory" target="_blank" rel="noopener noreferrer">
                  <span className="mr-2 h-4 w-4 inline-block align-middle">
                    {/* X (formerly Twitter) SVG icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.53 2.47a2.5 2.5 0 0 1 3.54 3.53l-5.16 5.17 5.16 5.16a2.5 2.5 0 0 1-3.54 3.54l-5.16-5.17-5.16 5.17a2.5 2.5 0 0 1-3.54-3.54l5.17-5.16-5.17-5.17A2.5 2.5 0 0 1 6.87 2.47l5.16 5.17 5.16-5.17z"/>
                    </svg>
                  </span>
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 sm:px-6 py-8 text-center text-gray-400">
          <Separator className="bg-cyan-500/30 mb-4" />
          <p className="text-sm sm:text-base">© 2025 Ivory. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}