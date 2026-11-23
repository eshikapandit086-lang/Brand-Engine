export interface LandingPageHook {
  headline: string;
  subheadline: string;
  ctaText: string;
}

export interface ProductLaunchEmail {
  subject: string;
  body: string;
  cta: string;
}

export interface ViralLinkedInPost {
  text: string;
}

export interface LaunchKit {
  landingPageHook: LandingPageHook;
  productLaunchEmail: ProductLaunchEmail;
  viralLinkedInPost: ViralLinkedInPost;
}

export interface HistoryItem {
  id: string;
  businessIdea: string;
  targetAudience: string;
  timestamp: string;
  launchKit: LaunchKit;
}
