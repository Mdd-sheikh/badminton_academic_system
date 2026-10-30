import React, { useEffect, useState } from "react";
import "./Home.css";

/*
 * SmashPoint Academy — Home page
 * ---------------------------------------------------------
 * This page intentionally does NOT include the global Navbar or Footer.
 * Render it between your existing <Navbar /> and <Footer /> components.
 *
 * Backend integration notes:
 * 1. Replace the sample stats, plans, coaches and testimonials with API data.
 * 2. Connect the enquiry form to your lead/enquiry endpoint.
 * 3. Connect plan buttons to your checkout or registration route.
 * 4. Keep secrets and payment logic on the server; never place API secrets here.
 */

const academyStats = [
    { value: "98.4%", label: "Athlete retention" },
    { value: "412 km/h", label: "Tracked shuttle speed" },
    { value: "14", label: "State championships" },
    { value: "12,000+", label: "Hours of coaching" },
];

const stakeholderCards = [
    {
        icon: "♙",
        title: "For Competitive Players",
        description:
            "Accelerate your skills with personalized training, match analysis, and measurable progress.",
        points: [
            "Skill development plans tailored to your level",
            "Actionable feedback after every session",
            "Tournament preparation and match strategy",
        ],
        action: "Register as a Player",
    },
    {
        icon: "◎",
        title: "For Parents",
        description:
            "Stay involved in your athlete’s development with clear updates and a supportive academy.",
        points: [
            "Progress reports and attendance updates",
            "A safe, structured training environment",
            "Clear communication with coaches",
        ],
        action: "Explore Parent Access",
    },
    {
        icon: "▤",
        title: "For Coaches & Academies",
        description:
            "Spend less time on administration and more time helping athletes improve.",
        points: [
            "Organize squads, courts, and schedules",
            "Review performance and attendance",
            "Keep athlete information in one place",
        ],
        action: "Explore Coach Tools",
    },
];

const features = [
    {
        icon: "◉",
        title: "Live Scoring & Radar Telemetry",
        description:
            "Capture match scores and shuttle-speed data to help players understand their performance.",
    },
    {
        icon: "▣",
        title: "Drag-and-Drop Lineup Builder",
        description:
            "Build squads and session lineups with a simple, coach-friendly workflow.",
    },
    {
        icon: "↗",
        title: "Parent Progress & Attendance",
        description:
            "Share attendance, milestones, and development updates with families.",
    },
    {
        icon: "▦",
        title: "Automated Invoicing & Fee Engine",
        description:
            "Keep track of fees, invoices, and payment status in one organized place.",
    },
    {
        icon: "✓",
        title: "QR Fast Turnstile Attendance",
        description:
            "Make check-ins quick and reduce manual attendance work for staff.",
    },
    {
        icon: "⌁",
        title: "BWF Standard Performance Heatmaps",
        description:
            "Review movement patterns and training metrics to guide the next session.",
    },
];

const pathwaySteps = [
    {
        number: "01",
        status: "COMPLIMENTARY",
        title: "Free Evaluation & Assessment",
        description:
            "We assess your current skill level, goals, movement, and match readiness.",
    },
    {
        number: "02",
        status: "PERSONAL PLAN",
        title: "Squad Allocation & Drill Plan",
        description:
            "Get placed in a suitable squad with a training plan built around your needs.",
    },
    {
        number: "03",
        status: "COMPETE",
        title: "Compete & Ascend the Ranks",
        description:
            "Track your progress, enter events, and keep improving with coach feedback.",
    },
];

const plans = [
    {
        name: "Development",
        price: "220",
        period: "/ month",
        description: "A strong foundation for new and developing players.",
        features: [
            "Age- and skill-appropriate weekly sessions",
            "Fundamental footwork and racket skills",
            "Monthly development report",
        ],
        button: "Select Development",
        className: "development",
    },
    {
        name: "Performance Elite",
        price: "380",
        period: "/ month",
        description: "For players ready to train with greater focus and intensity.",
        features: [
            "Priority squad placement and sessions",
            "Tournament preparation and video review",
            "Progress tracking and performance feedback",
        ],
        button: "Select Performance Elite",
        className: "elite",
        featured: true,
    },
    {
        name: "Master Pro",
        price: "590",
        period: "/ month",
        description: "High-performance coaching for ambitious competitors.",
        features: [
            "Dedicated development plan",
            "Priority coaching and tournament support",
            "Advanced performance review",
        ],
        button: "Select Master Pro",
        className: "master",
    },
];

const coaches = [
    {
        name: "Marcus Chen",
        role: "Head Coach · Former Olympian",
        image:
            "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1000&q=85",
        alt: "Indoor badminton court used as a coaching profile image",
        bio: "Focused on technical foundations, match awareness, and building confident competitors.",
        tag: "ELITE COACH",
    },
    {
        name: "Sarah Lin",
        role: "Junior Development Coach",
        image:
            "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=1000&q=85",
        alt: "Badminton training court used as a coaching profile image",
        bio: "Helps junior athletes build consistency, movement skills, and a love for the game.",
        tag: "JUNIOR SPECIALIST",
    },
];

const testimonials = [
    {
        quote:
            "The training plan gave my child clear goals. We can see the improvement in confidence, movement, and match preparation.",
        name: "Rajiv Krishnan",
        role: "Parent of a U15 player",
        initials: "RK",
    },
    {
        quote:
            "The coaching feedback is practical and specific. I know what to work on after every session, not just what went well.",
        name: "Maya Lindqvist",
        role: "U17 Junior Player",
        initials: "ML",
    },
];

const faqs = [
    {
        question: "What age groups are accepted?",
        answer:
            "We welcome juniors and adults. Squad placement depends on age, current ability, goals, and the availability of suitable sessions.",
    },
    {
        question: "Do I need my own racket for the trial?",
        answer:
            "Bring your racket if you have one. If you are new to badminton, contact the academy before your visit to ask about loan equipment.",
    },
    {
        question: "How does the SP-Rating system work?",
        answer:
            "The rating is intended to summarize progress using recorded training and match indicators. Your coach can explain which metrics are available for your squad.",
    },
    {
        question: "Can parents observe training sessions?",
        answer:
            "Observation arrangements can vary by session and venue. The academy team will confirm the policy when your trial is scheduled.",
    },
];

function SectionHeading({ eyebrow, title, description, centered = false }) {
    return (
        <div className={`section-heading${centered ? " section-heading--center" : ""}`}>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            {description ? <p className="section-description">{description}</p> : null}
        </div>
    );
}

export default function Home() {
    const [openFaq, setOpenFaq] = useState(0);
    const [formStatus, setFormStatus] = useState("idle");

    // Basic SEO metadata. For SSR, place the same metadata in your document head
    // or use your framework's metadata API to avoid client-only SEO updates.
    useEffect(() => {
        document.title =
            "SmashPoint Academy | Badminton Coaching, Performance & Player Development";

        let description = document.querySelector('meta[name="description"]');
        if (!description) {
            description = document.createElement("meta");
            description.name = "description";
            document.head.appendChild(description);
        }
        description.content =
            "Train with SmashPoint Academy for structured badminton coaching, player development, performance tracking, junior programs, and tournament preparation.";

        let themeColor = document.querySelector('meta[name="theme-color"]');
        if (!themeColor) {
            themeColor = document.createElement("meta");
            themeColor.name = "theme-color";
            document.head.appendChild(themeColor);
        }
        themeColor.content = "#101411";
    }, []);

    // Demo-only submit handler. Replace with your API request and real validation.
    async function handleEnquirySubmit(event) {
        event.preventDefault();
        setFormStatus("submitted");
        // Example backend integration:
        // const response = await fetch("/api/enquiries", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ fullName, phone }),
        // });
        // if (!response.ok) throw new Error("Unable to submit enquiry");
    }

    return (
        <main className="sp-home">
            {/* HERO: primary message and first conversion actions */}
            <section className="sp-hero" aria-labelledby="sp-hero-title">
                <div className="sp-container sp-hero__grid">
                    <div className="sp-hero__content">
                        <p className="sp-live-label">
                            <span className="sp-live-dot" aria-hidden="true" />
                            TRAIN SMARTER. COMPETE STRONGER.
                        </p>
                        <p className="eyebrow">SMASHPOINT ACADEMY</p>
                        <h1 id="sp-hero-title">
                            Forge Championship Precision at <span>SmashPoint</span>
                        </h1>
                        <p className="sp-hero__lead">
                            Olympic-standard court methodology, data-informed coaching, and
                            next-generation athlete development—all in one place.
                        </p>
                        <div className="sp-hero__actions">
                            <a className="sp-button sp-button--primary" href="#trial">
                                Join the Academy <span aria-hidden="true">↗</span>
                            </a>
                            <a className="sp-button sp-button--ghost" href="#features">
                                <span className="sp-play-icon" aria-hidden="true">▶</span>
                                Explore the Academy
                            </a>
                        </div>
                        <div className="sp-hero__trust">
                            <div className="sp-avatar-stack" aria-hidden="true">
                                <span>MC</span><span>SL</span><span>RK</span>
                            </div>
                            <p><strong>Player-first coaching</strong><br />Built around measurable progress</p>
                        </div>
                    </div>

                    {/* Replace this illustrative panel with live dashboard data if available. */}
                    <aside className="sp-performance-card" aria-label="Sample performance dashboard">
                        <div className="sp-performance-card__top">
                            <div>
                                <p className="sp-card-kicker">COURT TELEMETRY ACTIVE</p>
                                <h2>Performance Snapshot</h2>
                            </div>
                            <span className="sp-live-pill"><span /> LIVE DEMO</span>
                        </div>
                        <div className="sp-speed-panel">
                            <div>
                                <p className="sp-muted-label">SHUTTLE SPEED</p>
                                <p className="sp-speed">412 <span>km/h</span></p>
                                <p className="sp-card-note">↗ Sample performance metric</p>
                            </div>
                            <div className="sp-speed-ring" aria-label="Performance score 84 percent">
                                <span>84</span><small>%</small>
                            </div>
                        </div>
                        <div className="sp-dashboard-grid">
                            <div>
                                <span className="sp-muted-label">FOOTWORK EFFICIENCY</span>
                                <strong>94.2%</strong>
                                <small>Training benchmark</small>
                            </div>
                            <div>
                                <span className="sp-muted-label">REACTION TIME</span>
                                <strong>0.42 <small>sec</small></strong>
                                <small>Sample result</small>
                            </div>
                        </div>
                        <div className="sp-chart" aria-label="Illustrative performance trend">
                            <div className="sp-chart__labels"><span>SESSION 01</span><span>SESSION 06</span><span>SESSION 12</span></div>
                            <svg viewBox="0 0 420 80" role="img" aria-label="Illustrative rising performance line">
                                <defs>
                                    <linearGradient id="spChartFill" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#27d982" stopOpacity=".28" />
                                        <stop offset="100%" stopColor="#27d982" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d="M0 65 C28 60 35 49 60 53 S100 38 126 45 S164 25 190 35 S230 20 255 28 S295 10 320 20 S370 8 420 4 L420 80 L0 80 Z" fill="url(#spChartFill)" />
                                <path d="M0 65 C28 60 35 49 60 53 S100 38 126 45 S164 25 190 35 S230 20 255 28 S295 10 320 20 S370 8 420 4" fill="none" stroke="#27d982" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        <p className="sp-demo-note">Illustrative dashboard — connect real athlete data through your backend.</p>
                    </aside>
                </div>
            </section>

            {/* TRUST / METRICS: replace sample values with verified academy statistics. */}
            <section className="sp-stats" aria-label="Academy highlights">
                <div className="sp-container sp-stats__grid">
                    {academyStats.map((stat) => (
                        <div className="sp-stat" key={stat.label}>
                            <strong>{stat.value}</strong>
                            <span>{stat.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* AUDIENCES: separate value propositions for players, parents, and coaches. */}
            <section className="sp-section sp-section--surface" id="programs">
                <div className="sp-container">
                    <SectionHeading
                        eyebrow="TAILORED EXPERIENCES"
                        title="Designed for Every Stakeholder"
                        description="A practical pathway to explore role-specific tools, built to fit the SmashPoint Academy experience."
                        centered
                    />
                    <div className="sp-stakeholder-grid">
                        {stakeholderCards.map((card) => (
                            <article className="sp-card sp-stakeholder-card" key={card.title}>
                                <div className="sp-icon-box" aria-hidden="true">{card.icon}</div>
                                <h3>{card.title}</h3>
                                <p>{card.description}</p>
                                <ul className="sp-check-list">
                                    {card.points.map((point) => <li key={point}>{point}</li>)}
                                </ul>
                                <a className="sp-text-link" href="#trial">{card.action} <span aria-hidden="true">→</span></a>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES: product capabilities; connect each feature to a real module as it ships. */}
            <section className="sp-section" id="features">
                <div className="sp-container">
                    <SectionHeading
                        eyebrow="TECHNOLOGY-LED EDGE"
                        title="Tournament-Grade Features"
                        description="Built to replace scattered spreadsheets and paper notes with one cohesive athlete hub."
                    />
                    <div className="sp-feature-grid">
                        {features.map((feature) => (
                            <article className="sp-card sp-feature-card" key={feature.title}>
                                <div className="sp-icon-box" aria-hidden="true">{feature.icon}</div>
                                <div>
                                    <h3>{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* PROCESS: explains what happens from first enquiry to competitive training. */}
            <section className="sp-section sp-section--surface" id="pathway">
                <div className="sp-container sp-narrow-container">
                    <SectionHeading
                        eyebrow="YOUR PATHWAY"
                        title="Your 3-Step Pathway to Excellence"
                        description="From first evaluation to a squad plan that supports your goals."
                        centered
                    />
                    <div className="sp-pathway-list">
                        {pathwaySteps.map((step, index) => (
                            <article className="sp-card sp-pathway-card" key={step.number}>
                                <div className="sp-step-number">{step.number}</div>
                                <div className="sp-pathway-card__body">
                                    <div className="sp-pathway-card__meta">
                                        <span className="sp-pathway-card__status">{step.status}</span>
                                    </div>
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                </div>
                                {index < pathwaySteps.length - 1 ? <span className="sp-step-connector" aria-hidden="true" /> : null}
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING: prices are example content; confirm currency, tax, and billing rules. */}
            <section className="sp-section" id="pricing">
                <div className="sp-container">
                    <SectionHeading
                        eyebrow="TRANSPARENT MEMBERSHIP"
                        title="Academy Training Plans"
                        description="Choose a training level that suits your current ability and competitive ambitions."
                        centered
                    />
                    <div className="sp-plan-grid">
                        {plans.map((plan) => (
                            <article
                                className={`sp-card sp-plan-card sp-plan-card--${plan.className}${plan.featured ? " sp-plan-card--featured" : ""}`}
                                key={plan.name}
                            >
                                {plan.featured ? <span className="sp-plan-badge">MOST POPULAR</span> : null}
                                <p className="sp-plan-label">{plan.name}</p>
                                <p className="sp-plan-price">{plan.price}<span>{plan.period}</span></p>
                                <p className="sp-plan-description">{plan.description}</p>
                                <ul className="sp-check-list">
                                    {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
                                </ul>
                                <a className={`sp-button ${plan.featured ? "sp-button--primary" : "sp-button--subtle"}`} href="#trial">
                                    {plan.button}
                                </a>
                            </article>
                        ))}
                    </div>
                    <p className="sp-pricing-note">Membership details shown for layout demonstration. Confirm current fees and availability with the academy.</p>
                </div>
            </section>

            {/* COACHES: replace demo imagery and bios with approved coach profiles. */}
            <section  className="sp-section sp-section--surface" id="coaches">
                <div className="sp-container">
                    <SectionHeading
                        eyebrow="COACHING TEAM"
                        title="Mentored by Champions"
                        description="Meet the people who help athletes turn consistent practice into confident performance."
                    />
                    <div className="sp-coach-grid">
                        {coaches.map((coach) => (
                            <article className="sp-card sp-coach-card" key={coach.name}>
                                <div className="sp-coach-card__image-wrap">
                                    <img src={coach.image} alt={coach.alt} loading="lazy" />
                                    <span className="sp-coach-tag">{coach.tag}</span>
                                </div>
                                <div className="sp-coach-card__content">
                                    <p className="sp-coach-role">{coach.role}</p>
                                    <h3>{coach.name}</h3>
                                    <p>{coach.bio}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS: publish only reviews you have permission to use. */}
            <section className="sp-section" id="stories">
                <div className="sp-container sp-narrow-container">
                    <SectionHeading
                        eyebrow="COMMUNITY VOICES"
                        title="Stories from Court-Side"
                        description="Experiences from players and families on their development journey."
                        centered
                    />
                    <div className="sp-testimonial-grid">
                        {testimonials.map((item) => (
                            <figure className="sp-card sp-testimonial-card" key={item.name}>
                                <div className="sp-stars" aria-label="5 out of 5 stars">★★★★★</div>
                                <blockquote>“{item.quote}”</blockquote>
                                <figcaption>
                                    <span className="sp-testimonial-avatar" aria-hidden="true">{item.initials}</span>
                                    <span><strong>{item.name}</strong><small>{item.role}</small></span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ: native buttons improve keyboard access and screen-reader usability. */}
            <section className="sp-section sp-section--surface" id="faq">
                <div className="sp-container sp-narrow-container">
                    <SectionHeading
                        eyebrow="NEED TO KNOW"
                        title="Frequently Asked Questions"
                        centered
                    />
                    <div className="sp-faq-list">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;
                            const answerId = `sp-faq-answer-${index}`;
                            return (
                                <article className={`sp-faq-item${isOpen ? " is-open" : ""}`} key={faq.question}>
                                    <h3>
                                        <button
                                            type="button"
                                            aria-expanded={isOpen}
                                            aria-controls={answerId}
                                            onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                        >
                                            {faq.question}
                                            <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                                        </button>
                                    </h3>
                                    {isOpen ? <div className="sp-faq-answer" id={answerId}><p>{faq.answer}</p></div> : null}
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* LEAD FORM: connect this form to your backend/CRM before production. */}
            <section className="sp-section sp-section--cta" id="trial">
                <div className="sp-container">
                    <div className="sp-cta-panel">
                        <div className="sp-cta-icon" aria-hidden="true">♙</div>
                        <p className="eyebrow">START YOUR JOURNEY</p>
                        <h2>Ready to Step Onto the Court?</h2>
                        <p className="sp-cta-description">
                            Tell us a little about yourself and the academy team can help you find a suitable trial session.
                        </p>
                        {formStatus === "submitted" ? (
                            <div className="sp-form-success" role="status">
                                Thanks for your interest! This demo form is not connected to a server yet.
                            </div>
                        ) : (
                            <form className="sp-enquiry-form" onSubmit={handleEnquirySubmit}>
                                <label className="sp-sr-only" htmlFor="sp-full-name">Full name</label>
                                <input id="sp-full-name" name="fullName" type="text" placeholder="Full name" autoComplete="name" required />
                                <label className="sp-sr-only" htmlFor="sp-phone">Phone number or email</label>
                                <input id="sp-phone" name="contact" type="text" placeholder="Phone number or email" autoComplete="email" required />
                                <button className="sp-button sp-button--primary" type="submit">
                                    Book Your Free Trial <span aria-hidden="true">→</span>
                                </button>
                                <p className="sp-privacy-note">By submitting, you agree that the academy may contact you about your enquiry.</p>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
