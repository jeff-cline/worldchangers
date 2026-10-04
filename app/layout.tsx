import type { Metadata } from "next";
import "./globals.css";
import { site } from "./_site/config";
import RecaptchaProvider from "@/app/lib/RecaptchaProvider";

export const metadata: Metadata = {
  title: "worldchangers.ai — The Founder's Edge",
  description: "People First. Tech-Backed. Change the world without needing a vacation from your life. A Krystalore × R0cketShip joint venture.",
  metadataBase: new URL("https://worldchangers.ai"),
  openGraph: {
    title: "worldchangers.ai — The Founder's Edge",
    description: site.tagline,
    url: "https://worldchangers.ai",
    siteName: "worldchangers.ai",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Attaches a reCAPTCHA token to every guarded form submission.
            Inert until RECAPTCHA_SITE_KEY/SECRET_KEY are set. */}
        <RecaptchaProvider />{children}</body>
    </html>
  );
}
