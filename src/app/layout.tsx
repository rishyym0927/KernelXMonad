'use client';
import "./globals.css";
import { WagmiProvider } from "wagmi";
import {config} from "@/config/config"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'sonner'
import { ThemeProvider } from 'styled-components';
import { theme } from '../styles/theme';
import { Inter } from 'next/font/google';
import { NeuronAssistant } from "@/components/NeuronAssistant";
import { FloatingNavDemo } from "@/components/Navbar";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const queryClient = new QueryClient()


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body
        className={`antialiased ${inter.className}`}
      >
        <ThemeProvider theme={theme}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <div>
          <FloatingNavDemo/>
        {children}
        <NeuronAssistant/>
        </div>
        </QueryClientProvider>
        </WagmiProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
