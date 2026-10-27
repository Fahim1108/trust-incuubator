/** Store customer support and developer enquiries intentionally use separate numbers. */
export const contact={whatsappNumber:'01886456664',whatsappInternational:'8801886456664',whatsappUrl:'https://wa.me/8801886456664'} as const;

const developerMessage = "Hello Firoj Ahamed Fahim, I'm interested in your web development services. I came across your work on the Attires Arena website and would love to learn more about your services, pricing, and the process of developing a professional website. Could you please share some details? Thank you!";
export const developerContact = {
  name:'Firoj Ahamed Fahim',
  whatsappUrl:`https://wa.me/8801632915921?text=${encodeURIComponent(developerMessage)}`,
} as const;
