import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

/*
 * SmashPoint Academy — Hero section
 * ---------------------------------------------------------
 * Place this file next to Home.jsx (same folder) and import it with
 *   import Hero from "./Hero";
 * The file name is "Hero.jsx" with a capital H. Keep the import identical,
 * because Netlify (Linux) is case-sensitive.
 */

// Hero image. To use your own photo, put it in src/assets and replace with:
//   import courtPhoto from "../../../assets/court.jpg";   (adjust the path)
//   const heroImage = { src: courtPhoto, alt: "..." };
const heroImage = {
    src: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1400&q=80",
    alt: "Players training on an indoor badminton court",
    label: "LIVE",
    title: "Main court",
    subtitle: "Evening batch in session",
};

const academyInfo = [
    { label: "Training hours", value: "Daily, 6:00 AM to 9:00 PM" },
    { label: "Facility", value: "8 courts with sprung wooden flooring" },
    { label: "Age groups", value: "6 years and above" },
    { label: "Location", value: "Add your academy address here" },
];

export default function Hero() {
    return (
        <section className="sph-hero" aria-labelledby="sph-title">
            <div className="sp-container sph-grid">
                {/* Left: message and actions */}
                <div className="sph-copy">
                    <p className="sph-notice">
                        <span className="sph-notice__dot" aria-hidden="true" />
                        Admissions open for the new batch
                    </p>

                    <h1 id="sph-title">Badminton coaching where every session counts</h1>

                    <p className="sph-lead">
                        Structured batches for juniors, adults and tournament players. Coaches
                        mark attendance and progress on court, and parents and players see it
                        the same day.
                    </p>

                    <div className="sph-actions">
                        <a className="sp-button sp-button--primary" href="#trial">
                            Book a free trial
                        </a>
                        <a className="sp-button sp-button--ghost" href="#programs">
                            See programs
                        </a>
                    </div>

                    <div className="sph-signin">
                        <p>Already enrolled? Sign in to your dashboard</p>
                        <div className="sph-signin__links">
                            <Link to="/login">Coach</Link>
                            <Link to="/login">Parent</Link>
                            <Link to="/login">Player</Link>
                        </div>
                    </div>
                </div>

                {/* Right: image with blinking live badge */}
                <figure className="sph-feed">
                    <img
                        src={heroImage.src}
                        alt={heroImage.alt}
                        width="1400"
                        height="1000"
                        fetchPriority="high"
                    />
                    <span className="sph-feed__badge">
                        <span className="sph-feed__dot" aria-hidden="true" />
                        {heroImage.label}
                    </span>
                    <figcaption className="sph-feed__caption">
                        <strong>{heroImage.title}</strong>
                        <span>{heroImage.subtitle}</span>
                    </figcaption>
                </figure>
            </div>

            {/* Practical academy details */}
            <div className="sp-container">
                <dl className="sph-info">
                    {academyInfo.map((item) => (
                        <div key={item.label}>
                            <dt>{item.label}</dt>
                            <dd>{item.value}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}