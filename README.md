# Sakani (سَكَنِي) — Frontend 🏢

This repository contains the component-driven frontend application for **Sakani**, a multi-tenant SaaS property management platform designed to streamline workflows between property owners, managers, and renters. 

The user interface is built as a responsive Single Page Application (SPA) using **React** and **TypeScript**.

> 🌐 **Backend Repository:** This client application communicates with a decoupled, enterprise-ready .NET Clean Architecture backend API. You can find the backend source code and API documentation at [github.com/abedalqader/sakani](https://github.com/Abedalqaders/Sakani).

---

## 🏗️ Tech Stack & Architecture

The frontend is structured around highly reusable functional components, dynamic layout boundaries, and robust client-side state architecture:

* **Core Framework:** React (Functional Components & Hooks) with TypeScript for strict type-safety.
* **State Management:** React Context API handling authentication sessions, JWT tokens, and layout states.
* **Routing:** React Router DOM implementing protected route structures with dynamic role-based guards.
* **UI & Iconography:** Clean, modern interface layouts utilizing utility-first styles and `lucide-react` icons.

---

## 🔒 Role-Based User Portals

The application adapts dynamically to three core authenticated roles managed by custom routing guards:

* **SuperAdmin Dashboard:** High-level overview to provision new tenants, monitor global infrastructure health, and inspect system-wide financial summaries.
* **Tenant Workspace (Property Managers):** Management interface to oversee isolated property portfolios, configure specific structural units, track lease contracts, and log operational overhead expenses.
* **Renter Portal:** A personal dashboard for end-user tenants to view active lease files, check historical rent payments, and submit maintenance support tickets.

---

## 🚦 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or later)
* npm or yarn

### Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/NoorAS31/sakani.git](https://github.com/NoorAS31/sakani.git)
   cd sakani
   
