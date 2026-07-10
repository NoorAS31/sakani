
<div align="center">

# 🏠 Sakani
### Real-State Management System — Backend API

[![.NET 8](https://img.shields.io/badge/.NET-8.0-512bd4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Entity Framework Core](https://img.shields.io/badge/EF%20Core-ORM-6f42c1)](https://learn.microsoft.com/en-us/ef/core/)
[![Docker](https://img.shields.io/badge/Docker-Container-2496ed?logo=docker&logoColor=white)](https://www.docker.com/)
[![Architecture](https://img.shields.io/badge/Architecture-Onion-orange)](#-architecture)

A graduation project by the **Faculty of Information Technology**, **The World Islamic Sciences and Education University (WISE)**.

</div>

---

## 🎥 Demo Video




https://github.com/user-attachments/assets/c944c158-8760-45cc-9d9f-9c7460c3225f


---

## 📖 Abstract

**Sakani** is a multi-tenant, web-based Property Management System that digitizes the rental lifecycle for independent landlords — property & unit setup, lease contracts, rent and expense tracking, and maintenance ticketing — replacing manual paperwork and spreadsheets. This repository contains the **backend**: a secure ASP.NET Core Web API built with Onion Architecture, Entity Framework Core, and PostgreSQL, isolating each landlord's data through strict multi-tenancy.

---

## ✨ Key Features

- 🔑 JWT authentication with role-based access (`Super Admin`, `Landlord`, `Renter`)
- 🏢 Property & unit portfolio management
- 📄 Lease contract creation with automated payment scheduling
- 💰 Rent payment & expense tracking
- 🛠️ Maintenance ticketing with image uploads
- 🔔 Automated notifications (payment reminders, contract expiry)
- 🧾 Full auditing (`created_at`/`updated_at`/`by`) and soft delete on every record
- 🔒 Strict per-landlord data isolation (multi-tenancy)

---

## 🧰 Tech Stack

`CSS` · `ReactJS` · `TypeScript`

---

## 🏗️ Architecture

The API follows **Onion Architecture** — dependencies point inward, toward the domain:

```
Api  →  Application  →  Domain  ←  Infrastructure
```

| Layer | Responsibility |
|---|---|
| **Domain** | Core entities & enums — no external dependencies |
| **Application** | Business logic, DTOs, service interfaces |
| **Infrastructure** | EF Core `DbContext`, PostgreSQL, repositories, migrations |
| **Api** | Controllers, JWT middleware, Swagger — the only layer exposed publicly |

Multi-tenancy is enforced via a global EF Core query filter on `landlord_id`, so every query is automatically scoped to the current landlord.

---

## 🚀 Quick Start

```bash
docker-compose up -d      # start PostgreSQL
cd Api
dotnet run                 # run the API (Swagger at /swagger)
```

---

## 👥 Team & Supervisor

| Role | Name |
|---|---|
| 🧭 Team Lead / Backend | [AbdAlqader Al Sadi](https://github.com/Abedalqaders) |
| ⚙️ Backend | [Osama Al Kharoubi](https://github.com/fakeosama1) |
| 🎨 Frontend | [Mutaz Abusini](https://github.com/mutazabusini) |
| 🎨 Frontend | [NourAldin AbuSharkh](https://github.com/NoorAS31) |
