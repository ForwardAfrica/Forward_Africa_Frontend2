import React from 'react';
import { Instructor } from '../../types';
import Link from 'next/link';
import Image from 'next/image';
import { Award, Star, TrendingUp, User } from 'lucide-react';

interface InstructorCardProps {
  instructor: Instructor;
}

const InstructorCard: React.FC<InstructorCardProps> = ({ instructor }) => {
  return (
    <Link href={`/instructor/${instructor.id}`} className="group block">
      <div className="relative bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-red-600 hover:border-red-700 h-full">
        {/* Landscape Layout */}
        <div className="flex h-full">
          {/* Left Side - Avatar Section with Red Background */}
          <div className="relative bg-red-600 w-32 flex-shrink-0 flex items-center justify-center p-4">
            <div className="relative">
              {/* Avatar Image */}
              <div className="relative w-24 h-24 overflow-hidden rounded-full bg-white border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                {instructor.image.startsWith('http') ? (
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/images/placeholder-avatar.jpg') {
                        target.src = '/images/placeholder-avatar.jpg';
                      }
                    }}
                  />
                ) : (
                  <Image
                    src={instructor.image}
                    alt={instructor.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/images/placeholder-avatar.jpg') {
                        target.src = '/images/placeholder-avatar.jpg';
                      }
                    }}
                  />
                )}
              </div>
              
              {/* Verified Badge */}
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg">
                <Award className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>

          {/* Right Side - Content Section */}
          <div className="flex-1 flex flex-col p-4 min-w-0">
            {/* Name and Title */}
            <div className="mb-3">
              <h3 className="text-gray-900 font-bold text-lg mb-1 group-hover:text-red-600 transition-colors duration-300 truncate">
                {instructor.name}
              </h3>
              <p className="text-gray-600 text-sm font-medium truncate">{instructor.title}</p>
            </div>

            {/* Experience Badge */}
            {instructor.experience && (
              <div className="inline-flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-md border border-red-200 mb-3 w-fit">
                <Star className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                <span className="text-xs font-bold text-red-600">{instructor.experience} yrs</span>
              </div>
            )}

            {/* Expertise Tags */}
            {instructor.expertise && instructor.expertise.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3 flex-1">
                {instructor.expertise.slice(0, 2).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-600 text-white rounded text-xs font-bold uppercase tracking-wide border border-red-700 group-hover:bg-red-700 transition-all duration-300"
                  >
                    {skill}
                  </span>
                ))}
                {instructor.expertise.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold border border-gray-300">
                    +{instructor.expertise.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* View Profile Button */}
            <div className="mt-auto pt-2 border-t border-gray-200">
              <div className="flex items-center justify-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-md font-semibold text-xs uppercase tracking-wide group-hover:bg-red-700 transition-all duration-300">
                <User className="w-3.5 h-3.5" />
                <span>View</span>
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default InstructorCard;