import Portfolio from "@/components/portfolio";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function HomePage() {
  return (
    <>
      <Portfolio />
      <SpeedInsights />
    </>
  );
}
