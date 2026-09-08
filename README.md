# APIx-India: Automated High-Frequency Real-Time Airfare Price Index Engine

> **Smart India Hackathon 2026 | Problem Statement #26056**  
> *Organization: Ministry of Statistics & Programme Implementation (MoSPI / NSO) & Reserve Bank of India (RBI)*

APIx-India replaces manual, fragmented retail collection with an automated, high-frequency airfare tracking pipeline adhering to international CPI standards (IMF/ILO CPI Manual) and MoSPI's Consumer Price Index methodology.

---

## Key Architecture & Features

1. **Basket Definition & DGCA Weighting (Stage 1)**:
   - Dynamic route weights ($W_r$) calculated using DGCA monthly domestic city-pair traffic tables (Revenue Passenger Kilometers: $\text{RPKM} = \text{Passengers} \times \text{Distance}$).
   - Integrates flight frequency ($F_r$) and passenger load factor ($\text{PLF}_r$).

2. **Automated Multi-Source Web Scraping & CDP Fallback (Stage 2)**:
   - Scrapes Tier-1 domestic carriers (**IndiGo, Air India, Akasa Air, SpiceJet**) and OTAs (**MakeMyTrip, EaseMyTrip, Yatra**).
   - Advance Purchase Windows: **$T+1, T+7, T+15, T+30, T+45$**.
   - **CDP (Chrome DevTools Protocol) Fallback**: If standard Selenium/Scrapy scrapers are blocked by Cloudflare or anti-bot firewalls, the engine activates CDP network response interception (`page.on('response')`) and in-browser state evaluation (`page.evaluate()`) to capture clean in-flight pricing JSON directly from the browser memory.

3. **Data Cleansing & Disaggregation (Stage 3)**:
   - Disaggregates into **Base Fare**, **Airline Fuel Surcharge**, **UDF/ADF Statutory Airport Charges**, and **GST**.
   - **Interquartile Range (IQR) Outlier Filtering**: Discards quotes outside $[Q_1 - 1.5 \times \text{IQR}, Q_3 + 1.5 \times \text{IQR}]$ per route/lead-time stratum.

4. **Econometric Index Engine (Stage 5)**:
   - **Jevons Price Index** (unweighted geometric mean) at the elementary flight level to prevent upward substitution bias.
   - **Booking Curve Aggregation** using empirical weights ($\beta_{T+1}=0.15, \beta_{T+7}=0.30, \beta_{T+15}=0.30, \beta_{T+30}=0.15, \beta_{T+45}=0.10$).
   - **Modified Laspeyres / Young Index** for the upper-level national composite index.

5. **Econometric Factor Decomposition (Stage 6)**:
   - Shapley-value and log-difference attribution quantifying exact basis-point contributions from **Aviation Turbine Fuel (ATF)**, **Festivals/Holidays**, and **Lead-time compression**.

6. **Validation & Back-Testing (Stage 8)**:
   - 30-day historical tracking against DGCA passenger yield benchmarks with Pearson correlation $r \ge 0.85$.

7. **Government REST API (Stage 9)**:
   - Secure REST endpoints (`/api/v1/apix/headline`, `/api/v1/apix/routes/{id}`, `/api/v1/export/cpi-transport-subgroup`) for direct ingestion into NSO CPI and RBI macro models.

---

## 1-Click Deployment to Render with PostgreSQL

The project includes a `render.yaml` Blueprint that automatically provisions:
1. **Managed PostgreSQL Database** (`apix-postgres`): Persistent storage with connection string passed automatically.
2. **FastAPI Web Service** (`apix-fastapi-backend`): Auto-installs Python packages, runs database schema migrations, and launches Uvicorn.

### Steps to Deploy on Render:
1. Fork or push this repository to your GitHub/GitLab account.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect this repository. Render will automatically detect `render.yaml`.
5. Click **Apply**. Render will provision PostgreSQL and deploy your FastAPI backend!
