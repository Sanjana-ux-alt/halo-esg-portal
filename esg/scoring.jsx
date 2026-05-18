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
  // Tier breakpoints come from the Excel SOP sheet ("Read me (SOP)" in
  // SV_ESG KPI Scoring Sheet_HALO.xlsx): L1 = revenue <₹100 Cr, L2 = ₹100-500 Cr,
  // L3 = >₹500 Cr.
  const tierFromAmount = (amt) => {
    if (!amt) return 'L1';
    const n = parseInt(String(amt).replace(/[^0-9]/g, ''), 10) || 0;
    if (n >  500) return 'L3';
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
  // Accept arrays (real survey UI), raw count numbers, or Excel-style range strings
  // like "1 to 3", "4 to 6", "7 to 10", "5+", "0", "None of the above".
  const countScore = (answer, brackets, none='None of the above') => {
    let n = -1;
    if (Array.isArray(answer)) {
      const cleaned = answer.filter(x => x !== none);
      n = cleaned.length === 0 ? 0 : cleaned.length;
    } else if (typeof answer === 'number') {
      n = answer;
    } else if (typeof answer === 'string') {
      const s = answer.trim().toLowerCase();
      if (s === '' || s === 'none of the above' || s === 'we do not track this' || s === '0') n = 0;
      else if (/^\d+\+?$/.test(s))                     n = parseInt(s, 10);
      else if (/^\d+\s*to\s*\d+$/i.test(s))            { const m = s.match(/(\d+)\s*to\s*(\d+)/i); n = Math.round((parseInt(m[1]) + parseInt(m[2]))/2); }
      else if (/^\d+\s*or\s*more$/i.test(s))           n = parseInt(s.match(/(\d+)/)[1], 10);
      else if (/not yet|plan to/.test(s))              n = 0;
    }
    if (n <= 0) return 0;
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

    // Honour ESG's form-builder edits: skip disabled, include custom (which are unscored)
    const disabledSet = new Set(window.HALO_ESG.STATE.disabledQuestions || []);
    const activeQs = [...QUESTIONS.filter(q => !disabledSet.has(q.id)), ...(window.HALO_ESG.STATE.customQuestions || [])];

    const byTopic = {};
    activeQs.forEach(q => {
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
    // Tier priority: deal-team's explicit choice (from Send Survey) → company default → derived from amount
    const tier = (window.HALO_ESG.STATE.companyTiers || {})[companyId] || co.tier || tierFromAmount(co.amount);
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
  // POCs sourced from the raw answer-sheet "Name of the company POC" + "Designation"
  // columns in the Stride Ventures_ESG KPI Coverage Summary Excel.
  const CONTACTS = {
    npl: [ {name:'Jitin Sacdeva',      role:'Director Finance',         email:'jitin@naturohabit.com'} ],
    stp: [ {name:'Shail Daswani',      role:'Co-founder & CEO',         email:'shail@flent.in'} ],
    ony: [ {name:'Krishti Sharma',     role:'ESG Liaison',              email:'krishti@onyadiamonds.com'} ],
    fct: [ {name:'Rajib Chatterjee',   role:'Finance',                  email:'rajib@firstclub.tech'} ],
    krv: [ {name:'Yash Goyal',         role:'Co-founder & CEO',         email:'yash@krvvy.com'} ],
    mip: [ {name:'Manu Kumar Mittal',  role:'Director',                 email:'manu@medchain.io'} ],
    uep: [ {name:'Aditya Mehra',       role:'Manager — Finance',        email:'aditya@uolo.com'} ],
    rcp: [ {name:'Pratik Saraogi',     role:'Head of Strategy',         email:'pratik@riyaana.com'} ],
    fvp: [ {name:'Mohit Jain',         role:'Business Head',            email:'mohit@fraternitas.in'} ],
    bhi: [ {name:'Sanju Khanna',       role:'Head of Treasury',         email:'sanju@balancehero.com'} ],
    gtp: [ {name:'Rimjim Deka',        role:'Director',                 email:'rimjim@goodtribe.in'} ],
    ahb: [ {name:'Harish',             role:'Accountant',               email:'harish@allhomebharat.com'} ],
    dhp: [ {name:'Harshit Kukreja',    role:'Co-Founder & Director',    email:'harshit@dunnwood.com'} ],
    hex: [ {name:'Ishan',              role:'Manager',                  email:'ishan@hexalog.com'} ],
    frn: [ {name:'Mahesh Majali',      role:'Director Finance',         email:'mahesh@furnishka.com'} ],
    zuv: [ {name:'Gaurav Jhajharia',   role:'Finance Director',         email:'gaurav@zuvio.tech'} ],
    plp: [ {name:'Bhisham Bhateja',    role:'Director',                 email:'bhisham@puresta.com'} ],
    sam: [ {name:'Mayur Rastogi',      role:'Senior Manager Finance',   email:'mayur@samast.tech'} ],
    ava: [ {name:'Ankit Khemka',       role:'Director',                 email:'ankit@avano.tech'} ],
    cwt: [ {name:'Naveen Jain',        role:'Head of Finance',          email:'naveen@centricity.in'} ],
    nbc: [ {name:'Ankesh Jain',        role:'Director',                 email:'ankesh@nothingbeforecoffee.in'} ],
    fwc: [ {name:'Sandeep Dey',        role:'VP & Head — Corp Dev',     email:'sandeep@flatwhite.capital'} ],
    urf: [ {name:'Raghavendra Degala', role:'Head, Investor Relations', email:'raghav@unrealfood.in'} ],
    swi: [ {name:'Yogendra',           role:'Manager — Business Fin',   email:'yogendra@swish.in'} ],
    mdo: [ {name:'Anisha V S',         role:'General Manager',          email:'anisha@mydesignation.com'} ],
    tap: [ {name:'Vikram Jain',        role:'Director',                 email:'vikram@theaterapparel.com'} ],
    ppl: [ {name:'Ananya Iyer',        role:'Sustainability Lead',      email:'ananya@protonas.in'} ],
    brw: [ {name:'Sahil Mehta',        role:'Founder',                  email:'sahil@brewbay.in'} ],
    cfp: [ {name:'Rajiv Pandey',       role:'Head of Compliance',       email:'rajiv@cashfree.com'} ],
    swm: [ {name:'Anushka Gupta',      role:'Operations Lead',          email:'anushka@scripbox.com'} ],
    giv: [ {name:'Ishendra Agarwal',   role:'Co-founder & CEO',         email:'ishendra@giva.co'} ],
    ipp: [ {name:'Devraj Sharma',      role:'Head of Operations',       email:'devraj@ionic.pro'} ],
  };

  // ============================================================
  // 6. STATE — answers persist across screens via localStorage
  // ============================================================
  const LS_KEY = 'halo-esg-state-v4-real-all';  // flushes prior state so the full Excel seed (all 32 cos) loads
  const loadStored = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
  };
  const persisted = loadStored();
  const STATE = {
    answers: persisted.answers || {},
    customContacts: persisted.customContacts || {},
    sendDraft: persisted.sendDraft || null,
    qaQuestions: persisted.qaQuestions || {}, // { [companyId]: [{ id, from, q, time, status, a?, repliedBy? }] }
    disabledQuestions: persisted.disabledQuestions || [], // master-form questions ESG has hidden
    customQuestions:   persisted.customQuestions   || [], // extra questions ESG added on top of the Excel set
    companyTiers:      persisted.companyTiers      || {}, // { [companyId]: 'L1' | 'L2' | 'L3' } set by deal team on send
  };
  const persist = () => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(STATE)); } catch {}
  };
  const setAnswer = (cid, qid, val) => {
    if (!STATE.answers[cid]) STATE.answers[cid] = {};
    STATE.answers[cid][qid] = val;
    persist();
  };

  // ── Form Builder helpers (ESG-only) ──
  const getActiveQuestions = () => {
    const disabled = new Set(STATE.disabledQuestions);
    return [...QUESTIONS.filter(q => !disabled.has(q.id)), ...STATE.customQuestions];
  };
  const toggleQuestionDisabled = (qid) => {
    const idx = STATE.disabledQuestions.indexOf(qid);
    if (idx >= 0) STATE.disabledQuestions.splice(idx, 1);
    else STATE.disabledQuestions.push(qid);
    persist();
  };
  const addCustomQuestion = (q) => {
    STATE.customQuestions.push({ ...q, custom: true, unscored: true });
    persist();
  };
  const removeCustomQuestion = (qid) => {
    STATE.customQuestions = STATE.customQuestions.filter(q => q.id !== qid);
    persist();
  };
  const setCompanyTier = (cid, tier) => {
    STATE.companyTiers[cid] = tier;
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
    SCORING: { TOPICS, QUESTIONS, computeScores, scoreQuestion, sectorKey, tierFromAmount, PASS_THRESHOLDS, getActiveQuestions },
    CONTACTS,
    STATE,
    persist,
    setAnswer,
    askQuestion,
    replyQuestion,
    toggleQuestionDisabled,
    addCustomQuestion,
    removeCustomQuestion,
    setCompanyTier,
  });

  // ============================================================
  // 8. REAL-COMPANY SEED — verbatim answers from the Stride Ventures
  //    ESG KPI Coverage Excel (sheet "New Portcos_Fund III & Fund IV").
  //    Only runs on first load (when localStorage is empty for v3-real).
  // ============================================================
  if (!persisted.answers || Object.keys(persisted.answers).length === 0) {
    const REAL_ANSWERS = {
      npl: {  // Naturohabit — 69.6 · L1
        water_sites: "2", water_consumption: "> 10,000 Kilolitres", water_initiatives: "4",
        water_saved: "5000 - 10,000 Kilolitres", energy_src: "Only Electricity Grid",
        energy_eff_init: "4 or more", energy_savings: 0, re_total_kwh: 0, re_pct: 0, scope12: "<500 tCO2",
        scope3: "No we do not track our Scope 3 emissions", ghg_init: "2", ghg_saved: "None of the above",
        haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "Yes", training_hrs: "40 - 60 hours  per employee", third_party_courses: "2",
        pct_women_org: 22, pct_women_blue: 10, pct_women_white: 12, pct_women_lead: 50, pct_diff_abled: 0,
        jobs_created: 84, women_hired: 50, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "4",
        safety_drills: "Once a month", csr_sectors: "1 to 3", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "<5 complaints", cr_turnaround: "1-3 days", policies: "7 to 10", certs: "0",
        esg_gov: "4 to 6", fines: "No", data_breaches: "less than 2 incidents", breach_resp: "Yes",
        data_laws: "Yes", rd_spend: "1% - 5%", supplier_metrics: "2",
      },
      stp: {  // Slaash (Flent) — 38.8 · L1
        water_sites: "None of the above", water_consumption: "We do not track this",
        water_initiatives: "None of the above", water_saved: "We do not track this",
        energy_src: "Only Electricity Grid",
        energy_eff_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        energy_savings: 0, re_total_kwh: 0, re_pct: 0, scope12: "We do not track this",
        scope3: "No we do not track our Scope 3 emissions", ghg_init: "None of the above",
        ghg_saved: "No emission savings yet",
        haz_dispose: "We dispose it through the local municipality/ through the municipal waste stream",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "No", training_hrs: "We do not track this", third_party_courses: "None of the above",
        pct_women_org: 20, pct_women_blue: 0, pct_women_white: 20, pct_women_lead: 5, pct_diff_abled: 0,
        jobs_created: 25, women_hired: 5, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "1",
        safety_drills: "We do not do this", csr_sectors: "0", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "20 - 50 complaints", cr_turnaround: "1-3 days", policies: "1 to 3", certs: "0",
        esg_gov: "0", fines: "No", data_breaches: "less than 2 incidents", breach_resp: "Yes",
        data_laws: "No", rd_spend: "1% - 5%", supplier_metrics: "1",
      },
      ony: { /* Onya Diamonds — 39.9 · L1 (no answers preserved) */ },
      fct: {  // FirstClub — 49.3 · L1
        water_sites: "2", water_consumption: "< 500 Kilolitres",
        water_initiatives: "Not yet implemented any initiatives but plan to do so in the current year",
        water_saved: "We do not track this", energy_src: "Only Electricity Grid", energy_eff_init: "1",
        energy_savings: 0, re_total_kwh: 0, re_pct: 0, scope12: "<500 tCO2",
        scope3: "No we do not track our Scope 3 emissions",
        ghg_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        ghg_saved: "No emission savings yet", haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "Yes", training_hrs: "<10 hours per employee", third_party_courses: "2",
        pct_women_org: 20, pct_women_blue: 10, pct_women_white: 20, pct_women_lead: 20, pct_diff_abled: 0,
        jobs_created: 0, women_hired: 0, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "2",
        safety_drills: "Annually", csr_sectors: "0", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "<5 complaints", cr_turnaround: "<1 day", policies: "1 to 3", certs: "0",
        esg_gov: "0", data_breaches: "less than 2 incidents", breach_resp: "Yes", data_laws: "Yes",
        rd_spend: "1% - 5%", supplier_metrics: "0",
      },
      krv: {  // Krvvy — 45.2 · L1
        water_sites: "Not yet tracked but plan to do so in the current year",
        water_consumption: "We do not track this",
        water_initiatives: "Not yet implemented any initiatives but plan to do so in the current year",
        water_saved: "We do not track this", energy_src: "Only Electricity Grid",
        energy_eff_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        re_total_kwh: 0, re_pct: 0, scope12: "We do not track this",
        scope3: "No we do not track our Scope 3 emissions",
        ghg_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        ghg_saved: "We do not have this data yet, but we plan to calculate our emission savings in the current year",
        haz_dispose: "We dispose it through the local municipality/ through the municipal waste stream",
        nonhaz_dispose: "We sell it to another industry/recycler directly", waste_reduce: "Yes",
        training_hrs: "<10 hours per employee",
        third_party_courses: "Not yet tracked but plan to do so in the current year", pct_women_org: 60,
        pct_women_blue: 0, pct_women_white: 60, pct_women_lead: 2, pct_diff_abled: 0, jobs_created: 3,
        women_hired: 3, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "1",
        safety_drills: "We do not do this", csr_sectors: "0", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "<5 complaints", cr_turnaround: "<1 day", policies: "0", certs: "0", esg_gov: "0",
        fines: "No", data_breaches: "We plan to start tracking this data in the current year",
        breach_resp: "No", data_laws: "No", rd_spend: "1% - 5%", supplier_metrics: "2",
      },
      mip: {  // Medchain — 56.3 · L1
        water_sites: "Not yet tracked but plan to do so in the current year",
        water_consumption: "We do not track this",
        water_initiatives: "Not yet implemented any initiatives but plan to do so in the current year",
        water_saved: "We do not track this",
        energy_src: "Mix of Grid & Captive/Group Captive/Open Access etc. agreements from primarily renewable sources (rooftop solar, wind, biomass etc.)",
        energy_eff_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        scope12: "We do not track this", scope3: "No we do not track our Scope 3 emissions",
        ghg_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        ghg_saved: "We do not have this data yet, but we plan to calculate our emission savings in the current year",
        haz_dispose: "We reuse/recycle/treat onsite", nonhaz_dispose: "We reuse/recycle/treat onsite",
        waste_reduce: "Yes", training_hrs: "We do not track this",
        third_party_courses: "Not yet tracked but plan to do so in the current year", pct_women_org: 25,
        pct_women_blue: 5, pct_women_white: 43, pct_women_lead: 0, pct_diff_abled: 0, jobs_created: 2,
        women_hired: 0, pwd_hired: 0, posh_redressal: "No", ohs_practices: "5+",
        safety_drills: "Once every 2-6 monhs", csr_sectors: "0", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "<5 complaints", cr_turnaround: "1-3 days", policies: "4 to 6", certs: "0",
        esg_gov: "1 to 3", data_breaches: "less than 2 incidents", breach_resp: "Yes", data_laws: "Yes",
        rd_spend: "1% - 5%", supplier_metrics: "2",
      },
      uep: {  // Uolo Edtech — 63.5 · L1
        water_sites: "2", water_consumption: "We do not track this", water_initiatives: "3",
        water_saved: "We do not track this",
        energy_src: "Mix of Grid & Captive/Group Captive/Open Access etc. agreements from primarily non-renewable sources (coal, natural gas, diesel, etc.)",
        energy_eff_init: "1", re_total_kwh: 0, re_pct: 0, scope12: "We do not track this",
        scope3: "No we do not track our Scope 3 emissions", ghg_init: "None of the above",
        ghg_saved: "None of the above", haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "Yes", training_hrs: "10 - 20 hours  per employee", third_party_courses: "2",
        pct_women_org: 24, pct_women_blue: 0, pct_women_white: 24, pct_women_lead: 20, pct_diff_abled: 0,
        jobs_created: 74, women_hired: 19, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "5+",
        safety_drills: "Once every 2-6 monhs", csr_sectors: "7 to 9", cr_compliance: "Yes",
        cr_feedback: "Yes", cr_complaints: "<5 complaints", cr_turnaround: "1-3 days", policies: "7 to 10",
        certs: "0", esg_gov: "1 to 3", fines: "No", data_breaches: "less than 2 incidents",
        breach_resp: "Yes", data_laws: "Yes", rd_spend: "5% - 10%", supplier_metrics: "4",
      },
      rcp: {  // Riyaana — 41.2 · L1
        water_sites: "None of the above", water_consumption: "We do not track this",
        water_initiatives: "None of the above", water_saved: "We do not track this",
        energy_src: "Only Electricity Grid", energy_eff_init: "1", energy_savings: 0, re_total_kwh: 0,
        re_pct: 0, scope12: "We do not track this", scope3: "No we do not track our Scope 3 emissions",
        ghg_init: "None of the above", ghg_saved: "None of the above",
        haz_dispose: "We do not have hazardous waste", nonhaz_dispose: "We do not have non-hazardous waste",
        waste_reduce: "No", training_hrs: "10 - 20 hours  per employee",
        third_party_courses: "None of the above", pct_women_org: 35, pct_women_blue: 23, pct_women_white: 12,
        pct_women_lead: 1, pct_diff_abled: 0, jobs_created: 30, women_hired: 10, pwd_hired: 0,
        posh_redressal: "Yes", ohs_practices: "1", safety_drills: "Once every 2-3 years", csr_sectors: "0",
        cr_compliance: "Yes", cr_feedback: "Yes", cr_complaints: "<5 complaints", cr_turnaround: "<1 day",
        policies: "1 to 3", certs: "0", esg_gov: "0", fines: "No", data_breaches: "less than 2 incidents",
        breach_resp: "Yes", data_laws: "No", rd_spend: "1% - 5%", supplier_metrics: "2",
      },
      fvp: {  // Fraternitas — 39.1 · L1
        water_sites: "None of the above", water_consumption: "We do not track this",
        water_initiatives: "Not yet implemented any initiatives but plan to do so in the current year",
        water_saved: "We do not track this", energy_src: "Only Electricity Grid",
        energy_eff_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        re_total_kwh: 0, re_pct: 0, scope12: "We do not track this",
        scope3: "No we do not track our Scope 3 emissions", ghg_init: "None of the above",
        ghg_saved: "None of the above", haz_dispose: "We sell it to another industry/recycler directly",
        nonhaz_dispose: "We sell it to another industry/recycler directly", waste_reduce: "Yes",
        training_hrs: "10 - 20 hours  per employee", third_party_courses: "None of the above",
        pct_women_org: 20, pct_women_blue: 0, pct_women_white: 25, pct_women_lead: 0, pct_diff_abled: 0,
        jobs_created: 50, women_hired: 1, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "2",
        safety_drills: "We do not do this", csr_sectors: "1 to 3", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "<5 complaints", cr_turnaround: "<1 day", policies: "1 to 3", certs: "0",
        esg_gov: "0", data_breaches: "less than 2 incidents", breach_resp: "Yes", data_laws: "No",
        rd_spend: "We do not spend money on R&D", supplier_metrics: "0",
      },
      bhi: {  // Balancehero — 40.0 · L3
        water_sites: "None of the above", water_consumption: "We do not track this",
        water_initiatives: "None of the above", water_saved: "We do not track this",
        energy_src: "Only Electricity Grid", energy_eff_init: "None of the above", energy_savings: 0,
        re_total_kwh: 0, re_pct: 0,
        scope12: "We do not have this data yet, but we plan to calculate our emissions in the current year",
        scope3: "We do not have this data yet, but we plan to calculate our emissions in the current year",
        ghg_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        ghg_saved: "We do not have this data yet, but we plan to calculate our emission savings in the current year",
        ghg_intensity: 0, haz_dispose: "None of the above",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "Yes", training_hrs: "We do not track this", third_party_courses: "None of the above",
        pct_women_org: 0, pct_women_blue: 0, pct_women_white: 0, pct_women_lead: 0, pct_diff_abled: 0,
        jobs_created: 0, women_hired: 100, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "5+",
        safety_drills: "We do not do this", csr_sectors: "1 to 3", cr_compliance: "Some of the standards",
        cr_feedback: "Yes", cr_complaints: "We do not track this", cr_turnaround: "N/A", policies: "4 to 6",
        certs: "2", esg_gov: "1 to 3", fines: "No", data_breaches: "We do not track this",
        breach_resp: "Yes", data_laws: "Yes", rd_spend: "<0.5%", supplier_metrics: "3", circular_yn: "Yes",
        circular_pct: 0, fin_underserved_pct: 0,
      },
      gtp: {  // Good Tribe — 58.2 · L2
        water_sites: "Not yet tracked but plan to do so in the current year",
        water_consumption: "We do not track this",
        water_initiatives: "Not yet implemented any initiatives but plan to do so in the current year",
        water_saved: "We do not track this", energy_src: "Only Electricity Grid", energy_eff_init: "2",
        re_total_kwh: 50,
        scope12: "We do not have this data yet, but we plan to calculate our emissions in the current year",
        scope3: "We do not have this data yet, but we plan to calculate our emissions in the current year",
        ghg_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        ghg_saved: "We do not have this data yet, but we plan to calculate our emission savings in the current year",
        haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "Yes", training_hrs: "We do not track this",
        third_party_courses: "Not yet tracked but plan to do so in the current year", pct_women_org: 27,
        pct_women_blue: 71, pct_women_white: 24, pct_women_lead: 2, pct_diff_abled: 10, jobs_created: 100,
        women_hired: 50, pwd_hired: 5, posh_redressal: "Yes", ohs_practices: "5+", safety_drills: "Annually",
        csr_sectors: "0", cr_compliance: "Yes", cr_feedback: "Yes", cr_complaints: "<5 complaints",
        cr_turnaround: "1-3 days", policies: "7 to 10", certs: "0", esg_gov: "0", fines: "No",
        data_breaches: "less than 2 incidents", breach_resp: "Yes", data_laws: "Yes", rd_spend: "<0.5%",
        supplier_metrics: "2",
      },
      ahb: {  // All Home Bharat — 26.3 · L1
        water_sites: "None of the above", water_consumption: "We do not track this",
        water_initiatives: "Not yet implemented any initiatives but plan to do so in the current year",
        water_saved: "We do not track this", energy_src: "Only Electricity Grid",
        energy_eff_init: "None of the above", re_total_kwh: 0, re_pct: 0, scope12: "We do not track this",
        scope3: "No we do not track our Scope 3 emissions", ghg_init: "None of the above",
        ghg_saved: "No emission savings yet",
        haz_dispose: "We dispose it through the local municipality/ through the municipal waste stream",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "No", training_hrs: "We do not track this", third_party_courses: "None of the above",
        pct_women_org: 30, pct_women_blue: 35, pct_women_white: 25, pct_women_lead: 5, pct_diff_abled: 0,
        jobs_created: 35, women_hired: 2, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "2",
        safety_drills: "Annually", csr_sectors: "0", cr_compliance: "Yes", cr_feedback: "No",
        cr_complaints: "We do not track this", cr_turnaround: "N/A", policies: "1 to 3", certs: "0",
        esg_gov: "0", fines: "No", data_breaches: "We do not track this", breach_resp: "No", data_laws: "No",
        rd_spend: "1% - 5%", supplier_metrics: "0",
      },
      dhp: {  // Dunnwood Health — 34.0 · L1
        water_sites: "Not yet tracked but plan to do so in the current year",
        water_consumption: "We do not track this",
        water_initiatives: "Not yet implemented any initiatives but plan to do so in the current year",
        water_saved: "We do not track this", energy_src: "Only Electricity Grid",
        energy_eff_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        scope12: "We do not track this", scope3: "No we do not track our Scope 3 emissions",
        ghg_init: "None of the above", ghg_saved: "None of the above",
        haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "No", training_hrs: "20 - 40 hours  per employee",
        third_party_courses: "Not yet tracked but plan to do so in the current year", pct_women_org: 0,
        pct_women_blue: 0, pct_women_white: 0, pct_women_lead: 0, pct_diff_abled: 0, jobs_created: 62,
        women_hired: 0, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "0",
        safety_drills: "We do not do this", csr_sectors: "0", cr_compliance: "Some of the standards",
        cr_feedback: "Yes", cr_complaints: "<5 complaints", cr_turnaround: "1-3 days", policies: "4 to 6",
        certs: "0", esg_gov: "0", fines: "No", data_breaches: "less than 2 incidents", breach_resp: "Yes",
        data_laws: "Yes", rd_spend: "0.5% - 1%", supplier_metrics: "0",
      },
      hex: {  // Hexalog — 54.4 · L1
        water_sites: "Not yet tracked but plan to do so in the current year",
        water_consumption: "We do not track this",
        water_initiatives: "Not yet implemented any initiatives but plan to do so in the current year",
        water_saved: "We do not track this", energy_src: "Only Electricity Grid",
        energy_eff_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        scope12: "We do not have this data yet, but we plan to calculate our emissions in the current year",
        scope3: "We do not have this data yet, but we plan to calculate our emissions in the current year",
        ghg_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        ghg_saved: "We do not have this data yet, but we plan to calculate our emission savings in the current year",
        haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We sell it to another industry/recycler directly", waste_reduce: "Yes",
        training_hrs: "20 - 40 hours  per employee",
        third_party_courses: "Not yet tracked but plan to do so in the current year", pct_women_org: 12,
        pct_women_blue: 5, pct_women_white: 25, pct_women_lead: 3.77, pct_diff_abled: 0, jobs_created: 300,
        women_hired: 20, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "5+", safety_drills: "Annually",
        csr_sectors: "1 to 3", cr_compliance: "Yes", cr_feedback: "Yes", cr_complaints: "5 - 10 complaints",
        cr_turnaround: "<1 day", policies: "4 to 6", certs: "2", esg_gov: "1 to 3",
        data_breaches: "We plan to start tracking this data in the current year", breach_resp: "Yes",
        data_laws: "Yes", rd_spend: "0.5% - 1%", supplier_metrics: "0",
      },
      frn: {  // Furnishka — 31.5 · L1
        water_sites: "None of the above", water_consumption: "We do not track this",
        water_initiatives: "None of the above", water_saved: "We do not track this",
        energy_src: "Only Electricity Grid", energy_eff_init: "None of the above", energy_savings: 0,
        re_total_kwh: 0, re_pct: 0, scope12: "We do not track this",
        scope3: "No we do not track our Scope 3 emissions", ghg_init: "None of the above",
        ghg_saved: "No emission savings yet", haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We sell it to another industry/recycler directly", waste_reduce: "No",
        training_hrs: "10 - 20 hours  per employee", third_party_courses: "None of the above",
        pct_women_org: 5, pct_women_blue: 0, pct_women_white: 10.57, pct_women_lead: 10, pct_diff_abled: 0,
        jobs_created: 100, women_hired: 6, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "0",
        safety_drills: "Annually", csr_sectors: "0", cr_compliance: "Some of the standards",
        cr_feedback: "Yes", cr_complaints: "<5 complaints", cr_turnaround: "1-3 days", policies: "4 to 6",
        certs: "0", esg_gov: "0", fines: "No", data_breaches: "less than 2 incidents", breach_resp: "Yes",
        data_laws: "No", rd_spend: "We do not spend money on R&D", supplier_metrics: "0",
      },
      zuv: {  // Zuvio — 50.5 · L1
        water_sites: "2", water_consumption: "< 500 Kilolitres", water_initiatives: "2",
        water_saved: "< 500 Kilolitres", energy_src: "Only Electricity Grid", energy_eff_init: "2",
        scope12: "<500 tCO2", scope3: "No we do not track our Scope 3 emissions",
        ghg_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        ghg_saved: "We do not have this data yet, but we plan to calculate our emission savings in the current year",
        haz_dispose: "We dispose it through the local municipality/ through the municipal waste stream",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "Yes", training_hrs: "10 - 20 hours  per employee", third_party_courses: "2",
        pct_women_org: 30, pct_women_blue: 10, pct_women_white: 20, pct_women_lead: 10, pct_diff_abled: 0,
        jobs_created: 30, women_hired: 0, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "3",
        safety_drills: "Annually", csr_sectors: "0", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "<5 complaints", cr_turnaround: "1-3 days", policies: "4 to 6", certs: "0",
        esg_gov: "0", fines: "No", data_breaches: "We plan to start tracking this data in the current year",
        breach_resp: "No", data_laws: "No", rd_spend: ">10%", supplier_metrics: "0",
      },
      plp: {  // Puresta — 41.0 · L1
        water_sites: "2", water_consumption: "We do not track this", water_initiatives: "None of the above",
        water_saved: "We do not track this",
        energy_src: "Mix of Grid & Captive/Group Captive/Open Access etc. agreements from primarily renewable sources (rooftop solar, wind, biomass etc.)",
        energy_eff_init: "None of the above", re_total_kwh: 0, re_pct: 0, scope12: "We do not track this",
        scope3: "No we do not track our Scope 3 emissions", ghg_init: "None of the above",
        ghg_saved: "None of the above", haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We do not have non-hazardous waste", waste_reduce: "No",
        training_hrs: "We do not track this", third_party_courses: "2", pct_women_org: 23.33,
        pct_women_blue: 0, pct_women_white: 23.33, pct_women_lead: 3.33, pct_diff_abled: 0, jobs_created: 0,
        women_hired: 0, pwd_hired: 0, posh_redressal: "No", ohs_practices: "4", safety_drills: "Annually",
        csr_sectors: "0", cr_compliance: "Some of the standards", cr_feedback: "Yes",
        cr_complaints: "<5 complaints", cr_turnaround: "1-3 days", policies: "4 to 6", certs: "0",
        esg_gov: "0", fines: "No", data_breaches: "We do not track this", breach_resp: "Yes",
        data_laws: "No", rd_spend: "1% - 5%", supplier_metrics: "1",
      },
      sam: {  // Samast — 45.3 · L3
        water_sites: "2", water_consumption: "< 500 Kilolitres", water_initiatives: "2",
        water_saved: "< 500 Kilolitres", energy_src: "Only Electricity Grid",
        energy_eff_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        re_total_kwh: 0, re_pct: 0, scope12: "We do not track this",
        scope3: "No we do not track our Scope 3 emissions", ghg_init: "None of the above",
        ghg_saved: "None of the above", haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We do not have non-hazardous waste", waste_reduce: "No",
        training_hrs: "10 - 20 hours  per employee", third_party_courses: "2", pct_women_org: 40,
        pct_women_blue: 0, pct_women_white: 40, pct_women_lead: 2, pct_diff_abled: 0, jobs_created: 500,
        women_hired: 50, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "2", safety_drills: "Annually",
        csr_sectors: "0", cr_compliance: "Yes", cr_feedback: "Yes", cr_complaints: "10 - 20 complaints",
        cr_turnaround: "<1 day", policies: "1 to 3", certs: "2", esg_gov: "1 to 3", fines: "No",
        data_breaches: "less than 2 incidents", breach_resp: "Yes", data_laws: "Yes",
        rd_spend: "We do not spend money on R&D", supplier_metrics: "2",
      },
      ava: {  // Avano — 31.3 · L1
        water_sites: "None of the above", water_consumption: "< 500 Kilolitres",
        water_initiatives: "None of the above", water_saved: "We do not track this",
        energy_src: "Only Electricity Grid", energy_eff_init: "None of the above", energy_savings: 0,
        re_total_kwh: 0, re_pct: 0, scope12: "We do not track this",
        scope3: "No we do not track our Scope 3 emissions", ghg_init: "None of the above",
        ghg_saved: "None of the above", ghg_intensity: 0, haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We do not have non-hazardous waste", waste_reduce: "No",
        training_hrs: "<10 hours per employee", third_party_courses: "None of the above", pct_women_org: 10,
        pct_women_blue: 0, pct_women_white: 10, pct_women_lead: 0, pct_diff_abled: 0, jobs_created: 0,
        women_hired: 0, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "1",
        safety_drills: "We do not do this", csr_sectors: "0", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "<5 complaints", cr_turnaround: "7-14 days", policies: "1 to 3", certs: "0",
        esg_gov: "1 to 3", fines: "No", data_breaches: "We do not track this", breach_resp: "No",
        data_laws: "No", rd_spend: "We do not spend money on R&D", supplier_metrics: "2",
      },
      cwt: {  // Centricity — 41.0 · L3
        water_sites: "None of the above", water_consumption: "We do not track this",
        water_initiatives: "None of the above", water_saved: "We do not track this",
        energy_src: "Only Electricity Grid", energy_eff_init: "1", scope12: "We do not track this",
        scope3: "No we do not track our Scope 3 emissions", ghg_init: "None of the above",
        ghg_saved: "None of the above", haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "No", training_hrs: "20 - 40 hours  per employee",
        third_party_courses: "None of the above", pct_women_org: 20, pct_women_blue: 10, pct_women_white: 90,
        pct_women_lead: 30, pct_diff_abled: 2, jobs_created: 150, women_hired: 30, pwd_hired: 5,
        posh_redressal: "Yes", ohs_practices: "3", safety_drills: "Once every 2-6 monhs", csr_sectors: "0",
        cr_compliance: "Yes", cr_feedback: "Yes", cr_complaints: "<5 complaints", cr_turnaround: "3-7 days",
        policies: "4 to 6", certs: "0", esg_gov: "0", data_breaches: "less than 2 incidents",
        breach_resp: "Yes", data_laws: "Yes", rd_spend: "We do not spend money on R&D",
        supplier_metrics: "0",
      },
      nbc: {  // Nothing Before Coffee — 65.5 · L1
        water_sites: "3", water_consumption: "1000 - 5000 Kilolitres", water_initiatives: "3",
        water_saved: "1000 - 5000 Kilolitres", energy_src: "Only Electricity Grid", energy_eff_init: "2",
        energy_savings: 50000, re_pct: 5,
        scope12: "We do not have this data yet, but we plan to calculate our emissions in the current year",
        scope3: "We do not have this data yet, but we plan to calculate our emissions in the current year",
        ghg_init: "1",
        ghg_saved: "We do not have this data yet, but we plan to calculate our emission savings in the current year",
        haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "Yes", training_hrs: "10 - 20 hours  per employee", third_party_courses: "3",
        pct_women_org: 25, pct_women_blue: 15, pct_women_white: 10, pct_women_lead: 10, pct_diff_abled: 1,
        jobs_created: 85, women_hired: 40, pwd_hired: 2, posh_redressal: "Yes", ohs_practices: "1",
        safety_drills: "Annually", csr_sectors: "7 to 9", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "<5 complaints", cr_turnaround: "1-3 days", policies: "4 to 6", certs: "1",
        esg_gov: "1 to 3", fines: "No", data_breaches: "less than 2 incidents", breach_resp: "Yes",
        data_laws: "Yes", rd_spend: "1% - 5%", supplier_metrics: "1",
      },
      fwc: {  // Flat White — 64.4 · L1
        water_sites: "Not yet tracked but plan to do so in the current year",
        water_consumption: "We do not track this",
        water_initiatives: "Not yet implemented any initiatives but plan to do so in the current year",
        water_saved: "We do not track this", energy_src: "Only Electricity Grid", energy_eff_init: "2",
        re_total_kwh: 0, re_pct: 0, scope12: "<500 tCO2", scope3: "No we do not track our Scope 3 emissions",
        ghg_init: "None of the above", ghg_saved: "None of the above",
        haz_dispose: "We do not have hazardous waste", nonhaz_dispose: "We do not have non-hazardous waste",
        waste_reduce: "Yes", training_hrs: ">60 hours  per employee",
        third_party_courses: "Not yet tracked but plan to do so in the current year", pct_women_org: 29,
        pct_women_blue: 33, pct_women_white: 29, pct_women_lead: 25, pct_diff_abled: 0, jobs_created: 100,
        women_hired: 30, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "5+",
        safety_drills: "Once every 2-6 monhs", csr_sectors: "0", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "<5 complaints", cr_turnaround: "<1 day", policies: "7 to 10", certs: "3",
        esg_gov: "0", fines: "No", data_breaches: "less than 2 incidents", breach_resp: "Yes",
        data_laws: "Yes", rd_spend: ">10%", supplier_metrics: "0", fin_underserved_pct: 100,
      },
      urf: {  // Unreal Food — 29.2 · L1
        water_sites: "2", water_consumption: "< 500 Kilolitres", water_initiatives: "4",
        water_saved: "< 500 Kilolitres", energy_src: "Only Electricity Grid",
        energy_eff_init: "None of the above", re_total_kwh: 0, re_pct: 0,
        scope12: "We do not have this data yet, but we plan to calculate our emissions in the current year",
        scope3: "No we do not track our Scope 3 emissions", ghg_init: "None of the above",
        ghg_saved: "We do not have this data yet, but we plan to calculate our emission savings in the current year",
        haz_dispose: "We dispose it through the local municipality/ through the municipal waste stream",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "Yes", training_hrs: "We do not track this", third_party_courses: "2",
        pct_women_org: 12, pct_women_blue: 17, pct_women_white: 0, pct_women_lead: 0, pct_diff_abled: 0,
        jobs_created: 0, women_hired: 0, pwd_hired: 0, posh_redressal: "No", ohs_practices: "1",
        safety_drills: "We do not do this", csr_sectors: "0", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "<5 complaints", cr_turnaround: "1-3 days", policies: "0", certs: "0", esg_gov: "0",
        fines: "No", data_breaches: "We do not track this", breach_resp: "No", data_laws: "No",
        rd_spend: "0.5% - 1%", supplier_metrics: "0",
      },
      swi: {  // Swish — 53.0 · L1
        water_sites: "2", water_consumption: "5000 - 10,000 Kilolitres", water_initiatives: "2",
        water_saved: "< 500 Kilolitres", energy_src: "Only Electricity Grid", energy_eff_init: "1",
        re_total_kwh: 0, re_pct: 0,
        scope12: "We do not have this data yet, but we plan to calculate our emissions in the current year",
        scope3: "We do not have this data yet, but we plan to calculate our emissions in the current year",
        ghg_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        ghg_saved: "We do not have this data yet, but we plan to calculate our emission savings in the current year",
        haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "Yes", training_hrs: "20 - 40 hours  per employee", third_party_courses: "2",
        pct_women_org: 15, pct_women_blue: 12, pct_women_white: 20, pct_women_lead: 15, pct_diff_abled: 0,
        jobs_created: 700, women_hired: 100, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "5+",
        safety_drills: "Once every 2-6 monhs", csr_sectors: "0", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "10 - 20 complaints", cr_turnaround: "<1 day", policies: "4 to 6", certs: "0",
        esg_gov: "0", data_breaches: "less than 2 incidents", breach_resp: "Yes", data_laws: "No",
        rd_spend: "<0.5%", supplier_metrics: "1",
      },
      mdo: {  // My Designation — 32.6 · L1
        water_sites: "None of the above", water_consumption: "We do not track this",
        water_initiatives: "None of the above", water_saved: "We do not track this",
        energy_src: "Only Electricity Grid", energy_eff_init: "None of the above", energy_savings: 0,
        re_total_kwh: 0, re_pct: 0, scope12: "We do not track this",
        scope3: "No we do not track our Scope 3 emissions", ghg_init: "None of the above",
        ghg_saved: "None of the above", ghg_intensity: 0,
        haz_dispose: "We dispose it through the local municipality/ through the municipal waste stream",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "Yes", training_hrs: "We do not track this", third_party_courses: "None of the above",
        pct_women_org: 60, pct_women_blue: 15, pct_women_white: 25, pct_women_lead: 5, pct_diff_abled: 0,
        jobs_created: 15, women_hired: 5, pwd_hired: 10, posh_redressal: "Yes", ohs_practices: "0",
        safety_drills: "We do not do this", csr_sectors: "1 to 3", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "We do not track this", cr_turnaround: "1-3 days", policies: "1 to 3", certs: "0",
        esg_gov: "0", data_breaches: "We do not track this", breach_resp: "Yes", data_laws: "No",
        rd_spend: "0.5% - 1%", supplier_metrics: "0",
      },
      tap: {  // Theater Apparel — 62.2 · L1
        water_sites: "Not yet tracked but plan to do so in the current year",
        water_consumption: "< 500 Kilolitres",
        water_initiatives: "Not yet implemented any initiatives but plan to do so in the current year",
        water_saved: "< 500 Kilolitres", energy_src: "Only Electricity Grid", energy_eff_init: "1",
        re_total_kwh: 0, re_pct: 0,
        scope12: "We do not have this data yet, but we plan to calculate our emissions in the current year",
        scope3: "We do not have this data yet, but we plan to calculate our emissions in the current year",
        ghg_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        ghg_saved: "We do not have this data yet, but we plan to calculate our emission savings in the current year",
        haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "Yes", training_hrs: "<10 hours per employee",
        third_party_courses: "Not yet tracked but plan to do so in the current year", pct_women_org: 42,
        pct_women_blue: 39, pct_women_white: 44, pct_women_lead: 22, pct_diff_abled: 0, jobs_created: 62,
        women_hired: 27, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "4",
        safety_drills: "Once every 2-6 monhs", csr_sectors: "1 to 3", cr_compliance: "Yes",
        cr_feedback: "Yes", cr_complaints: "<5 complaints", cr_turnaround: "<1 day", policies: "4 to 6",
        certs: "0", esg_gov: "0", fines: "No", data_breaches: "less than 2 incidents", breach_resp: "Yes",
        data_laws: "Yes", rd_spend: "1% - 5%", supplier_metrics: "2",
      },
      ppl: {  // Protonas — submitted · L1
        water_sites: "None of the above", water_consumption: "We do not track this",
        water_initiatives: "None of the above", water_saved: "We do not track this",
        energy_src: "Only Electricity Grid", energy_eff_init: "None of the above", energy_savings: 0,
        re_total_kwh: 0, re_pct: 0, scope12: "We do not track this",
        scope3: "No we do not track our Scope 3 emissions", ghg_init: "None of the above",
        ghg_saved: "No emission savings yet", haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "No", training_hrs: "10 - 20 hours  per employee",
        third_party_courses: "None of the above", pct_women_org: 22, pct_women_blue: 0, pct_women_white: 22,
        pct_women_lead: 0, pct_diff_abled: 0, jobs_created: 5, women_hired: 0, pwd_hired: 5,
        posh_redressal: "Yes", ohs_practices: "3", safety_drills: "Annually", csr_sectors: "0",
        cr_compliance: "Yes", cr_feedback: "No", cr_complaints: "<5 complaints", cr_turnaround: "N/A",
        policies: "1 to 3", certs: "0", esg_gov: "0", fines: "No", data_breaches: "less than 2 incidents",
        breach_resp: "Yes", data_laws: "Yes", rd_spend: ">10%", supplier_metrics: "1", circular_yn: "No",
        circular_pct: 0,
      },
      brw: {  // Brewbay — submitted · L1
        water_sites: "1", water_consumption: "< 500 Kilolitres", water_initiatives: "None of the above",
        water_saved: "We do not track this", energy_src: "Only Electricity Grid", energy_eff_init: "3",
        scope12: "We do not track this", scope3: "No we do not track our Scope 3 emissions",
        ghg_init: "None of the above", ghg_saved: "None of the above",
        haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "Yes", training_hrs: "20 - 40 hours  per employee", third_party_courses: "1",
        pct_women_org: 32, pct_women_blue: 27, pct_women_white: 5, pct_women_lead: 1, pct_diff_abled: 1,
        jobs_created: 102, women_hired: 33, pwd_hired: 1, posh_redressal: "Yes", ohs_practices: "3",
        safety_drills: "Annually", csr_sectors: "0", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "50+", cr_turnaround: "1-3 days", policies: "4 to 6", certs: "0", esg_gov: "0",
        fines: "No", data_breaches: "less than 2 incidents", breach_resp: "Yes", data_laws: "Yes",
        rd_spend: "0.5% - 1%", supplier_metrics: "1",
      },
      cfp: {  // Cashfree — submitted · L3
        water_sites: "Not yet tracked but plan to do so in the current year",
        water_consumption: "We do not track this", water_initiatives: "None of the above",
        water_saved: "We do not track this",
        energy_src: "Mix of Grid & Captive/Group Captive/Open Access etc. agreements from primarily renewable sources (rooftop solar, wind, biomass etc.)",
        energy_eff_init: "None of the above", energy_savings: 0, re_total_kwh: 0, re_pct: 0,
        scope12: "We do not track this", scope3: "No we do not track our Scope 3 emissions",
        ghg_init: "None of the above", ghg_saved: "None of the above", ghg_intensity: 0,
        haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "No", training_hrs: "10 - 20 hours  per employee",
        third_party_courses: "Not yet tracked but plan to do so in the current year", pct_women_org: 25,
        pct_women_blue: 0, pct_women_white: 25, pct_women_lead: 20, pct_diff_abled: 0, jobs_created: 1500,
        women_hired: 95, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "0",
        safety_drills: "We do not do this", csr_sectors: "1 to 3", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "5 - 10 complaints", cr_turnaround: "1-3 days", policies: "7 to 10", certs: "2",
        esg_gov: "0", fines: "No", data_breaches: "less than 2 incidents", breach_resp: "Yes",
        data_laws: "Yes", rd_spend: "5% - 10%", supplier_metrics: "0", circular_yn: "No", circular_pct: 0,
        fin_underserved_pct: 4,
      },
      swm: {  // Scripbox — submitted · L2
        water_sites: "None of the above", water_consumption: "We do not track this",
        water_initiatives: "None of the above", water_saved: "We do not track this",
        energy_src: "Only Electricity Grid", energy_eff_init: "None of the above", energy_savings: 0,
        re_total_kwh: 0, re_pct: 0, scope12: "We do not track this",
        scope3: "No we do not track our Scope 3 emissions", ghg_init: "None of the above",
        ghg_saved: "None of the above", haz_dispose: "We do not have hazardous waste",
        nonhaz_dispose: "We dispose it thorugh the local municipality/ through the municipal waste stream",
        waste_reduce: "No", training_hrs: "We do not track this", third_party_courses: "None of the above",
        pct_women_org: 32, pct_women_blue: 0, pct_women_white: 32, pct_women_lead: 1, pct_diff_abled: 0,
        jobs_created: 20, women_hired: 10, pwd_hired: 0, posh_redressal: "Yes", ohs_practices: "5+",
        safety_drills: "Annually", csr_sectors: "0", cr_compliance: "Yes", cr_feedback: "Yes",
        cr_complaints: "20 - 50 complaints", cr_turnaround: "<1 day", policies: "1 to 3", certs: "1",
        esg_gov: "0", fines: "No", data_breaches: "less than 2 incidents", breach_resp: "Yes",
        data_laws: "Yes", rd_spend: "5% - 10%", supplier_metrics: "0", circular_yn: "No",
      },
      giv: {  // GIVA — 64% in progress · L2
        water_saved: "We do not track this",
        energy_src: "Mix of Grid & Captive/Group Captive/Open Access etc. agreements from primarily renewable sources (rooftop solar, wind, biomass etc.)",
        ghg_init: "1",
        ghg_saved: "We do not have this data yet, but we plan to calculate our emission savings in the current year",
        haz_dispose: "We sell it to another industry/recycler directly",
        nonhaz_dispose: "We sell it to another industry/recycler directly", waste_reduce: "Yes",
        pct_women_org: 30, pct_women_white: 20, pct_women_lead: 8, pct_diff_abled: 2, jobs_created: 800,
        women_hired: 200, pwd_hired: 16, posh_redressal: "Yes", ohs_practices: "4",
        safety_drills: "Once every 2-6 monhs", cr_compliance: "Some of the standards", cr_feedback: "Yes",
        cr_complaints: "<5 complaints", cr_turnaround: "1-3 days", policies: "4 to 6", esg_gov: "0",
        fines: "No", data_breaches: "less than 2 incidents", breach_resp: "Yes",
      },
      ipp: {  // Ionic — 22% in progress · L1
        water_sites: "2",
        ghg_init: "We have not yet implemented any initiatives but plan to do so in the current year",
        waste_reduce: "Yes", training_hrs: "<10 hours per employee", third_party_courses: "2",
        pct_women_org: 40, cr_compliance: "Yes", certs: "2",
      },
    };
    Object.entries(REAL_ANSWERS).forEach(([cid, payload]) => {
      STATE.answers[cid] = { ...payload };
    });

    // Pre-populate tier choices the deal team made when sending each survey,
    // matched to the actual L1/L2/L3 column from the Excel scoring sheet.
    STATE.companyTiers = {
      npl:'L1', stp:'L1', ony:'L1', fct:'L1', krv:'L1', mip:'L1', uep:'L1', rcp:'L1',
      fvp:'L1', bhi:'L3', gtp:'L2', ahb:'L1', dhp:'L1', hex:'L1', frn:'L1', zuv:'L1',
      plp:'L1', sam:'L3', ava:'L1', cwt:'L3', nbc:'L1', fwc:'L1', urf:'L1', swi:'L1',
      mdo:'L1', tap:'L1',
      ppl:'L1', brw:'L1', cfp:'L3', swm:'L2', giv:'L2', ipp:'L1',
    };
    persist();
  }
})();
