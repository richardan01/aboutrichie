"use node";

import { MDocument } from "@mastra/rag";
import { internalAction } from "../_generated/server";
import { rag } from "../rag";

export const addCVEmbeddings = internalAction({
  args: {},
  handler: async (ctx) => {
    const doc = MDocument.fromJSON(
      JSON.stringify({
        personal_info: {
          name: "Richard Ng",
          email: "richardconstantine67@gmail.com",
          profiles: {
            github: {
              username: "richardan01",
              url: "https://github.com/richardan01",
            },
            linkedIn: {
              url: "https://www.linkedin.com/in/richieriri",
            },
          },
        },
        summary:
          "I am a Data Product Manager with over 12 years of experience building enterprise data and AI platforms. I specialize in data products, AI/ML platforms, and GenAI implementation across fintech, enterprise SaaS, and cloud environments. I lead cross-functional teams from product discovery to delivery, translating business needs into actionable data solutions.",
        skills_and_technology: [
          "Python",
          "SQL",
          "AWS",
          "Google Cloud Platform (GCP)",
          "Microsoft Azure",
          "Databricks",
          "Spark (PySpark)",
          "Hadoop",
          "BigQuery",
          "Azure Stack",
          "AutoML",
          "Segment",
          "Looker",
          "Informatica CLAIRE",
          "VisionAI",
          "Power BI",
          "Tableau",
          "ThoughtSpot",
          "Looker Studio",
          "Informatica IDMC",
          "Microsoft Data Fabric",
          "ETL",
          "Agile",
          "Scrum",
          "MLOps",
          "A/B Testing",
          "Data Governance",
          "Data Catalog",
          "Feature Stores",
          "Master Data Management",
          "Data Quality & Profiling",
        ],
        work_experience: [
          {
            company: "Axicorp Pte Ltd",
            position: "Senior Data Product Manager",
            duration: "Jan 2024 - Current",
            achievements: [
              "Led company-wide AI & data modernization initiatives, reducing operational overhead by 40% through a unified Master Data strategy and self-service analytics adoption",
              "Streamlined analytics operations by consolidating 67 reports into 6 key dashboards, building a business data mart, and enhancing data transparency and data-driven decision making",
              "Increased marketing ROI and customer retention by 33% via a churn prediction model using Databricks AutoML and Segment CDP",
              "Launched Axi Data Marketplace & Data Platform from 0 to 1 with NLP-based search, boosting cross-functional data discoverability and collaboration by 45%",
              "Directed team of 3 and led cross-functional teams in building a centralized AI-ready data platform, supporting feature engineering, ML & A/B experimentation, and analytic insight",
            ],
            notable_projects: [
              {
                name: "Axi Data Marketplace & Data Platform",
                url: "non-public facing",
              },
              {
                name: "Churn Prediction Model using Databricks AutoML",
                url: "non-public facing",
              },
              {
                name: "Business Data Mart & Analytics Consolidation",
                url: "non-public facing",
              },
            ],
            technologies: [
              "Python",
              "SQL",
              "Databricks",
              "AutoML",
              "Segment CDP",
              "AWS",
              "PySpark",
              "BigQuery",
              "Looker",
              "Power BI",
              "A/B Testing",
              "MLOps",
              "Data Governance",
              "Feature Stores",
            ],
          },
          {
            company: "Informatica Corporation",
            position: "Product Manager, Data Marketplace & Analytics",
            duration: "April 2021 - Dec 2023",
            achievements: [
              "Spearheaded the development of Informatica's Data Marketplace platform, enabling enterprise customers to discover, catalog, and monetize data assets across hybrid cloud environments",
              "Led cross-functional teams of 15+ engineers and data scientists to deliver AI-powered data discovery features using Informatica CLAIRE platform",
              "Drove product strategy for analytics and visualization capabilities, resulting in 25% increase in platform adoption among Fortune 500 customers",
              "Managed product roadmap for data governance and quality features, improving data trust scores by 40% across customer implementations",
              "Collaborated with enterprise customers to define requirements for self-service analytics and automated data profiling capabilities",
            ],
            notable_projects: [
              {
                name: "Informatica Data Marketplace Platform",
                url: "https://www.informatica.com/products/data-catalog.html",
              },
              {
                name: "CLAIRE AI-Powered Data Discovery",
                url: "https://www.informatica.com/products/artificial-intelligence.html",
              },
            ],
            technologies: [
              "Informatica CLAIRE",
              "Informatica IDMC",
              "Python",
              "SQL",
              "AWS",
              "Google Cloud Platform",
              "Microsoft Azure",
              "Spark",
              "Hadoop",
              "Data Catalog",
              "Master Data Management",
              "ETL",
              "Data Quality & Profiling",
            ],
          },
          {
            company: "Huawei",
            position: "Product Manager – Hybrid Cloud & Data Analytics Native",
            duration: "Jan 2018 - Feb 2021",
            achievements: [
              "Led product strategy for Huawei's hybrid cloud data analytics platform, targeting enterprise customers in APAC region",
              "Managed end-to-end product lifecycle for cloud-native data services, from conception to market launch",
              "Drove adoption of big data and machine learning capabilities on Huawei Cloud, achieving 60% year-over-year growth in data service usage",
              "Collaborated with engineering teams to integrate open-source technologies like Spark and Hadoop into Huawei's cloud ecosystem",
              "Established partnerships with system integrators and developed go-to-market strategies for data analytics solutions",
            ],
            notable_projects: [
              {
                name: "Huawei Cloud Data Analytics Platform",
                url: "non-public facing",
              },
              {
                name: "Cloud-Native Big Data Services",
                url: "non-public facing",
              },
            ],
            technologies: [
              "Huawei Cloud",
              "Spark",
              "Hadoop",
              "Python",
              "SQL",
              "Kubernetes",
              "Docker",
              "BigQuery",
              "Machine Learning",
              "Data Lakes",
              "ETL",
              "Cloud Architecture",
            ],
          },
          {
            company: "Hewlett-Packard Enterprise",
            position: "Technology Architect, APAC",
            duration: "May 2013 - Dec 2017",
            achievements: [
              "Designed and implemented enterprise data architecture solutions for Fortune 500 clients across APAC region",
              "Led technical teams in deploying hybrid cloud infrastructures and data center modernization projects",
              "Architected big data solutions using HPE technologies, resulting in improved data processing capabilities for clients",
              "Provided technical leadership for complex system integrations and cloud migration projects",
              "Mentored junior architects and established best practices for enterprise data management",
            ],
            notable_projects: [
              {
                name: "Enterprise Data Center Modernization",
                url: "non-public facing",
              },
              {
                name: "Hybrid Cloud Infrastructure Deployment",
                url: "non-public facing",
              },
            ],
            technologies: [
              "HPE Technologies",
              "VMware",
              "Microsoft Azure",
              "SQL Server",
              "Oracle",
              "Linux",
              "Windows Server",
              "Network Architecture",
              "Storage Solutions",
              "Virtualization",
              "System Integration",
            ],
          },
        ],
        education: [
          {
            degree: "Bachelor of Science (Hons) Software Engineering",
            institution: "Coventry University, United Kingdom",
            duration: "Jan 2010 - Apr 2013",
          },
        ],
      })
    );

    const chunks = await doc.chunk({
      strategy: "json",
      overlap: 50,
      maxSize: 512,
    });

    await rag.add(ctx, {
      namespace: "cv",
      chunks: chunks,
    });
  },
});

export const addDataProductManagerJourneyEmbeddings = internalAction({
  args: {},
  handler: async (ctx) => {
    const doc = MDocument.fromJSON(
      JSON.stringify({
        title: "Data Product Manager Journey: From Technology Architect to AI Specialist",
        author: "Richard Ng",
        document_type: "career_progression_story",
        main_theme: "evolution_from_infrastructure_to_data_product_leadership",

        story_structure: {
          foreword: {
            key_message:
              "Career evolution in tech isn't just about changing roles - it's about building on your technical foundation to create meaningful data products that drive business value",
            target_audience:
              "technical professionals transitioning to product management and data leadership roles",
            encouragement:
              "Your technical background is your superpower in product management - leverage it to bridge the gap between engineering teams and business stakeholders",
          },

          background: {
            education: "Bachelor of Science (Hons) Software Engineering, Coventry University (2010-2013)",
            foundational_experience: [
              "enterprise architecture",
              "system integration", 
              "hybrid cloud infrastructure",
              "data center modernization",
              "technical leadership",
            ],
            starting_point:
              "Technology Architect with deep technical expertise in enterprise infrastructure and cloud solutions",
            timeline:
              "2013 graduated → 2013-2017 HPE Technology Architect → 2018+ product management transition",
          },

          motivation_for_evolution: {
            initial_catalyst:
              "2017 - growing interest in how data architecture translates to business outcomes",
            key_realization:
              "technical excellence means nothing without product-market fit and user value",
            business_awareness:
              "recognized the shift from infrastructure-focused to data-driven business models",
            market_opportunity:
              "explosion of cloud-native data platforms and AI/ML demand in enterprise",
          },

          career_progression_phases: {
            phase_1_foundation_building: {
              role: "Technology Architect at HPE (2013-2017)",
              focus: "Enterprise data architecture and hybrid cloud solutions",
              key_skills_developed: [
                "enterprise system design",
                "client stakeholder management", 
                "technical solution architecture",
                "cross-functional team leadership",
                "complex project delivery"
              ],
              business_impact: "Fortune 500 client implementations across APAC",
              transition_preparation: "Building understanding of how technical solutions drive business outcomes",
            },

            phase_2_product_discovery: {
              role: "Product Manager - Hybrid Cloud & Data Analytics at Huawei (2018-2021)",
              transformation: "First formal product management role leveraging technical background",
              new_skills_acquired: [
                "product strategy development",
                "market analysis and competitive intelligence",
                "go-to-market planning",
                "customer discovery and validation",
                "agile product development"
              ],
              achievements: "60% YoY growth in data service usage, successful platform launch",
              learning_curve: "Translating technical capabilities into customer value propositions",
            },

            phase_3_specialization: {
              role: "Product Manager - Data Marketplace & Analytics at Informatica (2021-2023)",
              focus: "AI-powered data discovery and enterprise data platforms",
              advanced_capabilities: [
                "AI/ML product strategy",
                "enterprise data governance",
                "self-service analytics platforms",
                "data monetization strategies", 
                "Fortune 500 customer success"
              ],
              major_milestone: "Led 15+ person cross-functional teams, 25% platform adoption increase",
              expertise_development: "Deep specialization in data marketplace and AI-driven discovery",
            },

            phase_4_leadership: {
              role: "Senior Data Product Manager at Axicorp (2024-Current)",
              evolution: "Company-wide AI & data modernization leadership",
              strategic_impact: [
                "40% operational overhead reduction",
                "33% marketing ROI improvement",
                "45% cross-functional collaboration boost",
                "0-to-1 data platform launches"
              ],
              team_leadership: "Directing teams of 3+ and cross-functional initiatives",
              innovation_focus: "NLP-based search, AutoML implementation, feature engineering platforms",
            },
          },

          technical_to_product_transition: {
            leveraged_strengths: {
              technical_credibility: "Engineering teams trust product decisions",
              system_thinking: "Understanding of data architecture complexities", 
              problem_solving: "Analytical approach to product challenges",
              stakeholder_communication: "Translating technical concepts to business leaders",
            },
            
            new_skills_developed: {
              customer_empathy: "Understanding user needs and pain points",
              business_acumen: "ROI analysis and revenue impact measurement",
              market_research: "Competitive analysis and positioning",
              product_analytics: "Data-driven product decision making",
              cross_functional_leadership: "Influencing without authority",
            },

            key_mindset_shifts: {
              from_solution_first: "to problem-first thinking",
              from_technical_perfection: "to minimum viable product delivery",
              from_individual_contributor: "to team and ecosystem enabler",
              from_feature_delivery: "to business outcome achievement",
            },
          },

          specialization_journey: {
            data_platform_expertise: "Evolution from infrastructure to data product platforms",
            ai_ml_integration: "Incorporating AutoML, NLP, and predictive analytics into products",
            enterprise_scale: "Scaling solutions for Fortune 500 and global enterprises",
            self_service_focus: "Enabling business users through intuitive data products",
            governance_and_quality: "Balancing innovation with enterprise data governance needs",
          },
        },

        key_takeaways: [
          "Technical background provides incredible foundation for product management - don't see it as a limitation but as a competitive advantage",
          "The transition from individual contributor to product leader requires developing empathy for both technical teams and business stakeholders",
          "Data product management is about creating platforms that democratize data access while maintaining quality and governance",
          "Success comes from bridging the gap between what's technically possible and what creates business value",
          "Continuous learning is essential - the data and AI landscape evolves rapidly, requiring constant skill development",
          "Building cross-functional relationships is more important than any single technical skill",
        ],

        important_lessons: {
          technical_foundation: "Strong technical background accelerates product credibility and decision-making",
          customer_focus: "Technology doesn't matter if it doesn't solve real customer problems",
          team_building: "Product success depends on enabling and empowering cross-functional teams",
          iterative_delivery: "MVP approach applies to data products - start simple, learn fast, iterate",
          stakeholder_alignment: "Regular communication and expectation management prevents project failures",
          market_timing: "Understanding when to push technical boundaries vs. when to focus on adoption",
        },

        timeline_summary: {
          "2010-2013": "Software Engineering degree, foundational technical education",
          "2013-2017": "HPE Technology Architect - enterprise architecture mastery", 
          "2018-2021": "Huawei Product Manager - first product role, cloud data platforms",
          "2021-2023": "Informatica Product Manager - AI/ML specialization, enterprise scale",
          "2024-Current": "Axicorp Senior Data Product Manager - leadership and innovation focus",
        },

        success_factors: [
          "technical credibility with engineering teams",
          "ability to translate between technical and business languages",
          "customer-obsessed problem-solving approach", 
          "cross-functional collaboration and influence",
          "continuous learning and adaptation to new technologies",
          "strategic thinking combined with execution excellence",
          "data-driven decision making and measurement",
          "enterprise-scale solution experience",
        ],
      })
    );

    const chunks = await doc.chunk({
      strategy: "json",
      overlap: 50,
      maxSize: 512,
    });

    await rag.add(ctx, {
      namespace: "career_progression_story",
      chunks: chunks,
    });
  },
});
