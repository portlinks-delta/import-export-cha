import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Portlinks | CHA Job Workspace",
  description: "Import and Export CHA job management",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
