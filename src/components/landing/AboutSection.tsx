"use client";
import React, { useTransition, useState } from "react";
import Image from "next/image";
import TabButton from "./TabButton";

const TAB_DATA = [
  {
    title: "Skills",
    id: "skills",
    content: (
      <ul className="list-disc pl-2">
        <li>Data & AI Architecture</li>
        <li>Cloud Solutions (AWS, Azure, GCP)</li>
        <li>Machine Learning & Deep Learning</li>
        <li>Python, R, SQL</li>
        <li>Data Engineering</li>
        <li>AI Strategy & Consulting</li>
      </ul>
    ),
  },
  {
    title: "Education",
    id: "education",
    content: (
      <ul className="list-disc pl-2">
        <li>PhD in Electrical and Electronics Engineering</li>
        <li>Multiple AI and Cloud Certifications</li>
        <li>15+ Years Industry Experience</li>
      </ul>
    ),
  },
  {
    title: "Experience",
    id: "experience",
    content: (
      <ul className="list-disc pl-2">
        <li>Former AWS Solutions Architect</li>
        <li>Former Deloitte Senior Consultant</li>
        <li>100+ Clients Globally</li>
        <li>Published Author & Speaker</li>
      </ul>
    ),
  },
];

const AboutSection = () => {
  const [tab, setTab] = useState("skills");
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (id: string) => {
    startTransition(() => {
      setTab(id);
    });
  };

  return (
    <section className="text-foreground flex justify-center items-center" id="about">
      <div className="md:grid md:grid-cols-2 gap-8 items-center py-8 px-4 xl:gap-16 sm:py-16 xl:px-16 flex justify-center">
        <div className="mt-4 md:mt-0 text-left flex flex-col h-full">
          <h2 className="text-4xl font-bold text-foreground mb-4">About Me</h2>
          <p className="text-base lg:text-lg text-justify text-muted-foreground">
            With over 15 years of experience in data and AI, Sam has a proven track record of advising clients on building cloud-native data and AI solutions, supporting more than 100 clients globally across sectors such as financial services, aviation, health, and mining. As a data and AI advisor, he assists organizations in developing robust AI strategies and solutions, ranging from initial concept to large-scale deployment.
            Sam has a strong background in software development, data analytics, and AI, with a PhD in Electrical and Electronics Engineering. He has also authored several publications and books on AI and cloud topics and delivered public speaking engagements at various events and conferences. Previously, Sam worked at AWS and Deloitte, leading projects across the full data and AI landscape, from strategy development and proof of concept to full-scale implementation.
          </p>
          <div className="flex flex-row mt-8">
            <TabButton
              selectTab={() => handleTabChange("skills")}
              active={tab === "skills"}
            >
              Skills
            </TabButton>
            <TabButton
              selectTab={() => handleTabChange("education")}
              active={tab === "education"}
            >
              Education
            </TabButton>
            <TabButton
              selectTab={() => handleTabChange("experience")}
              active={tab === "experience"}
            >
              Experience
            </TabButton>
          </div>
          <div className="mt-8">
            {TAB_DATA.find((t) => t.id === tab)?.content}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
