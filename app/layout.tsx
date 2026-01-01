"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { useState } from "react";
import { ToastContext, ToastProvider } from "../components/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [toasts, setToasts] = useState<string[]>([]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider value={{ toasts, setToasts }}>
          {children}
          <ToastContext />
        </ToastProvider>
      </body>
    </html>
  );
}
