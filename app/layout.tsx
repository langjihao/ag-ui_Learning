import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Form Assistant - ag-ui & CopilotKit Demo",
  description: "A demo showcasing shared state between UI and AI agent for intelligent form filling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
