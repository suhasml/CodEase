import React, { useState, useRef, useEffect } from 'react';
import { Play, Github, Sparkles, ChevronRight, Pause } from 'lucide-react'; // Removed Volume2, VolumeX
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function VideoSection() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // Removed activeHighlight state as the highlight section is commented out
  // const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null); // Ref for the section for IntersectionObserver

  // Commented out highlights data as the section using it is commented out
  // const highlights = [
  //   { time: "0:14", seconds: 14, desc: "Describing your extension idea" },
  //   { time: "1:26", seconds: 86, desc: "AI generates all required files" },
  //   { time: "2:38", seconds: 158, desc: "Testing in the sandbox environment" }
  // ];

  // Effect for video event listeners (timeupdate, loadedmetadata, play, pause)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Update active highlight based on current time (if highlights were active)
      // const current = highlights.find(
      //   (h, idx) =>
      //     video.currentTime >= h.seconds &&
      //     (idx === highlights.length - 1 || video.currentTime < highlights[idx + 1].seconds)
      // );
      // if (current) {
      //   setActiveHighlight(current.time);
      // } else {
      //   setActiveHighlight(null); // Clear highlight if time doesn't match any
      // }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Set initial duration if metadata is already loaded
    if (video.readyState >= 1) {
       handleLoadedMetadata();
    }


    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []); // Dependency array is empty, runs once on mount

  // Effect for Intersection Observer (play/pause on visibility)
  useEffect(() => {
    const videoElement = videoRef.current;
    const sectionElement = sectionRef.current;

    if (!videoElement || !sectionElement) return;

    const observerOptions = {
      root: null, // Use the viewport as the root
      rootMargin: '0px',
      threshold: 0.5, // Trigger when 50% of the element is visible (adjust as needed)
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Play when the section comes into view
          // Check if it's not already playing to avoid issues, though play() handles this
          if (videoElement.paused) {
             videoElement.play().catch((error) => {
                // Autoplay might be blocked by browser policies
                // The `muted` attribute helps, but user interaction might still be needed in some cases.
             });
          }
        } else {
          // Pause when the section goes out of view
          if (!videoElement.paused) {
             videoElement.pause();
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    observer.observe(sectionElement); // Start observing the section

    // Cleanup function to disconnect the observer
    return () => {
      if (sectionElement) {
        observer.unobserve(sectionElement);
      }
      observer.disconnect();
    };
  }, []); // Empty dependency array, runs once on mount


  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play().catch(error => {
          // Handle play error gracefully - video controls will still be available
        });
      } else {
        videoRef.current.pause();
      }
    }
  };

  // Removed toggleMute function

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) {
        return '0:00'; // Return default or loading state
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Removed jumpToTime function as the highlight section is commented out
  // const jumpToTime = (seconds: number) => {
  //   if (videoRef.current) {
  //     videoRef.current.currentTime = seconds;
  //     // Optionally play if paused when jumping
  //     if (videoRef.current.paused) videoRef.current.play().catch(error => console.error("Error playing video:", error));
  //   }
  // };

  // Handle progress bar click
   const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
     if (videoRef.current && duration > 0) {
       const progressBar = e.currentTarget;
       const rect = progressBar.getBoundingClientRect();
       const clickPosition = e.clientX - rect.left;
       const clickRatio = clickPosition / rect.width;
       videoRef.current.currentTime = clickRatio * duration;
     }
   };


  return (
    // Added ref to the section
    <section ref={sectionRef} className="py-8 sm:py-12 md:py-16 lg:py-14 relative overflow-hidden bg-gray-950 text-white" id="video-demo">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-[200px] -left-[200px] w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.1)_0%,transparent_70%)]" />
        <div className="absolute -top-[50px] sm:-top-[75px] md:-top-[100px] -right-[50px] sm:-right-[75px] md:-right-[100px] w-[250px] sm:w-[350px] md:w-[450px] lg:w-[500px] h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] bg-[radial-gradient(ellipse_at_center,hsla(280,100%,50%,0.08)_0%,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
             <motion.span
               className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs sm:text-sm font-medium hover:bg-blue-500/20 transition-colors cursor-pointer"
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={togglePlayPause} // Make the top badge also toggle play/pause
             >
               <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Watch It In Action
             </motion.span>
            <motion.h2
              className="mt-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-5 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 leading-tight md:leading-normal px-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              See How Easy It Is to Create Extensions
            </motion.h2>
             {/* Optional: Add back paragraph if needed */}
             {/* <motion.p
               className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               transition={{ delay: 0.3 }}
               viewport={{ once: true }}
             >
                Watch a quick demo...
             </motion.p> */}
          </div>

          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-gray-700/50 shadow-xl sm:shadow-2xl shadow-blue-900/20 bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900">
            {/* Fancy video overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

            {/* Video Player with custom controls */}
            {/* aspect-video ensures 16:9 ratio */}
            <div className="aspect-video w-full relative group">
              <video
                ref={videoRef}
                // w-full h-full object-contain fits video inside the 16:9 container
                className="w-full h-full object-contain"
                poster="/demo-thumbnail.jpg" // Consider updating placeholder
                preload="metadata"
                onClick={togglePlayPause} // Allow clicking video to play/pause
                muted // Muted attribute added for autoplay reliability
                autoPlay // Enable autoplay
                playsInline // Important for iOS Safari
                loop // Optional: loop the video if desired
              >
                 {/* Provide actual video sources */}
                <source src="/demo-video.mp4" type="video/mp4" />
                <source src="/demo-video.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>

              {/* Play/Pause overlay - appears on hover */}
               {/* Show button only when paused */}
              {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.button
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-500/80 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-blue-500 transition-colors text-white"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePlayPause}
                      aria-label="Play Video"
                    >
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ml-1" />
                    </motion.button>
                  </div>
               )}


              {/* Custom video controls - appear on hover */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 {/* Progress bar container */}
                <div
                    className="relative h-1.5 bg-gray-600/70 rounded-full my-1 sm:my-2 cursor-pointer group/progress"
                    onClick={handleProgressClick}
                 >
                    {/* Played portion */}
                   <div
                     className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                     style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                   ></div>
                   {/* Thumb - slightly larger on hover */}
                   <div
                     className="absolute h-3 w-3 bg-white rounded-full -mt-[0.2rem] sm:-mt-[0.225rem] shadow-md transform-gpu transition-transform group-hover/progress:scale-110 pointer-events-none"
                     style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 6px)` }}
                   ></div>
                 </div>


                {/* Controls row */}
                <div className="flex items-center justify-between mt-1 sm:mt-2">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <button onClick={togglePlayPause} className="text-white hover:text-blue-400 transition-colors" aria-label={isPlaying ? "Pause Video" : "Play Video"}>
                      {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                    {/* Mute button removed */}
                    <span className="text-xs sm:text-sm text-white tabular-nums">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  {/* Optional: Add Fullscreen button or other controls here */}
                </div>
              </div>
            </div>

            {/* Key highlights section commented out as requested indirectly by removing its state */}
            {/* <div className="bg-gray-800/50 backdrop-blur-sm p-3 sm:p-4 md:p-5 border-t border-gray-700/50"> ... </div> */}
          </div>

          {/* Call to action below video */}
          <div className="mt-8 sm:mt-10 md:mt-10 mb-8 sm:mb-12 md:mb-16 lg:mb-20 flex flex-col sm:flex-row justify-center items-center gap-4">
            <motion.button
              className="px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-teal-500 rounded-md sm:rounded-lg font-medium shadow-md sm:shadow-lg shadow-blue-500/10 sm:shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-teal-500/30 flex items-center justify-center group text-white"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/signin')} // Direct to sign in page to get the free credit
            >
              <span className="text-sm sm:text-base">Try It Yourself <span className="text-xs font-normal">for</span> Free</span>
              <span className="ml-1.5 text-xs text-yellow-300 font-bold animate-pulse">(Limited Time Only)</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </motion.button>
            
            <motion.button
              className="px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 border border-gray-600 hover:border-blue-500/50 bg-gray-800/40 backdrop-blur-sm rounded-md sm:rounded-lg font-medium transition-all hover:bg-gray-800/60 flex items-center justify-center group text-gray-200"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/pricing')} // Direct to pricing page
            >
              <span className="text-sm sm:text-base">See Pricing</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Add global styles for grid pattern */}
      <style jsx global>{`
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(60, 60, 60, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(60, 60, 60, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        /* Ensure video controls don't receive pointer events when hidden */
         .group:not(:hover) .opacity-0 {
           pointer-events: none;
         }
         /* Improve click area for progress bar */
         .group\/progress {
             touch-action: manipulation; /* Improve touch interaction */
         }

      `}</style>
    </section>
  );
}






