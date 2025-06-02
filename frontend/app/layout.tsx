import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "K8s-Dash",
  description: "Kubernetes Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">{children}</body>
    </html>
  );
}
