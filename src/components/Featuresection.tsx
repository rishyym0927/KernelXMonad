import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Image from "next/image";

export function FeaturesSectionDemo() {
  const features = [
    {
      title: "Smart Contract Development",
      description:
        "Build and deploy secure smart contracts on Monad AssetHub with our advanced IDE and debugging tools.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r border-neutral-800",
    },
    {
      title: "AI-Powered Code Generation",
      description:
        "Generate blockchain code effortlessly with our intelligent AI that understands Solidity patterns and Monad's EVM architecture.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 border-neutral-800",
    },
    {
      title: "Learn Blockchain Development",
      description:
        "Master Monad development with our comprehensive tutorials and community-driven learning resources.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r border-neutral-800",
    },
    {
      title: "Deploy to Monad Network",
      description:
        "Deploy your smart contracts to mainnet, testnet, or local networks with one-click deployment infrastructure.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];

  return (
    <div className="relative z-20 py-10 lg:py-40 max-w-6xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-white">
          Powered by Advanced Blockchain Technology
        </h4>

        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-neutral-500 text-center font-normal text-neutral-300">
          From smart contract development to DeFi protocols, Kernel AI provides everything you need to build on Monad AssetHub with confidence.
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md border-neutral-800">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full mt-4">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="max-w-5xl mx-auto text-left tracking-tight text-white text-xl md:text-2xl md:leading-snug">
      {children}
      <Image src="/d5.png" alt="Smart Contract IDE" width={400} height={80} className="w-full h-20 object-cover rounded mt-2" />
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-left mx-auto",
        "text-neutral-500 text-center font-normal text-neutral-300",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
      <Image src="/d8.png" alt="Smart Contract IDE" width={400} height={80} className="w-full h-20 object-cover rounded mt-2" />
    </p>
  );
};

export const SkeletonOne = () => {
  return (
    <div className="relative flex flex-col py-8 px-2 gap-4 h-48">
      <div className="w-full mx-auto bg-neutral-900 rounded-lg p-4 shadow-2xl">
        <div className="flex flex-col space-y-3">
          <div className="text-green-400 text-sm font-mono">
            <Image src="/d7.png" alt="Smart Contract IDE" width={400} height={80} className="w-full h-20 object-cover rounded mt-2" />
          </div>
          <div className="text-blue-400 text-sm font-mono">
            #[ink::contract]
          </div>
          <div className="text-white text-sm font-mono">
            mod flipper {"{"}
          </div>
          <div className="text-purple-400 text-sm font-mono ml-4">
            #[ink(storage)]
          </div>
          <div className="text-white text-sm font-mono ml-4">
            pub struct Flipper {"{"}
          </div>
          <div className="text-yellow-400 text-sm font-mono ml-8">
            value: bool,
          </div>
          <div className="text-white text-sm font-mono ml-4">
            {"}"}
          </div>
          <div className="text-white text-sm font-mono">
            {"}"}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 z-40 inset-x-0 h-20 bg-gradient-to-t from-black via-black to-transparent pointer-events-none" />
    </div>
  );
};

export const SkeletonTwo = () => {
  const codeSnippets = [
    "fn transfer()",
    "emit Event",
    "require(balance)",
    "#[ink(message)]",
    "cross_contract_call"
  ];

  return (
    <div className="relative flex flex-col items-center p-4 gap-4 h-48 overflow-hidden">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-400/30">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-white font-medium">AI Generating Code...</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {codeSnippets.map((snippet, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            className="px-3 py-2 bg-neutral-800 rounded-md border border-neutral-700"
          >
            <span className="text-green-400 text-sm font-mono">{snippet}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center text-neutral-400 text-xs mt-2">
        Smart contracts generated with AI assistance
      </div>
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-48">
      <div className="w-full max-w-sm mx-auto bg-neutral-900 rounded-lg overflow-hidden shadow-2xl">
        <div className="relative aspect-video">
          <Image 
            src="/d9.png" 
            alt="Monad Development Tutorial" 
            width={400}
            height={225}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h4 className="text-white font-semibold text-sm mb-1">
            Monad Development Masterclass
          </h4>
          <p className="text-neutral-400 text-xs">
            Learn substrate development from experts
          </p>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-sm">
          Start Learning
        </button>
      </div>
    </div>
  );
};

export const SkeletonFour = () => {
  return (
    <div className="h-48 flex flex-col items-center justify-center relative bg-transparent">
      <div className="text-center mb-6">
        <h4 className="text-white font-semibold text-lg mb-2">
          Global Monad Network
        </h4>
        <p className="text-neutral-400 text-sm">
          Deploy to parachains worldwide
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mb-1"></div>
          <span className="text-xs text-neutral-400">Mainnet</span>
        </div>
        <div className="w-8 h-px bg-gradient-to-r from-green-400 to-blue-400"></div>
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse mb-1"></div>
          <span className="text-xs text-neutral-400">Testnet</span>
        </div>
        <div className="w-8 h-px bg-gradient-to-r from-blue-400 to-purple-400"></div>
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse mb-1"></div>
          <span className="text-xs text-neutral-400">Local</span>
        </div>
      </div>
      
      <div className="mt-6">
        <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 text-sm font-medium">
          Deploy Now
        </button>
      </div>
      <div className="mt-4 w-full max-w-xs">
        <Image 
          src="/d10.png" 
          alt="Deployment Network" 
          width={300}
          height={80}
          className="w-full h-20 object-cover rounded opacity-50" 
        />
      </div>
    </div>
  );
};