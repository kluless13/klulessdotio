import Image from "next/image";
import HeroSection from "./components/HeroSection";
import About from "./components/About";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-13 container mx-auto px-12 py-14">
      <HeroSection/>
      <About/>
    </main>
  );
}
