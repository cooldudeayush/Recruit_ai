// src/data/seed.js
export const DEFAULT_ROLES = [
  {
    id: 'swe',
    title: 'Software Engineer (Backend)',
    department: 'Engineering',
    jd: 'Design and build scalable backend systems, APIs, and distributed services. Responsible for performance, reliability, and code quality. Works with microservices, cloud infrastructure, and high-throughput data pipelines.',
    areas: 'System Design, REST APIs, Algorithms, Databases, Scalability, DevOps, Cloud',
    benchmark: { relevance: 78, depth: 76, clarity: 72, correctness: 80 },
    color: '#4F6EF7'
  },
  {
    id: 'ds',
    title: 'Data Scientist / ML Engineer',
    department: 'Data Science',
    jd: 'Build and deploy machine learning models at scale. Work with large datasets, run experiments, and translate analytical insights into measurable business impact. Owns the full ML lifecycle from data exploration to production monitoring.',
    areas: 'Python, Machine Learning, Deep Learning, Statistics, SQL, MLOps, Feature Engineering',
    benchmark: { relevance: 76, depth: 82, clarity: 68, correctness: 80 },
    color: '#8B5CF6'
  },
  {
    id: 'pm',
    title: 'Product Manager',
    department: 'Product',
    jd: 'Define product vision and own the roadmap. Drive cross-functional teams across engineering, design, and business to deliver customer-centric solutions with measurable impact. Balance user needs, business goals, and technical constraints.',
    areas: 'Product Strategy, Roadmapping, Analytics, Agile, Stakeholder Management, User Research',
    benchmark: { relevance: 80, depth: 72, clarity: 82, correctness: 70 },
    color: '#10B981'
  }
]

export const DEFAULT_QUESTIONS = [
  // ─── SWE INTRO ───
  { id: 'q1', roleId: 'swe', stage: 'intro', difficulty: 'easy',
    text: 'Walk me through your backend engineering background and the most impactful system you have built.',
    answer: 'Tech stack, years of experience, scale handled, business impact, personal contributions, key challenges overcome.' },
  { id: 'q2', roleId: 'swe', stage: 'intro', difficulty: 'easy',
    text: 'Why are you interested in this backend role, and what excites you about working here?',
    answer: 'Motivation, company alignment, career trajectory, genuine enthusiasm.' },
  { id: 'q3', roleId: 'swe', stage: 'intro', difficulty: 'easy',
    text: 'Describe your typical development workflow from requirements to production deployment.',
    answer: 'Agile/Scrum process, design doc, PR reviews, CI/CD pipeline, feature flags, monitoring, on-call rotation.' },

  // ─── SWE TECHNICAL ───
  { id: 'q4', roleId: 'swe', stage: 'technical', difficulty: 'medium',
    text: 'Design a URL shortening service like bit.ly that must handle 100 million URLs and 1 billion redirects per month.',
    answer: 'Base62 hash, unique ID generation (Snowflake-style), Redis caching for hot URLs, DB schema (short_code → long_url + analytics), sharding strategy, CDN for redirects, 301 vs 302 trade-off, rate limiting abuse prevention, analytics async pipeline.' },
  { id: 'q5', roleId: 'swe', stage: 'technical', difficulty: 'medium',
    text: 'Explain the CAP theorem. Give a real example where you had to consciously choose between consistency and availability.',
    answer: 'C=all nodes return same data, A=every request returns response, P=system functions despite network partition. Can only guarantee 2 of 3. Example: e-commerce cart tolerates stale data (AP), banking ledger must be consistent (CP). Mention PACELC extension for deeper credit.' },
  { id: 'q6', roleId: 'swe', stage: 'technical', difficulty: 'hard',
    text: 'Design a distributed rate limiter that works correctly across 20 API server instances with sub-millisecond overhead.',
    answer: 'Sliding window log or token bucket algorithm, shared Redis with Lua script for atomic INCR+EXPIRE, keys by IP/user/API-key, 429 response with Retry-After header, per-tier quotas, Redis cluster for HA, circuit breaker for Redis failure fallback, approximate counting trade-off.' },
  { id: 'q7', roleId: 'swe', stage: 'technical', difficulty: 'hard',
    text: 'A critical database query went from 200ms to 8 seconds after a data growth event. Walk through your complete debugging and optimization process.',
    answer: 'EXPLAIN ANALYZE to identify seq scans, check index usage, add covering/partial index, identify N+1 queries, consider query rewrite, table partitioning, read replica offload, result caching (Redis), connection pooling tuning, query timeout safety net.' },

  // ─── SWE BEHAVIORAL ───
  { id: 'q8', roleId: 'swe', stage: 'behavioral', difficulty: 'medium',
    text: 'Tell me about a production incident you personally led the response for. What was your process and what changed afterwards?',
    answer: 'STAR format: detection/alerting, triage steps, communication cadence, fix vs rollback decision, timeline, post-mortem with blameless culture, process/monitoring improvements.' },
  { id: 'q9', roleId: 'swe', stage: 'behavioral', difficulty: 'medium',
    text: 'Describe a time you pushed back on a product or engineering decision you believed was technically flawed. What happened?',
    answer: 'Respectful disagreement backed by data, alternative proposals with trade-off analysis, knowing when to escalate, final outcome, relationship preserved.' },
  { id: 'q10', roleId: 'swe', stage: 'behavioral', difficulty: 'medium',
    text: 'How do you personally balance paying down technical debt against shipping new product features?',
    answer: '20% rule or dedicated sprint capacity, debt backlog tracking, quantifying cost of debt in engineer-hours, communicating urgency to PM, Boy Scout rule for incremental improvements.' },

  // ─── DS INTRO ───
  { id: 'q11', roleId: 'ds', stage: 'intro', difficulty: 'easy',
    text: 'Describe your data science background and the machine learning model that has had the most real-world business impact.',
    answer: 'Education path, tools/frameworks, domain expertise, specific model (not just "did NLP"), measurable business outcome, production considerations.' },
  { id: 'q12', roleId: 'ds', stage: 'intro', difficulty: 'easy',
    text: 'Walk me through your end-to-end workflow for an ML project from business problem to production deployment.',
    answer: 'Problem framing, data audit, EDA, feature engineering, model selection rationale, cross-validation strategy, evaluation metrics aligned to business goal, deployment approach, monitoring and drift detection.' },

  // ─── DS TECHNICAL ───
  { id: 'q13', roleId: 'ds', stage: 'technical', difficulty: 'medium',
    text: 'Explain the bias-variance trade-off. For a model showing high variance, walk through every tool you would use to fix it.',
    answer: 'Bias=underfitting, variance=overfitting. High variance fixes: L1/L2/Elastic Net regularisation, dropout (NNs), reduce feature count, get more data, cross-validation, bagging/ensemble, early stopping, simpler architecture.' },
  { id: 'q14', roleId: 'ds', stage: 'technical', difficulty: 'hard',
    text: 'Design a complete ML system for real-time fraud detection at a bank processing 10,000 transactions per second. Cover the full stack from features to monitoring.',
    answer: 'Streaming features (Kafka → Feature Store), behavioral velocity features, GBM model for low latency (<100ms), online vs batch scoring trade-off, champion-challenger deployment, SHAP for explainability/compliance, feedback loop for label collection, concept drift monitoring, model retraining pipeline.' },
  { id: 'q15', roleId: 'ds', stage: 'technical', difficulty: 'hard',
    text: 'Your fraud model has 99% accuracy and stakeholders are thrilled, but the head of risk is worried. What might be wrong and how do you diagnose it?',
    answer: 'Class imbalance: 99% baseline = always predict legit. Switch to precision-recall AUC, F1, confusion matrix. SMOTE or class weights, threshold tuning for recall vs precision business trade-off, check for label leakage, evaluate on held-out time window.' },

  // ─── DS BEHAVIORAL ───
  { id: 'q16', roleId: 'ds', stage: 'behavioral', difficulty: 'medium',
    text: 'Tell me about a time a deployed model behaved unexpectedly in production. How did you detect, debug, and resolve it?',
    answer: 'Monitoring alert triggered (data drift, prediction shift), root cause (distribution change, upstream data issue, label quality), retraining or rollback decision, communication to stakeholders, improved monitoring as outcome.' },
  { id: 'q17', roleId: 'ds', stage: 'behavioral', difficulty: 'medium',
    text: 'How do you explain model uncertainty and trade-offs to a non-technical business stakeholder who just wants a simple answer?',
    answer: 'Business-language framing, scenario analysis (best/expected/worst), visual aids, precision-recall as business language (cost of false positive vs false negative), confidence intervals without jargon, actionable recommendation.' },

  // ─── PM INTRO ───
  { id: 'q18', roleId: 'pm', stage: 'intro', difficulty: 'easy',
    text: 'Tell me about a product you have owned from 0 to launch. What was your role and what did you actually ship?',
    answer: 'Discovery process, defining the problem, vision articulation, roadmap creation, cross-functional coordination, launch plan, measurable outcome (adoption, revenue, NPS).' },
  { id: 'q19', roleId: 'pm', stage: 'intro', difficulty: 'easy',
    text: 'How do you define success for a product, and how do you choose which metrics actually matter?',
    answer: 'North-star metric tied to user value, leading vs lagging indicators, avoiding vanity metrics (downloads ≠ engagement), business goals alignment, guardrail metrics to prevent gaming.' },

  // ─── PM TECHNICAL ───
  { id: 'q20', roleId: 'pm', stage: 'technical', difficulty: 'medium',
    text: 'You have 20 feature requests and engineering capacity for only 3 this quarter. Walk me through your full prioritisation framework.',
    answer: 'RICE or ICE scoring, strategic theme alignment, user research validation, effort estimation with eng team, business impact quantification, stakeholder communication with documented rationale, what NOT to build and why.' },
  { id: 'q21', roleId: 'pm', stage: 'technical', difficulty: 'hard',
    text: "Uber's ride completion rate dropped 20% in one city overnight. You're the PM — walk through your entire diagnostic and response process.",
    answer: 'Funnel breakdown (request→match→pickup→complete), segment by city/device/OS/driver type/time, compare to control cities, check recent deploys and experiments, supply vs demand mismatch analysis, driver-side vs rider-side issue isolation, data-driven hypothesis, escalation with war room if P0.' },
  { id: 'q22', roleId: 'pm', stage: 'technical', difficulty: 'hard',
    text: 'Design a notification system for a super-app with 50 million daily active users across 12 countries.',
    answer: 'Channel mix (push/SMS/email/in-app), frequency capping to prevent fatigue, user preference centre, personalisation engine, time-zone awareness, A/B testing framework, delivery + open-rate tracking, GDPR/CAN-SPAM opt-out compliance, graceful degradation if push fails.' },

  // ─── PM BEHAVIORAL ───
  { id: 'q23', roleId: 'pm', stage: 'behavioral', difficulty: 'medium',
    text: "Tell me about a product or major feature you championed that you ultimately had to kill. How did you handle it?",
    answer: 'Data-driven kill decision (not ego-driven), team communication with transparency, stakeholder management, learning documented, forward momentum maintained, no blame culture.' },
  { id: 'q24', roleId: 'pm', stage: 'behavioral', difficulty: 'medium',
    text: 'How do you handle a situation where engineering, design, and sales all want different things from the next sprint?',
    answer: 'Shared prioritisation framework, neutral facilitation, executive alignment when needed, documented trade-offs for each stakeholder, transparent rationale, follow-up communication, preserving relationships.' }
]
