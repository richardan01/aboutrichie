import { action } from "./_generated/server";
import { v } from "convex/values";

// Mock responses for testing the chat functionality
const mockResponses = {
  "hello": `Hi there! I'm **Richard**, a Data Product Manager with over 12 years of experience building enterprise data and AI platforms. 

I specialize in transforming complex data challenges into scalable product solutions across fintech, cloud, and enterprise environments. My expertise spans:

- **Data Products & Platforms** - From 0-to-1 launches to enterprise scale
- **AI/ML Implementation** - AutoML, GenAI, and predictive analytics  
- **Enterprise Analytics** - Self-service platforms and data governance

I'd love to chat about data product strategy, AI platform implementation, or my journey from Technology Architect to Data Product Manager. What would you like to know about my work?`,

  "who are you": `I'm **Richard Ng**, a Senior Data Product Manager currently at Axicorp, where I lead company-wide AI & data modernization initiatives.

**Quick highlights:**
- 🏢 **Current:** Senior Data Product Manager at Axicorp (2024-present)  
- 🚀 **Previous:** Product Manager at Informatica & Huawei, Technology Architect at HPE
- 🎓 **Education:** Software Engineering degree from Coventry University
- 💼 **Expertise:** Python, SQL, AWS, GCP, Azure, Databricks, AutoML, enterprise analytics

I've successfully delivered projects like the Axi Data Marketplace (45% boost in data discoverability) and churn prediction models (33% retention improvement). 

What aspect of my background interests you most?`,

  "career": `Great question! My **career progression** has been quite a journey from technical foundations to product leadership:

**🏗️ 2013-2017: Technology Architect at HPE**
- Built enterprise data architecture for Fortune 500 clients across APAC
- Gained deep technical credibility and stakeholder management skills

**☁️ 2018-2021: Product Manager at Huawei** 
- First formal product role - learned to translate technical capabilities into customer value
- Achieved 60% YoY growth in cloud data services

**🤖 2021-2023: Product Manager at Informatica**
- Specialized in AI-powered data discovery and enterprise platforms
- Led 15+ person teams, drove 25% platform adoption increase

**🚀 2024-Present: Senior Data Product Manager at Axicorp**
- Leading company-wide AI & data modernization
- 40% operational overhead reduction, launched 0-to-1 data platforms

The key was leveraging my technical background as a **competitive advantage** in product management - it gives me credibility with engineering teams and helps bridge the gap between what's technically possible and what creates business value.

Want to dive deeper into any specific phase or the transition lessons?`,

  "projects": `Excellent question! I've led some **impactful data and AI projects** across enterprise environments:

**🏢 At Axicorp (Current):**
- **Axi Data Marketplace & Platform**: Built from 0 to 1 with NLP-based search, boosting data discoverability by 45%
- **Churn Prediction Model**: Using Databricks AutoML and Segment CDP, increased customer retention by 33%  
- **Analytics Modernization**: Streamlined 67 reports into 6 key dashboards, reducing operational overhead by 40%

**🤖 At Informatica:**
- **CLAIRE AI Platform**: Deployed Google NLP and ML for automated data profiling, achieving 40% improvement in data integrity
- **AI-Powered Data Marketplace**: Reduced time-to-insight by 50% for fintech & insurance clients

**☁️ At Huawei:**
- **Hybrid Cloud Data Analytics Platform**: Led product strategy for enterprise customers in APAC
- **Cloud-Native Big Data Services**: Achieved 60% YoY growth in data service usage

These projects span the full spectrum from **data infrastructure to GenAI applications**. Each taught me something different about scaling data products in enterprise environments.

Want to dive deeper into any specific project or the technologies behind them?`,

  "default": `I'm **Richard**, a Data Product Manager passionate about enterprise AI and data platforms! 

I'd be happy to discuss:
- 🏗️ **Data product strategy** and platform architecture
- 🤖 **AI/ML implementation** in enterprise environments  
- 📊 **Analytics modernization** and self-service platforms
- 🚀 **Career progression** from Technology Architect to Product Manager
- 💼 **Specific projects** I've led at companies like Axicorp, Informatica, and Huawei

What would you like to explore?`
};

export const mockChatResponse = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Mock chat with prompt:", args.prompt);
    
    const lowerPrompt = args.prompt.toLowerCase();
    
    // Determine appropriate response based on prompt content
    let response = mockResponses.default;
    
    if (lowerPrompt.includes("hello") || lowerPrompt.includes("hi")) {
      response = mockResponses.hello;
    } else if (lowerPrompt.includes("who are you") || lowerPrompt.includes("about yourself") || lowerPrompt.includes("tell me about")) {
      response = mockResponses["who are you"];
    } else if (lowerPrompt.includes("career") || lowerPrompt.includes("journey") || lowerPrompt.includes("progression") || lowerPrompt.includes("transition")) {
      response = mockResponses.career;
    } else if (lowerPrompt.includes("project") || lowerPrompt.includes("work") || lowerPrompt.includes("experience")) {
      response = mockResponses.projects;
    }
    
    console.log("Mock response:", response.substring(0, 100) + "...");
    return response;
  },
});