// HALO ESG sub-module — data + icons + components

// All 32 companies below are pulled verbatim from
//   /Users/sanjana/Desktop/Stride Ventures_ESG KPI Coverage Summary_29042026 (1).xlsx
// — the 26 completed rows come from sheet "New Portcos_Fund III, IV" (with their actual
//   E / S / G / Total / Tier from the Excel), and the 6 in-progress / in-review rows
//   come from the raw answer sheet (companies that filled the form but haven't been
//   scored yet). No placeholder companies.
const COMPANIES = [
  { id: "npl",  name: "Naturohabit Pvt Ltd",                          sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 69.6, e: 27.6, s: 22.3, g: 19.7, color: "#22C28F", initials: "NP", spoc: "Jitin Sacdeva",        deal: "SV4100_T1", amount: "₹25 Cr",  sent: "Oct 20", submitted: "Nov 10", reviewed: "Nov 11", tier: "L1" },
  { id: "stp",  name: "Slaash Technologies (Flent)",                  sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 38.8, e: 9.4,  s: 15.4, g: 14.0, color: "#6B6FBF", initials: "ST", spoc: "Shail Daswani",        deal: "SV4107_T2", amount: "₹25 Cr",  sent: "Nov 04", submitted: "Nov 25", reviewed: "Nov 26", tier: "L1" },
  { id: "ony",  name: "Onya Diamonds",                                sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 39.9, e: 11.7, s: 16.8, g: 11.4, color: "#E8A33D", initials: "OD", spoc: "Krishti Sharma",       deal: "SV4114_T3", amount: "₹25 Cr",  sent: "Nov 14", submitted: "Dec 05", reviewed: "Dec 05", tier: "L1" },
  { id: "fct",  name: "FirstClub Technology",                         sector: "B2B SaaS",           stage: "Active",    status: "completed",   progress: 100, score: 49.3, e: 25.4, s: 12.8, g: 11.1, color: "#0F2150", initials: "FC", spoc: "Rajib Chatterjee",     deal: "SV4121_T4", amount: "₹25 Cr",  sent: "Nov 10", submitted: "Dec 01", reviewed: "Dec 11", tier: "L1" },
  { id: "krv",  name: "Krvvy",                                        sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 45.2, e: 19.8, s: 13.5, g: 11.9, color: "#E25C5C", initials: "KR", spoc: "Yash Goyal",           deal: "SV4128_T1", amount: "₹25 Cr",  sent: "Nov 22", submitted: "Dec 13", reviewed: "Dec 15", tier: "L1" },
  { id: "mip",  name: "Medchain Innovation",                          sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 56.3, e: 20.4, s: 19.7, g: 16.2, color: "#8B91AB", initials: "MI", spoc: "Manu Kumar Mittal",    deal: "SV4135_T2", amount: "₹25 Cr",  sent: "Dec 01", submitted: "Dec 22", reviewed: "Dec 23", tier: "L1" },
  { id: "uep",  name: "Uolo Edtech",                                  sector: "B2B SaaS",           stage: "Active",    status: "completed",   progress: 100, score: 63.5, e: 21.1, s: 21.9, g: 20.5, color: "#0B1A3F", initials: "UE", spoc: "Aditya Mehra",         deal: "SV4142_T3", amount: "₹25 Cr",  sent: "Dec 08", submitted: "Dec 29", reviewed: "Dec 29", tier: "L1" },
  { id: "rcp",  name: "Riyaana Creations",                            sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 41.2, e: 11.1, s: 17.1, g: 13.0, color: "#45489B", initials: "RC", spoc: "Pratik Saraogi",       deal: "SV4149_T4", amount: "₹25 Cr",  sent: "Nov 27", submitted: "Dec 18", reviewed: "Dec 31", tier: "L1" },
  { id: "fvp",  name: "Fraternitas Ventures",                         sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 39.1, e: 15.2, s: 15.6, g: 8.3,  color: "#22C28F", initials: "FV", spoc: "Mohit Jain",           deal: "SV4156_T1", amount: "₹25 Cr",  sent: "Dec 27", submitted: "Jan 17", reviewed: "Jan 20", tier: "L1" },
  { id: "bhi",  name: "Balancehero India",                            sector: "Fintech / Lending",  stage: "Active",    status: "completed",   progress: 100, score: 40.0, e: 9.6,  s: 12.4, g: 18.0, color: "#6B6FBF", initials: "BH", spoc: "Sanju Khanna",         deal: "SV4163_T2", amount: "₹250 Cr", sent: "Jan 09", submitted: "Jan 30", reviewed: "Jan 30", tier: "L3" },
  { id: "gtp",  name: "Good Tribe",                                   sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 58.2, e: 19.2, s: 22.9, g: 16.1, color: "#E8A33D", initials: "GT", spoc: "Rimjim Deka",          deal: "SV4170_T3", amount: "₹125 Cr", sent: "Jan 12", submitted: "Feb 02", reviewed: "Feb 02", tier: "L2" },
  { id: "ahb",  name: "All Home Bharat Platform",                     sector: "B2B SaaS",           stage: "Active",    status: "completed",   progress: 100, score: 26.3, e: 9.9,  s: 11.1, g: 5.3,  color: "#0F2150", initials: "AH", spoc: "Harish",               deal: "SV4177_T4", amount: "₹25 Cr",  sent: "Jan 21", submitted: "Feb 11", reviewed: "Feb 11", tier: "L1" },
  { id: "dhp",  name: "Dunnwood Health",                              sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 34.0, e: 8.0,  s: 12.2, g: 13.8, color: "#E25C5C", initials: "DH", spoc: "Harshit Kukreja",      deal: "SV4184_T1", amount: "₹25 Cr",  sent: "Jan 26", submitted: "Feb 16", reviewed: "Feb 17", tier: "L1" },
  { id: "hex",  name: "Hexalog Technologies",                         sector: "B2B SaaS",           stage: "Active",    status: "completed",   progress: 100, score: 54.4, e: 18.6, s: 20.6, g: 15.2, color: "#8B91AB", initials: "HX", spoc: "Ishan",                deal: "SV4191_T2", amount: "₹25 Cr",  sent: "Feb 02", submitted: "Feb 23", reviewed: "Feb 24", tier: "L1" },
  { id: "frn",  name: "Furnishka Tech",                               sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 31.5, e: 10.1, s: 14.3, g: 7.1,  color: "#0B1A3F", initials: "FR", spoc: "Mahesh Majali",        deal: "SV4198_T3", amount: "₹25 Cr",  sent: "Feb 02", submitted: "Feb 23", reviewed: "Feb 24", tier: "L1" },
  { id: "zuv",  name: "Zuvio Technologies",                           sector: "Healthtech",         stage: "Active",    status: "completed",   progress: 100, score: 50.5, e: 15.6, s: 18.0, g: 16.9, color: "#45489B", initials: "ZT", spoc: "Gaurav Jhajharia",     deal: "SV4205_T4", amount: "₹25 Cr",  sent: "Feb 05", submitted: "Feb 26", reviewed: "Mar 02", tier: "L1" },
  { id: "plp",  name: "Puresta Lifestyle",                            sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 41.0, e: 12.9, s: 15.6, g: 12.5, color: "#22C28F", initials: "PL", spoc: "Bhisham Bhateja",      deal: "SV4212_T1", amount: "₹25 Cr",  sent: "Feb 04", submitted: "Feb 25", reviewed: "Mar 03", tier: "L1" },
  { id: "sam",  name: "Samast Technologies",                          sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 45.3, e: 12.6, s: 17.5, g: 15.2, color: "#6B6FBF", initials: "SM", spoc: "Mayur Rastogi",        deal: "SV4219_T2", amount: "₹250 Cr", sent: "Feb 10", submitted: "Mar 03", reviewed: "Mar 06", tier: "L3" },
  { id: "ava",  name: "Avano Technologies",                           sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 31.3, e: 11.4, s: 13.3, g: 6.6,  color: "#E8A33D", initials: "AV", spoc: "Ankit Khemka",         deal: "SV4226_T3", amount: "₹25 Cr",  sent: "Feb 07", submitted: "Feb 28", reviewed: "Mar 07", tier: "L1" },
  { id: "cwt",  name: "Centricity Wealth Tech",                       sector: "Fintech / Lending",  stage: "Active",    status: "completed",   progress: 100, score: 41.0, e: 5.0,  s: 23.4, g: 12.6, color: "#0F2150", initials: "CW", spoc: "Naveen Jain",          deal: "SV4233_T4", amount: "₹250 Cr", sent: "Feb 20", submitted: "Mar 13", reviewed: "Mar 14", tier: "L3" },
  { id: "nbc",  name: "Nothing Before Coffee",                        sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 65.5, e: 27.4, s: 18.8, g: 19.3, color: "#E25C5C", initials: "NB", spoc: "Ankesh Jain",          deal: "SV4240_T1", amount: "₹25 Cr",  sent: "Feb 23", submitted: "Mar 16", reviewed: "Mar 17", tier: "L1" },
  { id: "fwc",  name: "Flat White Capital",                           sector: "Fintech / Lending",  stage: "Active",    status: "completed",   progress: 100, score: 64.4, e: 10.4, s: 29.5, g: 24.5, color: "#8B91AB", initials: "FW", spoc: "Sandeep Dey",          deal: "SV4247_T2", amount: "₹25 Cr",  sent: "Mar 02", submitted: "Mar 23", reviewed: "Mar 25", tier: "L1" },
  { id: "urf",  name: "Unreal Food",                                  sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 29.2, e: 10.9, s: 14.0, g: 4.3,  color: "#0B1A3F", initials: "UF", spoc: "Raghavendra Degala",   deal: "SV4254_T3", amount: "₹25 Cr",  sent: "Feb 06", submitted: "Feb 27", reviewed: "Mar 25", tier: "L1" },
  { id: "swi",  name: "Swish",                                        sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 53.0, e: 20.0, s: 19.5, g: 13.5, color: "#45489B", initials: "SW", spoc: "Yogendra",             deal: "SV4261_T4", amount: "₹25 Cr",  sent: "Mar 25", submitted: "Apr 15", reviewed: "Apr 20", tier: "L1" },
  { id: "mdo",  name: "My Designation Clothing",                      sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 32.6, e: 12.1, s: 14.3, g: 6.2,  color: "#22C28F", initials: "MD", spoc: "Anisha V S",           deal: "SV4268_T1", amount: "₹25 Cr",  sent: "Mar 09", submitted: "Mar 30", reviewed: "Apr 23", tier: "L1" },
  { id: "tap",  name: "Theater Apparel",                              sector: "Consumer / D2C",     stage: "Active",    status: "completed",   progress: 100, score: 62.2, e: 23.2, s: 21.4, g: 17.6, color: "#6B6FBF", initials: "TA", spoc: "Vikram Jain",          deal: "SV4275_T2", amount: "₹25 Cr",  sent: "Apr 07", submitted: "Apr 28", reviewed: "Apr 28", tier: "L1" },
  // ─── 41 Fund II / III portcos from the 'Old Portcos_Fund II & Fund III' summary sheet ───
  // These are retroactive ESG surveys completed under the prior methodology so we only
  // have the total ESG score and tier from the Excel — no E/S/G pillar breakdown.
  { id: 'trv'  , name: 'Troovy Foods'                , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score:   30, e: null, s: null, g: null, color: '#22C28F', initials: 'TF' , spoc: 'Stride ESG Liaison'          , deal: 'SV3200_T1', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'mbd'  , name: 'MediBuddy'                   , sector: 'Healthtech'              , stage: 'Renewal',     status: 'completed', progress: 100, score: 51.4, e: null, s: null, g: null, color: '#6B6FBF', initials: 'ME' , spoc: 'Stride ESG Liaison'          , deal: 'SV3204_T2', amount: '₹600 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L3' },
  { id: 'hpp'  , name: 'Happi Planet'                , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score: 55.3, e: null, s: null, g: null, color: '#E8A33D', initials: 'HP' , spoc: 'Mayank'                      , deal: 'SV3208_T3', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'ybr'  , name: 'Yoga Bar'                    , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score: 55.2, e: null, s: null, g: null, color: '#0F2150', initials: 'YB' , spoc: 'Stride ESG Liaison'          , deal: 'SV3212_T1', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'zep'  , name: 'Zepto'                       , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score: 54.3, e: null, s: null, g: null, color: '#E25C5C', initials: 'ZE' , spoc: 'Stride ESG Liaison'          , deal: 'SV3216_T2', amount: '₹600 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L3' },
  { id: 'hfm'  , name: 'Healthifyme'                 , sector: 'Healthtech'              , stage: 'Renewal',     status: 'completed', progress: 100, score: 58.6, e: null, s: null, g: null, color: '#8B91AB', initials: 'HE' , spoc: 'Stride ESG Liaison'          , deal: 'SV3220_T3', amount: '₹600 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L3' },
  { id: 'egg'  , name: 'Eggoz'                       , sector: 'Agritech'                , stage: 'Renewal',     status: 'completed', progress: 100, score: 24.3, e: null, s: null, g: null, color: '#0B1A3F', initials: 'EG' , spoc: 'Stride ESG Liaison'          , deal: 'SV3224_T1', amount: '₹250 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L2' },
  { id: 'wim'  , name: 'Wiom'                        , sector: 'B2B SaaS'                , stage: 'Renewal',     status: 'completed', progress: 100, score: 54.3, e: null, s: null, g: null, color: '#45489B', initials: 'WI' , spoc: 'Stride ESG Liaison'          , deal: 'SV3228_T2', amount: '₹600 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L3' },
  { id: 'cpf'  , name: 'Captain Fresh'               , sector: 'Agritech'                , stage: 'Renewal',     status: 'completed', progress: 100, score: 57.3, e: null, s: null, g: null, color: '#22C28F', initials: 'CF' , spoc: 'Pranay Mohata'               , deal: 'SV3232_T3', amount: '₹600 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L3' },
  { id: 'akn'  , name: 'Akna Med'                    , sector: 'Healthtech'              , stage: 'Renewal',     status: 'completed', progress: 100, score: 76.9, e: null, s: null, g: null, color: '#6B6FBF', initials: 'AM' , spoc: 'Stride ESG Liaison'          , deal: 'SV3236_T1', amount: '₹600 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L3' },
  { id: 'kos'  , name: 'Koskii'                      , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score: 33.1, e: null, s: null, g: null, color: '#E8A33D', initials: 'KO' , spoc: 'Stride ESG Liaison'          , deal: 'SV3240_T2', amount: '₹250 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L2' },
  { id: 'rfy'  , name: 'Refyne'                      , sector: 'Fintech / Lending'       , stage: 'Renewal',     status: 'completed', progress: 100, score: 29.1, e: null, s: null, g: null, color: '#0F2150', initials: 'RE' , spoc: 'Amit'                        , deal: 'SV3244_T3', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'grp'  , name: 'Grip Invest'                 , sector: 'Fintech / Lending'       , stage: 'Renewal',     status: 'completed', progress: 100, score: 33.2, e: null, s: null, g: null, color: '#E25C5C', initials: 'GI' , spoc: 'Stride ESG Liaison'          , deal: 'SV3248_T1', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'msv'  , name: 'Massive'                     , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score:   69, e: null, s: null, g: null, color: '#8B91AB', initials: 'MA' , spoc: 'Stride ESG Liaison'          , deal: 'SV3252_T2', amount: '₹250 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L2' },
  { id: 'mev'  , name: 'MoEVing'                     , sector: 'Cleantech / Mobility'    , stage: 'Renewal',     status: 'completed', progress: 100, score: 70.3, e: null, s: null, g: null, color: '#0B1A3F', initials: 'MO' , spoc: 'Stride ESG Liaison'          , deal: 'SV3256_T3', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'btr'  , name: 'Battery Smart'               , sector: 'Cleantech / Mobility'    , stage: 'Renewal',     status: 'completed', progress: 100, score: 56.4, e: null, s: null, g: null, color: '#45489B', initials: 'BS' , spoc: 'Deepak Saini'                , deal: 'SV3260_T1', amount: '₹250 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L2' },
  { id: 'eul'  , name: 'Euler Motors'                , sector: 'Cleantech / Mobility'    , stage: 'Renewal',     status: 'completed', progress: 100, score: 67.5, e: null, s: null, g: null, color: '#22C28F', initials: 'EM' , spoc: 'Swarnika'                    , deal: 'SV3264_T2', amount: '₹250 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L2' },
  { id: 'zyl'  , name: 'Zyla Health'                 , sector: 'Healthtech'              , stage: 'Renewal',     status: 'completed', progress: 100, score: 54.1, e: null, s: null, g: null, color: '#6B6FBF', initials: 'ZH' , spoc: 'Stride ESG Liaison'          , deal: 'SV3268_T3', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'dvr'  , name: 'Dvara'                       , sector: 'Fintech / Lending'       , stage: 'Renewal',     status: 'completed', progress: 100, score: 53.4, e: null, s: null, g: null, color: '#E8A33D', initials: 'DV' , spoc: 'Stride ESG Liaison'          , deal: 'SV3272_T1', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'pls'  , name: 'Playshifu'                   , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score: 25.9, e: null, s: null, g: null, color: '#0F2150', initials: 'PL' , spoc: 'Stride ESG Liaison'          , deal: 'SV3276_T2', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'nwm'  , name: 'Newme'                       , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score: 45.4, e: null, s: null, g: null, color: '#E25C5C', initials: 'NE' , spoc: 'Stride ESG Liaison'          , deal: 'SV3280_T3', amount: '₹250 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L2' },
  { id: 'ztw'  , name: 'Zetwerk'                     , sector: 'B2B SaaS'                , stage: 'Renewal',     status: 'completed', progress: 100, score: 69.2, e: null, s: null, g: null, color: '#8B91AB', initials: 'ZE' , spoc: 'Stride ESG Liaison'          , deal: 'SV3284_T1', amount: '₹600 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L3' },
  { id: 'mpp'  , name: 'MyParkPlus'                  , sector: 'B2B SaaS'                , stage: 'Renewal',     status: 'completed', progress: 100, score: 34.2, e: null, s: null, g: null, color: '#0B1A3F', initials: 'MY' , spoc: 'Stride ESG Liaison'          , deal: 'SV3288_T2', amount: '₹250 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L2' },
  { id: 'iup'  , name: 'Infinite Uptime'             , sector: 'B2B SaaS'                , stage: 'Renewal',     status: 'completed', progress: 100, score: 48.9, e: null, s: null, g: null, color: '#45489B', initials: 'IU' , spoc: 'Stride ESG Liaison'          , deal: 'SV3292_T3', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'cur'  , name: 'Curebay'                     , sector: 'Healthtech'              , stage: 'Renewal',     status: 'completed', progress: 100, score: 67.8, e: null, s: null, g: null, color: '#22C28F', initials: 'CU' , spoc: 'Stride ESG Liaison'          , deal: 'SV3296_T1', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'ons'  , name: 'Onestack'                    , sector: 'B2B SaaS'                , stage: 'Renewal',     status: 'completed', progress: 100, score: 61.3, e: null, s: null, g: null, color: '#6B6FBF', initials: 'ON' , spoc: 'Stride ESG Liaison'          , deal: 'SV3300_T2', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'tru'  , name: 'Trunativ'                    , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score:  9.2, e: null, s: null, g: null, color: '#E8A33D', initials: 'TR' , spoc: 'Stride ESG Liaison'          , deal: 'SV3304_T3', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'ren'  , name: 'Renaura wellness'            , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score: 61.9, e: null, s: null, g: null, color: '#0F2150', initials: 'RW' , spoc: 'Stride ESG Liaison'          , deal: 'SV3308_T1', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'xmk'  , name: 'Ximkart'                     , sector: 'B2B SaaS'                , stage: 'Renewal',     status: 'completed', progress: 100, score: 40.7, e: null, s: null, g: null, color: '#E25C5C', initials: 'XI' , spoc: 'Stride ESG Liaison'          , deal: 'SV3312_T2', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'mny'  , name: 'Moneyview'                   , sector: 'Fintech / Lending'       , stage: 'Renewal',     status: 'completed', progress: 100, score: 51.8, e: null, s: null, g: null, color: '#8B91AB', initials: 'MO' , spoc: 'Stride ESG Liaison'          , deal: 'SV3316_T3', amount: '₹600 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L3' },
  { id: 'sms'  , name: 'Sumosave'                    , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score: 40.9, e: null, s: null, g: null, color: '#0B1A3F', initials: 'SU' , spoc: 'Stride ESG Liaison'          , deal: 'SV3320_T1', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'mov'  , name: 'Moove'                       , sector: 'Cleantech / Mobility'    , stage: 'Renewal',     status: 'completed', progress: 100, score: 20.4, e: null, s: null, g: null, color: '#45489B', initials: 'MO' , spoc: 'Stride ESG Liaison'          , deal: 'SV3324_T2', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'pro'  , name: 'Prolance'                    , sector: 'B2B SaaS'                , stage: 'Renewal',     status: 'completed', progress: 100, score: 48.5, e: null, s: null, g: null, color: '#22C28F', initials: 'PR' , spoc: 'Stride ESG Liaison'          , deal: 'SV3328_T3', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'mko'  , name: 'Miko'                        , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score: 54.6, e: null, s: null, g: null, color: '#6B6FBF', initials: 'MI' , spoc: 'Mansi Verma'                 , deal: 'SV3332_T1', amount: '₹250 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L2' },
  { id: 'byd'  , name: 'Beyond appliances'           , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score: 39.0, e: null, s: null, g: null, color: '#E8A33D', initials: 'BA' , spoc: 'Stride ESG Liaison'          , deal: 'SV3336_T2', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'wht'  , name: 'Whole truth'                 , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score: 28.7, e: null, s: null, g: null, color: '#0F2150', initials: 'WT' , spoc: 'Stride ESG Liaison'          , deal: 'SV3340_T3', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'mns'  , name: 'Mensa'                       , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score: 41.9, e: null, s: null, g: null, color: '#E25C5C', initials: 'ME' , spoc: 'Stride ESG Liaison'          , deal: 'SV3344_T1', amount: '₹600 Cr', sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L3' },
  { id: 'jet'  , name: 'Jetapult'                    , sector: 'B2B SaaS'                , stage: 'Renewal',     status: 'completed', progress: 100, score: 31.7, e: null, s: null, g: null, color: '#8B91AB', initials: 'JE' , spoc: 'Stride ESG Liaison'          , deal: 'SV3348_T2', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'myg'  , name: 'Mygenie'                     , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score: 35.0, e: null, s: null, g: null, color: '#0B1A3F', initials: 'MY' , spoc: 'Stride ESG Liaison'          , deal: 'SV3352_T3', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'skc'  , name: 'Sweet Karam Coffee'          , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score: 56.3, e: null, s: null, g: null, color: '#45489B', initials: 'SK' , spoc: 'Stride ESG Liaison'          , deal: 'SV3356_T1', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  { id: 'dpr'  , name: 'Drink Prime'                 , sector: 'Consumer / D2C'          , stage: 'Renewal',     status: 'completed', progress: 100, score: 44.0, e: null, s: null, g: null, color: '#22C28F', initials: 'DP' , spoc: 'Stride ESG Liaison'          , deal: 'SV3360_T2', amount: '₹50 Cr' , sent: 'Jun 24', submitted: 'Jul 16', reviewed: 'Jul 28', tier: 'L1' },
  // ── 6 real companies that submitted but aren't yet scored / are still filling ──
  { id: "ppl",  name: "Protonas",                                     sector: "Cleantech / Mobility", stage: "Diligence", status: "in-review",   progress: 100, score: null, e: null, s: null, g: null,  color: "#E8A33D", initials: "PT", spoc: "Ananya Iyer",          deal: "SV4282_T1", amount: "₹25 Cr",  sent: "Apr 02", submitted: "Apr 24", reviewed: "—",      tier: "L1" },
  { id: "brw",  name: "Brewbay Innovations",                          sector: "Consumer / D2C",     stage: "Diligence", status: "in-review",   progress: 100, score: null, e: null, s: null, g: null,  color: "#0F2150", initials: "BR", spoc: "Sahil Mehta",          deal: "SV4288_T2", amount: "₹25 Cr",  sent: "Apr 10", submitted: "Apr 28", reviewed: "—",      tier: "L1" },
  { id: "cfp",  name: "Cashfree Payments",                            sector: "Fintech / Lending",  stage: "Diligence", status: "in-review",   progress: 100, score: null, e: null, s: null, g: null,  color: "#E25C5C", initials: "CF", spoc: "Rajiv Pandey",         deal: "SV4294_T1", amount: "₹250 Cr", sent: "Apr 05", submitted: "Apr 30", reviewed: "—",      tier: "L3" },
  { id: "swm",  name: "Scripbox Wealth Managers",                     sector: "Fintech / Lending",  stage: "Diligence", status: "in-review",   progress: 100, score: null, e: null, s: null, g: null,  color: "#8B91AB", initials: "SC", spoc: "Anushka Gupta",        deal: "SV4300_T2", amount: "₹125 Cr", sent: "Apr 12", submitted: "May 02", reviewed: "—",      tier: "L2" },
  { id: "giv",  name: "GIVA",                                         sector: "Consumer / D2C",     stage: "Diligence", status: "in-progress", progress: 64,  score: null, e: null, s: null, g: null,  color: "#0B1A3F", initials: "GI", spoc: "Ishendra Agarwal",     deal: "SV4306_T3", amount: "₹125 Cr", sent: "Apr 18", submitted: "—",      reviewed: "—",      tier: "L2" },
  { id: "ipp",  name: "Ionic Professional",                           sector: "B2B SaaS",           stage: "Diligence", status: "in-progress", progress: 22,  score: null, e: null, s: null, g: null,  color: "#45489B", initials: "IP", spoc: "Devraj Sharma",        deal: "SV4312_T1", amount: "₹25 Cr",  sent: "Apr 22", submitted: "—",      reviewed: "—",      tier: "L1" },
];

const STATUS_LABEL = {
  "completed": "Completed",
  "in-review": "In Review",
  "in-progress": "In Progress",
  "not-started": "Not Started",
  "overdue": "Overdue",
};

const SECTIONS = [
  { id: 1, title: "Company Information",     qs: 8,  done: 8,  status: "done" },
  { id: 2, title: "Water Management",        qs: 11, done: 11, status: "done" },
  { id: 3, title: "Energy & Emissions",      qs: 14, done: 14, status: "done" },
  { id: 4, title: "Workforce & Diversity",   qs: 12, done: 7,  status: "current" },
  { id: 5, title: "Health & Safety",         qs: 10, done: 0,  status: "todo" },
  { id: 6, title: "Community & CSR",         qs: 9,  done: 0,  status: "todo" },
  { id: 7, title: "Governance & Compliance", qs: 18, done: 0,  status: "todo" },
  { id: 8, title: "Supply Chain & Sourcing", qs: 13, done: 0,  status: "todo" },
  { id: 9, title: "Sector-Specific",         qs: 11, done: 0,  status: "todo" },
];

window.HALO_ESG = { COMPANIES, STATUS_LABEL, SECTIONS };

// Icons
const Icon = ({ name, size = 16, stroke = 1.75, color = "currentColor" }) => {
  const p = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    pipe: <><circle cx="6" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><path d="M6 9v6a3 3 0 0 0 3 3h6" /></>,
    erp: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></>,
    chart: <><path d="M3 21h18" /><path d="M6 17v-6" /><path d="M11 17V7" /><path d="M16 17v-9" /></>,
    leaf: <><path d="M5 21c8 0 14-6 14-14V3h-4C7 3 3 9 3 15c0 2 1 4 2 6z" /><path d="M3 21l9-9" /></>,
    brain: <><path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3 3 3 0 0 0 3-3V4a0 0 0 0 0 0 0z" /><path d="M15 4a3 3 0 0 1 3 3v0a3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3 3 3 0 0 1-3-3" /></>,
    trend: <><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></>,
    pen: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
    folder: <><path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>,
    shield: <><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" /></>,
    phone: <><path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4" /><circle cx="12" cy="17" r="0.5" fill="currentColor" /></>,
    out: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
    chev: <><path d="M9 18l6-6-6-6" /></>,
    chevd: <><path d="M6 9l6 6 6-6" /></>,
    arrowup: <><path d="M7 17L17 7" /><path d="M7 7h10v10" /></>,
    arrowdn: <><path d="M7 7l10 10" /><path d="M17 7v10H7" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
    bell: <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
    send: <><path d="M21 3L11 13" /><path d="M21 3l-7 18-3-8-8-3z" /></>,
    check: <><path d="M5 12l5 5L20 7" /></>,
    x: <><path d="M6 6l12 12M6 18L18 6" /></>,
    file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></>,
    download: <><path d="M12 3v12M6 11l6 6 6-6" /><path d="M5 21h14" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01" /><path d="M11 12h1v5h1" /></>,
    flag: <><path d="M4 21V4" /><path d="M4 4h13l-2 4 2 4H4" /></>,
    upload: <><path d="M12 21V9M6 13l6-6 6 6" /><path d="M5 3h14" /></>,
    bldg: <><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01" /></>,
    coin: <><circle cx="12" cy="12" r="9" /><path d="M9 9h4a2 2 0 0 1 0 4h-4M9 13h4a2 2 0 0 1 0 4h-4" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></>,
    dots: <><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></>,
    arrowback: <><path d="M19 12H5M12 19l-7-7 7-7" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{p[name]}</svg>;
};

const StatusPill = ({ status }) => (
  <span className={"pill " + status}>
    <span className="dot" />{window.HALO_ESG.STATUS_LABEL[status]}
  </span>
);

const Ring = ({ value, max = 100, size = 72, stroke = 7, color = "#22C28F", track = "#ECEEF6" }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(value / max, 1));
  const offset = c * (1 - pct);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dashoffset 400ms ease" }} />
    </svg>
  );
};

Object.assign(window, { Icon, StatusPill, Ring });
