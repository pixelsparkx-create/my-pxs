import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/contact";

export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink("General Inquiry")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 group"
    >
      <span className="absolute inset-0 rounded-full bg-gold/40 animate-ping" />
      <span className="relative h-14 w-14 rounded-full bg-gradient-gold text-ink flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
        <MessageCircle className="h-6 w-6" strokeWidth={2.2} />
      </span>
    </a>
  );
}
