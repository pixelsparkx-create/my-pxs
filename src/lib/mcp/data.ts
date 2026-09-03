// Plain, image-free copies of the site's marketing content for MCP tools.
// Keep this module free of asset imports so it stays safe to evaluate at
// build time and on Worker cold start.

export const contact = {
  brand: "PixelSpark Studio",
  founder: "Mohammed",
  tagline: "Building websites, apps, and digital experiences that drive results.",
  whatsapp: "+2347081580318",
  email: "pixelsparkx@gmail.com",
};

export const services = [
  {
    name: "Website Design & Development",
    description: "Premium, conversion-focused marketing sites and landing pages.",
  },
  {
    name: "Web Applications",
    description: "Dashboards, booking platforms and custom business tools.",
  },
  {
    name: "Mobile & Product Design",
    description: "Mobile-first product experiences and modern UI/UX systems.",
  },
  {
    name: "Brand & Digital Experience",
    description: "Cinematic brand presence, animations and polished interactions.",
  },
];

export const pricing = [
  {
    tier: "Starter",
    price: "₦25,000",
    summary: "A clean one-page site to get a brand online fast.",
  },
  {
    tier: "Growth",
    price: "₦60,000",
    summary: "Multi-page website with animations, SEO and contact integrations.",
  },
  {
    tier: "Premium",
    price: "₦100,000+",
    summary: "Full custom web app or product build with advanced features.",
  },
];

export const portfolio = [
  {
    slug: "nevada-hotels-suites",
    title: "Nevada Hotels & Suites",
    category: "Hotel Platforms",
    location: "Lekki, Lagos",
    liveUrl: "https://nevada-hotels-shutdown-101.netlify.app/",
    summary:
      "Luxury hospitality website for a Lekki hotel — room showcase, restaurant & bar, gallery and mobile-first booking enquiries.",
  },
  {
    slug: "rendezvous-solar",
    title: "Rendezvous Solar Company",
    category: "Websites",
    location: "17 Anjorin Street, Ijegun, Lagos",
    liveUrl: "https://rendezvous-solar-pxs-101.netlify.app",
    summary:
      "Solar energy company website covering residential and commercial installs, inverters and pricing packages for the Nigerian market.",
  },
  {
    slug: "bluerush",
    title: "BlueRush",
    category: "Mobile Apps",
    liveUrl:
      "https://lovable.dev/share-preview/e468914c-cf77-4dae-b9c3-1636eef25c55",
    summary:
      "Smart bike ride planner combining daily weather forecasts with a Rideability Score so cyclists know the best time to ride.",
  },
  {
    slug: "deenly",
    title: "Deenly",
    category: "Mobile Apps",
    liveUrl: "https://mydeenly.netlify.app",
    summary:
      "Muslim companion app with prayer times, Quran reader, hadith collection, Ramadan tracker, Qibla compass and cloud sync.",
  },
  {
    slug: "emoji-forge",
    title: "Emoji Forge",
    category: "Games",
    summary:
      "Strategic turn-based mobile battle game where players collect, upgrade and command emoji fighters across multiple worlds. In development.",
  },
];

