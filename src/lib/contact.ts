export const WHATSAPP_NUMBER = "2347081580318";
export const EMAIL_ADDRESS = "pixelsparkx@gmail.com";
export const LINKEDIN_URL =
  "https://www.linkedin.com/in/pixel-squad-98a174402?utm_source=share_via&utm_content=profile&utm_medium=member_android";

export function whatsappMessage(plan: string = "General Inquiry") {
  return `Hello Mohammed 👋

I'm interested in building a website/app for my business.

Selected Plan: ${plan}

Business Name:
Business Type:
What I Need:

I saw your portfolio website and I'd like to discuss further.`;
}

export function whatsappLink(plan: string = "General Inquiry") {
  const text = encodeURIComponent(whatsappMessage(plan));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function emailSubject() {
  return "Website/App Project Inquiry";
}

export function emailBody(plan: string = "General Inquiry") {
  return `Hello Mohammed,

I'm interested in working with you on a digital project.

Selected Plan: ${plan}

Business Name:
Business Type:
Project Details:

I found your portfolio website and would like to discuss further.

Thank you.`;
}

export function emailLink(plan: string = "General Inquiry") {
  const subject = encodeURIComponent(emailSubject());
  const body = encodeURIComponent(emailBody(plan));
  return `mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${body}`;
}

export function openWhatsApp(plan: string = "General Inquiry") {
  if (typeof window !== "undefined") window.open(whatsappLink(plan), "_blank", "noopener,noreferrer");
}

export function openEmail(plan: string = "General Inquiry") {
  if (typeof window !== "undefined") window.location.href = emailLink(plan);
}
