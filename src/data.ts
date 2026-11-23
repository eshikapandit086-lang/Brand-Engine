import { HistoryItem } from "./types";

export interface FrameworkTemplate {
  name: string;
  category: "Frameworks" | "Headlines" | "Cold Email";
  description: string;
  layoutPattern: string;
  examplePrompt: { idea: string; audience: string };
  metricsSimulatedText: string;
}

// Seed realistic example history items to let the user immediately experience the premium app capability
export const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: "hist-1",
    businessIdea: "Curated weekly batch of premium React & Tailwind templates delivered directly via newsletter tag configs.",
    targetAudience: "Web designers, Solopreneurs, and Indie Hackers craving rapid frontend starting blocks.",
    timestamp: "2 mins ago",
    launchKit: {
      landingPageHook: {
        headline: "Assemble Premium React UIs 10x Faster.",
        subheadline: "Stop wrestling with boilerplate styling. Select your aesthetics and receive fully structured responsive components every Tuesday direct to your developer workspace.",
        ctaText: "Get First Templates Free"
      },
      productLaunchEmail: {
        subject: "🚀 No more writing styling from scratch: templates on autopilot",
        body: "Hey there,\n\nWe all know the struggle: you have a stunning project idea, but you spend the first two days writing index.css, configuring tailwind themes, and stitching together basic landing page blocks.\n\nIntroducing TemplateFlow. We compile elite, battle-tested modern React & Tailwind layouts curated strictly around your industry tags, delivered directly to your inbox every week.\n\nJoin 2,400+ developers launching clean MVPs over the weekend.\n\nBest wishes,\nThe Brand Engine Team",
        cta: "Claim Your Startup Blueprint"
      },
      viralLinkedInPost: {
        text: "I spent 14 hours styling a single CTA widget last week. 🤦‍♂️\n\nIndie hackers make this one error constantly:\nWe treat layout design as a core development task instead of a commodity.\n\nThat's why we engineered Brand Engine. It automates your startup copywriting and landing configurations so you can focus strictly on logic.\n\nHere is how to optimize your next MVP:\n- Choose 1 display font\n- Set responsive bounds early\n- Automate content mockups via AI\n\nWhat are you launching this weekend? 👇\n\n#buildinpublic #solopreneurship #indiehackers"
      }
    }
  },
  {
    id: "hist-2",
    businessIdea: "Organic gourmet French patisserie dessert subscription box paired with hand-blended organic loose leaf teas.",
    targetAudience: "Busy urban foodies, sweet connoisseurs, and high-end gift seekers looking for an elegant dessert pairing experience.",
    timestamp: "1 hour ago",
    launchKit: {
      landingPageHook: {
        headline: "Artisanal French Patisserie, Sent to Your Sanctuary.",
        subheadline: "Treat yourself to hand-crafted, seasonal macarons, delicate tarts, and gourmet tea pairings sourced directly from micro-bakers. Baked with love, delivered with absolute care.",
        ctaText: "Reserve Next Month's Box"
      },
      productLaunchEmail: {
        subject: "🍩 Lavender-infused tarts and gourmet Earl Grey are waiting for you...",
        body: "Hello Connoisseur,\n\nPremium pastries shouldn't require a boutique queue on a rainy Sunday. We believe exceptional dessert pairing is a ritual that belongs in the comfort of your home.\n\nNext month, our Master Bakers are preparing an exclusive Parisian Lavender Box, starring lavender-cream infused butter-crust pastries, and hand-blended organic Earl Grey reserve teas.\n\nOnly 150 gourmet subscriptions are open for next month's batch.\n\nIndulge elegantly,\nFounder, Brand Engine",
        cta: "Secure My Lavender Box"
      },
      viralLinkedInPost: {
        text: "Can a subscription box deliver feelings? 🧁\n\nMost modern retail brands obsess strictly over operations and shipping weights.\n\nBut elite brands specialize in ritual.\n\nBy curating rare artisan foods with premium teas, we noticed a massive 72% increase in customer brand affinity on the very first delivery.\n\nLesson learned: Don't sell the item. Sell the ritual that honors the craft.\n\nWould you sign up for monthly dessert rituals? Let me know below!\n\n#luxurybranding #customerjourney #entrepreneurship"
      }
    }
  }
];

export const SUGGESTIONS = [
  {
    title: "AI Study Partner",
    idea: "An AI-powered audio study companion that listens to your class lectures, builds active-recall audio quizzes on the fly, and grills you while you commute.",
    audience: "Busy college students and medical residents studying for intense board exams."
  },
  {
    title: "Eco Gym Wear",
    idea: "High-performance athletic clothing made entirely from upcycled ocean plastic netting that naturally repels odor and fits with zero skin friction.",
    audience: "Conscious active fitness creators and athletes looking to minimize environmental footprint without sacrificing gym stats."
  },
  {
    title: "Micro Bakery Box",
    idea: "Artisan sourdough and sourdough-pairing specialty butter subscription boxes delivered warm by local cargo-bike riders every Saturday morning.",
    audience: "Sourdough connoisseurs, premium brunch lovers, and local food supporters."
  }
];

export const FRAMEWORK_TEMPLATES: FrameworkTemplate[] = [
  {
    name: "PAS Formula (Problem, Agitate, Solve)",
    category: "Frameworks",
    description: "Identify a specific user irritation point, agitate the financial or mental damage of ignoring it, and deliver your brand as the savior.",
    layoutPattern: "Problem: [Insert Friction] -> Agitate: [What if this fails?] -> Solution: [Our Tool]",
    examplePrompt: {
      idea: "Automated tax deduction classifier for micro-contractors and freelancers.",
      audience: "Freelance graphic designers and independent consultants anxious about tax seasons."
    },
    metricsSimulatedText: "High converting on cold developer outbound and premium business blogs."
  },
  {
    name: "AIDA Model (Attention, Interest, Desire, Action)",
    category: "Frameworks",
    description: "Secure immediate eye attention with a shocking claim, build interest via raw logic, stir up lifestyle desire, and present a clear low-bar CTA button.",
    layoutPattern: "Attention [Bold stats] -> Interest [Logical insight] -> Desire [Exclusive offer] -> Action [CTA]",
    examplePrompt: {
      idea: "Smart home sound isolation panels engineered with recycled aerospace foams.",
      audience: "Urban apartment dwellers and high-performance remote work specialists."
    },
    metricsSimulatedText: "Optimal for high impact visual landing pages with clean dark aesthetics."
  },
  {
    name: "The Cliffhanger Curiosity Hook",
    category: "Headlines",
    description: "Presents a highly counter-intuitive lesson to trigger human curiosity. Highly effective for social threads and viral newsletters.",
    layoutPattern: "[X Counter-intuitive point] is why most builders fail. Here is the 3-step solution...",
    examplePrompt: {
      idea: "A visual drag-and-drop database designer that exports native Prisma schemas.",
      audience: "Junior backend engineers and no-code builders looking to scale clean structures."
    },
    metricsSimulatedText: "Fosters extremely high scroll depth and shares on professional social networks."
  },
  {
    name: "Urgency-Infused Direct Product Launch",
    category: "Cold Email",
    description: "Explicit, time-sensitive launch announcement. Includes pre-approved discounts and clear onboarding expectations.",
    layoutPattern: "Exclusive Invitation / Founder Offer -> Onboarding Roadmap -> 48h limit checklist",
    examplePrompt: {
      idea: "Premium physical ergonomic mechanical keyboards with oiled walnut wrist rests.",
      audience: "Software engineering leads and luxury office setup collectors."
    },
    metricsSimulatedText: "Drives intense focus conversion on early list segments (25% open rate base)."
  }
];
