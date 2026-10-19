import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // live store product photos (Ready to order scene)
    remotePatterns: [{ protocol: "https", hostname: "setmiindia.com", pathname: "/wp-content/uploads/**" }],
  },
};

export default config;
