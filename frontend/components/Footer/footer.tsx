'use client'

import React from 'react'
import Link from 'next/link'
import { SiDiscord, SiGithub, SiX, SiTelegram } from 'react-icons/si'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  const footerLinks = [
    {
      section: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Whitepaper', href: '/whitepaper' },
        // { name: 'Release Notes', href: '/release-notes' },
      ]
    },
    {
      section: 'Legal',
      links: [
        { name: 'Terms', href: '/terms' },
        { name: 'Privacy', href: '/privacy' },
        { name: 'Refund Policy', href: '/refund-policy' },
        { name: 'Shipping', href: '/shipping' },
        { name: 'Cookies', href: '/cookies' },
      ]
    }
  ]
  
  const socialLinks = [
    {
      icon: SiTelegram,
      href: 'https://t.me/CodEaseCODON',
      label: 'Telegram'
    },
    {
      icon: SiDiscord,
      href: 'https://discord.gg/Gajr772G',
      label: 'Discord'
    },
    {
      icon: SiX,
      href: 'https://x.com/CodEasePro',
      label: 'X (Twitter)'
    }
  ]
  
  return (
    <footer className="bg-black text-gray-400 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Main footer container with mobile first ordering */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Footer Links - First on mobile, right side on desktop */}
          <div className="order-1 md:order-2 md:col-span-7">
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-2">
              {footerLinks.map((section) => (
                <div key={section.section}>
                  <h3 className="text-white text-lg font-medium mb-4">{section.section}</h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link 
                          href={link.href} 
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          {/* Company info and social links - Second on mobile, left side on desktop */}
          <div className="order-2 md:order-1 md:col-span-5 space-y-6">
            <div className="flex items-center space-x-5">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <social.icon size={24} />
                </Link>
              ))}
            </div>
            <p className="text-gray-400">
              A product of{' '}
              <span className="font-bold text-blue-500">
                Viskara
              </span>
            </p>
          </div>
        </div>
          
        {/* Copyright - Improved spacing and border */}
        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-sm">
          <p>© {currentYear} CodEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer