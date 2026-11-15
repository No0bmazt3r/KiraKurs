# SOURCES.md: every citation used by KiraKurs, the poster, the video and the report

One place for references. When a source is used anywhere (app `SOURCES` list in `packages/core/src/content.ts`, poster,
video, report), it must be listed here with its exact URL/DOI.

**Status key**
- **Panel-opened 15 Nov:** the URL was opened by the AI review panel on 15 Nov 2026 and the quoted claim matched. This is
  *not* the member check: a named member must still open it and log name + date in `../../evidence/reference-check.md`, and
  archive a PDF/screenshot in `../../evidence/sources/` (idea.md §12).
- **Unverified:** could not be opened by the panel. Do not use on the poster until a member confirms it.

## A. Poster references (APA, numbered as on the poster)
| # | Reference | Used for | Status |
|---|---|---|---|
| 1 | Madura, J. (2021). *International financial management* (14th ed.). Cengage. | IRP, PPP, Fisher, IFE formulas | Book: member confirms the lecturer's edition and logs chapter + page per formula |
| 2 | Rogoff, K. (1996). The purchasing power parity puzzle. *Journal of Economic Literature, 34*(2), 647–668. https://ideas.repec.org/a/aea/jeclit/v34y1996i2p647-668.html | PPP holds slowly (3–5 year half-life) | Panel-opened 15 Nov |
| 3 | Bank Negara Malaysia. (2026, November 5). *Monetary policy statement*. https://www.bnm.gov.my/-/monetary-policy-statement-05112026 | OPR 2.75% | Panel-opened 15 Nov |
| 4 | Board of Governors of the Federal Reserve System. (2026, October 28). *Federal Reserve issues FOMC statement*. https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm | Fed funds 3.75–4.00% (midpoint 3.875%) | Panel-opened 15 Nov |
| 5 | Department of Statistics Malaysia. (2026, October 19). *Consumer price index Malaysia, September 2026*. **DOSM URL still to record.** Press confirmation: The Star (2026, October 19). *September inflation eases slightly to 1.8%…* https://www.thestar.com.my/business/business-news/2026/10/19/september-inflation-eases-slightly-to-18-on-as-utilities-cost-moderates | Malaysian CPI 1.8% | DOSM: member to find the release URL. The Star: Panel-opened 15 Nov |
| 6 | U.S. Bureau of Labor Statistics. (2026, October 14). *Consumer price index, September 2026*. https://www.bls.gov/news.release/archives/cpi_10142026.htm | US CPI 3.7% | Panel-opened 15 Nov |
| 7 | Bernama. (2026, November 6). *Ringgit slips against US dollar amid global risk-off sentiment*. https://bernama.com/en/market/news.php?id=2631031 | Spot 4.0565 (6 Nov close) | Panel-opened 15 Nov |
| 8 | Bank Negara Malaysia. (2025). Financial Capability and Inclusion Demand Side Survey 2024 (Box 4). In *Annual report 2024*. https://www.bnm.gov.my/documents/20124/17493532/ar2024_en_box4.pdf | MYFLIC 59.1 (2021: 59.0) | Panel-opened 15 Nov |
| 9 | International Trade Administration. (2023, March 23). *Malaysia education and training services industry snapshot*. https://www.trade.gov/country-commercial-guides/malaysia-education-and-training-services-industry-snapshot | 55,311 Malaysians abroad (UNESCO, year not stated); 4,933 in the US (2021/22) | Panel-opened 15 Nov |
| 10 | European Central Bank. (2026). *Euro foreign exchange reference rates* (USD/MYR cross), retrieved via Frankfurter, https://api.frankfurter.dev/v1 (the old api.frankfurter.app redirects here). Data used: 2010-12-31 → 2026-11-06 in `evidence/fx/usdmyr.json`; the historical range and Fee Day use windows starting 2016-01-04 onward. | Historical range (q10/q90), Fee Day replay | Panel-opened 15 Nov (6 Nov 2026 = 4.059) |

## B. Report-only references
- Fama, E. F. (1984). Forward and spot exchange rates. *Journal of Monetary Economics, 14*(3), 319–338. https://doi.org/10.1016/0304-3932(84)90046-1 (panel: Crossref metadata confirmed)
- Mishkin, F. S. (1991). *Is the Fisher effect for real?* (NBER Working Paper No. 3632). https://doi.org/10.3386/w3632 (panel-opened)
- Du, W., Tepper, A., & Verdelhan, A. (2018). Deviations from covered interest rate parity. *Journal of Finance, 73*(3), 915–957. https://doi.org/10.1111/jofi.12620 (Crossref confirmed; Wiley page 403)
- Sweller, J. (1988). Cognitive load during problem solving. *Cognitive Science, 12*(2), 257–285. https://doi.org/10.1207/s15516709cog1202_4 (Crossref confirmed)
- Sweller, J., Ayres, P., & Kalyuga, S. (2011). *Cognitive load theory*. Springer. https://doi.org/10.1007/978-1-4419-8126-4 (Crossref confirmed)
- Chen, Z., et al. (2021). FinQA: A dataset of numerical reasoning over financial data. *Proceedings of EMNLP 2021*, 3697–3711. https://doi.org/10.18653/v1/2021.emnlp-main.300 (Crossref confirmed)
- Bank Negara Malaysia. (2017, August 9). *BNM stance on ringgit currency derivatives products in offshore market*. (URL to record)
- Bank Negara Malaysia. (2019). *Foreign exchange policy FAQs, Part 1: Residents* (Q18, Q20). https://www.bnm.gov.my/documents/20124/60360/FAQs_Part_1_Residents+2019.pdf (panel-opened)
- Malay Mail. (2026, February 2). *Stronger ringgit stretches education funds further…* https://www.malaymail.com/news/malaysia/2026/02/02/stronger-ringgit-stretches-education-funds-further-delivering-real-relief-for-malaysians-studying-abroad/207685 (panel-opened; PNB quote confirmed)
- New Straits Times. (2026, July 3). *Mara reallocates sponsored students from US over policy, geopolitical uncertainties*. https://www.nst.com.my/news/nation/2026/07/1479719/mara-reallocates-sponsored-students-us-over-policy-geopolitical (page opens; no date shown on page)
- Wise. (2023, August 1). *Unfavourable money transfer rates cost Malaysian international students close to RM70 million each year*. https://newsroom.wise.com/en-CAS/228691-report-unfavourable-money-transfer-rates-cost-malaysian-international-students-close-to-rm70-million-each-year/ (panel-opened; RM 1,182.92 per student)
- Bernama. (2026, August 19). *MARA resumes sending medical students to Al-Azhar after seven-year hiatus* (reports the 2026 Premier MARA pre-departure programme, about 600 students). https://bernama.com/en/news.php?id=2596470 (panel-opened; use this real headline, not the event name)

## C. Market and engagement evidence (idea-v6-addendum.md, added 15 Nov)
- The PIE News. (2025, August 11). *International students flock to Malaysia as demand surges* ("over 50,000 Malaysian students studied abroad", Acumen 2024). https://thepienews.com/international-students-flock-to-malaysia-as-demand-surges/ (panel-opened)
- Ministry of Higher Education Malaysia. (2025). *Higher education statistics 2025*, ch. 6, table "Number of Malaysian students abroad by types of sponsorship 2024–2025". https://mohe.gov.my/en/download/statistics/2025-1-1/1846-bab-6-bem-2025-pdf/file (table present; totals not yet read)
- The Star. (2025, November 23). *NS2.0: Youth yields* (Malaysians aged 19–30 below the national MYFLIC average). https://www.thestar.com.my/news/focus/2025/11/23/ns20-youth-yields (panel-opened)
- Securities Commission Malaysia. (2025, October 3). *Malaysia launches National Strategy for Financial Literacy 2026–2030 (NS2.0)…* https://www.sc.com.my/resources/media/media-release/malaysia-launches-national-strategy-for-financial-literacy-2026-2030-ns20-financial-literacy-month-flm-2025-for-a-resilient-financial-future (panel-opened; supports the launch date only)
- The Star. (2025, October 3). *Bank Negara launches national financial literacy strategy 2026–2030 to drive inclusion, digitalisation, accountability*. https://www.thestar.com.my/business/business-news/2025/10/03/bank-negara-launches-national-financial-literacy-strategy-2026-2030-to-drive-inclusion-digitalisation-accountability (for pillars, National Coordination Office, 45 FEN partners; **unverified**, member to open)
- Huang, R., Ritzhaupt, A. D., Sommer, M., & Zhu, J. (2020). The impact of gamification in educational settings on student learning outcomes: A meta-analysis. *Educational Technology Research and Development, 68*(4), 1875–1901. https://doi.org/10.1007/s11423-020-09807-z (Crossref confirmed)
- Lima da Silva Moraes et al. (2026). Gamification and financial behaviour: systematic review and meta-analysis (28 studies). *EDULEARN26 Proceedings*, IATED. https://library.iated.org/view/LIMADASILVAMORAES2026GAM (panel-opened; member to record full author list and pages)
- Bank of Finland, Financial Literacy Centre. (n.d.). *Measuring the impact of games*. https://www.rahamuseo.fi/en/financial-literacy-centre/financial-education-games/measuring-the-impact-of-games/ (panel-opened)

## D. Competitors (accessed as stated; members re-open and screenshot before use)
| Tool | URL | Accessed | Status |
|---|---|---|---|
| Xe rate alerts | https://www.xe.com/blog/money-transfer/the-top-5-reasons-to-set-a-rate-alert-today/ | 15 Nov 2026 | Panel-opened ("it's up to you to decide") |
| CurrencyFair tuition payments | https://currencyfair.com/pay-tuition-fees | 15 Nov 2026 | Panel-opened |
| Pay4Me | https://pay4me.app/blog/257/secure-currency-exchange-tips-for-paying-tuition-fees-overseas | 15 Nov 2026 | Unverified (drop if not confirmed) |
| Mercer ERIC | https://mobilityexchange.mercer.com/solutions/more-mobility-solutions/technology-solutions/exchange-rate-and-inflation-calculator | 9 Nov 2026 | Panel-opened (no pricing shown: don't call it "subscription") |
| Edvisor PPP interactive | https://edvisor.ai/interactives/purchasing-power-parity | 9 Nov 2026 | Panel-opened (uses inflate/deflate buttons, not a slider) |
| Tukaram Consultancy hedging model | https://tukaramconsultancy.blogspot.com/2025/06/currency-exchange-risk-hedging-model.html | 9 Nov 2026 | Panel-opened |
| Ryan O'Connell transaction-exposure calculator | https://ryanoconnellfinance.com/calculators/transaction-exposure-calculator/ | 9 Nov 2026 | Unverified (HTTP 403) |
| Wise, Flywire, Omni, AgentCalc, CFI | URLs to record | — | Unverified |

## E. Software and AI (for the AI-use disclosure)
- Claude Code (Anthropic), Claude Opus models: drafted the idea and specs, and **generated the app code** (`packages/`, `apps/`) from the
  AGENTS.md/docs spec on 15 Nov 2026, plus the v6 features. Humans review and verify (see idea.md §12 disclosure; update it to say this).
- Groq API, model `openai/gpt-oss-20b`: optional "Ask KiraKurs" router; returns an explanation ID only.
- Lucide icons (ISC licence), https://lucide.dev. Fonts: Inter, Plus Jakarta Sans (Google Fonts, OFL).
- React, Vite, TanStack Router, Zustand, Vitest, Playwright (MIT/Apache licences).

## F. Extra dated scenarios (added 15 Nov 2026; web-checked by Claude Code, member check still needed)
Exchange rates are ECB reference crosses from `../../evidence/fx/usdmyr.json` (via Frankfurter, §A #10). Ranges come from
`../../evidence/fx/band.py` (`band_asof`): 270-day periods starting 2016-01-01 that had **ended by the snapshot date**.

**Scenario 3 · Snapshot 6 Nov 2025** (S 4.1830, OPR 2.75%, Fed mid 3.875%, CPI MY 1.5% / US 3.0%, q10 −6.679%, q90 +7.070%)
- Bank Negara Malaysia. (2025, November 6). *Monetary policy statement*. https://www.bnm.gov.my/-/monetary-policy-statement-06112025 (OPR held at 2.75%)
- Board of Governors of the Federal Reserve System. (2025, October 29). *Federal Reserve issues FOMC statement*. https://www.federalreserve.gov/newsevents/pressreleases/monetary20251029a.htm (target range lowered to 3¾–4%)
- Department of Statistics Malaysia. (2025, October 22). *Consumer price index Malaysia, September 2025*. https://www.dosm.gov.my/portal-main/release-content/consumer-price-index-september-2025 (1.5%)
- U.S. Bureau of Labor Statistics. (2025, October 24). *Consumer price index, September 2025*. https://www.bls.gov/news.release/archives/cpi_10242025.htm (3.0% over 12 months)

**Scenario 4 · Snapshot 20 Feb 2024** (S 4.7975 = highest USD/MYR in the 2016–2026 data, OPR 3.00%, Fed mid 5.375%, CPI MY 1.5% / US 3.1%, q10 −6.370%, q90 +7.589%)
- Bank Negara Malaysia. (2024, January 24). *Monetary policy statement*. https://www.bnm.gov.my/-/monetary-policy-statement-24012024 (OPR held at 3.00%)
- Board of Governors of the Federal Reserve System. (2024, January 31). *Federal Reserve issues FOMC statement*. https://www.federalreserve.gov/newsevents/pressreleases/monetary20240131a.htm (5¼–5½%)
- Department of Statistics Malaysia. (2024, January 22). *Consumer price index Malaysia, December 2023*. https://www.dosm.gov.my/portal-main/release-content/consumer-price-index-december-2023 (1.5%; the January 2024 release came after 20 Feb)
- U.S. Bureau of Labor Statistics. (2024, February 13). *Consumer price index, January 2024*. https://www.bls.gov/news.release/archives/cpi_02132024.htm (3.1% over 12 months)

Status: figures matched by web search on 15 Nov 2026 (official pages plus press coverage). Not yet member-checked.
