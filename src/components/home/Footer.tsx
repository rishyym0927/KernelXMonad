import { Github, Twitter, Linkedin, Mail } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="#" className="text-gray-400 hover:text-gray-300">
            <span className="sr-only">Twitter</span>
            <Twitter className="h-5 w-5" />
          </Link>
          <Link href="#" className="text-gray-400 hover:text-gray-300">
            <span className="sr-only">GitHub</span>
            <Github className="h-5 w-5" />
          </Link>
          <Link href="#" className="text-gray-400 hover:text-gray-300">
            <span className="sr-only">LinkedIn</span>
            <Linkedin className="h-5 w-5" />
          </Link>
          <Link href="#" className="text-gray-400 hover:text-gray-300">
            <span className="sr-only">Email</span>
            <Mail className="h-5 w-5" />
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex items-center justify-center md:justify-start">
            <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-xl font-bold text-transparent">
              Web3 IDE
            </span>
          </div>
          <nav className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 md:justify-start">
            <Link href="#" className="text-sm text-gray-400 hover:text-gray-300">
              Home
            </Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-gray-300">
              Features
            </Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-gray-300">
              Pricing
            </Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-gray-300">
              Documentation
            </Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-gray-300">
              Blog
            </Link>
          </nav>
          <p className="mt-4 text-center text-xs text-gray-500 md:text-left">
            &copy; {new Date().getFullYear()} Web3 IDE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
