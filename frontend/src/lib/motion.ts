import { Variants, Transition } from "framer-motion";

/**
 * MICROINTERACTION & MOTION DESIGN BLUEPRINT (V5)
 * 
 * Standardized easing curves and duration constants to ensure
 * native app-level fluidity across the Teer Social ecosystem.
 */

// Timing Constants
export const DURATIONS = {
    micro: 0.15,   // 150ms for tap depth, micro-toggles
    fast: 0.25,    // 250ms for simple state changes
    base: 0.35,    // 350ms for page transitions, modals
    reveal: 0.7,   // 700ms for dramatic slot-machine reveals
    celeb: 1.2,    // 1.2s for confetti/success animations
};

// Easing Curves (Cubic Bezier)
export const EASINGS = {
    entrance: [0.2, 0, 0, 1] as [number, number, number, number],       // Ease-out (Swift entrance)
    standard: [0.4, 0, 0.2, 1] as [number, number, number, number],     // Ease-in-out (Standard UI)
    exit: [0.4, 0, 1, 1] as [number, number, number, number],           // Ease-in (Swift exit)
    spring: {                       // Fluid iOS-style spring
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 1,
    } as Transition,
    bouncySpring: {
        type: "spring",
        stiffness: 400,
        damping: 20,
        mass: 1,
    } as Transition,
};

// Common Transitions
export const TRANSITIONS = {
    micro: { duration: DURATIONS.micro, ease: EASINGS.standard },
    base: { duration: DURATIONS.base, ease: EASINGS.standard },
    spring: EASINGS.spring,
};

/* -------------------------------------------------------------------------- */
/*                                ANIMATION VARIANTS                          */
/* -------------------------------------------------------------------------- */

// Slide-up Modal (e.g., Post Prediction Drawer)
export const slideUpModalVariants: Variants = {
    hidden: { y: "100%", opacity: 0.8 },
    visible: {
        y: 0,
        opacity: 1,
        transition: EASINGS.spring
    },
    exit: {
        y: "100%",
        opacity: 0.8,
        transition: { duration: DURATIONS.fast, ease: EASINGS.exit }
    }
};

// Modal Backdrop Dim & Blur
export const backdropVariants: Variants = {
    hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    visible: {
        opacity: 1,
        backdropFilter: "blur(8px)",
        transition: TRANSITIONS.base
    },
    exit: {
        opacity: 0,
        backdropFilter: "blur(0px)",
        transition: TRANSITIONS.base
    }
};

// Staggered Feed List
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08, // 80ms delay between cards
        }
    }
};

// Single Feed Item Drop-in
export const fadeUpItem: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 25 }
    }
};

// Tap Effect (Buttons, Cards)
export const tapRipple = {
    scale: 0.97,
    transition: TRANSITIONS.micro
};

// Hover Lift (Cards)
export const hoverLift = {
    y: -4,
    boxShadow: "0px 12px 24px -8px rgba(0, 0, 0, 0.15)",
    transition: TRANSITIONS.base
};

// Number Match Reveal / Confetti Pop
export const successPop: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: EASINGS.bouncySpring
    }
};

// Horizontal Swipe-in (e.g., Sidebars, Tickers)
export const slideInFromRight: Variants = {
    hidden: { x: 40, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: EASINGS.spring
    }
};
