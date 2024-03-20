import { Jost } from "next/font/google";
import "./globals.css";

const inter = Jost({ subsets: ["latin"] });

export const metadata = {
  title: "kluless",
  description: "~",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
