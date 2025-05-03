import { useEffect, useRef } from 'react'

const LogoCarousel = () => {
  const logosRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const ul = logosRef.current
    if (ul) {
      ul.insertAdjacentHTML('afterend', ul.outerHTML)
      const nextSibling = ul.nextSibling as HTMLElement
      if (nextSibling) {
        nextSibling.setAttribute('aria-hidden', 'true')
      }
    }
  }, [])

  const logos = [
    {
      src: '/images/logos/Sui_Symbol_Sea.svg',
      alt: 'Sui',
      url: 'https://sui.io',
    },
    {
      src: '/images/logos/Nike_Symbol.svg',
      alt: 'Walrus',
      url: 'https://walrus.tech',
    },
    {
      src: '/images/logos/Sui_Symbol_Sea.svg',
      alt: 'Sui',
      url: 'https://sui.io',
    },
    {
      src: '/images/logos/Nike_Symbol.svg',
      alt: 'Walrus',
      url: 'https://walrus.tech',
    },
    {
      src: '/images/logos/Sui_Symbol_Sea.svg',
      alt: 'Sui',
      url: 'https://sui.io',
    },
    {
      src: '/images/logos/Nike_Symbol.svg',
      alt: 'Walrus',
      url: 'https://walrus.tech',
    },
    {
      src: '/images/logos/Sui_Symbol_Sea.svg',
      alt: 'Sui',
      url: 'https://sui.io',
    },
    {
      src: '/images/logos/Nike_Symbol.svg',
      alt: 'Walrus',
      url: 'https://walrus.tech',
    },
  ]

  return (
    <div className="w-full h-20 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <ul
          ref={logosRef}
          className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll"
        >
          {logos.map((logo, index) => (
            <li key={index}>
              <a
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-12 object-contain"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default LogoCarousel
