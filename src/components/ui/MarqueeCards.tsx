"use client"
import { motion } from "framer-motion"
import { ContractStore } from "@/data/contracts"
import { Code, Shield, Layers,  Users, Globe, Coins } from "lucide-react"


export const MarqueeCards = () => {
  const getContractIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("token") && lower.includes("erc20")) {
      return <Coins className="w-7 h-7 text-purple-300" />;
    }
    if (lower.includes("token") && lower.includes("erc721")) {
      return <Shield className="w-7 h-7 text-indigo-300" />;
    }
    if (lower.includes("token") && lower.includes("erc1155")) {
      return <Layers className="w-7 h-7 text-purple-400" />;
    }
    if (lower.includes("marketplace")) {
      return <Globe className="w-7 h-7 text-indigo-300" />;
    }
    if (lower.includes("vote") || lower.includes("split")) {
      return <Users className="w-7 h-7 text-purple-300" />;
    }
    if (lower.includes("account")) {
      return <Shield className="w-7 h-7 text-indigo-300" />;
    }
    return <Code className="w-7 h-7 text-indigo-200" />;
  };

  const getContractCategory = (identifier: string | string[]) => {
    if (identifier.includes("token")) return "Token";
    if (identifier.includes("account")) return "Account";
    if (identifier.includes("marketplace")) return "Marketplace";
    if (identifier.includes("vote")) return "Governance";
    if (identifier.includes("drop")) return "Distribution";
    if (identifier.includes("split")) return "Finance";
    return "Utility";
  };

  const contracts = ContractStore[0].contracts;

  return (
    <div className="relative w-full overflow-hidden py-4">
      {/* Gradient overlays for smooth edges */}
      <div className="absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-black to-transparent" />
      <div className="absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-black to-transparent" />

      <div className="flex animate-marquee space-x-6 hover:pause">
        {[...contracts, ...contracts].map((contract, index) => (
          <motion.div
            key={`${contract.identifier}-${index}`}
            whileHover={{ 
              scale: 1.02, 
              y: -2,
              transition: { duration: 0.2 }
            }}
            className="group relative flex-shrink-0 w-96 h-64 rounded-2xl bg-gradient-to-br from-black/50 to-indigo-950/60 backdrop-blur-sm border border-indigo-700/50 hover:border-purple-400 p-8 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-purple-400/30"
          >
            {/* Category Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1.5 text-xs font-medium bg-indigo-800/40 text-indigo-200 rounded-full border border-indigo-600/30">
                {getContractCategory(contract.identifier)}
              </span>
            </div>

            <div className="flex items-start gap-4 mb-4">
              <motion.div 
                className="p-3 rounded-xl bg-indigo-900/40 group-hover:bg-purple-600/25 transition-colors border border-indigo-700/30"
                whileHover={{ rotate: 5 }}
              >
                {getContractIcon(contract.name)}
              </motion.div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors">
                  {contract.name}
                </h3>
                <p className="text-sm text-indigo-300">v{contract.version}</p>
              </div>
            </div>

            <p className="text-base text-indigo-100 leading-relaxed line-clamp-3">
              {contract.description}
            </p>

            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-700/15 to-indigo-900/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 60s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }

        .pause {
          animation-play-state: paused;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};