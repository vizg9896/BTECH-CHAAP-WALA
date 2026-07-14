import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { OrderContextProvider } from "@/context/OrderContext";
import "./globals.css";
import fs from "fs";
import path from "path";

// Hot-copy generated assets from brain directory to local public folder on server render
try {
  const brainDir = "C:/Users/dinesh/.gemini/antigravity-ide/brain/00ffb376-eb53-4a86-8050-550d03c692bd";
  const publicDir = path.join(process.cwd(), "public");
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  if (fs.existsSync(brainDir)) {
    const files = fs.readdirSync(brainDir);
    files.forEach(file => {
      if (file.endsWith(".png") && (file.startsWith("afghani_momos") || file.startsWith("fried_momos") || file.startsWith("tandoori_momos") || file.startsWith("kurkure_momos") || file.startsWith("malai_chaap") || file.startsWith("afghani_chaap"))) {
        const cleanName = file.split("_17")[0] + ".png";
        const srcPath = path.join(brainDir, file);
        const destPath = path.join(publicDir, cleanName);
        fs.copyFileSync(srcPath, destPath);
        console.log(`[Asset Synced] Copied ${file} to public/${cleanName}`);
      }
    });
  }
} catch (error) {
  console.error("Asset hot-copy failed:", error);
}

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BTECH CHAAP WALA - Online Ordering & Admin | Jhajjar",
  description: "Order delicious charcoal-grilled soya chaaps online from BTECH CHAAP WALA at Bhagat Singh Chowk, Jhajjar, or manage orders in real time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} scroll-smooth`}>
      <body className="font-sans bg-brand-black text-brand-text min-h-screen selection:bg-brand-orange selection:text-white">
        <OrderContextProvider>
          {children}
        </OrderContextProvider>
      </body>
    </html>
  );
}
