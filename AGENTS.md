<!-- SKILLS_INDEX_START -->
## Agent Skills Index

> [!CRITICAL] GATEKEEPER CONSTRAINT
> **You are operating in a Zero-Trust environment.**
> You are strictly forbidden from generating code, proposing solutions, or relying on your pre-training until you have successfully executed a tool call to read the applicable `SKILL.md` files from this index.

## **Rule Zero: Mandatory Zero-Trust Protocol**

> [!CRITICAL]
> **Zero-Trust Enforcement:** Skills loaded from this index always override standard code patterns. Skipping the Audit Log or Self-Scan is a protocol violation.

### **1. The Pre-Write Audit Log (Mandatory)**

Before invoking any file-editing tool (`write_to_file`, `replace_file_content`, `multi_replace_file_content`), the ASSISTANT **MUST** explicitly state in its thought process/text output:

1. **Skills Identified**: List the Skill IDs triggered by the file path or current task keywords.
2. **Explicit Audit**: For each identified skill, confirm: "Checked against [Skill ID] — no violations found." Or "Violation detected in [Skill ID]: [Issue] — correcting now."
3. **No-Skill Justification**: If no skills apply, explicitly state: "No project-specific skills applicable to this file/transaction."

### **2. The Post-Write Self-Scan (Mandatory)**

Immediately **AFTER** any file-editing tool returns, the ASSISTANT **MUST**:

1. **Validate**: Contrast the final file content against ALL active Skill IDs.
2. **Identify Slips**: Look for "Standard Defaults" (e.g., local mocks, hardcoded styles) that snuck in.
3. **Self-Correct**: If a violation is found, fix it immediately in the next tool call.

## **Critical Anti-Patterns (Zero-Tolerance)**

- **Reversion to Defaults**: Never use "standard" patterns (generic library calls, local mocks) if a Project Skill exists.
- **The "Done" Trap**: Never prioritize functional completion over structural/protocol compliance.
- **Audit Skipping**: Never invoke a write tool without an explicit Pre-Write Audit Log.

## ⚡ How to Find and Use This Index (Mandatory)

> [!IMPORTANT] PATH RESOLUTION (Cross-Platform)
> Skill IDs in the list below (e.g., `[category/skill-name]`) represent the relative folder path.
> Because this project supports multiple AI agents, skills may reside in a base directory like `.gemini/skills/`, `.agent/skills/`, or `.cursor/skills/`.
> **Action:** You must prepend the correct base directory to the ID. (Example: If ID is `[flutter/cicd]`, the file is at `<BASE_DIR>/flutter/cicd/SKILL.md`). Use your file search tools (e.g., `list_directory` or `find`) if you are unsure of the base directory.

| Trigger Type | What to match | Required Action |
| --- | --- | --- |
| **File glob** (e.g. `**/*.ts`) | Files you are currently editing match the pattern | Call `view_file` on `<BASE_DIR>/[Skill ID]/SKILL.md` |
| **Keyword** (e.g. `auth`, `refactor`) | These words appear in the user\'s request | Call `view_file` on `<BASE_DIR>/[Skill ID]/SKILL.md` |
| **Composite** (e.g. `+other/skill`) | Another listed skill is already active | Also load this skill via `view_file` |

> [!TIP]
> **Indirect phrasing still counts.** Match keywords by intent, not just exact words.
> Examples: "make it faster" → `performance`, "broken query" → `database`, "login flow" → `auth`, "clean up this file" → `refactor`.

- **[common/common-accessibility]**: Enforce WCAG 2.2 AA compliance with semantic HTML, ARIA roles, keyboard navigation, and color contrast standards for web UIs. Use when building interactive components, adding form labels, fixing focus traps, or auditing a11y compliance. (triggers: `**/*.tsx, **/*.jsx, **/*.html, **/*.vue, **/*.component.html, accessibility, a11y, wcag, aria, screen reader, focus, alt text`)
- **[common/common-api-design]**: Apply REST API conventions — HTTP semantics, status codes, versioning, pagination, and OpenAPI standards for any framework. Use when designing endpoints, choosing HTTP methods, implementing pagination, or writing OpenAPI specs. (triggers: `**/*.controller.ts, **/*.router.ts, **/*.routes.ts, **/routes/**, **/controllers/**, **/handlers/**, rest api, endpoint, http method, status code, versioning, pagination, openapi, api design, api contract`)
- **[common/common-architecture-audit]**: Audit structural debt, logic leakage, and monolithic components across Web, Mobile, and Backend codebases. Use when reviewing architecture, assessing tech debt, detecting logic in wrong layers, or identifying God classes. (triggers: `package.json, pubspec.yaml, go.mod, pom.xml, nest-cli.json, architecture audit, code review, tech debt, logic leakage, refactor`)
- **[common/common-architecture-diagramming]**: Standards for creating clear, audience-appropriate C4 and UML architecture diagrams with Mermaid. Use when producing system context diagrams, container views, sequence diagrams, or updating ARCHITECTURE.md files. (triggers: `ARCHITECTURE.md, **/*.mermaid, **/*.drawio, diagram, architecture, c4, system design, mermaid`)
- **[common/common-best-practices]**: 🚨 Enforce SOLID principles, guard-clause style, function size limits, and intention-revealing naming across all languages. Use when refactoring for readability, applying clean-code patterns, reviewing naming conventions, or reducing function complexity. (triggers: `**/*.ts, **/*.tsx, **/*.go, **/*.dart, **/*.java, **/*.kt, **/*.swift, **/*.py, solid, kiss, dry, yagni, naming, conventions, refactor, clean code`)
- **[common/common-code-review]**: Conduct high-quality, persona-driven code reviews. Use when reviewing PRs, critiquing code quality, or analyzing changes for team feedback. (triggers: `review, pr, critique, analyze code`)
- **[common/common-context-optimization]**: Maximize context window efficiency, reduce latency, and prevent lost-in-middle issues through strategic masking and compaction. Use when token budgets are tight, tool outputs flood the context, conversations drift from intent, or latency spikes from cache misses. (triggers: `*.log, chat-history.json, reduce tokens, optimize context, summarize history, clear output`)
- **[common/common-dast-tooling]**: Standardize usage of Dynamic Application Security Testing (DAST) tools (ZAP, Nuclei, Nikto) and custom AI-driven curl probes for adversarial system testing. Use when advising on or running dynamic security scans on local/staging environments. (triggers: `DAST, dynamic scan, zap, nuclei, nikto, curl probe, pentest, dynamic analysis`)
- **[common/common-debugging]**: Troubleshoot systematically using the Scientific Method. Use when debugging crashes, tracing errors, diagnosing unexpected behavior, or investigating exceptions. (triggers: `debug, fix bug, crash, error, exception, troubleshooting`)
- **[common/common-documentation]**: Write effective code comments, READMEs, and technical documentation following intent-first principles. Use when adding comments, writing docstrings, creating READMEs, or updating any documentation. (triggers: `comment, docstring, readme, documentation`)
- **[common/common-error-handling]**: Cross-cutting standards for error design, response shapes, error codes, and boundary placement across API, domain, and infrastructure layers. Use when defining error hierarchies, wrapping exceptions, building standardized error responses, or placing error boundaries in layered architectures. (triggers: `**/*.service.ts, **/*.handler.ts, **/*.controller.ts, **/*.go, **/*.java, **/*.kt, **/*.py, error handling, exception, try catch, error boundary, error response, error code, throw`)
- **[common/common-feedback-reporter]**: 🚨 Pre-write skill violation audit. Checks planned code against loaded skill anti-patterns before any file write. Use when writing Flutter/Dart code, editing SKILL.md files, or generating any code where project skills are active. Load as composite alongside other skills. When a violation is detected and Auto-fixed: YES, also load +common/common-learning-log to record the mistake. (triggers: `skill violation, pre-write audit, audit violations, SKILL.md, **/*.dart, **/*.ts, **/*.tsx, +common/common-learning-log`)
- **[common/common-git-collaboration]**: 🚨 Enforce version control best practices for commits, branching, pull requests, and repository security. Use when writing commits, creating branches, merging, or opening pull requests. (triggers: `commit, branch, merge, pull-request, git`)
- **[common/common-learning-log]**: Append a structured learning entry to AGENTS_LEARNING.md whenever an AI agent makes a mistake. Auto-activates as a composite skill when: a pre-write skill violation is detected and auto-fixed, or when the session retrospective finds a correction loop. Also triggers directly when the user corrects the AI mid-session. Use when: mistake, wrong, redo, that's not right, correction, my bad, fix that error, I made a mistake, agent error, learning log, log mistake, AGENTS_LEARNING.md
- **[common/common-llm-security]**: 🚨 OWASP LLM Top 10 (2025) audit checklist for AI applications, agent tools, RAG pipelines, and prompt construction. Load during any security review touching LLM client code, prompt templates, agent tools, or vector stores. (triggers: `LLM security, prompt injection, agent security, RAG security, AI security, openai, anthropic, langchain, LLM review`)
- **[common/common-owasp]**: 🚨 OWASP Top 10 audit checklist for Web Applications (2021) and APIs (2023). Load during any security review, PR review, or codebase audit touching web, mobile backend, or API code. (triggers: `security review, OWASP, broken access control, IDOR, BOLA, injection, broken auth, API review, authorization, access control`)
- **[common/common-performance-engineering]**: 🚨 Enforce universal standards for high-performance development. Use when profiling bottlenecks, reducing latency, fixing memory leaks, improving throughput, or optimizing algorithm complexity in any language. (triggers: `**/*.ts, **/*.tsx, **/*.go, **/*.dart, **/*.java, **/*.kt, **/*.swift, **/*.py, performance, optimize, profile, scalability, latency, throughput, memory leak, bottleneck`)
- **[common/common-product-requirements]**: 🚨 Expert process for gathering requirements and drafting PRDs (Iterative Discovery). Use when creating a PRD, speccing a new feature, or clarifying requirements. (triggers: `PRD.md, specs/*.md, create prd, draft requirements, new feature spec`)
- **[common/common-protocol-enforcement]**: 🚨 Enforce Red-Team verification and adversarial protocol audit. Use when verifying tasks, performing self-scans, or checking for protocol violations. Load as composite for all sessions. (triggers: `verify done, protocol check, self-scan, pre-write audit, task complete, audit violations, retrospective, scan, red-team`)
- **[common/common-security-audit]**: 🚨 Probe for hardcoded secrets, injection surfaces, unguarded routes, and infrastructure weaknesses across Node, Go, Dart, Java, Python, and Rust codebases. Use when performing security audits, vulnerability scans, secrets detection, or penetration testing. (triggers: `package.json, go.mod, pubspec.yaml, pom.xml, Dockerfile, security audit, vulnerability scan, secrets detection, injection probe, pentest`)
- **[common/common-security-standards]**: 🚨 Enforce universal security protocols for safe, resilient software. Use when implementing authentication, encryption, authorization, input validation, secret management, or any security-sensitive feature across any language or framework. (triggers: `**/*.ts, **/*.tsx, **/*.go, **/*.dart, **/*.java, **/*.kt, **/*.swift, **/*.py, security, encrypt, authenticate, authorize`)
- **[common/common-session-retrospective]**: Analyze conversation corrections to detect skill gaps and auto-improve the skills library. Use after any session with user corrections, rework, or retrospective requests. After finding correction loops, also load +common/common-learning-log to persist mistake entries to AGENTS_LEARNING.md. (triggers: `**/*.spec.ts, **/*.test.ts, SKILL.md, AGENTS.md, retrospective, self-learning, improve skills, session review, correction, rework, +common/common-learning-log`)
- **[common/common-skill-creator]**: 🚨 Standardizes the creation and evaluation of high-density Agent Skills (Claude, Cursor, Windsurf). Ensures skills achieve high Activation (specificity/completeness) and Implementation (conciseness/actionability) scores. Use when: writing or auditing SKILL.md, improving trigger accuracy, or refactoring skills to reduce redundancy and maximize token ROI.
- **[common/common-system-design]**: 🚨 Enforce separation of concerns, dependency inversion, and resilience patterns across layered and distributed architectures. Use when designing new features, evaluating module boundaries, selecting architectural patterns, or resolving scalability bottlenecks. (triggers: `architecture, design, system, scalability, microservice, module boundary, coupling`)
- **[common/common-tdd]**: 🚨 Implements a strict Red-Green-Refactor loop to ensure zero production code is written without a prior failing test. Use when: creating new features, fixing bugs, or expanding test coverage. (triggers: `**/*.test.ts, **/*.spec.ts, **/*_test.go, **/*Test.java, **/*_test.dart, **/*_spec.rb, tdd, unit test, write test, red green refactor, failing test, test coverage`)
- **[common/common-ui-design]**: 🚨 Design distinctive, production-grade frontend UI with bold aesthetic choices. Use when building web components, pages, interfaces, dashboards, or applications in any framework (React, Next.js, Angular, Vue, HTML/CSS). (triggers: `build a page, create a component, design a dashboard, landing page, UI for, build a layout, make it look good, improve the design, build UI, create interface, design screen`)
- **[common/common-workflow-writing]**: 🚨 Rules for writing concise, token-efficient workflow and skill files. Prevents over-building that requires costly optimization passes. (triggers: `.agent/workflows/*.md, SKILL.md, create workflow, write workflow, new skill, new workflow`)
- **[react/react-component-patterns]**: 🚨 Build modern React component architecture with composition patterns. Use when designing reusable React components, applying composition patterns, or structuring component hierarchies. (triggers: `**/*.jsx, **/*.tsx, component, props, children, composition, hoc, render-props`)
- **[react/react-hooks]**: 🚨 Write efficient React functional components and hooks. Use when writing custom hooks, optimizing useEffect, or working with useMemo/useCallback in React. (triggers: `**/*.tsx, **/*.jsx, useEffect, useCallback, useMemo, useState, useRef, useContext, useReducer, useLayoutEffect, custom hook`)
- **[react/react-performance]**: 🚨 Optimize React rendering, bundle size, and data fetching performance. Use when optimizing React rendering performance, reducing re-renders, or improving bundle size. (triggers: `**/*.tsx, **/*.jsx, waterfall, bundle, lazy, suspense, dynamic`)
- **[react/react-security]**: 🚨 Prevent XSS, secure auth flows, and harden React client-side applications. Use when preventing XSS, securing auth flows, or auditing third-party dependencies in React. (triggers: `**/*.tsx, **/*.jsx, dangerouslySetInnerHTML, token, auth, xss`)
- **[react/react-state-management]**: 🚨 Manage local, global, and server state in React. Use when choosing or implementing state management (Context, Zustand, Redux, React Query) in React. (triggers: `**/*.tsx, **/*.jsx, state, useReducer, context, store, props`)
- **[react/react-testing]**: Test React components with RTL and Jest/Vitest. Use when writing React component tests with React Testing Library, Jest, or Vitest. (triggers: `**/*.test.tsx, **/*.spec.tsx, render, screen, userEvent, expect`)
- **[react/react-tooling]**: Configure debugging, bundle analysis, and ecosystem tools for React applications. Use when setting up Vite/webpack build tooling, analyzing bundle size, debugging re-renders with React DevTools, or configuring ESLint and StrictMode for React projects. (triggers: `package.json, devtool, bundle, strict mode, profile`)
- **[react/react-typescript]**: Type React components and hooks with TypeScript patterns. Use when typing React props, hooks, event handlers, or component generics in TypeScript. (triggers: `**/*.tsx, ReactNode, FC, PropsWithChildren, ComponentProps`)
- **[typescript/typescript-best-practices]**: Write idiomatic TypeScript patterns for clean, maintainable code. Use when writing or refactoring TypeScript classes, functions, modules, or async logic. (triggers: `**/*.ts, **/*.tsx, class, function, module, import, export, async, promise`)
- **[typescript/typescript-language]**: 🚨 Apply modern TypeScript standards for type safety and maintainability. Use when working with types, interfaces, generics, enums, unions, or tsconfig settings. (triggers: `**/*.ts, **/*.tsx, tsconfig.json, type, interface, generic, enum, union, intersection, readonly, const, namespace`)
- **[typescript/typescript-security]**: 🚨 Validate input, secure auth tokens, and prevent injection attacks in TypeScript. Use when validating input, handling auth tokens, sanitizing data, or managing secrets and sensitive configuration. (triggers: `**/*.ts, **/*.tsx, validate, sanitize, xss, injection, auth, password, secret, token`)
- **[typescript/typescript-tooling]**: Development tools, linting, and build config for TypeScript. Use when configuring ESLint, Prettier, Jest, Vitest, tsconfig, or any TS build tooling. (triggers: `tsconfig.json, .eslintrc.*, jest.config.*, package.json, eslint, prettier, jest, vitest, build, compile, lint`)

<!-- SKILLS_INDEX_END -->
