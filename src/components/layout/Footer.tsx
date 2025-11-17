import React from 'react';
import Link from 'next/link';
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
      <div className="max-w-screen-xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div>
            <Link href="/" className="flex items-center mb-6">
              <div className="flex items-center">
                <span className="text-brand-primary font-bold text-2xl">FORWARD</span>
                <span className="text-white font-bold text-2xl">AFRICA</span>
              </div>
            </Link>
            <p className="text-gray-400 mb-6">
              Empowering African professionals through expert-led courses and cutting-edge learning experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-brand-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/courses" className="hover:text-brand-primary transition-colors flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link href="/afri-sage" className="hover:text-brand-primary transition-colors flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Afri-Sage
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-brand-primary transition-colors flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Community
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-primary transition-colors flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Categories</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/category/business" className="hover:text-brand-primary transition-colors">
                  Business
                </Link>
              </li>
              <li>
                <Link href="/category/entrepreneurship" className="hover:text-brand-primary transition-colors">
                  Entrepreneurship
                </Link>
              </li>
              <li>
                <Link href="/category/finance" className="hover:text-brand-primary transition-colors">
                  Finance
                </Link>
              </li>
              <li>
                <Link href="/category/personal-development" className="hover:text-brand-primary transition-colors">
                  Personal Development
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-brand-primary" />
                <span>123 Innovation Hub, Digital City, Africa</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-brand-primary" />
                <span>+234 123 456 7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-brand-primary" />
                <span>support@forwardafrica.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 pt-8 pb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-white text-lg font-semibold mb-3">Subscribe to Our Newsletter</h3>
            <p className="text-gray-400 mb-6">
              Get the latest updates on new courses, features, and special offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <button
                type="submit"
                className="bg-brand-gradient text-white px-6 py-3 rounded-lg hover:shadow-brand-glow transition-all"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Forward Africa. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
              <Link href="/terms" className="hover:text-brand-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-brand-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="hover:text-brand-primary transition-colors">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="hover:text-brand-primary transition-colors">
                Accessibility
              </Link>
              <button
                onClick={handleAdminLogin}
                className="hover:text-brand-primary transition-colors flex items-center"
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
