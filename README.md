# 🚀 AI-Powered Autonomous Job Application Agent

[![Java 21](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot 3.2](https://img.shields.io/badge/Spring%20Boot-3.2.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Automation-blue.svg)](https://playwright.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade, distributed autonomous job application and matching engine architected for scale, stealth, and resilience. 

Built with **Java 21 (Virtual Threads)** & **Spring Boot 3** for core orchestration and security, **Node.js** for AI parsing and headless automation, and a cross-device responsive **React + Tailwind** dashboard synchronized via **WebSockets (STOMP)**.

---

## 🏛️ System Architecture

```text
                           ┌────────────────────────┐
                           │  Cross-Device Web UI   │
                           │ (React + Tailwind CSS) │
                           └───────────┬────────────┘
                                       │ WebSocket (STOMP)
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Java 21 Spring Boot Core Backend                     │
│  - Virtual Threads (Tomcat Protocol Customizer)                        │
│  - AES-256-GCM Zero-Knowledge Crypto Vault (Layer 1)                  │
│  - Composite SHA-256 Fingerprint Deduplication (Layer 7)               │
│  - Dynamic State Restoration & Quota Scheduler (Layer 2 & Layer 9)     │
│  - Inbound Email High-Intent Interview Scanner (Layer 6)               │
│  - Web Push Mobile Bridge (Layer 5)                                    │
└───────────────────┬─────────────────────────────────┬──────────────────┘
                    │                                 │
           JPA / SQL│                                 │ Enqueue Task
                    ▼                                 ▼
         ┌─────────────────────┐          ┌───────────────────────┐
         │ PostgreSQL Database │          │      Redis 7+         │
         │ (Optimistic Locking)│          │  (BullMQ Wait Queue)  │
         └─────────────────────┘          └───────────┬───────────┘
                                                      │
                                                      │ Worker Pop (Layer 12 Rate Limiter)
                                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Node.js Stealth Automation Worker                      │
│  - Gemini 2.5 Flash ATS Fit & Keyword Tailoring Engine (Layer 4)       │
│  - Multi-Portal Strategy Adapters (Naukri, LinkedIn)                   │
│  - Shadow Honeypot Evasion & DOM Pop-up Dismissal (Layer 14 & 16)      │
│  - AES-256 Encrypted Session & Cookie Vault (Layer 13)                 │
│  - Sandbox Context Memory Leak Containment Loop (Layer 17)             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 💎 Core Highlights & 17-Layer Capabilities

1. **JDK 21 Virtual Threads**: Zero thread starvation on high concurrency and continuous scheduling loops.
2. **Hardened AES-256-GCM Vault**: Credentials and session cookies are zero-knowledge encrypted on disk.
3. **Composite SHA-256 Deduplication**: Guarantees zero duplicate job applications across a 30-day sliding matrix.
4. **Google Gemini ATS Matcher**: Automatically scores descriptions and rejects jobs below the 70% relevance threshold.
5. **Cross-Device Responsive Dashboard**: Tailored column distributions across Mobile (`grid-cols-1`), Tablet (`md:grid-cols-2`), and Laptop/Desktop (`lg:grid-cols-4`).
6. **Multi-Portal Strategy Pattern**: Easily extendable adapter interface to support new job boards without modifying core logic.

---

## ⚡ Quick Start Guide

### 1. Start Infrastructure (PostgreSQL & Redis)
```bash
docker-compose up -d
```

### 2. Run Java Spring Boot Backend (JDK 21)
```bash
cd backend-spring-boot
mvn spring-boot:run
```

### 3. Run Automation Worker (Node.js)
```bash
cd automation-node-js
npm install
npm run worker
```

### 4. Run Frontend Dashboard (React + Tailwind)
```bash
cd frontend-cross-device
npm install
npm run dev
```

---

## 👨‍💻 Author
**Amit Raj** — Backend SDE & Distributed Systems Engineer  
- GitHub: [@amitraz62](https://github.com/amitraz62)
- LinkedIn: [linkedin.com/in/amitrajhjp](https://www.linkedin.com/in/amitrajhjp)
