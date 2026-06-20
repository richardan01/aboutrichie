/**
 * Structured resume data for Richard Ng
 * This module contains all professional information extracted from the resume
 * Merged from three resume variants (Analytics & AI, Senior PM, Gen AI PM)
 * into a single superset source of truth.
 * Last updated: 2026-06-20
 */

export const personalInfo = {
  name: "Richard Ng Wai Leung",
  location: "Singapore",
  phone: "+65 87913436",
  email: "richardconstantine67@gmail.com",
  linkedin: "https://www.linkedin.com/in/richieriri/",
  calendly: "https://calendly.com/richieriri/30min",
  aboutMe: "https://aboutrichie.vercel.app",
} as const;

export const professionalSummary = `Senior AI Product Manager with 12+ years building and scaling enterprise AI platforms across financial services, fintech, B2B SaaS, and Web3. Proven in 0 to 1 launch and 1 to scale of GenAI, AutoML, and semantic search platforms serving 5,000+ users and multi-region enterprise clients. Deep expertise in LLMs, conversational AI, agentic systems, human-in-the-loop design, AI evaluation, and governance. Skilled at shaping AI platform roadmaps, driving adoption through GTM strategy, and aligning engineering, data science, field sales, and compliance to ship secure, production-grade AI products that improve customer support, CSAT, and automation efficiency.`;

export const experience = [
  {
    title: "Senior Product Manager, Analytics & AI",
    company: "Axi Pte Ltd",
    location: "Singapore",
    period: "Jan 2024 – Current",
    achievements: [
      "Shaped AI platform strategy for enterprise trading & marketing workflows, packaging GenAI assistant capabilities and driving 70%+ adoption across 5,000+ employees",
      "Built enterprise chatbot platform integrated with trading & customer data, automating 60% of inquiries and raising CSAT by 25%",
      "Launched Finance GenAI Assistant with RLHF loops to automate recurring reporting, cutting manual ops 60% and lowering run-rate costs 25%",
      "Launched governed semantic data marketplace (300+ data owners, org-wide), achieving 70%+ adoption and reducing time-to-insight from 3 hours to 15 minutes",
      "Designed annotation and LLM evaluation framework with feedback loops (CSAT, intent accuracy, cost per inference), improving model performance and prompt accuracy by 30%",
      "Identified ~USD 500K cost-saving opportunity in manual finance ops, pitched GenAI automation to C-suite, and secured a funded 6-month roadmap",
      "Deployed churn-prediction ML models (Databricks AutoML + Segment CDP), lifting retention ROI by 33% across data science, ML Ops, and QA teams",
      "Partnered with Sales, Compliance, and Data teams to operationalize AI platform governance (lineage, auditability, evaluation metrics) for secure production rollout",
      "Modernized internal tech platform saving USD 330K overhead and delivered partner/affiliate business insights with automated commission payouts",
    ],
    keywords: ["chatbot", "conversational AI", "RLHF", "multi-agent", "LLM evaluation", "GenAI", "semantic search", "data marketplace", "GTM", "AI governance", "automation", "CSAT"],
  },
  {
    title: "Product Manager",
    company: "Informatica",
    location: "Singapore & Hong Kong",
    period: "April 2021 – Dec 2023",
    achievements: [
      "Co-owned the AI platform roadmap for CLAIRE GPT, aligning metadata AutoML and search capabilities across 5 engineering pods and global enterprise customers",
      "Shipped chatbot solutions with Informatica 360 for an insurance marketplace, reducing onboarding query resolution time by 40% and improving customer engagement",
      "Launched Informatica CLAIRE AI, an AutoML + metadata recommendation engine, cutting data discovery time by 40%",
      "Led governance features (lineage, access controls, confidence scoring) for regulated BFSI clients, increasing compliance adoption by 35%",
      "Achieved 50% YoY platform adoption growth by building the foundation of a data-products strategy for marketplace intelligence tools",
      "Executed AI and analytics rollouts across APAC with localized data residency and regulatory constraints, balancing global standards with market-specific needs",
    ],
    keywords: ["chatbot", "AutoML", "CLAIRE GPT", "AI governance", "data governance", "MDM", "BFSI", "marketplace", "data residency"],
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
      "Led go-to-market and technical positioning for Huawei Cloud AI & analytics offerings (AutoML, Vision AI, BigQuery), influencing ~$200M pipeline growth",
      "Increased enterprise RFP win rates by 28% through technical storytelling and AI solution packaging",
      "Boosted workflow efficiency by 40% by launching Vision AI for intelligent document automation",
      "Reduced reporting time by 70% by developing reusable AI-powered reporting templates",
    ],
    keywords: ["cloud", "AutoML", "BigQuery", "Vision AI", "document automation", "analytics", "GTM", "pipeline"],
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
    name: "GenAIBuff",
    context: "Solo Hackathon",
    description: "GenAI platform for social influencers to manage content, engagement, and monetization",
    keywords: ["GenAI", "LLM", "creator tools", "monetization", "hackathon"],
  },
  {
    name: "inVestor Pulse CDP (LinkedIn Curator AI)",
    context: "Google Hackathon",
    description: "One-click Chrome extension that summarizes and tags LinkedIn posts into a searchable knowledge base (Google Sheets)",
    keywords: ["Chrome extension", "AI", "knowledge management", "summarization"],
  },
] as const;

export const genAIProductExperience = {
  axiFinanceGenAIAssistant: {
    title: "Finance GenAI Assistant + Agentic Automation",
    company: "Axi Pte Ltd",
    period: "Jan 2024 - Current",
    users: [
      "Finance Ops",
      "FP&A",
      "Payments Ops",
      "Partner/Affiliate Ops",
      "Business stakeholders",
    ],
    problem:
      "Manual finance reporting and reconciliation created high operating cost, slow cycle times, and avoidable errors.",
    outcomes: [
      "Manual operations reduced by 60%",
      "Operational cost reduced by 25%",
      "Platform modernization saved USD 330K overhead",
      "Identified and translated ~USD 500K cost-saving opportunity into funded roadmap",
    ],
    metrics: [
      "Automation rate",
      "Time-to-report",
      "Accuracy/error rate",
      "Cost-to-serve",
      "Adoption (WAU/MAU, repeat usage)",
    ],
    guardrails: [
      "Compliance and audit readiness via lineage and audit logs",
      "Data correctness validation and exception thresholds",
    ],
    tools: ["LLMs", "Agentic workflows", "NLQ", "Structured queries"],
  },
  axiSemanticMarketplace: {
    title: "Enterprise Semantic Data Marketplace + GenAI Search",
    company: "Axi Pte Ltd",
    period: "Jan 2024 - Current",
    problem:
      "Data discovery was slow and inconsistent with duplicated work from fragmented ownership.",
    outcomes: [
      "Reduced discovery time from 3 hours to 15 minutes",
      "Achieved 70%+ company-wide adoption across 5,000+ employees",
      "Improved productivity and data reuse by 45%",
    ],
    metrics: [
      "Discovery latency (median/p90)",
      "Search success rate",
      "Dataset reuse rate",
      "Adoption and retention",
      "Data trust/quality score usage",
    ],
    guardrails: [
      "Access control compliance",
      "Data validation thresholds and freshness SLA adherence",
    ],
    tools: ["NLP search", "Semantic discovery", "Metadata guidance", "AI-ready platform foundation"],
  },
  axiEnterpriseChatbot: {
    title: "Enterprise Chatbot Platform + AI Ops",
    company: "Axi Pte Ltd",
    period: "Jan 2024 - Current",
    outcomes: [
      "Automated 60% of inquiries",
      "Increased CSAT by 25%",
      "Improved intent accuracy by 30%",
    ],
    metrics: [
      "Containment rate",
      "CSAT",
      "Intent accuracy (precision/recall)",
      "Resolution time",
      "Fallback rate",
      "Hallucination proxy rate",
    ],
    guardrails: [
      "Sensitive-topic policy adherence",
      "Wrong-answer rate threshold with confidence-based escalation",
    ],
    tools: ["Annotation pipelines", "Evaluation pipelines", "Intent lifecycle management"],
  },
  informaticaClaireGPT: {
    title: "CLAIRE GPT / Intelligent Metadata + AutoML Recommendation",
    company: "Informatica",
    period: "Apr 2021 - Dec 2023",
    outcomes: [
      "Reduced data discovery time by 40%",
      "Improved audit readiness and compliance adoption by 35%",
      "Contributed to 50% YoY platform adoption growth",
    ],
    tools: [
      "AutoML recommendations",
      "Metadata profiling/mapping/discovery",
      "Lineage/access/confidence scoring governance modules",
    ],
  },
  huaweiVisionAI: {
    title: "Vision AI Document Processing + Analytics Acceleration",
    company: "Huawei",
    period: "Jan 2018 - Feb 2021",
    outcomes: [
      "Improved workflow efficiency by 40%",
      "Reduced reporting time by 70%",
      "Delivered $3M+ cloud projects using AutoML + BigQuery + Looker",
    ],
    tools: ["Vision AI", "BigQuery", "Looker", "Reusable reporting templates"],
  },
  executionApproach: [
    "Problem framing with ROI baseline and north star metrics",
    "Human-centered discovery using jobs-to-be-done",
    "Data readiness and governance first (quality, lineage, access control)",
    "Build-vs-partner decisioning (RAG/search/structured query by risk-cost-value)",
    "MVP with iterative releases and instrumentation",
    "Evaluation loops (labeling, error taxonomy, QA sampling)",
    "Scale with enablement, governance, and operating workflows",
  ],
  frameworks: [
    "North Star with input/output metrics",
    "Guardrails and risk controls",
    "Experimentation via A/B and phased rollout",
    "AI evaluation loop",
    "PD-TOL narrative (Problem, Decision, Tradeoff, Outcome, Learning)",
  ],
  tooling: [
    "LLMs",
    "RAG patterns",
    "Agentic workflows",
    "Braintrust",
    "LangChain",
    "Vertex AI",
    "Databricks AutoML",
    "BigQuery",
    "Segment CDP",
    "Looker",
    "Data marts/semantic layers",
    "Lineage/access control/confidence scoring",
  ],
} as const;

export const skills = {
  ai: ["GenAI", "LLMs", "RAG", "Braintrust", "AI/ML Lifecycle", "Agentic AI with Vertex AI", "Semantic Search", "AI Evaluation"],
  tools: ["Internal AI Tools", "Databricks", "Segment CDP", "BigQuery", "Looker", "Figma"],
  product: ["Product Strategy & Roadmaps", "Go-to-Market (GTM)", "Enterprise AI Deployment", "Experimentation & Metrics", "Human-Centered Design", "Stakeholder Engagement", "Product Lifecycle", "Agile & SAFe", "Market Analysis"],
  analytics: ["Data Analytics", "Analytics & Data Platforms", "Data Quality, Lineage & Pipelines"],
  compliance: ["Regulatory Compliance", "Data & AI Governance, Risk & Controls"],
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
  yearsOfExperience: "12+",
  industries: ["financial services", "fintech", "B2B SaaS", "Web3", "insurance", "cloud computing"],
  impactMetrics: [
    "60% automation of customer inquiries",
    "25% CSAT improvement",
    "60% reduction in manual operations",
    "70%+ adoption for data marketplace across 5,000+ employees",
    "30% improvement in prompt accuracy",
    "Discovery time reduced from 3 hours to 15 minutes",
    "33% retention/ROI uplift from churn-prediction ML",
    "~USD 500K cost-saving opportunity translated into a funded roadmap",
    "~$200M pipeline influence and +28% RFP win rate at Huawei",
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
    title: "Product Strategy, GTM & Execution",
    focus: [
      "0 to 1 and 1 to scale product development",
      "Go-to-market strategy, ICP definition, and positioning",
      "POCs and lighthouse-customer rollouts with field/sales teams",
      "AI success-metrics frameworks (adoption, accuracy, cost per inference, ROI uplift)",
      "Multi-region, compliance-first enterprise deployment",
      "Cross-functional team alignment",
      "Product metrics and KPIs",
      "Stakeholder management",
      "Agile and SAFe methodologies",
    ],
    achievements: [
      "Defined KPIs for deflection rate, CSAT, and model quality",
      "Drove 70%+ GenAI platform adoption across 5,000+ employees",
      "Influenced ~$200M pipeline and +28% RFP win rate via AI solution packaging",
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
