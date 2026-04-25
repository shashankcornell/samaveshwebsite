import type { Metadata } from "next";
import { Libre_Caslon_Text, Montserrat, Inconsolata } from "next/font/google";
import "./globals.css";

const libreC = Libre_Caslon_Text({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-libre-caslon",
  display: "swap",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});
const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Samavesh", template: "%s | Samavesh" },
  description:
    "An inclusive community for policy discourses. A sounding board for policy solutions aiming to solve the wicked challenges of our times.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${libreC.variable} ${montserrat.variable} ${inconsolata.variable}`}>
      <body>{children}</body>
    </html>
  );
}
