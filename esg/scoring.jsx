// HALO ESG — Excel-driven scoring engine + per-company contacts + answer state
// Loads after data.jsx, before any screen file. Exposes everything on window.HALO_ESG.

(() => {
  // ============================================================
  // 1. TOPIC WEIGHTS — verbatim from "topic_score" sheet. Each column sums to 100.
  // ============================================================
  const TOPICS = {
    water:    {pillar:'E', name:'Water',                         w:{Consumer:6,B2B:6,Cleantech:6,Agritech:9,Healthtech:6,Fintech:6}},
    energy:   {pillar:'E', name:'Energy',                        w:{Consumer:10,B2B:10,Cleantech:10,Agritech:8,Healthtech:7,Fintech:6}},
    ghg:      {pillar:'E', name:'GHG emissions',                 w:{Consumer:10,B2B:10,Cleantech:10,Agritech:8,Healthtech:7,Fintech:7}},
    waste:    {pillar:'E', name:'Waste',                         w:{Consumer:10,B2B:10,Cleantech:10,Agritech:5,Healthtech:8,Fintech:6}},
    hcd:      {pillar:'S', name:'Human Capital Development',     w:{Consumer:8,B2B:8,Cleantech:8,Agritech:6,Healthtech:9,Fintech:10}},
    ohs:      {pillar:'S', name:'Occupational Health & Safety',  w:{Consumer:8,B2B:9,Cleantech:8,Agritech:6,Healthtech:7,Fintech:7}},
    comm:     {pillar:'S', name:'Community Engagement',          w:{Consumer:5,B2B:5,Cleantech:4,Agritech:5,Healthtech:9,Fintech:5}},
    consResp: {pillar:'S', name:'Consumer Responsibility',       w:{Consumer:9,B2B:7,Cleantech:7,Agritech:6,Healthtech:8,Fintech:9}},
    cgov:     {pillar:'G', name:'Corporate Governance',          w:{Consumer:7,B2B:7,Cleantech:6,Agritech:5,Healthtech:7,Fintech:10}},
    privacy:  {pillar:'G', name:'Privacy & Data Security',       w:{Consumer:5,B2B:5,Cleantech:5,Agritech:5,Healthtech:9,Fintech:10}},
    spi:      {pillar:'G', name:'Social Product Innovation',     w:{Consumer:4,B2B:4,Cleantech:5,Agritech:5,Healthtech:9,Fintech:8}},
    ess:      {pillar:'G', name:'Ethical Sourcing & Supply Chain',w:{Consumer:6,B2B:6,Cleantech:7,Agritech:6,Healthtech:7,Fintech:8}},
    comm_fin: {pillar:'S', name:'Community Engagement (Fintech)',w:{Fintech:8}},
    circular: {pillar:'E', name:'Circular Economy & Sustainable Packaging', w:{Consumer:8,B2B:8,Cleantech:6,Agritech:5}},
    ess_sec:  {pillar:'G', name:'Ethical Sourcing (sector-specific)', w:{Consumer:4,B2B:5,Cleantech:8}},
    comm_hth: {pillar:'S', name:'Community Engagement (Healthtech)', w:{Healthtech:7}},
    bio:      {pillar:'E', name:'Biodiversity (Agritech)',       w:{Agritech:7}},
    climate:  {pillar:'E', name:'Climate Risk (Agritech)',       w:{Agritech:6}},
    comm_agri:{pillar:'S', name:'Community Engagement (Agritech)',w:{Agritech:4}},
    spi_agri: {pillar:'G', name:'Social Product Innovation (Agritech)', w:{Agritech:4}},
  };

  const PASS_THRESHOLDS = { L1: 15, L2: 30, L3: 40 };

  // Map the existing sample data's sector strings to the Excel sector buckets.
  const sectorKey = (s) => {
    if (!s) return 'Consumer';
    const x = s.toLowerCase();
    if (x.includes('fintech')) return 'Fintech';
    if (x.includes('saas') || x.includes('b2b')) return 'B2B';
    if (x.includes('cleantech') || x.includes('mobility')) return 'Cleantech';
    if (x.includes('agritech') || x.includes('agri')) return 'Agritech';
    if (x.includes('health')) return 'Healthtech';
    return 'Consumer';
  };
  const tierFromAmount = (amt) => {
    if (!amt) return 'L1';
    const n = parseInt(String(amt).replace(/[^0-9]/g, ''), 10) || 0;
    if (n >= 200) return 'L3';
    if (n >= 100) return 'L2';
    return 'L1';
  };

  // ============================================================
  // 2. SCORING HELPERS
  // ============================================================
  const positiveScore = (n) => (Number(n) > 0 ? 1 : 0);
  const numericBracket = (n, brackets) => {
    const v = Number(n);
    if (!isFinite(v)) return 0;
    for (const b of brackets) {
      const okMin = b.min === undefined || v >= b.min;
      const okMax = b.max === undefined || v <= b.max;
      if (okMin && okMax) return b.score;
    }
    return 0;
  };
  const countScore = (answer, brackets, none='None of the above') => {
    if (!Array.isArray(answer) || answer.length === 0) return 0;
    const cleaned = answer.filter(x => x !== none);
    if (cleaned.length === 0) return 0;
    const n = cleaned.length;
    for (const b of brackets) if (n >= b.min && n <= b.max) return b.score;
    return 0;
  };

  // ============================================================
  // 3. QUESTIONS — every Excel KPI question with weight, type, options, score fn
  // ============================================================
  const QUESTIONS = [
    // === Workforce & Diversity (HCD) — Excel rows 28–39 ===
    { id:'training_topics', topic:'hcd', section:'Workforce & Diversity', w:0.2, type:'Multi-select', required:true,
      q:'How many of the following topics do you offer structured training programs in? (Technical, Safety, Digital literacy, Compliance, Leadership, Cybersecurity, Human Rights/DEI, Soft skills)',
      opts:['Technical development','Safety practices and procedures','Digital development and literacy','Compliance','Leadership development','Cybersecurity','Human Rights / DEI','Soft skills development'],
      score: a => countScore(a, [{min:1,max:3,score:0.5},{min:4,max:5,score:0.75},{min:6,max:99,score:1.0}]),
      logic:'0% if 0 · 50% 1–3 · 75% 4–5 · 100% 6+' },
    { id:'training_hrs', topic:'hcd', section:'Workforce & Diversity', w:0.1, type:'Single-select', required:true,
      q:'Average training hours per employee in 2024',
      opts:[
        {l:'<10 hours per employee',     s:0.10},
        {l:'10 - 20 hours per employee', s:0.25},
        {l:'20 - 40 hours per employee', s:0.75},
        {l:'40 - 60 hours per employee', s:0.75},
        {l:'>60 hours per employee',     s:1.0},
        {l:'We do not track this',       s:0},
      ],
      logic:'0% No track · 10% <10 · 25% 10–20 · 75% 20–60 · 100% >60' },
    { id:'third_party_courses', topic:'hcd', section:'Workforce & Diversity', w:0.05, type:'Single-select',
      q:'Do you provide employees access to third-party courses (incl. paid certified)?',
      opts:[
        {l:'No, we do not provide this option', s:0},
        {l:'We plan on introducing this option in the current year', s:0.25},
        {l:'Yes, this option can be availed by some employees', s:0.75},
        {l:'Yes, this option can be availed by most employees', s:1.0},
      ],
      logic:'0% No · 25% Plan · 75% Some · 100% Most' },
    { id:'pct_women_org', topic:'hcd', section:'Workforce & Diversity', w:0.07, type:'Slider', unit:'%', required:true,
      q:'% of women in the organization',
      score: a => numericBracket(a, [{min:0,max:4.999,score:0},{min:5,max:10,score:0.5},{min:10.001,max:15,score:0.75},{min:15.001,score:1.0}]),
      logic:'0% <5% · 50% 5–10% · 75% 10–15% · 100% >15%' },
    { id:'pct_women_blue', topic:'hcd', section:'Workforce & Diversity', w:0.05, type:'Slider', unit:'%',
      q:'% of women in Blue Collar roles (shop floor / factory)',
      score: a => numericBracket(a, [{min:0,max:1.999,score:0},{min:2,max:5,score:0.5},{min:5.001,max:10,score:0.75},{min:10.001,score:1.0}]),
      logic:'0% <2% · 50% 2–5% · 75% 5–10% · 100% >10%' },
    { id:'pct_women_white', topic:'hcd', section:'Workforce & Diversity', w:0.05, type:'Slider', unit:'%',
      q:'% of women in White Collar roles (corporate/admin/technical)',
      score: a => numericBracket(a, [{min:0,max:4.999,score:0},{min:5,max:10,score:0.5},{min:10.001,max:15,score:0.75},{min:15.001,score:1.0}]),
      logic:'0% <5% · 50% 5–10% · 75% 10–15% · 100% >15%' },
    { id:'pct_women_lead', topic:'hcd', section:'Workforce & Diversity', w:0.05, type:'Slider', unit:'%', required:true,
      q:'% of women in Senior Leadership (management / executive team)',
      score: a => numericBracket(a, [{min:0,max:4.999,score:0},{min:5,max:10,score:0.5},{min:10.001,max:15,score:0.75},{min:15.001,score:1.0}]),
      logic:'0% <5% · 50% 5–10% · 75% 10–15% · 100% >15%' },
    { id:'pct_diff_abled', topic:'hcd', section:'Workforce & Diversity', w:0.1, type:'Slider', unit:'%',
      q:'% of differently-abled employees in the organization',
      score: a => numericBracket(a, [{min:0,max:0.999,score:0},{min:1,max:3,score:0.5},{min:3.001,max:7,score:0.75},{min:7.001,score:1.0}]),
      logic:'0% <1% · 50% 1–3% · 75% 3–7% · 100% >7%' },
    { id:'jobs_created', topic:'hcd', section:'Workforce & Diversity', w:0.1, type:'Number', unit:'jobs',
      q:'Total jobs created (formal or informal) in 2024',
      score: a => numericBracket(a, [{min:0,max:4.999,score:0},{min:5,max:10,score:0.5},{min:10.001,max:15,score:0.75},{min:15.001,score:1.0}]),
      logic:'0% <5 · 50% 5–10 · 75% 10–15 · 100% >15' },
    { id:'women_hired', topic:'hcd', section:'Workforce & Diversity', w:0.05, type:'Number', unit:'women',
      q:'How many women were hired in 2024?',
      score: a => numericBracket(a, [{min:0,max:0,score:0},{min:0.001,max:5,score:0.5},{min:5.001,max:10,score:0.75},{min:10.001,score:1.0}]),
      logic:'0% 0 · 50% upto 5 · 75% upto 10 · 100% >10' },
    { id:'pwd_hired', topic:'hcd', section:'Workforce & Diversity', w:0.05, type:'Number', unit:'people',
      q:'How many people with disability or other diverse profile were hired in 2024?',
      score: a => numericBracket(a, [{min:0,max:0,score:0},{min:0.001,max:2,score:0.5},{min:2.001,max:5,score:0.75},{min:5.001,score:1.0}]),
      logic:'0% 0 · 50% upto 2 · 75% upto 5 · 100% >5' },
    { id:'posh_redressal', topic:'hcd', section:'Workforce & Diversity', w:0.1, type:'Yes / No', required:true,
      q:'Formal redressal mechanism for POSH, human rights, H&S, workplace concerns?',
      score: a => a==='Yes'?1:0, logic:'100% Yes' },

    // === Water (E) ===
    { id:'water_sites', topic:'water', section:'Water Management', w:0.15, type:'Multi-select',
      q:'At how many of the following sites do you track water consumption?',
      opts:['Manufacturing Units','Corporate Offices','External / 3rd-party facilities','None of the above'],
      score: a => countScore(a, [{min:1,max:99,score:1.0}]),
      logic:'100% if ≥1 site (excluding "None")' },
    { id:'water_consumption', topic:'water', section:'Water Management', w:0.3, type:'Single-select',
      q:'Total water consumption across all sites (Kiloliters, 2024)',
      opts:[
        {l:'< 500 Kilolitres', s:1.0},
        {l:'500 - 1000 Kilolitres', s:1.0},
        {l:'1000 - 5000 Kilolitres', s:0.75},
        {l:'5000 - 10,000 Kilolitres', s:0.75},
        {l:'> 10,000 Kilolitres', s:0.25},
        {l:'We do not track this', s:0},
      ],
      logic:'100% I/II · 75% III/IV · 25% V · 0% VI' },
    { id:'water_initiatives', topic:'water', section:'Water Management', w:0.3, type:'Single-select',
      q:'Number of water reduction/reuse/recycle initiatives implemented (audits, leak optimisation, efficient fixtures, closed-loop, recycling, rainwater, training)',
      opts:[
        {l:'None of the above', s:0},
        {l:'Not yet implemented but plan to in current year', s:0.25},
        {l:'1', s:0.5}, {l:'2', s:0.5},
        {l:'3', s:0.75}, {l:'4', s:0.75},
        {l:'5 or more', s:1.0},
      ],
      logic:'0% None · 25% Plan · 50% 1–2 · 75% 3–4 · 100% 5+' },
    { id:'water_saved', topic:'water', section:'Water Management', w:0.25, type:'Single-select',
      q:'Total water saved in 2024 (Kiloliters)',
      opts:[
        {l:'< 500 Kilolitres', s:0.5}, {l:'500 - 1000 Kilolitres', s:0.5},
        {l:'1000 - 5000 Kilolitres', s:0.75},
        {l:'5000 - 10,000 Kilolitres', s:1.0}, {l:'> 10,000 Kilolitres', s:1.0},
        {l:'We do not track this', s:0},
      ],
      logic:'0% No track · 50% I/II · 75% III · 100% IV/V' },

    // === Energy & GHG (E) ===
    { id:'energy_src', topic:'energy', section:'Energy & Emissions', w:0.3, type:'Single-select', required:true,
      q:'Sources of energy — best match',
      opts:[
        {l:'Only Electricity Grid', s:0.5},
        {l:'Only Captive — primarily non-renewable', s:0.25},
        {l:'Only Captive — primarily renewable', s:1.0},
        {l:'Mix of Grid & Captive — primarily non-renewable', s:0.25},
        {l:'Mix of Grid & Captive — primarily renewable', s:0.75},
      ],
      logic:'25% non-renewable · 50% Grid only · 75% Mix-renewable · 100% Captive-renewable' },
    { id:'re_pct', topic:'energy', section:'Energy & Emissions', w:0.2, type:'Slider', unit:'%',
      q:'% of energy requirements met through Renewable Energy',
      score: a => { const v=Number(a); if (!isFinite(v)||v<=0) return 0; return v<=10?0.75:1.0; },
      logic:'0% 0 · 75% ≤10% · 100% >10%' },
    { id:'energy_eff_init', topic:'energy', section:'Energy & Emissions', w:0.3, type:'Single-select',
      q:'How many energy-efficiency initiatives have you implemented in last 3 years?',
      opts:[
        {l:'None of the above', s:0},
        {l:'Plan to in current year', s:0.25},
        {l:'1', s:0.5}, {l:'2', s:0.5},
        {l:'3', s:0.75},
        {l:'4 or more', s:1.0},
      ],
      logic:'0% None · 25% Plan · 50% 1–2 · 75% 3 · 100% 4+' },
    { id:'energy_savings', topic:'energy', section:'Energy & Emissions', w:0.1, type:'Number', unit:'USD',
      q:'Total energy cost savings achieved in 2024 (USD; leave 0 if not tracked)',
      score: a => positiveScore(a), logic:'100% if >0' },
    { id:'re_total_kwh', topic:'energy', section:'Energy & Emissions', w:0.1, type:'Number', unit:'kWh',
      q:'Total energy met through Renewable Energy (kWh)',
      score: a => positiveScore(a), logic:'100% if >0' },

    { id:'scope12', topic:'ghg', section:'Energy & Emissions', w:0.3, type:'Single-select', required:true,
      q:'Approximate Scope 1 + Scope 2 GHG emissions',
      opts:[
        {l:'<500 tCO2', s:1.0},
        {l:'500 - 1000 tCO2', s:0.75},
        {l:'1000 - 5000 tCO2', s:0.5},
        {l:'5000 - 10,000 tCO2', s:0.5},
        {l:'>10,000 tCO2', s:0.25},
        {l:'No data yet, plan to calculate this year', s:0.25},
        {l:'We do not track this', s:0},
      ],
      logic:'0% VII · 25% V/VI · 50% III/IV · 75% II · 100% I' },
    { id:'scope3', topic:'ghg', section:'Energy & Emissions', w:0.1, type:'Single-select',
      q:'Do you track your Scope 3 emissions?',
      opts:[
        {l:'Yes, based on globally established methodologies', s:1.0},
        {l:'We track some Scope 3 (partial data)', s:0.75},
        {l:'No data yet, plan to calculate this year', s:0.25},
        {l:'No, we do not track Scope 3', s:0},
      ],
      logic:'0% IV · 25% III · 75% II · 100% I' },
    { id:'ghg_init', topic:'ghg', section:'Energy & Emissions', w:0.3, type:'Single-select',
      q:'Initiatives to reduce GHG (energy-eff, low-impact ops/EV, offsets via certificates)',
      opts:[
        {l:'None of the above', s:0},
        {l:'Plan to in current year', s:0.25},
        {l:'1', s:0.75},
        {l:'2', s:1.0}, {l:'3', s:1.0},
      ],
      logic:'0% None · 25% Plan · 75% 1 · 100% 2–3' },
    { id:'ghg_saved', topic:'ghg', section:'Energy & Emissions', w:0.2, type:'Single-select',
      q:'Approximate Scope 1+2 emissions saved through these efforts',
      opts:[
        {l:'None of the above', s:0},
        {l:'Plan to calculate this year', s:0.25},
        {l:'No emission savings yet', s:0.25},
        {l:'<500 tCO2', s:0.5}, {l:'500 - 1000 tCO2', s:0.5},
        {l:'1000 - 5000 tCO2', s:0.75}, {l:'5000 - 10,000 tCO2', s:0.75},
        {l:'>10,000 tCO2', s:1.0},
      ],
      logic:'0% None · 25% Plan · 50% <1k · 75% 1k–10k · 100% >10k' },
    { id:'ghg_intensity', topic:'ghg', section:'Energy & Emissions', w:0.1, type:'Number', unit:'tCO2/customer',
      q:'Emissions intensity in 2024 (tCO2/customer; leave 0 if not calculated)',
      score: a => positiveScore(a), logic:'100% if >0' },

    // === Waste (E) ===
    { id:'haz_dispose', topic:'waste', section:'Waste Management', w:0.3, type:'Single-select',
      q:'How do you manage/dispose hazardous waste?',
      opts:[
        {l:'Reuse / recycle / treat onsite', s:1.0},
        {l:'Sell to industry / recycler directly', s:1.0},
        {l:'Local municipality / municipal waste stream', s:0.5},
        {l:'Incineration / landfilling', s:0.25},
        {l:'None of the above', s:0},
        {l:'N/A — no hazardous waste produced', s:1.0},
      ],
      logic:'0% V · 25% IV · 50% III · 100% I/II/N-A' },
    { id:'nonhaz_dispose', topic:'waste', section:'Waste Management', w:0.3, type:'Single-select',
      q:'How do you manage/dispose non-hazardous waste?',
      opts:[
        {l:'Reuse / recycle / treat onsite', s:1.0},
        {l:'Sell to industry / recycler directly', s:1.0},
        {l:'Local municipality / municipal waste stream', s:0.75},
        {l:'Incineration / landfilling', s:0.25},
        {l:'None of the above', s:0},
        {l:'N/A — no non-hazardous waste produced', s:1.0},
      ],
      logic:'0% V · 25% IV · 75% III · 100% I/II/N-A' },
    { id:'waste_reduce', topic:'waste', section:'Waste Management', w:0.4, type:'Yes / No',
      q:'Have you taken steps to reduce waste generation in last 3 years?',
      score: a => a==='Yes'?1:0, logic:'100% Yes' },

    // === OH&S (S) ===
    { id:'ohs_practices', topic:'ohs', section:'Health & Safety', w:0.6, type:'Multi-select',
      q:'OH&S practices implemented (policies, emergency tools, PPE, signage, reps, injury comp, accident records)',
      opts:['OH&S policies & manuals','Emergency tools/equipment','Personal protective equipment','OH&S signage / emergency exits','Nominated OH&S reps & first-aiders','Remuneration for work-related injuries','Record-keeping of all accidents'],
      score: a => countScore(a, [{min:1,max:2,score:0.25},{min:3,max:3,score:0.5},{min:4,max:4,score:0.75},{min:5,max:99,score:1.0}]),
      logic:'0% 0 · 25% 1–2 · 50% 3 · 75% 4 · 100% 5+' },
    { id:'safety_drills', topic:'ohs', section:'Health & Safety', w:0.15, type:'Single-select',
      q:'Frequency of fire drills, audits, precautionary activities',
      opts:[
        {l:'We do not do this', s:0},
        {l:'Once every 2-3 years', s:0.25},
        {l:'Annually', s:0.75},
        {l:'Once every 2-6 months', s:0.9},
        {l:'Once a month', s:1.0},
      ],
      logic:'0% Never · 25% 2–3 yr · 75% Yearly · 90% 2–6 mo · 100% Monthly' },
    { id:'incidents', topic:'ohs', section:'Health & Safety', w:0.25, type:'Single-select',
      q:'Workplace incidents / accidents last year',
      opts:[ {l:'0',s:1.0}, {l:'1-5',s:0.75}, {l:'6-10',s:0.5}, {l:'>10',s:0} ],
      logic:'0% >10 · 50% 6–10 · 75% 1–5 · 100% 0' },

    // === Community & CSR (S) ===
    { id:'collab_activities', topic:'comm', section:'Community & CSR', w:0.2, type:'Single-select',
      q:'Activities in collaboration with NGOs/govt/community in 2024',
      opts:[ {l:'No activities',s:0}, {l:'1-5 activities',s:0.75}, {l:'>5 activities',s:1.0} ],
      logic:'0% None · 75% 1–5 · 100% >5' },
    { id:'csr_amount', topic:'comm', section:'Community & CSR', w:0.4, type:'Single-select',
      q:'Total CSR spend in 2024 (USD)',
      opts:[
        {l:'No amount spent', s:0},
        {l:'<USD 10,000 spent', s:0.5},
        {l:'USD 10,000 - 20,000 spent', s:0.75},
        {l:'>USD 20,000 spent', s:1.0},
      ],
      logic:'0% None · 50% <10k · 75% 10–20k · 100% >20k' },
    { id:'csr_sectors', topic:'comm', section:'Community & CSR', w:0.4, type:'Multi-select',
      q:'Sectors of CSR initiatives',
      opts:['Poverty, health, sanitation','Education and employment','Gender equality / vulnerable groups','Environmental sustainability','National heritage and culture','Armed forces support','Sports','Government funds','R&D support','Educational institutions','Rural development','Slum area development','Disaster management'],
      score: a => countScore(a, [{min:1,max:6,score:0.75},{min:7,max:99,score:1.0}]),
      logic:'0% 0 · 75% 1–6 · 100% 7+' },

    // === Consumer Responsibility (S) ===
    { id:'cr_compliance', topic:'consResp', section:'Consumer Responsibility', w:0.15, type:'Single-select',
      q:'Compliant with safety/consumer-protection regulations?',
      opts:[ {l:'No',s:0}, {l:'Some of the standards',s:0.75}, {l:'Yes',s:1.0} ],
      logic:'75% Some · 100% Yes' },
    { id:'cr_feedback', topic:'consResp', section:'Consumer Responsibility', w:0.15, type:'Yes / No',
      q:'Email/portal/phone for customer feedback or complaints?',
      score: a => a==='Yes'?1:0, logic:'100% Yes' },
    { id:'cr_complaints', topic:'consResp', section:'Consumer Responsibility', w:0.3, type:'Single-select',
      q:'Average daily product/service complaints in 2024',
      opts:[
        {l:'<5 complaints', s:1.0}, {l:'5 - 10 complaints', s:1.0},
        {l:'10 - 20 complaints', s:0.75},
        {l:'20 - 50 complaints', s:0.5}, {l:'50+', s:0.5},
        {l:'We do not track this', s:0},
      ],
      logic:'0% No track · 50% 20+ · 75% 10–20 · 100% <10' },
    { id:'cr_turnaround', topic:'consResp', section:'Consumer Responsibility', w:0.3, type:'Single-select',
      q:'Average turnaround time for closing complaints',
      opts:[
        {l:'<1 day', s:1.0}, {l:'1-3 days', s:1.0},
        {l:'3-7 days', s:0.75},
        {l:'7-14 days', s:0.5},
        {l:'14+ days', s:0.25}, {l:'N/A', s:0.25},
      ],
      logic:'25% 14+/NA · 50% 7–14d · 75% 3–7d · 100% <3d' },

    // === Corporate Governance (G) ===
    { id:'policies', topic:'cgov', section:'Governance & Compliance', w:0.35, type:'Multi-select', required:true,
      q:'Policies developed & implemented (CSR, EMS, OH&S, Anti-corruption, Human Rights, HR Handbook, DEI/POSH, Code of Ethics, Responsible Procurement, Whistleblower)',
      opts:['Corporate Social Responsibility Policy','Environmental Management Policy','Occupational Health and Safety Policy','Anti-corruption / Anti-bribery','Human Rights','HR Policy / Employee Handbook','Diversity, Equity & Inclusion / POSH','Code of Ethics / Code of Conduct','Responsible Procurement / Supplier Code of Conduct','Whistleblower Policy'],
      score: a => countScore(a, [{min:1,max:3,score:0.5},{min:4,max:6,score:0.75},{min:7,max:99,score:1.0}]),
      logic:'0% 0 · 50% 1–3 · 75% 4–6 · 100% 7+' },
    { id:'certs', topic:'cgov', section:'Governance & Compliance', w:0.2, type:'Multi-select',
      q:'Certifications obtained',
      opts:['ISO 26000 (social responsibility)','ISO 14001 (env mgmt)','OHSAS 18001 / ISO 45001 (H&S)','ISO 9001 (quality)','ISO 37001 (anti-bribery)','ISO 50001 (energy)','ISO 20400 (sustainable procurement)','ISO 27001 (information security)'],
      score: a => countScore(a, [{min:1,max:2,score:0.5},{min:3,max:4,score:0.75},{min:5,max:99,score:1.0}]),
      logic:'0% 0 · 50% 1–2 · 75% 3–4 · 100% 5+' },
    { id:'esg_gov', topic:'cgov', section:'Governance & Compliance', w:0.3, type:'Multi-select',
      q:'ESG approach statements that apply (board committee, agenda topic, dedicated team, goals/targets, roadmap, materiality assessment, periodic tracking, public disclosure)',
      opts:['Board-level ESG committee','ESG on board agenda','Dedicated ESG team / C-suite position','ESG goals & targets set','ESG roadmap / policy','Materiality assessment conducted','Periodic ESG tracking','Public ESG disclosure'],
      score: a => countScore(a, [{min:1,max:3,score:0.5},{min:4,max:6,score:0.75},{min:7,max:99,score:1.0}]),
      logic:'0% 0 · 50% 1–3 · 75% 4–6 · 100% 7+' },
    { id:'fines', topic:'cgov', section:'Governance & Compliance', w:0.15, type:'Yes / No',
      q:'Any monetary loss in fines/penalties for ethics/compliance violations?',
      score: a => a==='No'?1:0, logic:'100% No' },

    // === Privacy & Data Security (G) ===
    { id:'data_breaches', topic:'privacy', section:'Governance & Compliance', w:0.6, type:'Single-select',
      q:'Data breaches/security incidents tracked? Estimated # in 2024',
      opts:[
        {l:'Less than 2 incidents', s:1.0}, {l:'2 - 5 incidents', s:1.0},
        {l:'5 - 10 incidents', s:0.75},
        {l:'10+ incidents', s:0.5},
        {l:'Plan to start tracking this year', s:0.25},
        {l:'We do not track this', s:0},
      ],
      logic:'0% No track · 25% Plan · 50% 10+ · 75% 5–10 · 100% <5' },
    { id:'breach_resp', topic:'privacy', section:'Governance & Compliance', w:0.2, type:'Yes / No',
      q:'Steps to minimise impact, inform stakeholders, prevent recurrence?',
      score: a => a==='Yes'?1:0, logic:'100% Yes' },
    { id:'data_laws', topic:'privacy', section:'Governance & Compliance', w:0.2, type:'Yes / No',
      q:'Steps to comply with data protection laws (GDPR, CCPA, etc.)?',
      score: a => a==='Yes'?1:0, logic:'100% Yes' },

    // === Social Product Innovation (G) ===
    { id:'rd_spend', topic:'spi', section:'Governance & Compliance', w:1.0, type:'Single-select',
      q:'% of annual spending on R&D',
      opts:[
        {l:'We do not spend money on R&D', s:0},
        {l:'<0.5%', s:0.25},
        {l:'0.5% - 1%', s:0.5},
        {l:'1% - 5%', s:0.75},
        {l:'5% - 10%', s:0.9},
        {l:'>10%', s:1.0},
      ],
      logic:'0% none · 25% <0.5% · 50% 0.5–1% · 75% 1–5% · 90% 5–10% · 100% >10%' },

    // === Ethical Sourcing & Supply Chain (G) ===
    { id:'supply_steps', topic:'ess', section:'Supply Chain & Sourcing', w:0.7, type:'Multi-select',
      q:'Steps to ensure sustainable supply chain (commitment, supplier code, ISO/cert on onboarding, supplier audits)',
      opts:['Undertaking/commitment from suppliers','Supplier Code of Conduct adherence','Sustainability-linked performance on onboarding','Supplier audits & evaluations'],
      score: a => countScore(a, [{min:1,max:2,score:0.75},{min:3,max:99,score:1.0}]),
      logic:'0% 0 · 75% 1–2 · 100% 3+' },
    { id:'supplier_metrics', topic:'ess', section:'Supply Chain & Sourcing', w:0.3, type:'Multi-select',
      q:'Supplier metrics tracked (local <200km, diversity, ethical certs, recycled materials)',
      opts:['Local suppliers (<200km)','Diversity ratio (women/minority-owned)','Ethical approaches (Rainforest Alliance, FairTrade)','Suppliers providing recycled / recovered materials'],
      score: a => countScore(a, [{min:1,max:2,score:0.75},{min:3,max:99,score:1.0}]),
      logic:'0% 0 · 75% 1–2 · 100% 3+' },

    // === Sector-specific shortlist (still scored when applicable) ===
    { id:'circular_yn', topic:'circular', section:'Sector-Specific', w:0.1, type:'Yes / No',
      sectors:['Consumer','B2B','Cleantech','Agritech'],
      q:'Eco-friendly raw materials used in production?',
      score: a => a==='Yes'?1:0, logic:'100% Yes (Consumer / B2B / Cleantech / Agritech only)' },
    { id:'circular_pct', topic:'circular', section:'Sector-Specific', w:0.1, type:'Slider', unit:'%',
      sectors:['Consumer','B2B','Cleantech','Agritech'],
      q:'% of raw material that could be considered "eco-friendly"',
      score: a => numericBracket(a, [{min:0,max:0,score:0},{min:0.001,max:5,score:0.5},{min:5.001,max:10,score:0.75},{min:10.001,score:1.0}]),
      logic:'0% 0% · 50% 1–5% · 75% 5–10% · 100% >10%' },
    { id:'fin_underserved_pct', topic:'comm_fin', section:'Sector-Specific', w:0.3, type:'Slider', unit:'%',
      sectors:['Fintech'],
      q:'% of revenue from products targeting underserved/high-need populations',
      score: a => numericBracket(a, [{min:0,max:0,score:0},{min:0.001,max:25,score:0.5},{min:25.001,max:50,score:0.75},{min:50.001,score:1.0}]),
      logic:'0% 0% · 50% 1–25% · 75% 25–50% · 100% >50% (Fintech only)' },
    { id:'hth_groups', topic:'comm_hth', section:'Sector-Specific', w:0.5, type:'Multi-select',
      sectors:['Healthtech'],
      q:'Groups directly/indirectly targeted through products in 2024',
      opts:['Rural population','Women','Children','People with disability / chronic illness','Economically weaker','The elderly','Sexual minorities','Other vulnerable / minority groups'],
      score: a => countScore(a, [{min:1,max:2,score:0.75},{min:3,max:99,score:1.0}]),
      logic:'0% 0 · 75% 1–2 · 100% 3+ (Healthtech only)' },
    { id:'agri_traceability', topic:'spi_agri', section:'Sector-Specific', w:0.6, type:'Slider', unit:'%',
      sectors:['Agritech'],
      q:'% of supply chain integrated with traceability solutions',
      score: a => numericBracket(a, [{min:0,max:0,score:0},{min:0.001,max:15,score:0.5},{min:15.001,max:30,score:0.75},{min:30.001,score:1.0}]),
      logic:'0% 0% · 50% 1–15% · 75% 15–30% · 100% >30% (Agritech only)' },
  ];

  // ============================================================
  // 4. SCORE A QUESTION
  // ============================================================
  const scoreQuestion = (q, answer) => {
    if (q.unscored) return null;
    if (typeof q.score === 'function') return q.score(answer);
    if (q.type === 'Single-select' && Array.isArray(q.opts) && typeof q.opts[0] === 'object') {
      const opt = q.opts.find(o => o.l === answer);
      return opt ? (opt.s ?? 0) : 0;
    }
    return 0;
  };

  const computeScores = (companyId) => {
    const co = window.HALO_ESG.COMPANIES.find(c => c.id === companyId);
    if (!co) return null;
    const sec = sectorKey(co.sector);
    const ans = (window.HALO_ESG.STATE.answers[companyId]) || {};

    const byTopic = {};
    QUESTIONS.forEach(q => {
      if (q.unscored) return;
      if (q.sectors && !q.sectors.includes(sec)) return;
      const tw = TOPICS[q.topic]?.w?.[sec];
      if (!tw) return;
      const respPct = scoreQuestion(q, ans[q.id]);
      const max    = (q.w || 0) * tw;
      const points = max * (respPct || 0);
      if (!byTopic[q.topic]) {
        byTopic[q.topic] = { topic:q.topic, name:TOPICS[q.topic].name, pillar:TOPICS[q.topic].pillar, weight:tw, scored:0, max:0, items:[] };
      }
      byTopic[q.topic].scored += points;
      byTopic[q.topic].max    += max;
      byTopic[q.topic].items.push({ q, respPct: respPct||0, points, max,
        answered: ans[q.id] !== undefined && ans[q.id] !== '' && !(Array.isArray(ans[q.id]) && ans[q.id].length === 0) });
    });

    let total=0, totalMax=0;
    const eP={s:0,m:0}, sP={s:0,m:0}, gP={s:0,m:0};
    Object.values(byTopic).forEach(t => {
      total += t.scored; totalMax += t.max;
      if (t.pillar==='E'){ eP.s+=t.scored; eP.m+=t.max; }
      if (t.pillar==='S'){ sP.s+=t.scored; sP.m+=t.max; }
      if (t.pillar==='G'){ gP.s+=t.scored; gP.m+=t.max; }
    });
    const tier = co.tier || tierFromAmount(co.amount);
    const threshold = PASS_THRESHOLDS[tier] || 30;
    const r = (x) => Math.round(x*10)/10;
    return {
      total: r(total), totalMax: r(totalMax),
      eP, sP, gP,
      byTopic: Object.values(byTopic),
      verdict: total >= threshold ? 'PASS' : (total >= threshold * 0.6 ? 'REVIEW' : 'FAIL'),
      threshold, tier, sector: sec,
    };
  };

  // ============================================================
  // 5. PER-COMPANY CONTACTS — for the Send Survey "Add recipient" dropdown
  // ============================================================
  const CONTACTS = {
    wer: [
      {name:'Niranjan Rathi',  role:'CEO',                       email:'niranjan@werize.com'},
      {name:'Anita Iyer',      role:'CFO',                       email:'anita@werize.com'},
      {name:'Dev Sharma',      role:'Head of Compliance',        email:'dev@werize.com'},
    ],
    alf: [
      {name:'Siddharth Manohar',role:'CEO',                      email:'siddharth@alphacapital.in'},
      {name:'Pratik Bose',      role:'COO',                      email:'pratik@alphacapital.in'},
    ],
    sid: [
      {name:'Siddharth Manohar',role:'Founder',                  email:'sid@sidsco.com'},
      {name:'Maya Krishnan',    role:'Operations Lead',          email:'maya@sidsco.com'},
    ],
    tap: [
      {name:'Akshat Gautam',    role:'Founder & CEO',            email:'akshat@theaterapparel.com'},
      {name:'Vikram Jain',      role:'Sustainability Officer',   email:'vikram@theaterapparel.com'},
      {name:'Sneha Iyer',       role:'HR & People Lead',         email:'sneha@theaterapparel.com'},
    ],
    krv: [
      {name:'Akshat Gautam',    role:'CEO',                      email:'akshat@krvvy.com'},
      {name:'Tara Mukherjee',   role:'Head of Sustainability',   email:'tara@krvvy.com'},
      {name:'Karan Bhatia',     role:'CFO',                      email:'karan@krvvy.com'},
    ],
    fct: [
      {name:'Rohan Sethi',      role:'CEO',                      email:'rohan@firstclub.tech'},
      {name:'Riya Patel',       role:'Head of People',           email:'riya@firstclub.tech'},
    ],
    nat: [
      {name:'Priya Menon',      role:'CEO & Co-founder',         email:'priya@naturohabit.com'},
      {name:'Manav Sharma',     role:'COO',                      email:'manav@naturohabit.com'},
    ],
    fln: [
      {name:'Anaya Krishnan',   role:'Co-founder',               email:'anaya@slaash.in'},
      {name:'Lavanya Reddy',    role:'Operations Lead',          email:'lavanya@slaash.in'},
    ],
    cpf: [
      {name:'Rohan Sethi',      role:'Founder & CEO',            email:'rohan@captainfresh.com'},
      {name:'Divya Nambiar',    role:'Head of Sustainability',   email:'divya@captainfresh.com'},
      {name:'Rajesh Pillai',    role:'Supply Chain Director',    email:'rajesh@captainfresh.com'},
    ],
    ath: [
      {name:'Vikram Jain',      role:'CEO',                      email:'vikram@atherenergy.com'},
      {name:'Swapnil Jain',     role:'CTO',                      email:'swapnil@atherenergy.com'},
      {name:'Devika Rao',       role:'Head of Sustainability',   email:'devika@atherenergy.com'},
    ],
    rzr: [
      {name:'Vikram Jain',      role:'CEO',                      email:'vikram@razorpay.com'},
      {name:'Shashank Kumar',   role:'CTO',                      email:'shashank@razorpay.com'},
      {name:'Neha Pandit',      role:'Head of ESG & Impact',     email:'neha@razorpay.com'},
    ],
    frt: [
      {name:'Anaya Krishnan',   role:'Founder',                  email:'anaya@fraternitas.in'},
    ],
  };

  // ============================================================
  // 6. STATE — answers persist across screens via localStorage
  // ============================================================
  const LS_KEY = 'halo-esg-state-v2';
  const loadStored = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
  };
  const persisted = loadStored();
  const STATE = {
    answers: persisted.answers || {},
    customContacts: persisted.customContacts || {},
    sendDraft: persisted.sendDraft || null,
    qaQuestions: persisted.qaQuestions || {}, // { [companyId]: [{ id, from, q, time, status, a?, repliedBy? }] }
  };
  const persist = () => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(STATE)); } catch {}
  };
  const setAnswer = (cid, qid, val) => {
    if (!STATE.answers[cid]) STATE.answers[cid] = {};
    STATE.answers[cid][qid] = val;
    persist();
  };
  // Founder asks a question that the ESG team will see in the Q&A tab.
  const askQuestion = (cid, payload) => {
    if (!STATE.qaQuestions[cid]) STATE.qaQuestions[cid] = [];
    const item = {
      id: 'qa_' + Date.now(),
      from: payload.from || 'Founder',
      q: payload.q,
      time: 'Just now',
      status: 'open',
      ...payload,
    };
    STATE.qaQuestions[cid].unshift(item);
    persist();
    return item;
  };
  const replyQuestion = (cid, qid, reply) => {
    const list = STATE.qaQuestions[cid] || [];
    const idx = list.findIndex(x => x.id === qid);
    if (idx === -1) return;
    list[idx] = { ...list[idx], status: 'answered', a: reply, repliedBy: 'Krishti Sharma', repliedTime: 'Just now' };
    persist();
  };

  // ============================================================
  // 7. EXPORT to window.HALO_ESG.SCORING
  // ============================================================
  Object.assign(window.HALO_ESG, {
    SCORING: { TOPICS, QUESTIONS, computeScores, scoreQuestion, sectorKey, tierFromAmount, PASS_THRESHOLDS },
    CONTACTS,
    STATE,
    persist,
    setAnswer,
    askQuestion,
    replyQuestion,
  });

  // ============================================================
  // 8. DEMO SEED — populate realistic answers and Q&A for completed
  //    / in-review companies on first load so the Response/Review/Q&A
  //    tabs aren't empty. Only runs if no state has been persisted yet.
  // ============================================================
  if (!persisted.answers || Object.keys(persisted.answers).length === 0) {
    // Strong-performer answer set (used for completed companies)
    const STRONG = {
      training_topics: ['Technical development','Safety practices and procedures','Digital development and literacy','Compliance','Leadership development','Cybersecurity','Human Rights / DEI','Soft skills development'],
      training_hrs:'40 - 60 hours per employee',
      third_party_courses:'Yes, this option can be availed by most employees',
      pct_women_org:'34', pct_women_blue:'8', pct_women_white:'28', pct_women_lead:'22', pct_diff_abled:'4',
      jobs_created:'42', women_hired:'14', pwd_hired:'3', posh_redressal:'Yes',
      water_sites:['Corporate Offices'], water_consumption:'< 500 Kilolitres', water_initiatives:'3', water_saved:'500 - 1000 Kilolitres',
      energy_src:'Mix of Grid & Captive — primarily renewable', re_pct:'22', energy_eff_init:'4 or more', energy_savings:'18000', re_total_kwh:'45000',
      scope12:'500 - 1000 tCO2', scope3:'We track some Scope 3 (partial data)', ghg_init:'2', ghg_saved:'500 - 1000 tCO2', ghg_intensity:'0.18',
      haz_dispose:'Sell to industry / recycler directly', nonhaz_dispose:'Reuse / recycle / treat onsite', waste_reduce:'Yes',
      ohs_practices:['OH&S policies & manuals','Emergency tools/equipment','Personal protective equipment','OH&S signage / emergency exits','Nominated OH&S reps & first-aiders','Record-keeping of all accidents'],
      safety_drills:'Once every 2-6 months', incidents:'1-5',
      collab_activities:'>5 activities', csr_amount:'>USD 20,000 spent', csr_sectors:['Poverty, health, sanitation','Education and employment','Gender equality / vulnerable groups','Environmental sustainability','Rural development','Educational institutions','Disaster management'],
      cr_compliance:'Yes', cr_feedback:'Yes', cr_complaints:'5 - 10 complaints', cr_turnaround:'1-3 days',
      policies:['Corporate Social Responsibility Policy','Environmental Management Policy','Occupational Health and Safety Policy','Anti-corruption / Anti-bribery','Human Rights','HR Policy / Employee Handbook','Diversity, Equity & Inclusion / POSH','Code of Ethics / Code of Conduct','Whistleblower Policy'],
      certs:['ISO 14001 (env mgmt)','ISO 9001 (quality)','ISO 27001 (information security)'],
      esg_gov:['Board-level ESG committee','ESG on board agenda','Dedicated ESG team / C-suite position','ESG goals & targets set','ESG roadmap / policy','Periodic ESG tracking'],
      fines:'No',
      data_breaches:'2 - 5 incidents', breach_resp:'Yes', data_laws:'Yes',
      rd_spend:'1% - 5%',
      supply_steps:['Undertaking/commitment from suppliers','Supplier Code of Conduct adherence','Supplier audits & evaluations'],
      supplier_metrics:['Local suppliers (<200km)','Diversity ratio (women/minority-owned)'],
      circular_yn:'Yes', circular_pct:'8',
      fin_underserved_pct:'40',
      hth_groups:['Rural population','Women','Economically weaker','The elderly'],
      agri_traceability:'25',
    };
    // Mid-performer answer set (used for in-review)
    const MID = { ...STRONG,
      pct_women_lead:'12', pct_diff_abled:'2',
      energy_src:'Only Electricity Grid', re_pct:'8', energy_eff_init:'2',
      scope12:'1000 - 5000 tCO2', scope3:'No, we do not track Scope 3', ghg_init:'1', ghg_saved:'No emission savings yet',
      certs:['ISO 9001 (quality)'],
      esg_gov:['ESG on board agenda','ESG goals & targets set','Periodic ESG tracking'],
      data_breaches:'5 - 10 incidents',
      cr_complaints:'10 - 20 complaints', cr_turnaround:'3-7 days',
      policies:['Corporate Social Responsibility Policy','HR Policy / Employee Handbook','Code of Ethics / Code of Conduct','Whistleblower Policy'],
      water_initiatives:'1', water_saved:'We do not track this',
      training_hrs:'10 - 20 hours per employee', training_topics:['Technical development','Safety practices and procedures','Compliance'],
    };
    // Partial answer set (used for in-progress)
    const PARTIAL = {
      pct_women_org:'22', pct_women_lead:'8', posh_redressal:'Yes',
      training_topics:['Technical development','Compliance'],
      water_sites:['Corporate Offices'], water_consumption:'< 500 Kilolitres',
      energy_src:'Only Electricity Grid', re_pct:'0',
      scope12:'We do not track this',
      policies:['HR Policy / Employee Handbook','Code of Ethics / Code of Conduct'],
      cr_feedback:'Yes', data_laws:'Yes',
    };
    const SEEDS = {
      // Completed
      wer:STRONG, fct:STRONG, nat:STRONG, ath:STRONG, rzr:STRONG,
      // In-review
      alf:MID, krv:MID,
      // In-progress
      sid:PARTIAL, tap:PARTIAL, cpf:PARTIAL,
      // Not-started / overdue stay empty
    };
    Object.entries(SEEDS).forEach(([cid, payload]) => {
      STATE.answers[cid] = { ...payload };
    });

    // Seed Q&A threads
    STATE.qaQuestions['wer'] = [
      { id:'qa_seed_1', from:'Niranjan Rathi', q:'For Scope 1+2 — should we include emissions from our leased Mumbai office?', time:'2 days ago', status:'answered', a:'Yes, please include all leased premises under operational control.', repliedBy:'Krishti Sharma', repliedTime:'2 days ago' },
      { id:'qa_seed_2', from:'Niranjan Rathi', q:"We don't have a formal D&I policy yet. Is uploading a draft acceptable?", time:'4 days ago', status:'open' },
    ];
    STATE.qaQuestions['krv'] = [
      { id:'qa_seed_3', from:'Akshat Gautam', q:'How should we report partial Scope 3 numbers — by category or aggregate?', time:'Yesterday', status:'open' },
    ];
    STATE.qaQuestions['cpf'] = [
      { id:'qa_seed_4', from:'Rohan Sethi', q:'Can the file upload accept a Google Drive link instead of PDF?', time:'5 days ago', status:'answered', a:"We'd prefer a downloaded PDF; export the doc and upload directly.", repliedBy:'Krishti Sharma', repliedTime:'5 days ago' },
    ];
    persist();
  }
})();
