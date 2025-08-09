import {
    Code,
    Play,
    ShieldCheck,
    Terminal,
    Box,
    Clock,
    Rocket,
    CodeIcon,
    PuzzleIcon,
    RocketIcon,
    Sparkles,
    Check,
    Briefcase,
    Megaphone,
    Shield,
    Coins,
    Store,
    Coins as CoinsIcon
  } from 'lucide-react'
  import React from 'react'
  
  export const features = [
    {
      icon: <Code className="w-6 h-6 text-blue-400" />,
      title: "AI-Powered Creation",
      description: "Describe your extension in plain English and watch our AI build it in seconds"
    },
    {
      icon: <Play className="w-6 h-6 text-purple-400" />,
      title: "Live Playground - Now Sharable",
      description: "Test your extensions instantly in our sandbox before exporting"
    },
    {
      icon: <CoinsIcon className="w-6 h-6 text-yellow-400" />,
      title: "Tokenize Your Extensions",
      description: "Mint your extensions as Hedera tokens and earn passive income"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-green-400" />,
      title: "90% Working Accuracy",
      description: "Our sandbox testing ensures your extensions work first time"
    },
    {
      icon: <Shield className="w-6 h-6 text-orange-400" />,
      title: "Advanced Security Testing",
      description: "Every extension undergoes thorough security testing after sandbox validation for maximum safety"
    },
    {
      icon: <Coins className="w-6 h-6 text-yellow-400" />,
      title: "CODON Payment System",
      description: "Pay with our utility token CODON for seamless, fast transactions and exclusive platform benefits"
    },
    {
      icon: <Store className="w-6 h-6 text-cyan-400" />,
      title: "Community Marketplace",
      description: "List your extensions for sale or discover amazing extensions created by the community"
    },
    {
      icon: <Terminal className="w-6 h-6 text-blue-400" />,
      title: "Built-in Code Editor",
      description: "Fine-tune your extension with our powerful yet simple editor"
    },
    {
      icon: <Box className="w-6 h-6 text-purple-400" />,
      title: "Manifest V3 Ready",
      description: "All extensions are built with future-proof Chrome standards"
    }
  ]
  
  export const demoSteps = [
    {
      title: "Describe Your Extension",
      description: "Use natural language to explain what your extension should do",
      example: '"Create a productivity extension that blocks distracting websites during work hours and tracks my focus time"',
      icon: <Code className="w-8 h-8 text-blue-400" />
    },
    {
      title: "AI Generation",
      description: "CodEase builds complete extension files in seconds",
      example: "Generating manifest.json, background scripts, content scripts, and UI components...",
      icon: <Sparkles className="w-8 h-8 text-purple-400" />
    },
    {
      title: "Test & Refine",
      description: "See your extension in action instantly",
      example: "Test functionality in our sandbox environment with real-time feedback",
      icon: <Play className="w-8 h-8 text-green-400" />
    },
    {
      title: "Export & Deploy",
      description: "One-click export ready for Download",
      example: "Download your extension package with all required files and documentation",
      icon: <Rocket className="w-8 h-8 text-blue-400" />
    }
  ]
  
  export const useCases = [
    {
      title: "For Founders",
      icon: <Briefcase className="w-8 h-8 text-blue-500" />,
      description: "Launch browser tools for your SaaS without hiring developers",
      examples: ["Customer support widgets", "Product companion tools", "SaaS feature extensions"]
    },
    {
      title: "For Developers",
      icon: <CodeIcon className="w-8 h-8 text-purple-500" />,
      description: "Build & iterate 10x faster with AI assistance",
      examples: ["API integrations", "Developer tools", "Data scrapers"]
    },
    {
      title: "For Marketers",
      icon: <Megaphone className="w-8 h-8 text-green-500" />,
      description: "Create tools that enhance your brand's browser presence",
      examples: ["Social sharing tools", "Content publishing", "Analytics integrations"]
    }
  ]
  
  export const defaultPricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for trying CodEase",
      features: [
        "1 free credit upon sign-in",
        "Basic AI models",
        "Community support",
        "Public templates"
      ],
      cta: "Get Started Free",
      highlighted: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For professionals & teams",
      features: [
        "Unlimited extensions",
        "Advanced AI models",
        "Priority support",
        "Private extensions",
        "Custom branding",
        "Code export"
      ],
      highlighted: true,
      cta: "Start 7-Day Trial"
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For organizations & agencies",
      features: [
        "Everything in Pro",
        "Dedicated instance",
        "SSO & team management",
        "SLA guarantee",
        "API access",
        "Custom models"
      ],
      cta: "Contact Sales"
    }
  ]

  export const pricingPlans = defaultPricingPlans;
  
  export const testimonials = [
    {
      quote: "I built and published my first Chrome extension in under 10 minutes. No coding knowledge needed, and it worked perfectly on the first try!",
      author: "Sarah Chen",
      role: "Product Manager",
      company: "TechFlow"
    },
    {
      quote: "CodEase saved our dev team weeks of work. We needed a browser extension for our SaaS product and had it ready in minutes, not months.",
      author: "Michael Rodriguez",
      role: "CTO",
      company: "BoostX"
    },
    {
      quote: "As a marketer with zero coding experience, I was able to create a social sharing extension for our content team. It's honestly revolutionary.",
      author: "Emily Wilson",
      role: "Digital Marketing Lead",
      company: "GrowthLab"
    },
    {
      quote: "Our agency now offers Chrome extensions as a service thanks to CodEase. We've delivered 12 client projects in just two months.",
      author: "David Park",
      role: "Agency Founder",
      company: "WebSuite"
    },
    {
      quote: "I never thought building a Chrome extension could be this easy! I had it up and running in just an afternoon.",
      author: "Alice Thompson",
      role: "Marketing Director",
      company: "SmartGrow"
    },
    {
      quote: "CodEase allowed our team to rapidly prototype a custom browser extension that solved a key pain point for our users. Amazing tool!",
      author: "James Lee",
      role: "Lead Developer",
      company: "Innovatech"
    },
    {
      quote: "I had no coding experience, but I was able to create a Chrome extension that integrated with our CRM and improved team productivity!",
      author: "Chloe Miller",
      role: "Operations Manager",
      company: "SalesBoost"
    },
    {
      quote: "CodEase streamlined our development process. We launched our first extension in less than a week, saving us countless hours.",
      author: "Brian Scott",
      role: "Software Engineer",
      company: "ByteCrafters"
    },
    {
      quote: "Our content team now uses a custom Chrome extension to streamline publishing. It was incredibly easy to create thanks to CodEase.",
      author: "Sophia Evans",
      role: "Content Strategist",
      company: "Echo Media"
    },
    {
      quote: "Thanks to CodEase, we developed a Chrome extension that instantly improved our customer support workflows. It was like magic!",
      author: "Tom Harris",
      role: "Customer Support Lead",
      company: "HelpMate"
    },
    {
      quote: "With no prior knowledge of JavaScript, I was able to develop a Chrome extension that automated tasks for our sales team. CodEase is a game changer!",
      author: "Liam Carter",
      role: "Sales Operations Specialist",
      company: "PitchPerfect"
    },
    {
      quote: "As a small startup, CodEase helped us build a lightweight extension to enhance user experience. It’s a great product for non-technical founders like me.",
      author: "Zoe Green",
      role: "Co-Founder",
      company: "Visionary Labs"
    },
    {
      quote: "Our team built a powerful internal tool using a Chrome extension, all without writing a single line of code. CodEase is a must-have for rapid innovation.",
      author: "Daniel Moore",
      role: "Product Lead",
      company: "TechFlux"
    },
    {
      quote: "CodEase empowered us to build an extension for our e-commerce platform in record time, and it’s already driving better conversion rates.",
      author: "Olivia White",
      role: "E-commerce Manager",
      company: "ShopifyPro"
    }
  ]

  // Add this to your existing data.ts file, where other data like testimonials is defined:

  export const faqs = [
    {
      question: "How does CodEase generate a Chrome extension from my description?",
      answer: "CodEase uses AI to transform your plain English description into a fully functional Chrome extension. It generates the required manifest, scripts, and UI components while ensuring that it follows best practices and the latest Chrome extension standards. Afterward, we automatically test your extension in a sandbox environment, ensuring it works 90% of the time on the first try.",
      color: "blue"
    },
    {
      question: "Do I need to know how to code to create an extension?",
      answer: "No coding knowledge is required! With CodEase, simply describe the functionality you need in plain English, and our AI takes care of the rest. If you want to make advanced customizations, you can provide additional details and ask follow-up questions - our AI will implement the changes automatically based on your natural language instructions.",
      color: "green"
    },
    {
      question: "What types of Chrome extensions can I build with CodEase?",
      answer: "You can create a wide variety of Chrome extensions, including productivity tools, content filters, custom toolbars, and much more. Whether you're building a simple tool or a complex web app, CodEase provides the flexibility to turn your ideas into working Chrome extensions in no time.",
      color: "purple"
    },
    {
      question: "How is CodEase different from other no-code platforms for building Chrome extensions?",
      answer: "CodEase eliminates the frustrating cycle of constant reprompting and manual fixes that plague other platforms. Our AI-powered automatic testing ensures your extension works 90% of the time on the first try. Plus, you can upload any existing extension ZIP file to continue development rather than starting from scratch. While other tools leave you tweaking and troubleshooting for hours, CodEase's intelligent testing and optimization makes the process dramatically faster and more reliable.",
      color: "blue"
    },
    {
      question: "Can I customize the Chrome extensions generated by CodEase?",
      answer: "Yes! While our AI generates a functional Chrome extension based on your description, you can easily customize it by having a conversation with our AI. Simply explain what changes you'd like to make, and the AI will implement them for you. This conversational approach lets you refine features, design, and functionality without needing to write or edit any code yourself.",
      color: "purple"
    },
    {
      question: "What if I need specific permissions for my extension?",
      answer: "CodEase's AI automatically identifies and configures the necessary permissions for your extension based on its functionality. If you need more advanced permissions or features, simply describe what you need in natural language, and our AI will adjust the permissions accordingly. The AI optimizes permission requests to ensure your extension follows best security practices while maintaining all your desired functionality.",
      color: "yellow"
    }
  ];
