import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { CourseProgress } from '../../types';
import Link from 'next/link';
import Image from 'next/image';

interface ContinueLearningRowProps {
  /** Array of courses with progress information */
  courses: CourseProgress[];
}

const ContinueLearningRow: React.FC<ContinueLearningRowProps> = ({ courses }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [hoveredCardId, setHoveredCardId] = React.useState<string | null>(null);

  // Handle card hover with React state
  const handleCardHover = (e: React.MouseEvent) => {
    const card = e.currentTarget as HTMLElement;
    const gridContainer = card.closest('.card-grid-container');
    if (!gridContainer) return;

    // Get all cards in this container (which is now just one row)
    const allCards = Array.from(gridContainer.querySelectorAll('.card-container'));
    const currentIndex = allCards.indexOf(card);
    const isLastCard = currentIndex === allCards.length - 1;

    // First, reset all cards in this container to ensure clean state
    allCards.forEach((adjacentCard) => {
      (adjacentCard as HTMLElement).style.transform = 'translateX(0) scale(1)';
      (adjacentCard as HTMLElement).style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    if (isLastCard) {
      // Last card in row: push container to the left and expand card to the left
      // Only apply container push on course pages, not homepage
      const isCoursePage = window.location.pathname.includes('/courses');
      if (isCoursePage) {
        (gridContainer as HTMLElement).style.transform = 'translateX(-12rem)';
        (gridContainer as HTMLElement).style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      }

      (card as HTMLElement).style.transform = 'scale(1.05) translateX(-4rem)';
      (card as HTMLElement).style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      (card as HTMLElement).style.width = '200%';
      (card as HTMLElement).classList.add('active');
    } else {
      // Other cards: expand to the right and push adjacent cards in the same row
      (card as HTMLElement).style.transform = 'scale(1.05) translateX(1rem)';
      (card as HTMLElement).style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      (card as HTMLElement).style.width = '200%';
      (card as HTMLElement).classList.add('active');

      // Push cards to the right of the hovered card (only in this container/row)
      allCards.forEach((adjacentCard, index) => {
        if (index > currentIndex) {
          // Different push distance for homepage vs course pages
          const isHomePage = window.location.pathname === '/' || window.location.pathname === '/home';
          const pushDistance = isHomePage ? '14rem' : '18rem';

          (adjacentCard as HTMLElement).style.transform = `translateX(${pushDistance})`;
          (adjacentCard as HTMLElement).style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        }
      });
    }
  };

  const handleCardLeave = (e: React.MouseEvent) => {
    const card = e.currentTarget as HTMLElement;
    const gridContainer = card.closest('.card-grid-container');
    if (!gridContainer) return;

    const allCards = Array.from(gridContainer.querySelectorAll('.card-container'));

    // Reset container position only on course pages
    const isCoursePage = window.location.pathname.includes('/courses');
    if (isCoursePage) {
      (gridContainer as HTMLElement).style.transform = 'translateX(0)';
      (gridContainer as HTMLElement).style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    // Immediately reset all cards
    allCards.forEach((adjacentCard) => {
      (adjacentCard as HTMLElement).style.transform = 'translateX(0) scale(1)';
      (adjacentCard as HTMLElement).style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      (adjacentCard as HTMLElement).style.width = '100%';
      (adjacentCard as HTMLElement).classList.remove('active'); // Remove active border
    });

    // Reset hovered card immediately
    (card as HTMLElement).style.transform = 'translateX(0) scale(1)';
    (card as HTMLElement).style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    (card as HTMLElement).style.width = '100%';
    (card as HTMLElement).classList.remove('active'); // Remove active border
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth
        : scrollLeft + clientWidth;

      rowRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-white text-lg font-medium mb-3 px-4">Continue Learning</h2>

      <div className="group relative">
        {/* Navigation Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 ml-1"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 mr-1"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </button>

        {/* Scrollable Content */}
        <div
          ref={rowRef}
          className="grid grid-flow-col auto-cols-[45%] sm:auto-cols-[30%] md:auto-cols-[22%] lg:auto-cols-[18%] xl:auto-cols-[15%] gap-8 overflow-x-scroll scrollbar-hide px-4 py-1 card-grid-container"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/course/${course.id}`}
              className="group card-container"
              onMouseEnter={handleCardHover}
              onMouseLeave={handleCardLeave}
            >
              <div className="relative w-full h-80 transition-all duration-500 ease-in-out card-expansion card-landscape-expand">
                {/* Poster Container */}
                <div className="w-full h-full relative rounded-lg overflow-hidden shadow-xl card-orientation-transition bg-brand-surface">
                  {/* Thumbnail */}
                  {course.thumbnail.startsWith('http') ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover card-landscape-image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/images/placeholder-course.jpg') {
                          target.src = '/images/placeholder-course.jpg';
                        }
                      }}
                    />
                  ) : (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      width={300}
                      height={450}
                      className="w-full h-full object-cover card-landscape-image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/images/placeholder-course.jpg') {
                          target.src = '/images/placeholder-course.jpg';
                        }
                      }}
                    />
                  )}

                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-100"></div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-red-600 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                        <Play className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-bold text-base leading-tight mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-300 text-sm mb-2 line-clamp-1">{course.currentLesson.title}</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700/50 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-red-600 h-full transition-all duration-300"
                        style={{ width: `${Math.round(course.progress)}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-300 text-xs mt-1">{Math.round(course.progress)}% complete</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContinueLearningRow;