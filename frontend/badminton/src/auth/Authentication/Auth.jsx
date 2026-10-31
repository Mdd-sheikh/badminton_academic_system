import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { z } from "zod";
import { toast } from "react-toastify";
import {
    FiArrowLeft,
    FiArrowRight,
    FiAward,
    FiCheck,
    FiCheckCircle,
    FiEye,
    FiEyeOff,
    FiLock,
    FiMail,
    FiUser,
    FiUsers,
    FiShield,
    FiCalendar,
    FiActivity,
    FiRefreshCw,
    FiLink,
} from "react-icons/fi";
import "./Auth.css";

// IndexedDB layer + seed (adjust these paths to your folder structure)
import { getAll, save } from "../../pages/academy_owner/db/db.js";
import { ensureSeed } from "../../pages/academy_owner/db/seed.js";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const ROLES = [
    { value: "parent", title: "Parent", description: "Track your child's performance", icon: FiUsers },
    { value: "coach", title: "Coach", description: "Manage assigned players & training", icon: FiActivity },
    { value: "admin", title: "Admin", description: "Manage the academy", icon: FiShield },
];

// Admin uses the existing Owner dashboard route in App.jsx.
const DASHBOARDS = {
    parent: "/player/dashboard",
    coach: "/coach/dashboard",
    admin: "/owner/dashboard",
};

// Admin accounts are created by the academy, not through public signup.
const SIGNUP_ROLES = ROLES.filter((item) => item.value !== "admin");

const EMPTY_OTP = ["", "", "", "", "", ""];
const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 30;

/* -------------------------------------------------------------------------- */
/*  IndexedDB helpers (source of truth for login)                             */
/* -------------------------------------------------------------------------- */

const normEmail = (value) => String(value || "").trim().toLowerCase();
const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

// Reads a store safely. Returns [] if the store does not exist yet.
async function readStore(storeName) {
    try {
        return (await getAll(storeName)) || [];
    } catch {
        return [];
    }
}

// Backward compatibility: older accounts may be stored as "player"/"owner".
function getAccountType(accountRole) {
    const value = String(accountRole || "").toLowerCase();
    if (value === "coach") return "coach";
    if (value === "parent" || value === "player") return "parent";
    if (value === "admin" || value === "owner") return "admin";
    return value;
}

// COACH: created by Admin in the Owner Dashboard ("coaches" store).
async function findCoachByCredentials(email, password) {
    await ensureSeed(); // make sure data exists even if Auth is the first page opened
    const coaches = await readStore("coaches");
    const coach = coaches.find((item) => normEmail(item.email) === normEmail(email));

    if (!coach) throw new Error("Invalid email or password.");
    if (!coach.password) throw new Error("Your password has not been set yet. Please contact the admin.");
    if (coach.password !== password) throw new Error("Invalid email or password.");
    if (String(coach.status || "").toLowerCase() !== "active") {
        throw new Error("Your coach account is not active. Please contact the admin.");
    }
    return coach;
}

// ADMIN: stored in the "admins" store, with a fallback to a "meta" record
// such as { id: "admin", email, password }.
const DEFAULT_ADMIN = {
    id: "admin",
    name: "Academy Admin",
    email: "admin@smashpoint.in",
    password: "admin123",
    role: "admin",
};

async function findAdminByCredentials(email, password) {
    await ensureSeed();

    let meta = await readStore("meta");
    // Self-heal: databases seeded before the admin record existed get it added
    // here, so coaches and players are kept and no reset is needed.
    if (!meta.some((item) => item.id === DEFAULT_ADMIN.id)) {
        await save("meta", DEFAULT_ADMIN);
        meta = await readStore("meta");
    }
    const admins = await readStore("admins");

    const admin = [...admins, ...meta]
        .map((item) => (item?.value && typeof item.value === "object" ? item.value : item))
        .find((item) =>
            item &&
            item.email &&
            normEmail(item.email) === normEmail(email) &&
            item.password === password
        );

    if (!admin) throw new Error("Invalid email or password.");
    return admin;
}

// PARENT: one input only. Accepts the Player ID (e.g. p12) or the parent's
// registered phone number. A phone number may match several children.
async function findPlayersByCode(code) {
    await ensureSeed();
    const raw = String(code || "").trim().toLowerCase();
    if (!raw) return [];

    const players = await readStore("players");
    const phone = onlyDigits(raw);

    return players.filter((player) => {
        if (String(player.id || "").toLowerCase() === raw) return true;
        if (player.inviteCode && String(player.inviteCode).toLowerCase() === raw) return true;
        // phone match: only when the input looks like a phone number
        return phone.length >= 7 && onlyDigits(player.parentPhone).endsWith(phone.slice(-10));
    });
}

/* -------------------------------------------------------------------------- */
/*  Validation schemas                                                        */
/* -------------------------------------------------------------------------- */

const emailSchema = z.string().trim().email("Please enter a valid email address.");

const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required."),
});

const passwordSchema = z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/[0-9]/, "Include at least one number.")
    .regex(/[^A-Za-z0-9]/, "Include at least one symbol.");

const signupSchema = z
    .object({
        fullName: z.string().trim().min(2, "Name must contain at least 2 characters.").max(100, "Name is too long."),
        email: emailSchema,
        phone: z.string().trim().min(7, "Enter a valid phone number.").max(20, "Phone number is too long."),
        password: passwordSchema,
        confirmPassword: z.string(),
        terms: z.boolean().refine(Boolean, "Please accept the terms."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

const resetSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

const otpSchema = z
    .string()
    .length(6, "Enter the complete 6-digit code.")
    .regex(/^\d{6}$/, "The code must contain 6 digits.");

/* -------------------------------------------------------------------------- */
/*  Utilities                                                                 */
/* -------------------------------------------------------------------------- */

// Message for API (axios) errors and for plain Errors thrown by our own code.
function getMessage(error, fallback = "Something went wrong. Please try again.") {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (error?.code === "ECONNABORTED" ? "The request timed out. Please try again." : null) ||
        (!error?.response && error?.request
            ? "Cannot connect to the server. Check your connection and API URL."
            : null) ||
        (!error?.request && error?.message) ||
        fallback
    );
}

function getPasswordStrength(password) {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}

function saveSession(user) {
    localStorage.setItem("token", "demo-token");
    localStorage.setItem("user", JSON.stringify(user));
}

/* -------------------------------------------------------------------------- */
/*  Small components                                                          */
/* -------------------------------------------------------------------------- */

function FieldError({ children }) {
    if (!children) return null;
    return (
        <span className="auth-field-error" role="alert">
            {children}
        </span>
    );
}

function PasswordStrength({ password }) {
    const score = getPasswordStrength(password);
    const labels = ["", "Weak", "Fair", "Good", "Strong"];

    return (
        <div className="auth-strength" aria-live="polite">
            <div className="auth-strength-bars">
                {[1, 2, 3, 4].map((level) => (
                    <span
                        key={level}
                        className={level <= score ? `strength-${score <= 1 ? 1 : score <= 2 ? 2 : 3}` : ""}
                    />
                ))}
            </div>
            <small>{labels[score] || "Password strength"}</small>
        </div>
    );
}

function PasswordRules({ password }) {
    const rules = [
        { label: "At least 8 characters", valid: password.length >= 8 },
        { label: "At least one number", valid: /\d/.test(password) },
        { label: "At least one symbol", valid: /[^A-Za-z0-9]/.test(password) },
    ];

    return (
        <div className="auth-rule-list">
            {rules.map((rule) => (
                <span key={rule.label} className={rule.valid ? "valid" : ""}>
                    {rule.valid ? <FiCheckCircle /> : <FiCheck />}
                    {rule.label}
                </span>
            ))}
        </div>
    );
}

function RoleCards({ roles, role, onSelect }) {
    return (
        <div className="auth-role-grid">
            {roles.map(({ value, title, description, icon: Icon }) => (
                <button
                    key={value}
                    type="button"
                    className={`auth-role-card ${role === value ? "selected" : ""}`}
                    onClick={() => onSelect(value)}
                    aria-pressed={role === value}
                >
                    <Icon />
                    <strong>{title}</strong>
                    <small>{description}</small>
                    {role === value && <FiCheckCircle className="auth-role-check" />}
                </button>
            ))}
        </div>
    );
}

function AuthAside() {
    return (
        <aside className="auth-aside">
            <span className="auth-eyebrow">
                <span className="auth-status-dot" />
                YOUR GAME. YOUR JOURNEY.
            </span>

            <h1>
                Train harder.
                <span>Play smarter.</span>
            </h1>

            <p>
                Your badminton journey, all in one place. Connect with your coach,
                track your progress, and celebrate every win.
            </p>

            <div className="auth-feature-list">
                <div>
                    <span><FiActivity /></span>
                    <p>
                        <strong>Performance tracking</strong>
                        <small>Monitor your game and improvement.</small>
                    </p>
                </div>
                <div>
                    <span><FiCalendar /></span>
                    <p>
                        <strong>Training and matches</strong>
                        <small>Keep up with your academy schedule.</small>
                    </p>
                </div>
                <div>
                    <span><FiUsers /></span>
                    <p>
                        <strong>One connected community</strong>
                        <small>Parents, coaches and academy administrators together.</small>
                    </p>
                </div>
            </div>

            <div className="auth-court-art" aria-hidden="true">
                <span className="court-circle" />
                <span className="court-line court-line-one" />
                <span className="court-line court-line-two" />
                <FiAward />
            </div>
        </aside>
    );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function Auth() {
    const location = useLocation();
    const navigate = useNavigate();
    const otpRefs = useRef([]);
    const redirectTimer = useRef(null);

    // Normalise the path (trailing slash / case) and treat /auth as /login.
    const rawPath = location.pathname.replace(/\/+$/, "").toLowerCase() || "/";
    const page = rawPath === "/auth" ? "/login" : rawPath;

    const isSignup = page === "/signup";
    const isLogin = page === "/login";
    const isVerify = page === "/verify-email";
    const isForgot = page === "/forgot-password";
    const isReset = page === "/reset-password";
    const isLinkChild = page === "/parent/link-child";

    const [role, setRole] = useState(location.state?.role || "parent");

    // Parent login is a single input (player code), so email/password are hidden.
    const isParentLogin = isLogin && role === "parent";

    const [form, setForm] = useState({
        fullName: "",
        email: location.state?.email || "",
        phone: "",
        password: "",
        confirmPassword: "",
        terms: false,
        rememberMe: true,
        inviteCode: "",
        playerCode: "",
    });

    const [otp, setOtp] = useState(EMPTY_OTP);
    const [errors, setErrors] = useState({});
    const [banner, setBanner] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resendSeconds, setResendSeconds] = useState(60);
    const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_ATTEMPTS);
    const [lockoutSeconds, setLockoutSeconds] = useState(0);
    const [childPreview, setChildPreview] = useState(null);

    const email = (location.state?.email || form.email).trim().toLowerCase();

    // Make sure the academy database exists as soon as the auth page opens.
    useEffect(() => {
        ensureSeed().catch((err) => console.error("Academy database initialization failed", err));
    }, []);

    // The same <Auth /> instance is reused between /login, /signup, etc.,
    // so reset page-specific state whenever the page changes.
    useEffect(() => {
        setBanner("");
        setErrors({});
        setSuccess(false);
        setOtp(EMPTY_OTP);
        setChildPreview(null);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setForm((previous) => ({
            ...previous,
            password: "",
            confirmPassword: "",
            email: location.state?.email || previous.email,
        }));

        if (location.state?.role) setRole(location.state.role);
        if (page === "/verify-email") setResendSeconds(60);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    useEffect(() => {
        if (!isVerify || resendSeconds <= 0) return;
        const timer = window.setTimeout(() => setResendSeconds((seconds) => seconds - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [isVerify, resendSeconds]);

    useEffect(() => {
        if (lockoutSeconds <= 0) return;
        const timer = window.setTimeout(() => setLockoutSeconds((seconds) => seconds - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [lockoutSeconds]);

    // Clear the delayed redirect if the component unmounts.
    useEffect(() => () => window.clearTimeout(redirectTimer.current), []);

    const updateField = (name, value) => {
        setForm((previous) => ({ ...previous, [name]: value }));
        setErrors((previous) => {
            const next = { ...previous };
            delete next[name];
            return next;
        });
        setBanner("");
    };

    const validate = (schema, values) => {
        const result = schema.safeParse(values);

        if (result.success) {
            setErrors({});
            return result.data;
        }

        const nextErrors = {};
        result.error.issues.forEach((issue) => {
            const key = issue.path[0];
            if (!nextErrors[key]) nextErrors[key] = issue.message;
        });
        setErrors(nextErrors);
        return null;
    };

    const selectRole = (nextRole) => {
        setRole(nextRole);
        setBanner("");
        setErrors({});
    };

    /* ----------------------------- LOGIN ---------------------------------- */

    const registerFailedAttempt = (message) => {
        const next = attemptsRemaining - 1;
        if (next <= 0) {
            setAttemptsRemaining(MAX_ATTEMPTS);
            setLockoutSeconds(LOCKOUT_SECONDS);
            setBanner(`Too many attempts. Try again in ${LOCKOUT_SECONDS}s.`);
        } else {
            setAttemptsRemaining(next);
            setBanner(message);
        }
    };

    // Login reads everything from IndexedDB:
    //  - Parent: single player code (player ID or registered parent phone)
    //  - Coach:  email + password created by Admin ("coaches" store)
    //  - Admin:  email + password stored in IndexedDB ("admins" store)
    const handleLogin = async (event) => {
        event.preventDefault();
        setBanner("");

        if (lockoutSeconds > 0) {
            setBanner(`Too many attempts. Try again in ${lockoutSeconds}s.`);
            return;
        }

        let user;

        if (role === "parent") {
            const code = form.playerCode.trim();
            if (!code) {
                setErrors({ playerCode: "Enter the player code." });
                return;
            }

            setLoading(true);
            try {
                const matches = await findPlayersByCode(code);
                if (!matches.length) throw new Error("No player found with this code.");

                const first = matches[0];
                user = {
                    id: `parent-${first.id}`,
                    name: first.parentName || `Parent of ${first.name || "Player"}`,
                    phone: first.parentPhone,
                    role: "parent",
                    accountType: "parent",
                    linkedPlayerId: first.id,
                    linkedPlayerIds: matches.map((player) => player.id),
                    enrollmentCompleted: true,
                    hasLinkedChild: true,
                };
            } catch (error) {
                registerFailedAttempt(getMessage(error, "No player found with this code."));
                setLoading(false);
                return;
            }
        } else {
            const values = validate(loginSchema, { email: form.email, password: form.password });
            if (!values) return;

            setLoading(true);
            try {
                if (role === "coach") {
                    const coach = await findCoachByCredentials(values.email, values.password);
                    user = {
                        id: coach.id,
                        coachId: coach.id, // useCoachData reads this first
                        name: coach.name,
                        email: coach.email,
                        phone: coach.phone,
                        role: "coach",
                        accountType: "coach",
                        enrollmentCompleted: true,
                        hasLinkedChild: false,
                    };
                } else {
                    const admin = await findAdminByCredentials(values.email, values.password);
                    user = {
                        id: admin.id,
                        name: admin.name || admin.fullName || "Admin",
                        email: admin.email,
                        // App.jsx guards the Owner dashboard with role "owner"
                        role: "owner",
                        accountType: "admin",
                        enrollmentCompleted: true,
                        hasLinkedChild: false,
                    };
                }
            } catch (error) {
                registerFailedAttempt(getMessage(error, "Invalid email or password."));
                setLoading(false);
                return;
            }
        }

        setAttemptsRemaining(MAX_ATTEMPTS);
        saveSession(user);
        toast.success(`Welcome back${user.name ? `, ${user.name.split(" ")[0]}` : ""}!`);
        navigate(DASHBOARDS[getAccountType(user.accountType)], { replace: true });
        setLoading(false);
    };

    /* ----------------------------- SIGNUP --------------------------------- */

    const handleSignup = async (event) => {
        event.preventDefault();
        setBanner("");

        // Admin accounts are provisioned by the academy; public signup is disabled.
        if (role === "admin") {
            setBanner("Admin accounts cannot be created through public signup.");
            return;
        }

        const values = validate(signupSchema, form);
        if (!values) return;

        setLoading(true);

        try {
            await api.post("/auth/signup", {
                fullName: values.fullName,
                email: values.email,
                phone: values.phone,
                password: values.password,
                role,
            });

            toast.success("Account created. Check your email.");
            navigate("/verify-email", {
                replace: true,
                state: { email: values.email, role },
            });
        } catch (error) {
            setBanner(getMessage(error, "Could not create your account."));
        } finally {
            setLoading(false);
        }
    };

    /* ------------------------------ VERIFY -------------------------------- */

    const handleVerify = async (event) => {
        event.preventDefault();

        // The verify page has no email input, so opening it directly
        // would send an empty email to the server.
        if (!email) {
            setBanner("Email address missing. Please sign up again.");
            return;
        }

        const code = otp.join("");
        const validCode = otpSchema.safeParse(code);

        if (!validCode.success) {
            setBanner(validCode.error.issues[0].message);
            return;
        }

        setBanner("");
        setLoading(true);

        try {
            const { data } = await api.post("/auth/verify-email", { email, otp: code });

            setSuccess(true);
            toast.success("Email verified!");

            const verifiedRole = getAccountType(data.user?.role || role);

            redirectTimer.current = window.setTimeout(() => {
                if (verifiedRole === "parent") {
                    navigate("/parent/link-child", { replace: true });
                } else if (verifiedRole === "coach") {
                    navigate("/coach/pending-approval", { replace: true });
                } else if (verifiedRole === "admin") {
                    navigate(DASHBOARDS.admin, { replace: true });
                } else {
                    navigate("/login", { replace: true });
                }
            }, 900);
        } catch (error) {
            setBanner(getMessage(error, "Invalid or expired verification code."));
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendSeconds > 0 || loading) return;

        if (!email) {
            setBanner("Email address missing. Please sign up again.");
            return;
        }

        setLoading(true);
        setBanner("");

        try {
            await api.post("/auth/resend-verification", { email });
            setResendSeconds(60);
            setOtp(EMPTY_OTP);
            toast.success("A new verification code has been sent.");
        } catch (error) {
            setBanner(getMessage(error, "Unable to resend the code."));
        } finally {
            setLoading(false);
        }
    };

    /* --------------------------- FORGOT / RESET --------------------------- */

    const handleForgot = async (event) => {
        event.preventDefault();

        const parsedEmail = emailSchema.safeParse(form.email);
        if (!parsedEmail.success) {
            setErrors({ email: "Enter a valid email address." });
            return;
        }

        setLoading(true);
        setBanner("");

        try {
            await api.post("/auth/forgot-password", { email: parsedEmail.data });
            setSuccess(true);
            toast.success("If the account exists, reset instructions are on the way.");
        } catch (error) {
            setBanner(getMessage(error, "Unable to process your request."));
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (event) => {
        event.preventDefault();

        const values = validate(resetSchema, form);
        if (!values) return;

        const token = new URLSearchParams(location.search).get("token");
        if (!token) {
            setBanner("Your reset link is missing or invalid. Request a new one.");
            return;
        }

        setLoading(true);
        setBanner("");

        try {
            await api.post("/auth/reset-password", { token, password: values.password });
            setSuccess(true);
            toast.success("Password updated successfully.");
        } catch (error) {
            setBanner(getMessage(error, "Could not reset your password."));
        } finally {
            setLoading(false);
        }
    };

    /* ----------------------------- LINK CHILD ----------------------------- */

    const handleFindChild = async (event) => {
        event.preventDefault();
        setBanner("");
        setChildPreview(null);

        const code = form.inviteCode.trim().toUpperCase();

        if (!/^[A-Z]{3}-\d{4}$/.test(code)) {
            setErrors({ inviteCode: "Use the invitation format ABC-1234." });
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const { data } = await api.post("/parent/preview-child", { inviteCode: code });
            setChildPreview(data.child);
        } catch (error) {
            setBanner(getMessage(error, "Invalid or expired invitation code."));
        } finally {
            setLoading(false);
        }
    };

    const handleLinkChild = async () => {
        setLoading(true);
        setBanner("");

        try {
            await api.post("/parent/link-child", {
                inviteCode: form.inviteCode.trim().toUpperCase(),
            });

            // Keep the stored user in sync so the next login/redirect
            // doesn't send the parent back to this page.
            try {
                const stored = JSON.parse(localStorage.getItem("user") || "null");
                if (stored) {
                    localStorage.setItem("user", JSON.stringify({ ...stored, hasLinkedChild: true }));
                }
            } catch {
                /* ignore malformed stored user */
            }

            setSuccess(true);
            toast.success("Child linked successfully.");
        } catch (error) {
            setBanner(getMessage(error, "Could not link this child."));
        } finally {
            setLoading(false);
        }
    };

    /* -------------------------------- OTP --------------------------------- */

    const handleOtpChange = (index, rawValue) => {
        const digits = rawValue.replace(/\D/g, "");

        // Full code at once (autofill / one-time-code)
        if (digits.length >= 6) {
            setOtp(digits.slice(0, 6).split(""));
            otpRefs.current[5]?.focus();
            return;
        }

        // Keep only the last typed digit for this box.
        const next = [...otp];
        next[index] = digits.slice(-1);
        setOtp(next);

        if (digits && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpPaste = (event) => {
        event.preventDefault();

        const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!digits) return;

        const next = [...EMPTY_OTP];
        digits.split("").forEach((digit, i) => {
            next[i] = digit;
        });

        setOtp(next);
        otpRefs.current[Math.min(digits.length, 5)]?.focus();
    };

    const handleOtpKeyDown = (index, event) => {
        if (event.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
        if (event.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
        if (event.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
    };

    /* ------------------------------ RENDER -------------------------------- */

    const handleSubmit = (event) => {
        if (isLogin) return handleLogin(event);
        if (isSignup) return handleSignup(event);
        if (isVerify) return handleVerify(event);
        if (isForgot) return handleForgot(event);
        if (isReset) return handleReset(event);
        if (isLinkChild) return handleFindChild(event);
    };

    const heading = {
        "/login": ["Welcome back", "Sign in to continue your journey."],
        "/signup": ["Create your account", "Choose Parent or Coach to join the academy."],
        "/verify-email": ["Verify your email", "Enter the six-digit code we sent you."],
        "/forgot-password": ["Forgot password?", "We'll help you securely reset it."],
        "/reset-password": ["Set a new password", "Choose a strong password for your account."],
        "/parent/link-child": ["Link your child", "Connect your parent account to your child's profile."],
    }[page] || ["Page not found", "This page is not available."];

    const submitLabel = {
        "/login": "Sign in",
        "/signup": "Create account",
        "/verify-email": "Verify email",
        "/forgot-password": "Send reset link",
        "/reset-password": "Update password",
        "/parent/link-child": "Find child",
    }[page] || "Continue";

    return (
        <main className="auth-shell">
            <div className="auth-decoration auth-decoration-one" />
            <div className="auth-decoration auth-decoration-two" />

            <div className="auth-layout-grid">
                <AuthAside />

                <section className="auth-panel">
                    <div className="auth-heading">
                        <span className="auth-heading-icon">
                            {isSignup ? <FiUser /> : isVerify ? <FiMail /> : isLinkChild ? <FiUsers /> : <FiLock />}
                        </span>
                        <h2>{heading[0]}</h2>
                        <p>{heading[1]}</p>
                    </div>

                    {banner && (
                        <div className="auth-banner" role="alert" aria-live="polite">
                            <FiShield />
                            <span>{banner}</span>
                        </div>
                    )}

                    {isLogin && (
                        <>
                            <span className="auth-section-label">SIGN IN AS</span>
                            <RoleCards roles={ROLES} role={role} onSelect={selectRole} />
                        </>
                    )}

                    {isSignup && (
                        <>
                            <span className="auth-section-label">CHOOSE YOUR ACCOUNT</span>
                            <RoleCards roles={SIGNUP_ROLES} role={role} onSelect={selectRole} />
                        </>
                    )}

                    {success && (isForgot || isReset || isVerify || isLinkChild) ? (
                        <div className="auth-success-animation">
                            <span className="auth-success-big"><FiCheckCircle /></span>
                            <h2>
                                {isForgot
                                    ? "Check your inbox"
                                    : isReset
                                        ? "Password updated"
                                        : isVerify
                                            ? "Email verified!"
                                            : "Child linked!"}
                            </h2>
                            <p>
                                {isForgot
                                    ? "If an account exists for that email, you will receive reset instructions."
                                    : isReset
                                        ? "Your password has been changed. You can now sign in."
                                        : isVerify
                                            ? "Your account is verified. Redirecting you now..."
                                            : "Your child's profile is now linked to your parent account."}
                            </p>

                            {isForgot && (
                                <button type="button" className="auth-secondary-btn" onClick={() => setSuccess(false)}>
                                    <FiRefreshCw /> Send another request
                                </button>
                            )}

                            {isReset && (
                                <Link className="auth-submit auth-submit-link" to="/login">
                                    Back to login <FiArrowRight />
                                </Link>
                            )}

                            {isLinkChild && (
                                <>
                                    <Link className="auth-submit auth-submit-link" to={DASHBOARDS.parent}>
                                        Go to dashboard <FiArrowRight />
                                    </Link>

                                    <button
                                        type="button"
                                        className="auth-secondary-btn"
                                        onClick={() => {
                                            setSuccess(false);
                                            setChildPreview(null);
                                            setForm((previous) => ({ ...previous, inviteCode: "" }));
                                        }}
                                    >
                                        Link another child
                                    </button>
                                </>
                            )}
                        </div>
                    ) : isLinkChild && childPreview ? (
                        <div className="auth-form">
                            <div className="auth-child-preview">
                                <span><FiUser /></span>
                                <div>
                                    <strong>{childPreview.fullName}</strong>
                                    <small>{childPreview.batchName || "Academy player"}</small>
                                    <small>{childPreview.skillLevel || "Player profile"}</small>
                                </div>
                                <FiCheckCircle />
                            </div>

                            <button type="button" className="auth-submit" disabled={loading} onClick={handleLinkChild}>
                                {loading ? "Linking..." : "Yes, this is my child"}
                                <FiCheckCircle />
                            </button>

                            <button type="button" className="auth-back-link" onClick={() => setChildPreview(null)}>
                                <FiArrowLeft /> Use another invitation code
                            </button>
                        </div>
                    ) : (
                        <form className="auth-form" onSubmit={handleSubmit} noValidate>
                            {isSignup && (
                                <>
                                    <div className="auth-field">
                                        <label htmlFor="fullName">Full name</label>
                                        <div className={`auth-input-wrap ${errors.fullName ? "has-error" : ""}`}>
                                            <FiUser className="auth-input-icon" />
                                            <input
                                                id="fullName"
                                                autoComplete="name"
                                                placeholder="Enter your full name"
                                                value={form.fullName}
                                                onChange={(e) => updateField("fullName", e.target.value)}
                                                aria-invalid={Boolean(errors.fullName)}
                                            />
                                        </div>
                                        <FieldError>{errors.fullName}</FieldError>
                                    </div>

                                    <div className="auth-field">
                                        <label htmlFor="phone">Phone number</label>
                                        <div className={`auth-input-wrap ${errors.phone ? "has-error" : ""}`}>
                                            <input
                                                id="phone"
                                                type="tel"
                                                autoComplete="tel"
                                                placeholder="+91 98765 43210"
                                                value={form.phone}
                                                onChange={(e) => updateField("phone", e.target.value)}
                                                aria-invalid={Boolean(errors.phone)}
                                            />
                                        </div>
                                        <FieldError>{errors.phone}</FieldError>
                                    </div>
                                </>
                            )}

                            {/* Parent login: ONE input only */}
                            {isParentLogin && (
                                <div className="auth-field">
                                    <label htmlFor="playerCode">Player code</label>
                                    <div className={`auth-input-wrap ${errors.playerCode ? "has-error" : ""}`}>
                                        <FiLink className="auth-input-icon" />
                                        <input
                                            id="playerCode"
                                            placeholder="Player ID or registered phone number"
                                            autoComplete="off"
                                            value={form.playerCode}
                                            onChange={(e) => updateField("playerCode", e.target.value)}
                                            aria-invalid={Boolean(errors.playerCode)}
                                            autoFocus
                                        />
                                    </div>
                                    <FieldError>{errors.playerCode}</FieldError>
                                </div>
                            )}

                            {(isSignup || isForgot || (isLogin && !isParentLogin)) && (
                                <div className="auth-field">
                                    <label htmlFor="email">Email address</label>
                                    <div className={`auth-input-wrap ${errors.email ? "has-error" : ""}`}>
                                        <FiMail className="auth-input-icon" />
                                        <input
                                            id="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                            value={form.email}
                                            onChange={(e) => updateField("email", e.target.value)}
                                            aria-invalid={Boolean(errors.email)}
                                            required
                                        />
                                    </div>
                                    <FieldError>{errors.email}</FieldError>
                                </div>
                            )}

                            {(isSignup || isReset || (isLogin && !isParentLogin)) && (
                                <div className="auth-field">
                                    <label htmlFor="password">{isReset ? "New password" : "Password"}</label>

                                    <div className={`auth-input-wrap ${errors.password ? "has-error" : ""}`}>
                                        <FiLock className="auth-input-icon" />
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete={isLogin ? "current-password" : "new-password"}
                                            placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                                            value={form.password}
                                            onChange={(e) => updateField("password", e.target.value)}
                                            aria-invalid={Boolean(errors.password)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() => setShowPassword((value) => !value)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>

                                    <FieldError>{errors.password}</FieldError>

                                    {(isSignup || isReset) && (
                                        <>
                                            <PasswordStrength password={form.password} />
                                            <PasswordRules password={form.password} />
                                        </>
                                    )}
                                </div>
                            )}

                            {(isSignup || isReset) && (
                                <div className="auth-field">
                                    <label htmlFor="confirmPassword">Confirm password</label>
                                    <div className={`auth-input-wrap ${errors.confirmPassword ? "has-error" : ""}`}>
                                        <FiLock className="auth-input-icon" />
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            placeholder="Enter your password again"
                                            value={form.confirmPassword}
                                            onChange={(e) => updateField("confirmPassword", e.target.value)}
                                            aria-invalid={Boolean(errors.confirmPassword)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() => setShowConfirmPassword((value) => !value)}
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                    <FieldError>{errors.confirmPassword}</FieldError>
                                </div>
                            )}

                            {isLogin && !isParentLogin && (
                                <div className="auth-form-options">
                                    <label className="auth-check">
                                        <input
                                            type="checkbox"
                                            checked={form.rememberMe}
                                            onChange={(e) => updateField("rememberMe", e.target.checked)}
                                        />
                                        <span>Remember me</span>
                                    </label>
                                    <Link to="/forgot-password" className="auth-inline-link">
                                        Forgot password?
                                    </Link>
                                </div>
                            )}

                            {isSignup && (
                                <label className="auth-check auth-terms">
                                    <input
                                        type="checkbox"
                                        checked={form.terms}
                                        onChange={(e) => updateField("terms", e.target.checked)}
                                    />
                                    <span>
                                        I agree to the <Link to="/terms">Terms</Link> and{" "}
                                        <Link to="/privacy-policy">Privacy Policy</Link>.
                                        <FieldError>{errors.terms}</FieldError>
                                    </span>
                                </label>
                            )}

                            {isVerify && (
                                <>
                                    <p className="auth-note">
                                        Verification code sent to <strong>{email || "your email"}</strong>
                                    </p>
                                    <div className="auth-otp">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(node) => (otpRefs.current[index] = node)}
                                                value={digit}
                                                inputMode="numeric"
                                                autoComplete={index === 0 ? "one-time-code" : "off"}
                                                maxLength={6}
                                                aria-label={`Verification digit ${index + 1}`}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                onPaste={handleOtpPaste}
                                            />
                                        ))}
                                    </div>
                                    <div className="auth-resend">
                                        {resendSeconds > 0 ? (
                                            <>Resend code in <strong>{resendSeconds}s</strong></>
                                        ) : (
                                            <button type="button" onClick={handleResendOtp} disabled={loading}>
                                                Resend code
                                            </button>
                                        )}
                                    </div>
                                    <Link className="auth-back-link" to="/signup" state={{ role }}>
                                        <FiArrowLeft /> Change account details
                                    </Link>
                                </>
                            )}

                            {isLinkChild && (
                                <div className="auth-field">
                                    <label htmlFor="inviteCode">Player invitation code</label>
                                    <div className={`auth-input-wrap ${errors.inviteCode ? "has-error" : ""}`}>
                                        <FiLink className="auth-input-icon" />
                                        <input
                                            id="inviteCode"
                                            placeholder="ABC-1234"
                                            autoCapitalize="characters"
                                            value={form.inviteCode}
                                            onChange={(e) => updateField("inviteCode", e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    <FieldError>{errors.inviteCode}</FieldError>
                                    <p className="auth-note">
                                        Enter the invitation code provided by the academy to link the player and view performance.
                                    </p>
                                </div>
                            )}

                            {isSignup && (
                                <p className="auth-note">
                                    <FiShield />
                                    Coach accounts may require admin approval. Admin accounts cannot be created
                                    through public signup.
                                </p>
                            )}

                            {isParentLogin && (
                                <p className="auth-note">
                                    <FiUsers />
                                    Enter the player code given by the academy to see attendance, match results
                                    and coach feedback.
                                </p>
                            )}

                            {isLogin && role === "coach" && (
                                <p className="auth-note">
                                    <FiShield />
                                    Sign in with the email and password your academy admin created for you.
                                </p>
                            )}

                            {isLogin && role === "admin" && (
                                <p className="auth-note">
                                    <FiShield />
                                    Admin accounts are provided by the academy.
                                </p>
                            )}

                            <button
                                className="auth-submit"
                                type="submit"
                                disabled={loading || (isLogin && lockoutSeconds > 0)}
                            >
                                {loading ? (
                                    <>
                                        <span className="auth-spinner" />
                                        Please wait...
                                    </>
                                ) : isLogin && lockoutSeconds > 0 ? (
                                    `Try again in ${lockoutSeconds}s`
                                ) : (
                                    <>
                                        {submitLabel}
                                        <FiArrowRight />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {(isLogin || isSignup) && (
                        <p className="auth-switch">
                            {isSignup ? "Already have an account?" : "New to SmashPoint?"}
                            <Link to={isSignup ? "/login" : "/signup"}>
                                {isSignup ? " Sign in" : " Create account"}
                            </Link>
                        </p>
                    )}

                    {(isForgot || isVerify || isReset || isLinkChild) && (
                        <Link to="/login" className="auth-back-link">
                            <FiArrowLeft /> Back to login
                        </Link>
                    )}
                </section>
            </div>
        </main>
    );
}