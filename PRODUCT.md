# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary buyer — First-time drone enthusiast**: Buying a first drone, looking to translate technical telemetry into real-world flight ease, safety, and price-to-capability confidence without getting lost in jargon.
- **Secondary buyers — Content creators and professional/industrial operators**: Experienced pilots comparing optical sensors, stabilization, flight endurance, and long-range transmission for photography, filmmaking, or inspections.
- **Store operators (`ADMIN`)**: Internal administrators managing catalog integrity (brands, models, cameras, drones, approved suppliers), inventory levels, promotional campaigns, orders, and administrator access.

## Product Purpose

**Skyline Drones** (`E-Commerce de Drones`) is an academic full-stack e-commerce web platform (UNITINS Tópicos em Programação II) specialized in drones, coupled optical cameras/sensors, and accessories.

It solves two core problems: helping shoppers make informed purchases backed by reliable technical specifications and buyer reviews rather than sparse marketplace listings, and giving administrators strict relational catalog governance, atomic stock control, and immutable order delivery records.

## Positioning

Unlike generalist e-commerce sites with inconsistent specifications and unverified manufacturer-model pairings, Skyline Drones enforces `Marca` ↔ `Modelo` catalog integrity and pairs it with domain-calibrated buying tools: relative autonomy and range bars across catalog cards, flight-purpose shortcuts (`Primeiro voo`, `Viagem e vlog`, `Fotografia e cinema`, `Longo alcance`), side-by-side comparison of up to 3 models with best-value highlights (`/comparar`), and transactional safeguards (atomic stock reservation/refund and immutable delivery-address snapshots on orders).

## Operating Context

- **Locale and domain standards**: Brazilian Portuguese (`pt-br`), BRL (`R$`) currency, Brazilian document and address validation (CPF, CNPJ, CEP), and recreational flight framing referencing ANAC's `120 m` ceiling (RBAC-E nº 94), with explicit units (`min`, `g`, `m`, `km`, `fps`, `GHz`).
- **Storefront workflows**: `/` (scroll-driven "primeiro voo" landing page), `/home` (filterable technical catalog), `/drone-info/:id` (full spec sheet, up to 5-image gallery, paginated buyer reviews), `/comparar` (side-by-side comparison of up to 3 drones), `/favoritos`, `/carrinho` (cart and simulated checkout), `/minha-conta` (`dados`, `enderecos`, `seguranca`), `/login`, and `/register`.
- **Admin back-office workflows (`/admin/*`, `ADMIN` role)**: Protected management views for Drones (including up to 5 S3-stored images), Marcas, Modelos, Câmeras, Fornecedores, Promoções, and Administradores.
- **Technical runtime context**: Angular 22.1 zoneless SPA (Signals plus `ChangeDetectorRef.markForCheck()` for subscription updates) backed by a Quarkus 3.32 / Java 25 REST API, PostgreSQL 16, and S3-compatible object storage (`AWS Emulator` in local dev, streamed via `GET /drones/imagens/{id}/arquivo`).

## Capabilities and Constraints

- **Academic and demonstrative checkout boundary**: Checkout simulates PIX (generated UUID key) and Credit Card confirmation with no real payment gateway integration and no real credit card numbers stored. Future work must preserve this demo framing and must not fabricate real customers, live payment guarantees, or production sales claims.
- **Role-based access control**: Stateless asymmetric RSA JWT authentication with `CLIENTE` and `ADMIN` roles (`authGuard`, `adminGuard`); public catalog reads (`GET /drones`) use `@PermitAll`.
- **Catalog and media rules**: Every `Modelo` belongs strictly to one `Marca`; each drone supports up to `5` images with `1` main cover image (`principal`); promotional discounts (`percentualDesconto`) apply only while within `[dataInicio, dataFim]`.
- **Cart, stock, and order rules**: Cart item quantities are capped by `quantidadeDisponivel`; zero-stock items display `"Esgotado"` and disable purchase; checkout requires an authenticated user with `nomeCompleto`, `cpf`, and a selected address (saved as an immutable delivery snapshot on `Pedido`); order creation reserves/decrements stock immediately and cancelling a `PENDENTE` order refunds stock atomically.
- **Reviews**: Maximum `1` review per authenticated user per drone (`1–5` stars, up to `1000` characters), listed newest-first in pages of up to `5`, storing a snapshot of `nomeCliente` (`<desconhecido>` when absent).
- **Active unbuilt scope**: Customer `"Meus Pedidos"` screen (tracking `PENDENTE`/`PAGO`/`CANCELADO` orders and cancelling pending orders) and frontend password-recovery screens (`Esqueci minha senha` / `Redefinir senha`, already supported on backend) remain active roadmap scope.
- **Open product/copy discrepancies to resolve**: Reconcile `"até 10x"` (`ecommerce-layout.html`) vs `"12x sem juros"` on catalog cards; align `"pedidos"` copy on `/login` with shipped customer order views; align catalog card promotional price display with backend DTO data; review hardcoded placeholder retail claims (`"Frete grátis"`, `"Garantia nacional"`, `(11) 4000-2025`, `@skylinedrones.com.br`) against the academic framing.
- **Deferred scope**: Admin curation of featured landing reviews (`destaque`, up to 3) is deferred; the landing page uses one explicitly marked illustrative testimonial (`DEPOIMENTO_FICTICIO` in `landing.ts`).

## Brand Commitments

- **Brand name**: **Skyline Drones** (quadrotor emblem + `SKYLINE` / `DRONES`).
- **Voice**: Direct, technical-yet-accessible Brazilian Portuguese (`pt-br`) grounded in real flight and telemetry terminology without intimidating first-time buyers.
- **Scope rules**: Maintain one unified `Skyline Drones` identity across the storefront and `/admin`, and restrict scroll-driven storytelling (`FxScroll`) strictly to `/` (task screens remain static and scan-optimized).

## Evidence on Hand

- **Seeded catalog data**: `backend/src/main/resources/import.sql` seeds 4 brands (`DJI`, `Autel Robotics`, `Hasselblad`, `Ryze`), 13 models, 4 cameras, 9 drones (e.g., `Drone DJI Mini 4 Pro`, `Drone DJI Air 3`, `Drone Autel EVO Lite+`), 2 active 2026 promotions, 2 suppliers, and seeded `ADMIN` (`rhuan`) and `CLIENTE` (`cliente`) accounts.
- **Landing photography**: `frontend/public/landing/` holds real landing images (`chao.webp`, `aerea.webp`, `tipo-primeiro-voo.jpg`, `tipo-viagem.jpg`, `tipo-cinema.jpg`, `tipo-longo-alcance.jpg`, `pouso.jpg`).
- **Existing project records**: `docs/CONTEXTO_PROJETO.md`, `docs/REGRAS_NEGOCIO.md`, `docs/modelo.plantuml`, `frontend/docs/landing/BRIEF.md`, and critique snapshot `.impeccable/critique/2026-11-17T18-31-31Z__frontend-src-app.md`.
- **Explicit absences (do not fabricate)**: No real customer testimonials (`DEPOIMENTO_FICTICIO` is explicitly fictitious), no live payment gateway, and seeded drones rely on dev-time S3 uploads rather than committed product photo binaries.

## Product Principles

1. **Translate telemetry into flight capability**: Show exact specifications alongside plain-language meaning so beginners decide confidently and experienced operators verify quickly.
2. **Transactional truth over retail theater**: Keep stock availability, promotion windows, installment copy, and simulated-checkout limits accurate and consistent across backend and UI.
3. **Story on entry, speed on task**: Reserve scroll narrative for `/`; keep catalog filtering, comparison, checkout, account management, and `/admin` predictable and scannable.
4. **One Skyline system across buyer and operator**: Storefront, customer account, and `/admin` share unified domain terminology, clarity, and quality standards.
5. **Preserve academic integrity**: Keep simulated payments and marked illustrative examples transparent without inventing real commercial traction or customer proof.

## Accessibility & Inclusion

- **WCAG 2.1 Level AA** compliance across both storefront and `/admin` workflows (full keyboard operability, visible focus indicators, AA text and control contrast, accessible validation/status alerts, and `prefers-reduced-motion` support).
