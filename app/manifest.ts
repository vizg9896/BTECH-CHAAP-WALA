import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BTECH CHAAP WALA",
    short_name: "Btech Chaap Wala",
    description: "Order delicious charcoal-grilled soya chaaps online from BTECH CHAAP WALA at Bhagat Singh Chowk, Jhajjar.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#ea580c",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
