import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { FormattedMessage, useIntl } from 'react-intl';

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
            0% { opacity: 0.1; }
            50% { opacity: 0.2; }
            100% { opacity: 0.1; }
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
          
          /* Enhanced pixel font effect */
          .ivory-strong-pixel {
            font-family: 'Press Start 2P', cursive !important;
            letter-spacing: 2px !important;
            text-shadow: 2px 2px 0 rgba(0,0,0,0.2),
                         -2px -2px 0 rgba(0,0,0,0.2),
                         2px -2px 0 rgba(0,0,0,0.2),
                         -2px 2px 0 rgba(0,0,0,0.2) !important;
            transform: scale(1.2) !important;
          }
        `}</style>
      </Helmet>
      <main className="min-h-screen text-white">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
          <div className="relative text-center space-y-8">
            <div className="relative z-10">
              <h1 className="font-bold tracking-tight bg-gradient-to-r from-cyan-200 to-cyan-300 text-transparent bg-clip-text ivory-pixel-font w-full px-4 sm:px-0 whitespace-nowrap overflow-x-auto text-[1.1rem] xs:text-[1.35rem] sm:text-5xl md:text-6xl lg:text-7xl text-center">
                About Ivory
              </h1>
              {/* SVG blockchain animation under the title, not behind */}
              <div className="flex justify-center mt-2">
                <svg width="900" height="120" viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="blockchain-cyan-green" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#60e4f9" />
                      <stop offset="1" stopColor="#48d0f2" />
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

            <div>
              <p className="text-lg sm:text-xl md:text-2xl text-cyan-200 max-w-3xl mx-auto leading-relaxed relative z-10 font-medium drop-shadow-[0_2px_12px_rgba(34,213,238,0.25)]">
                <FormattedMessage id="aboutus.hero.text" values={{ walrus: <span className="text-cyan-300 font-bold animate-pulse hover:animate-bounce font-pixel">Walrus</span> }} />
              </p>
            </div>
          </div>
        </section>

        {/* Walrus Logo */}
        <section className="container mx-auto px-4 sm:px-6 py-12">
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src="https://academy-public.coinmarketcap.com/srd-optimized-uploads/52564359d7544359a8f4063d924e1557.jpg" 
                alt="Walrus Storage" 
                className="h-32 w-auto grayscale hover:grayscale-0 transition-all duration-300 ease-in-out"
                style={{ 
                  filter: 'drop-shadow(0 4px 10px rgba(4, 217, 255, 0.3))',
                  WebkitFilter: 'drop-shadow(0 4px 10px rgba(4, 217, 255, 0.3))'
                }}
              />
              <div className="absolute -top-2 -left-2 right-0 bottom-0 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-lg blur-sm"></div>
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
                <FormattedMessage id="aboutus.project.definition" />
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
                <li><FormattedMessage id="aboutus.techstack.nextjs" /></li>
                <li><FormattedMessage id="aboutus.techstack.typescript" /></li>
                <li><FormattedMessage id="aboutus.techstack.tailwind" /></li>
                <li><FormattedMessage id="aboutus.techstack.shadcn" /></li>
                <li><FormattedMessage id="aboutus.techstack.sui" /></li>
                <li><FormattedMessage id="aboutus.techstack.walrus" /></li>
                <li><FormattedMessage id="aboutus.techstack.googlecloud" /></li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Milestones */}
        <section className="container mx-auto px-4 sm:px-6 py-12">
          <Card className="bg-gray-800/70 border-cyan-500/30 backdrop-blur-sm ivory-web3-card">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-cyan-400">
                <FormattedMessage id="aboutus.milestones.title" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                
                {/* Timeline items */}
                <div className="space-y-12">
                  {/* Past milestones */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center relative">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-6">
                      <p className="text-gray-300 text-sm sm:text-base">
                        <FormattedMessage id="aboutus.milestones.1" />
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        <a href="https://www.facebook.com/story.php?story_fbid=1001718711951432&id=100063399376995" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                          Sui Overflow Hacker House 2025
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Current milestone */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center relative">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-6">
                      <p className="text-white font-semibold text-sm sm:text-base">
                        <FormattedMessage id="aboutus.milestones.2"/>

                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        <a href="https://sui.io/overflow" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                          Sui Overflow (current)
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Future milestones */}
                  <div className="flex items-center relative">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center relative">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-6">
                      <p className="text-gray-300 text-sm sm:text-base opacity-70">
                        <FormattedMessage id="aboutus.milestones.3" />
                      </p>
                    </div>
                    <div className="absolute -left-1/2 w-1 h-full bg-cyan-500/30" />
                  </div>

                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center relative">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-6">
                      <p className="text-gray-300 text-sm sm:text-base opacity-70">
                        <FormattedMessage id="aboutus.milestones.4" />
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center relative">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-6">
                      <p className="text-gray-300 text-sm sm:text-base opacity-70">
                        <FormattedMessage id="aboutus.milestones.5" />
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center relative">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-6">
                      <p className="text-gray-300 text-sm sm:text-base opacity-70">
                        <FormattedMessage id="aboutus.milestones.6" />
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center relative">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-6">
                      <p className="text-gray-300 text-sm sm:text-base opacity-70">
                        <FormattedMessage id="aboutus.milestones.7" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-gray-400 italic text-sm sm:text-base">
                <FormattedMessage id="aboutus.milestones.note" />
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Goals */}
        <section className="container mx-auto px-4 sm:px-6 py-12">
          <Card className="bg-gray-800/70 border-cyan-500/30 backdrop-blur-sm ivory-web3-card">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-cyan-400">
                <FormattedMessage id="aboutus.goals.title" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-300 text-sm sm:text-base space-y-3">
                <li><FormattedMessage id="aboutus.goals.1" /></li>
                <li><FormattedMessage id="aboutus.goals.2" /></li>
                <li><FormattedMessage id="aboutus.goals.3" /></li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Team */}
        <section className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-cyan-300 mb-6 ivory-title-glow ivory-pixel-font">
            <FormattedMessage id="aboutus.team.title" />
          </h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            <FormattedMessage id="aboutus.team.description" />
          </p>
        </section>

        {/* Contact */}
        <section className="container mx-auto px-4 sm:px-6 py-12">
          <Card className="bg-gray-800/70 border-cyan-500/30 backdrop-blur-sm ivory-web3-card">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-cyan-400">
                <FormattedMessage id="aboutus.contact.title" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="outline"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 text-sm sm:text-base"
                asChild
              >
                <a href="mailto:tinkivory@gmail.com?subject=Ivory%20Inquiry&body=Hello,%20I%20have%20a%20question%20about%20Ivory%20project...">
                  <Mail className="mr-2 h-4 w-4" /> tinkivory@gmail.com
                </a>
              </Button>
              <Button
                variant="outline"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 text-sm sm:text-base"
                asChild
              >
                <a href="https://github.com/Bonmek/ivory" target="_blank" rel="noopener noreferrer">
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
                <a href="https://x.com/Ivory_officialz" target="_blank" rel="noopener noreferrer">
                  <span className="mr-2 h-4 w-4 inline-block align-middle">
                    {/* X (formerly Twitter) SVG icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.53 2.47a2.5 2.5 0 0 1 3.54 3.53l-5.16 5.17 5.16 5.16a2.5 2.5 0 0 1-3.54 3.54l-5.16-5.17-5.16 5.17a2.5 2.5 0 0 1-3.54-3.54l5.17-5.16-5.17-5.17A2.5 2.5 0 0 1 6.87 2.47l5.16 5.17 5.16-5.17z"/>
                    </svg>
                  </span>
                  @Ivory_officialz
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 sm:px-6 py-8 text-center text-gray-400">
          <Separator className="bg-cyan-500/30 mb-4" />
          <p className="text-sm sm:text-base">
            <FormattedMessage id="aboutus.footer.copyright" />
          </p>
        </footer>
      </main>
    </>
  );
}