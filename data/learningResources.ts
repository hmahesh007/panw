import type { AudienceType, RoadmapStep } from "@/types";

type ResourceType = RoadmapStep["resourceType"];

interface ResourceTemplate {
  title: string;
  resourceType: ResourceType;
  cost: RoadmapStep["cost"];
  estimatedHours: number;
}

const DEFAULT_RESOURCE: ResourceTemplate = {
  title: "Targeted practice sprint",
  resourceType: "practice",
  cost: "free",
  estimatedHours: 6,
};

export const LEARNING_RESOURCE_MAP: Record<string, ResourceTemplate> = {
  accessibility: {
    title: "Web Accessibility Fundamentals",
    resourceType: "course",
    cost: "free",
    estimatedHours: 5,
  },
  airflow: {
    title: "Airflow DAGs Mini Project",
    resourceType: "project",
    cost: "free",
    estimatedHours: 8,
  },
  ansible: {
    title: "Ansible for the Absolute Beginner",
    resourceType: "course",
    cost: "free",
    estimatedHours: 6,
  },
  aws: {
    title: "AWS Cloud Practitioner Essentials",
    resourceType: "certification",
    cost: "optional",
    estimatedHours: 10,
  },
  azure: {
    title: "Azure Fundamentals Learning Path",
    resourceType: "certification",
    cost: "optional",
    estimatedHours: 8,
  },
  bash: {
    title: "Shell Scripting Practice Pack",
    resourceType: "practice",
    cost: "free",
    estimatedHours: 4,
  },
  "ci/cd": {
    title: "CI/CD Pipeline Build Project",
    resourceType: "project",
    cost: "free",
    estimatedHours: 7,
  },
  "cloud security": {
    title: "Cloud Security Fundamentals",
    resourceType: "course",
    cost: "paid",
    estimatedHours: 7,
  },
  css: {
    title: "Modern CSS Deep Dive",
    resourceType: "course",
    cost: "free",
    estimatedHours: 5,
  },
  databricks: {
    title: "Databricks Lakehouse Fundamentals",
    resourceType: "course",
    cost: "optional",
    estimatedHours: 6,
  },
  dbt: {
    title: "dbt Fundamentals",
    resourceType: "course",
    cost: "free",
    estimatedHours: 5,
  },
  docker: {
    title: "Containerize and Deploy a Service",
    resourceType: "project",
    cost: "free",
    estimatedHours: 8,
  },
  etl: {
    title: "Build an ETL Pipeline End-to-End",
    resourceType: "project",
    cost: "free",
    estimatedHours: 8,
  },
  firebase: {
    title: "Firebase App Backend Starter",
    resourceType: "project",
    cost: "free",
    estimatedHours: 5,
  },
  flutter: {
    title: "Flutter Crash Course + Demo App",
    resourceType: "course",
    cost: "free",
    estimatedHours: 8,
  },
  gcp: {
    title: "Google Cloud Digital Leader Prep",
    resourceType: "certification",
    cost: "optional",
    estimatedHours: 8,
  },
  go: {
    title: "Go Fundamentals for Production Services",
    resourceType: "course",
    cost: "free",
    estimatedHours: 7,
  },
  graphql: {
    title: "Design and Ship a GraphQL API",
    resourceType: "project",
    cost: "free",
    estimatedHours: 7,
  },
  helm: {
    title: "Helm Charts Workshop",
    resourceType: "practice",
    cost: "free",
    estimatedHours: 4,
  },
  html: {
    title: "Semantic HTML Refresher",
    resourceType: "practice",
    cost: "free",
    estimatedHours: 3,
  },
  iam: {
    title: "IAM Policy Design Lab",
    resourceType: "project",
    cost: "free",
    estimatedHours: 5,
  },
  "incident response": {
    title: "Incident Response Tabletop Pack",
    resourceType: "practice",
    cost: "free",
    estimatedHours: 4,
  },
  javascript: {
    title: "JavaScript Interview Prep Track",
    resourceType: "course",
    cost: "free",
    estimatedHours: 6,
  },
  java: {
    title: "Spring Boot REST API Build",
    resourceType: "project",
    cost: "free",
    estimatedHours: 8,
  },
  jupyter: {
    title: "Jupyter Workflow Practice",
    resourceType: "practice",
    cost: "free",
    estimatedHours: 3,
  },
  kafka: {
    title: "Kafka Event Streaming Essentials",
    resourceType: "course",
    cost: "free",
    estimatedHours: 7,
  },
  kotlin: {
    title: "Kotlin Android Fundamentals",
    resourceType: "course",
    cost: "free",
    estimatedHours: 8,
  },
  kubernetes: {
    title: "Kubernetes for Developers",
    resourceType: "course",
    cost: "free",
    estimatedHours: 9,
  },
  linux: {
    title: "Linux Command Line Practice",
    resourceType: "practice",
    cost: "free",
    estimatedHours: 4,
  },
  mlops: {
    title: "MLOps Deployment Project",
    resourceType: "project",
    cost: "paid",
    estimatedHours: 10,
  },
  "mobile ui": {
    title: "Mobile UI Portfolio Screen Build",
    resourceType: "project",
    cost: "free",
    estimatedHours: 5,
  },
  microservices: {
    title: "Microservices Architecture Case Study",
    resourceType: "practice",
    cost: "free",
    estimatedHours: 6,
  },
  monitoring: {
    title: "Prometheus and Grafana Observability Lab",
    resourceType: "project",
    cost: "free",
    estimatedHours: 6,
  },
  mongodb: {
    title: "MongoDB CRUD API Starter",
    resourceType: "project",
    cost: "free",
    estimatedHours: 5,
  },
  networking: {
    title: "Networking Fundamentals for Engineers",
    resourceType: "course",
    cost: "free",
    estimatedHours: 6,
  },
  "next.js": {
    title: "Ship a Next.js Feature Project",
    resourceType: "project",
    cost: "free",
    estimatedHours: 7,
  },
  "node.js": {
    title: "Node.js API Foundations",
    resourceType: "course",
    cost: "free",
    estimatedHours: 6,
  },
  numpy: {
    title: "NumPy Fundamentals Notebook",
    resourceType: "practice",
    cost: "free",
    estimatedHours: 3,
  },
  pandas: {
    title: "Pandas Data Wrangling Lab",
    resourceType: "practice",
    cost: "free",
    estimatedHours: 4,
  },
  postgresql: {
    title: "PostgreSQL Query and Schema Practice",
    resourceType: "practice",
    cost: "free",
    estimatedHours: 5,
  },
  python: {
    title: "Python Foundations and Build Tasks",
    resourceType: "course",
    cost: "free",
    estimatedHours: 6,
  },
  pytorch: {
    title: "PyTorch Model Training Sprint",
    resourceType: "project",
    cost: "free",
    estimatedHours: 8,
  },
  react: {
    title: "React Component Systems Project",
    resourceType: "project",
    cost: "free",
    estimatedHours: 7,
  },
  "react native": {
    title: "React Native Starter App",
    resourceType: "project",
    cost: "free",
    estimatedHours: 8,
  },
  redis: {
    title: "Redis Caching Patterns Lab",
    resourceType: "practice",
    cost: "free",
    estimatedHours: 4,
  },
  "rest api": {
    title: "REST API Design and Testing",
    resourceType: "project",
    cost: "free",
    estimatedHours: 6,
  },
  redux: {
    title: "Redux State Management Practice",
    resourceType: "practice",
    cost: "free",
    estimatedHours: 4,
  },
  "scikit-learn": {
    title: "Scikit-learn Modeling Workflow",
    resourceType: "project",
    cost: "free",
    estimatedHours: 6,
  },
  siem: {
    title: "SIEM Fundamentals and Alert Triage",
    resourceType: "course",
    cost: "paid",
    estimatedHours: 7,
  },
  snowflake: {
    title: "Snowflake Data Warehousing Primer",
    resourceType: "course",
    cost: "optional",
    estimatedHours: 5,
  },
  spark: {
    title: "Spark Batch Processing Project",
    resourceType: "project",
    cost: "free",
    estimatedHours: 8,
  },
  sql: {
    title: "SQL Analytics and Joins Practice",
    resourceType: "practice",
    cost: "free",
    estimatedHours: 5,
  },
  swift: {
    title: "Swift iOS Essentials",
    resourceType: "course",
    cost: "free",
    estimatedHours: 8,
  },
  "tailwind css": {
    title: "Tailwind CSS UI Build Sprint",
    resourceType: "project",
    cost: "free",
    estimatedHours: 4,
  },
  tensorflow: {
    title: "TensorFlow Model Deployment Lab",
    resourceType: "project",
    cost: "free",
    estimatedHours: 8,
  },
  testing: {
    title: "Testing Pyramid Practice Track",
    resourceType: "practice",
    cost: "free",
    estimatedHours: 5,
  },
  terraform: {
    title: "Terraform Associate Prep Project",
    resourceType: "certification",
    cost: "optional",
    estimatedHours: 8,
  },
  typescript: {
    title: "TypeScript in Production Apps",
    resourceType: "course",
    cost: "free",
    estimatedHours: 6,
  },
};

export function getLearningResource(skill: string) {
  return LEARNING_RESOURCE_MAP[skill] ?? DEFAULT_RESOURCE;
}

export function audienceResourceHint(audience: AudienceType, resourceType: ResourceType) {
  if (audience === "recent-graduate") {
    return resourceType === "certification"
      ? "Prioritize this if you need a credible early-career signal."
      : "Turn this into a resume bullet or portfolio talking point.";
  }

  if (audience === "career-switcher") {
    return "Tie this resource back to transferable work you have already done.";
  }

  return "Use this as a mentoring checkpoint with explicit review criteria.";
}
