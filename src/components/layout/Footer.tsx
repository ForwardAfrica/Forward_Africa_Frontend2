import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useNavigate } from '../../lib/router';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone, Globe, Lock } from 'lucide-react';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    navigate('/admin/login');
  };

  return (
    <footer className="bg-gradient-to-b from-brand-background via-brand-background to-black text-gray-400">
      {/* Main Footer Content */}
      <div className="max-w-screen-xl mx-auto pt-10 sm:pt-12 md:pt-16 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12 md:mb-16">
          {/* Brand Section */}
          <div>
            <Link href="/" className="flex items-center mb-4 sm:mb-5 md:mb-6">
              <Image
                src="/images/chosen.png"
                alt="Forward Africa Logo"
                width={200}
                height={200}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 object-contain"
                priority
              />
            </Link>
            <p className="text-gray-400 mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base">
              A Platform Engineered for Growth and Mastery
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Facebook">
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Twitter">
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Instagram">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors" aria-label="YouTube">
                <Youtube className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-base sm:text-lg font-semibold mb-4 sm:mb-5 md:mb-6">Quick Links</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <Link href="/courses" className="hover:text-red-500 transition-colors flex items-center text-sm sm:text-base">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link href="/afri-sage" className="hover:text-red-500 transition-colors flex items-center text-sm sm:text-base">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  Akira Ai
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-red-500 transition-colors flex items-center text-sm sm:text-base">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  Forums
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-red-500 transition-colors flex items-center text-sm sm:text-base">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white text-base sm:text-lg font-semibold mb-4 sm:mb-5 md:mb-6">Categories</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <Link href="/category/business" className="hover:text-red-500 transition-colors text-sm sm:text-base">
                  Business
                </Link>
              </li>
              <li>
                <Link href="/category/entrepreneurship" className="hover:text-red-500 transition-colors text-sm sm:text-base">
                  Entrepreneurship
                </Link>
              </li>
              <li>
                <Link href="/category/finance" className="hover:text-red-500 transition-colors text-sm sm:text-base">
                  Finance
                </Link>
              </li>
              <li>
                <Link href="/category/personal-development" className="hover:text-red-500 transition-colors text-sm sm:text-base">
                  Personal Development
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-base sm:text-lg font-semibold mb-4 sm:mb-5 md:mb-6">Contact Us</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start sm:items-center">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-red-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-sm sm:text-base">123 Innovation Hub, Digital City, Africa</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-red-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">+234 123 456 7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-red-500 flex-shrink-0" />
                <span className="text-sm sm:text-base break-all">Support@forwardafrica.tech</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 pt-6 sm:pt-7 md:pt-8 pb-8 sm:pb-10 md:pb-12">
          <div className="max-w-2xl mx-auto text-center px-4">
            <h3 className="text-white text-base sm:text-lg font-semibold mb-2 sm:mb-3">Subscribe to Our Newsletter</h3>
            <p className="text-gray-400 mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base">
              Get the latest updates on new courses, features, and special offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm sm:text-base"
              />
              <button
                type="submit"
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:shadow-lg transition-all text-sm sm:text-base font-semibold w-full sm:w-auto"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-6 sm:pt-7 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 sm:space-y-4 md:space-y-0">
            <p className="text-xs sm:text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Forward Africa. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-3 sm:gap-4 text-xs sm:text-sm">
              <Link href="/terms" className="hover:text-red-500 transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-red-500 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="hover:text-red-500 transition-colors">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="hover:text-red-500 transition-colors">
                Accessibility
              </Link>
              <button
                onClick={handleAdminLogin}
                className="hover:text-red-500 transition-colors flex items-center"
              >
                <Lock className="h-3 w-3 mr-1" />
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
