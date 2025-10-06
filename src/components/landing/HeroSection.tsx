"use client";
import React, { useEffect, useState } from "react";
import { TypeAnimation } from "react-type-animation";
import Link from "next/link";
import dynamic from 'next/dynamic';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted rounded-lg animate-pulse" />
});

const HeroSection = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Load the animation data
    fetch('/animations/ai-animation.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);

  return (
    <section className="lg:py-16">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-10">
        <div className="col-span-7 place-self-center text-center sm:text-left justify-self-start">
          <h1 className="text-foreground mb-4 text-4xl sm:text-5xl lg:text-8xl lg:leading-normal font-extrabold">
            <span className="text-gradient-magenta-cyan">
              Hello, I&apos;m{" "}
            </span>
            <br></br>
            <TypeAnimation
              sequence={[
                "Dr. Sam Mokhtari",
                1000,
                "Data & AI Sales Specialist",
                1000,
                "Data & AI Adviser",
                1000,
                "Data & AI Mentor",
                1000
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-6 lg:text-xl">
            With over 15 years of experience in data & AI, I have a proven track record of designing and building cloud-native data & AI solutions for more than 100 clients globally across sectors such as financial services, aviation, health, and mining.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
            <Link
              href="/#contact"
              className="px-6 inline-block py-3 w-full sm:w-fit rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/register"
              className="px-6 inline-block py-3 w-full sm:w-fit rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
            >
              Start Mentorship
            </Link>
            <a
              href="/data/cv.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-1 inline-block py-1 w-full sm:w-fit rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
            >
              <span className="block bg-background hover:bg-accent rounded-full px-5 py-2 text-foreground">
                Resume
              </span>
            </a>
          </div>
        </div>
        <div className="col-span-5 place-self-center mt-4 lg:mt-0">
          <div className="w-[250px] h-[250px] lg:w-[400px] lg:h-[400px] relative">
            {animationData ? (
              <Lottie
                animationData={animationData}
                loop={true}
                autoplay={true}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-magenta-cyan opacity-20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">SM</span>
                  </div>
                  <p className="text-muted-foreground text-sm">AI & Data Expert</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;