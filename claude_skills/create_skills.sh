#!/bin/bash

# This script creates template SKILL.md files for remaining skills
# Will be populated with comprehensive content

skills=(
  "test-automation:test-automation:Expert in automated testing strategies including unit, integration, E2E tests, TDD/BDD, test coverage, and CI/CD integration. Use when writing tests, setting up test frameworks, improving test coverage, or implementing test automation pipelines."
  "performance-profiling:performance-profiling:Expert in application performance analysis, profiling, optimization, and monitoring. Use when identifying performance bottlenecks, optimizing slow code, reducing memory usage, or improving application speed."
  "docker-kubernetes:docker-kubernetes:Expert in containerization with Docker and orchestration with Kubernetes including deployment, scaling, networking, and production-grade configurations. Use for containerizing applications, Kubernetes deployments, microservices architecture, or DevOps automation."
  "ci-cd-pipeline:ci-cd-pipeline:Expert in CI/CD pipeline design and implementation using GitHub Actions, GitLab CI, Jenkins, and other tools. Use when setting up automated testing, deployment pipelines, or DevOps workflows."
  "frontend-accessibility:frontend-accessibility:Expert in web accessibility (WCAG 2.1 AAA) including ARIA, keyboard navigation, screen reader support, and inclusive design. Use for accessibility audits, implementing a11y features, or ensuring compliance with accessibility standards."
  "backend-scaling:backend-scaling:Expert in backend scaling strategies including load balancing, caching, database sharding, microservices, and horizontal/vertical scaling. Use when optimizing for high traffic, designing scalable architectures, or troubleshooting performance under load."
  "data-pipeline:data-pipeline:Expert in building ETL/ELT pipelines, data processing, transformation, and orchestration using tools like Airflow, Spark, and dbt. Use for data engineering tasks, building data workflows, or implementing data processing systems."
  "ml-model-integration:ml-model-integration:Expert in integrating AI/ML models into applications including model serving, API design, inference optimization, and monitoring. Use when deploying ML models, building AI features, or optimizing model performance in production."
  "documentation-generator:documentation-generator:Expert in generating comprehensive technical documentation including API docs, code comments, README files, and technical specifications. Use for auto-generating documentation, improving code documentation, or creating developer guides."
  "error-handling:error-handling:Expert in robust error handling patterns, exception management, logging, monitoring, and graceful degradation. Use when implementing error handling strategies, debugging production issues, or improving application reliability."
  "code-review:code-review:Expert in automated and manual code review focusing on best practices, security, performance, and maintainability. Use for conducting code reviews, setting up automated checks, or providing feedback on pull requests."
  "git-workflow-optimizer:git-workflow-optimizer:Expert in Git workflows, branching strategies, merge strategies, conflict resolution, and Git best practices. Use for optimizing Git workflows, resolving complex merge conflicts, or setting up branching strategies."
  "dependency-management:dependency-management:Expert in package management, dependency updates, security patches, and managing dependency conflicts. Use when updating dependencies, resolving version conflicts, or auditing package security."
  "logging-monitoring:logging-monitoring:Expert in application logging, monitoring, observability, alerting, and incident response using tools like Datadog, Prometheus, Grafana, and ELK stack. Use for implementing logging strategies, setting up monitoring dashboards, or troubleshooting production issues."
  "auth-implementation:auth-implementation:Expert in authentication and authorization systems including OAuth2, JWT, session management, SSO, and identity providers. Use when implementing user authentication, authorization, or integrating with identity providers like Auth0, Okta, or Firebase Auth."
  "graphql-schema-design:graphql-schema-design:Expert in GraphQL schema design, resolvers, optimization, subscriptions, and federation. Use when designing GraphQL APIs, optimizing query performance, or implementing GraphQL subscriptions."
  "real-time-systems:real-time-systems:Expert in building real-time systems using WebSockets, Server-Sent Events, WebRTC, and real-time databases. Use for implementing chat, live updates, collaborative features, or real-time notifications."
  "caching-strategies:caching-strategies:Expert in caching strategies including Redis, Memcached, CDN caching, application-level caching, and cache invalidation patterns. Use for implementing caching layers, optimizing performance, or designing cache invalidation strategies."
  "migration-tools:migration-tools:Expert in database migrations, framework migrations, version upgrades, and data migration strategies. Use when migrating databases, upgrading frameworks, or planning large-scale migrations with zero downtime."
  "ui-component-library:ui-component-library:Expert in building design systems and component libraries using React, Vue, or web components with Storybook, testing, and documentation. Use when creating reusable UI components, building design systems, or implementing component libraries."
  "mobile-responsive:mobile-responsive:Expert in responsive web design, mobile-first development, progressive web apps, and cross-device compatibility. Use for building responsive layouts, optimizing mobile performance, or implementing PWA features."
)

for skill_info in "${skills[@]}"; do
  IFS=':' read -r folder name desc <<< "$skill_info"
  echo "Creating $name..."
done

