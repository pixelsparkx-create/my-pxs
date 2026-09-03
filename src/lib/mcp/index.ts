import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getContactInfo from "./tools/get-contact-info";
import listPortfolioProjects from "./tools/list-portfolio-projects";
import listServicesAndPricing from "./tools/list-services-and-pricing";
import listTestimonials from "./tools/list-testimonials";
import submitTestimonial from "./tools/submit-testimonial";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged and is inlined by Vite at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "pixelspark-studio",
  title: "PixelSpark Studio",
  version: "0.1.0",
  instructions:
    "Tools for PixelSpark Studio, a creative development studio. Use them to look up portfolio projects, services and pricing, contact details, and client testimonials, or to submit a new testimonial for review.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listPortfolioProjects,
    listServicesAndPricing,
    getContactInfo,
    listTestimonials,
    submitTestimonial,
  ],
});
