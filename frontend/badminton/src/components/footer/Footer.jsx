
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    FiArrowUpRight,
    FiArrowUp,
    FiMapPin,
    FiPhone,
    FiMail,
    FiClock,
    FiInstagram,
    FiFacebook,
    FiYoutube,
    FiArrowRight,
} from "react-icons/fi";
import "./Footer.css";

export default function Footer() {
    const [email, setEmail] = useState("");

    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { label: "Home", to: "/" },
        { label: "About Academy", to: "/about" },
        { label: "Our Coaches", to: "/coaches" },
        { label: "Upcoming Matches", to: "/matches" },
    ];

    const programs = [
        { label: "Beginner Training", to: "/programs#beginner" },
        { label: "Advanced Training", to: "/programs#advanced" },
        { label: "Junior Academy", to: "/programs#junior" },
        { label: "Match Preparation", to: "/programs#matches" },
    ];

    const socialLinks = [
        {
            label: "Instagram",
            href: "https://www.instagram.com/",
            icon: <FiInstagram />,
        },
        {
            label: "Facebook",
            href: "https://www.facebook.com/",
            icon: <FiFacebook />,
        },
        {
            label: "YouTube",
            href: "https://www.youtube.com/",
            icon: <FiYoutube />,
        },
    ];

    const handleNewsletterSubmit = (event) => {
        event.preventDefault();

        // Connect your newsletter API or backend here.
        // This example does not actually subscribe the user.
        setEmail("");
        window.alert(
            "Newsletter signup is not connected yet. Please connect your backend."
        );
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="sp-footer">
            {/* CTA banner */}
            <div className="sp-footer-cta">
                <div className="sp-footer-cta-content">
                    <span className="sp-footer-eyebrow">
                        YOUR NEXT LEVEL STARTS HERE
                    </span>

                    <h2>
                        Ready to <span>smash</span> your limits?
                    </h2>

                    <p>
                        Train with purpose, improve your game, and become
                        the player you want to be.
                    </p>
                </div>

                <Link to="/register" className="sp-footer-cta-btn">
                    Join the Academy <FiArrowUpRight />
                </Link>
            </div>

            {/* Main footer */}
            <div className="sp-footer-main">
                <div className="sp-footer-grid">
                    {/* Academy information */}
                    <div className="sp-footer-brand-column">
                        <Link
                            to="/"
                            className="sp-footer-brand"
                            aria-label="SmashPoint Academy home"
                        >
                            <span className="sp-footer-logo" aria-hidden="true">
                                <svg viewBox="0 0 40 40" fill="none">
                                    <circle
                                        cx="20"
                                        cy="20"
                                        r="17"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        opacity=".35"
                                    />
                                    <path
                                        d="M13 25L23 12L28 17L17 28"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <circle cx="27" cy="11" r="3" fill="#27D982" />
                                    <path
                                        d="M11 30L17 24"
                                        stroke="#27D982"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>

                            <span className="sp-footer-brand-text">
                                <strong>SmashPoint</strong>
                                <span>ACADEMY</span>
                            </span>
                        </Link>

                        <p className="sp-footer-description">
                            Building stronger players through disciplined training,
                            expert guidance, teamwork, and a passion for badminton.
                        </p>

                        <div className="sp-footer-socials" aria-label="Social media">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="sp-social-link"
                                    aria-label={social.label}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick navigation */}
                    <div className="sp-footer-column">
                        <h3>Explore</h3>
                        <ul>
                            {quickLinks.map((link) => (
                                <li key={link.to}>
                                    <Link to={link.to}>
                                        <FiArrowRight />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Training programs */}
                    <div className="sp-footer-column">
                        <h3>Our Programs</h3>
                        <ul>
                            {programs.map((program) => (
                                <li key={program.to}>
                                    <Link to={program.to}>
                                        <FiArrowRight />
                                        {program.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact information */}
                    <div className="sp-footer-column sp-contact-column">
                        <h3>Get in Touch</h3>

                        <ul className="sp-contact-list">
                            <li>
                                <FiMapPin className="sp-contact-icon" />
                                <span>Visit our academy for training information.</span>
                            </li>

                            <li>
                                <FiPhone className="sp-contact-icon" />
                                <span>
                                    <Link to="/contact">Contact our team</Link>
                                </span>
                            </li>

                            <li>
                                <FiMail className="sp-contact-icon" />
                                <span>
                                    <Link to="/contact">Send us an enquiry</Link>
                                </span>
                            </li>

                            <li>
                                <FiClock className="sp-contact-icon" />
                                <span>Contact us for training schedules.</span>
                            </li>
                        </ul>

                        <Link to="/contact" className="sp-footer-contact-link">
                            Contact Us <FiArrowUpRight />
                        </Link>
                    </div>
                </div>

                {/* Newsletter */}
                <div className="sp-footer-newsletter">
                    <div>
                        <h3>Stay in the game.</h3>
                        <p>Get academy updates, training news, and announcements.</p>
                    </div>

                    <form
                        className="sp-newsletter-form"
                        onSubmit={handleNewsletterSubmit}
                    >
                        <label className="sp-sr-only" htmlFor="sp-newsletter-email">
                            Email address
                        </label>

                        <input
                            id="sp-newsletter-email"
                            type="email"
                            placeholder="Enter your email address"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />

                        <button type="submit" aria-label="Subscribe to newsletter">
                            <FiArrowRight />
                        </button>
                    </form>
                </div>

                {/* Bottom bar */}
                <div className="sp-footer-bottom">
                    <p>
                        © {currentYear} SmashPoint Academy. All rights reserved.
                    </p>

                    <nav className="sp-footer-legal" aria-label="Legal navigation">
                        <Link to="/privacy-policy">Privacy Policy</Link>
                        <Link to="/terms">Terms & Conditions</Link>
                    </nav>

                    <button
                        type="button"
                        className="sp-back-to-top"
                        onClick={scrollToTop}
                        aria-label="Back to top"
                        title="Back to top"
                    >
                        <FiArrowUp />
                    </button>
                </div>
            </div>
        </footer>
    );
}
