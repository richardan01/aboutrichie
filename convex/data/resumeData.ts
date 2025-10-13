/**
 * Structured resume data for Richard Ng
 * This module contains all professional information extracted from the resume
 * Last updated: 2025-10-13
 */

export const personalInfo = {
  name: "Richard Ng Wai Leung",
  location: "Singapore",
  phone: "+65 87913436",
  email: "richardconstantine67@gmail.com",
  linkedin: "https://www.linkedin.com/in/richieriri/",
  calendly: "https://calendly.com/richieriri/30min",
  aboutMe: "https://developerdanwu.com",
} as const;

export const professionalSummary = `Product Manager with 10+ years delivering next-gen AI platforms across financial services, fintech, and Web3. Proven expertise in LLMs, conversational AI, agentic systems, and human-in-the-loop design. Skilled in building 0 to 1 and 1 to scale AI products, chatbot lifecycle management, and GenAI evaluation frameworks. Adept at aligning engineering, data science, and operations to ship scalable AI assistants that improve customer support, CSAT, and automation efficiency.`;

export const experience = [
  {
    title: "Product Manager, Analytics & AI",
    company: "Axi Pte Ltd",
    location: "Singapore",
    period: "Jan 2024 – Current",
    achievements: [
      "Built enterprise chatbot platform integrated with trading & customer data, automating 60% of inquiries and raising CSAT by 25%",
      "Launched Finance GenAI Assistant with RLHF loops, cutting manual ops 60% and lowering costs 25%",
      "Orchestrated multi-agent orchestration for semantic data marketplace, achieving 70%+ adoption and adaptive AI improvement",
      "Designed annotation and LLM evaluation framework & metrics for AI Evals framework, improve prompt accuracy by 30%",
      "Defined KPIs for deflection rate, CSAT, and model quality, aligning product metrics with business goals",
      "Modernized internal tech platform saving USD 330K overhead and deliver partner and affiliate business insights with automated commission payouts",
    ],
    keywords: ["chatbot", "conversational AI", "RLHF", "multi-agent", "LLM evaluation", "GenAI", "automation", "CSAT"],
  },
  {
    title: "Product Manager",
    company: "Informatica",
    location: "Singapore & Hong Kong",
    period: "April 2021 – Dec 2023",
    achievements: [
      "Shipped chatbot solutions for insurance marketplace, reducing onboarding query resolution time by 40% and improve customer engagement and onboarding",
      "Launched Informatica CLAIRE AI, an AutoML + metadata recommendation engine, cutting data discovery time by 40%",
      "Enhanced compliance adoption 35% by leading Data & AI governance with Informatica MDM and Data Governance across SEA",
      "Achieved 50% YoY platform adoption growth by building foundation of data products strategy for marketplace intelligence tools",
    ],
    keywords: ["chatbot", "AutoML", "AI governance", "data governance", "MDM", "marketplace"],
  },
  {
    title: "Senior Product Manager",
    company: "Animoca Brands",
    location: "Hong Kong (Freelance)",
    period: "Sept 2022 – Jul 2023",
    achievements: [
      "Launched Web3 sustainability crypto token MVP; onboarded 200+ users via social-led GTM and defined utility mechanics",
      "Launched Moca Wallet, driving adoption within Animoca Brands' partner and investor ecosystem for crypto tokens and NFTs",
    ],
    keywords: ["Web3", "crypto", "NFT", "wallet", "blockchain"],
  },
  {
    title: "Product Manager, Hybrid Cloud & Data Analytics",
    company: "Huawei",
    location: "Singapore",
    period: "Jan 2018 – Feb 2021",
    achievements: [
      "Delivered $3M+ in cloud projects using Huawei Cloud and AutoML, Google BigQuery, and Looker for enterprise analytics",
      "Boosted workflow efficiency by 40% by launching Vision AI for intelligent document automation",
      "Reduced reporting time by 70% by developing reusable AI-powered reporting templates",
    ],
    keywords: ["cloud", "AutoML", "BigQuery", "Vision AI", "document automation", "analytics"],
  },
  {
    title: "Technology Architect, APAC",
    company: "Hewlett-Packard Enterprise",
    location: "Malaysia",
    period: "May 2013 – Dec 2017",
    achievements: [
      "Led hybrid cloud deployments and infrastructure modernization across APAC",
      "Reduced Azure hybrid cloud migration cost/time 40% by designing resilient hybrid cloud frameworks",
      "Designed and documented large-scale data center architectures for enterprise clients",
    ],
    keywords: ["hybrid cloud", "Azure", "infrastructure", "architecture"],
  },
] as const;

export const portfolios = [
  {
    name: "AIViralBuzz",
    context: "Bolt Hackathon",
    description: "GenAI platform for social influencer to manage content, engagement and monetization",
    keywords: ["GenAI", "social media", "influencer", "content management"],
  },
  {
    name: "LinkedIn Curator AI",
    context: "Google Hackathon",
    description: "One-click Chrome extension that summarizes and tags LinkedIn posts into a searchable knowledge base (Google Sheets)",
    keywords: ["Chrome extension", "AI", "knowledge management", "summarization"],
  },
] as const;

export const skills = {
  ai: ["GenAI", "LLMs", "RAG", "Braintrust", "AI/ML Lifecycle", "Agentic AI with Vertex AI", "Semantic Search"],
  tools: ["Internal AI Tools", "Databricks", "Figma"],
  product: ["Human-Centered Design", "Stakeholder Engagement", "Product Lifecycle", "Agile & SAFe"],
  analytics: ["Data Analytics"],
  compliance: ["Regulatory Compliance"],
} as const;

export const education = {
  degree: "Bachelor of Science (Honors) Software Engineering",
  university: "Coventry University",
  location: "United Kingdom",
  period: "Jan 2010 - Apr 2013",
  activities: [
    "Chairperson of Astronomy Club",
    "Project Manager & Quartermaster for INTI Pageant Night (Won Best Event of the year 2010, 2011, 2012, 2013)",
  ],
} as const;

/**
 * Key metrics and achievements for quick reference
 */
export const keyMetrics = {
  yearsOfExperience: "10+",
  industries: ["financial services", "fintech", "Web3", "insurance", "cloud computing"],
  impactMetrics: [
    "60% automation of customer inquiries",
    "25% CSAT improvement",
    "60% reduction in manual operations",
    "70%+ adoption for data marketplace",
    "30% improvement in prompt accuracy",
    "40% reduction in onboarding query resolution time",
    "50% YoY platform adoption growth",
    "USD 330K cost savings",
  ],
} as const;

/**
 * Expertise areas for context-aware responses
 */
export const expertiseAreas = {
  aiAndML: {
    title: "AI & ML Product Management",
    focus: [
      "LLMs and Conversational AI",
      "Agentic systems and multi-agent orchestration",
      "Human-in-the-loop design and RLHF",
      "Chatbot lifecycle management",
      "GenAI evaluation frameworks",
      "AutoML platforms",
      "AI governance and compliance",
    ],
    achievements: [
      "Built enterprise chatbot platform with 60% inquiry automation",
      "Launched Finance GenAI Assistant with RLHF, reducing manual ops by 60%",
      "Designed LLM evaluation framework improving prompt accuracy by 30%",
      "Shipped Informatica CLAIRE AI with AutoML capabilities",
    ],
  },
  productManagement: {
    title: "Product Strategy & Execution",
    focus: [
      "0 to 1 and 1 to scale product development",
      "Cross-functional team alignment",
      "Product metrics and KPIs",
      "Stakeholder management",
      "Agile and SAFe methodologies",
    ],
    achievements: [
      "Defined KPIs for deflection rate, CSAT, and model quality",
      "Achieved 50% YoY platform adoption growth",
      "Launched multiple MVPs from concept to production",
    ],
  },
  dataAndAnalytics: {
    title: "Data & Analytics Platforms",
    focus: [
      "Data marketplace and semantic search",
      "Data governance and MDM",
      "Enterprise analytics platforms",
      "Cloud data infrastructure",
    ],
    achievements: [
      "Orchestrated semantic data marketplace with 70%+ adoption",
      "Enhanced compliance adoption by 35% through data governance",
      "Delivered $3M+ in cloud analytics projects",
    ],
  },
  emergingTech: {
    title: "Web3 & Blockchain",
    focus: [
      "Crypto token economics",
      "NFT platforms",
      "Web3 product strategy",
      "Wallet solutions",
    ],
    achievements: [
      "Launched Web3 sustainability crypto token MVP",
      "Launched Moca Wallet for crypto and NFT adoption",
    ],
  },
} as const;
