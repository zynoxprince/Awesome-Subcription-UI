// src/App.js
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaUserFriends, FaDatabase, FaRocket, FaStar, FaRegGem, FaBolt, FaTimes, FaArrowRight, FaArrowLeft, FaRegCreditCard, FaLock, FaUser, FaEnvelope, FaPhone, FaSpinner } from 'react-icons/fa';

// Helper function to simulate async action
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Plan Data
const plans = [
    { id: 'starter', name: 'Starter Spark', price: { monthly: '$9', annually: '$90' }, priceValue: { monthly: 9, annually: 90 }, icon: FaBolt, bgColor: 'rgba(22, 33, 62, 0.85)', borderColor: '#3b82f6', accentColor: '#60a5fa', features: [{ text: '1 User Account', icon: FaUserFriends }, { text: '1 GB Secure Storage', icon: FaDatabase }, { text: 'Basic Email Support', icon: FaCheckCircle }, { text: 'Community Forum Access', icon: FaCheckCircle }], isFeatured: false, ctaText: 'Get Started', delay: 0.2 },
    { id: 'pro', name: 'Pro Ignition', price: { monthly: '$29', annually: '$290' }, priceValue: { monthly: 29, annually: 290 }, icon: FaRocket, bgColor: 'rgba(15, 54, 96, 0.9)', borderColor: '#0ea5e9', accentColor: '#38bdf8', features: [{ text: '5 User Accounts', icon: FaUserFriends }, { text: '50 GB Secure Storage', icon: FaDatabase }, { text: 'Priority Email Support', icon: FaCheckCircle }, { text: 'Standard API Access', icon: FaCheckCircle }, { text: 'Advanced Analytics Dashboard', icon: FaCheckCircle }], isFeatured: true, ctaText: 'Choose Pro', delay: 0 },
    { id: 'enterprise', name: 'Enterprise Orbit', price: { monthly: '$99', annually: '$990' }, priceValue: { monthly: 99, annually: 990 }, icon: FaRegGem, bgColor: 'rgba(40, 18, 77, 0.85)', borderColor: '#a855f7', accentColor: '#c084fc', features: [{ text: 'Unlimited User Accounts', icon: FaUserFriends }, { text: '1 TB Secure Storage', icon: FaDatabase }, { text: 'Dedicated 24/7 Support', icon: FaCheckCircle }, { text: 'Premium API & Integrations', icon: FaCheckCircle }, { text: 'Custom SLA & Onboarding', icon: FaCheckCircle }], isFeatured: false, ctaText: 'Contact Sales', delay: 0.2 },
];

// --- Animation Variants ---
const pageVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5, when: "beforeChildren" } } };
const titleContainerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } } };
const titleVariants = { hidden: { opacity: 0, y: -30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const starIconVariants = { hidden: { opacity: 0, scale: 0, rotate: -45 }, visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 200, damping: 10, delay: 0.3 } } };
const subtitleVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };
const toggleVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut', delay: 0.6 } } };
const plansContainerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.25, delayChildren: 0.8 } } };
const cardVariants = { hidden: { opacity: 0, y: 60, scale: 0.9 }, visible: (customDelay) => ({ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 90, damping: 18, mass: 0.8, delay: customDelay } }), hover: { scale: 1.06, y: -8, boxShadow: (custom, element) => { let accentColor = '#60a5fa'; if (element && element.dataset.plan) { try { const planData = JSON.parse(element.dataset.plan); accentColor = planData.accentColor || accentColor; } catch (e) { console.error("Failed to parse plan data", e); } } else if (typeof custom === 'object' && custom !== null && custom.accentColor) { accentColor = custom.accentColor; } return `0px 30px 60px -15px rgba(0, 0, 0, 0.4), 0 0 25px 0px ${accentColor}aa`; }, transition: { type: 'spring', stiffness: 350, damping: 15 } }, tap: { scale: 0.98, transition: { type: 'spring', stiffness: 400, damping: 25 } } };
const featureVariants = { hidden: { opacity: 0, x: -30 }, visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1 + 0.5, duration: 0.5, ease: "circOut" } }) };

// --- Modal Animation Variants ---
const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } }, exit: { opacity: 0, transition: { duration: 0.3, delay: 0.3 } } };
const modalVariants = { hidden: { opacity: 0, y: 50, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 25, delay: 0.1 } }, exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } } };
const stepVariants = { enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }), center: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 30, duration: 0.4 } }, exit: (direction) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0, transition: { ease: 'easeInOut', duration: 0.3 } }) };


function App() {
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', cardNumber: '', expiryDate: '', cvc: '' });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleBilling = () => {
        setBillingCycle(prev => (prev === 'monthly' ? 'annually' : 'monthly'));
    };

    const handleSignUpClick = (plan) => {
        setSelectedPlan(plan);
        setCurrentStep(1);
        setFormData({ name: '', email: '', phone: '', password: '', cardNumber: '', expiryDate: '', cvc: '' });
        setFormErrors({});
        setIsSubmitting(false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const formatExpiryDate = (value) => {
        const cleaned = value.replace(/\D+/g, ''); // Remove non-digits
        if (cleaned.length >= 3) {
            // Insert " / " after the first 2 digits (month)
            return `${cleaned.slice(0, 2)} / ${cleaned.slice(2, 4)}`;
        }
        return cleaned;
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // *** Apply formatting specifically for expiry date ***
        if (name === 'expiryDate') {
            formattedValue = formatExpiryDate(value);
        }
         // Optional: Add formatting for Card Number (e.g., add spaces)
         else if (name === 'cardNumber') {
            const cleaned = value.replace(/\D+/g, '');
            const parts = [];
            for(let i=0; i< cleaned.length; i+=4){
                 parts.push(cleaned.slice(i, i+4));
            }
            formattedValue = parts.join(' ');
         }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateStep1 = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = "Name is required";
        if (!formData.email.trim()) errors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
        if (!formData.phone.trim()) errors.phone = "Phone number is required";
        else if (!/^\+?[0-9\s-()]{10,}$/.test(formData.phone)) errors.phone = "Phone number is invalid";
        if (!formData.password.trim()) errors.password = "Password is required";
        else if (formData.password.length < 8) errors.password = "Password must be at least 8 characters";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep2 = () => {
        const errors = {};
        if (!formData.cardNumber.replace(/\s/g, '')) errors.cardNumber = "Card number is required";
        else if (!/^[0-9\s]{15,19}$/.test(formData.cardNumber)) errors.cardNumber = "Invalid card number format";
        if (!formData.expiryDate.trim()) errors.expiryDate = "Expiry date is required";
        // Validate format AFTER formatting (MM / YY)
        else if (!/^(0[1-9]|1[0-2])\s?\/\s?[0-9]{2}$/.test(formData.expiryDate)) errors.expiryDate = "Invalid date format (MM / YY)";
        if (!formData.cvc.trim()) errors.cvc = "CVC is required";
        else if (!/^[0-9]{3,4}$/.test(formData.cvc)) errors.cvc = "Invalid CVC format";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNextStep = () => {
        if (currentStep === 1 && validateStep1()) {
            setDirection(1);
            setCurrentStep(2);
        }
    };

    const handlePrevStep = () => {
        setDirection(-1);
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentStep === 2 && validateStep2()) {
            setIsSubmitting(true);
            console.log("Simulating submission...");
            await sleep(1500);
            console.log("Form Data Submitted (mock):", formData);
            setIsSubmitting(false);
            setDirection(1);
            setCurrentStep(3);
        }
    };

    const resetAndClose = () => {
        closeModal();
        setTimeout(() => {
            setCurrentStep(1);
            setFormData({ name: '', email: '', phone: '', password: '', cardNumber: '', expiryDate: '', cvc: '' });
            setFormErrors({});
            setSelectedPlan(null);
        }, 300)
    }


    return (
        <motion.div
            className="App"
            initial="hidden"
            animate="visible"
            variants={pageVariants}
        >
            <div className="background-shapes">
                <motion.div className="shape shape-1" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', delay: 1.2, duration: 1.5 }}></motion.div>
                <motion.div className="shape shape-2" initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', delay: 1.4, duration: 1.8 }}></motion.div>
                <motion.div className="shape shape-3" initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', delay: 1.6, duration: 2 }}></motion.div>
            </div>

            <motion.div className="title-container" variants={titleContainerVariants}>
                <motion.div variants={starIconVariants}><FaStar className="title-icon" /></motion.div>
                <motion.h1 className="main-title" variants={titleVariants}>Choose Your Perfect Plan</motion.h1>
                <motion.p className="subtitle" variants={subtitleVariants}>Unlock potential with our flexible and scalable subscription tiers.</motion.p>
            </motion.div>

            <motion.div className="billing-toggle-container" variants={toggleVariants}>
                <span className={`toggle-label ${billingCycle === 'monthly' ? 'active' : ''}`}>Billed Monthly</span>
                <motion.div className="toggle-switch" onClick={toggleBilling} data-active={billingCycle === 'annually'} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                    <motion.div className="toggle-knob" layout transition={{ type: 'spring', stiffness: 600, damping: 25 }} />
                </motion.div>
                <span className={`toggle-label ${billingCycle === 'annually' ? 'active' : ''}`}>Billed Annually<motion.span className="save-badge" initial={{ scale: 0, opacity: 0 }} animate={{ scale: billingCycle === 'annually' ? 1 : 0, opacity: billingCycle === 'annually' ? 1 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}>SAVE 15%+</motion.span></span>
            </motion.div>

            <motion.div className="plans-container" variants={plansContainerVariants}>
                {plans.map((plan) => (
                    <motion.div key={plan.id} className={`plan-card ${plan.isFeatured ? 'featured' : ''}`} variants={cardVariants} custom={plan.delay} whileHover="hover" whileTap="tap" initial="hidden" animate="visible" data-plan={JSON.stringify({ accentColor: plan.accentColor })} style={{ '--card-border-color': plan.borderColor, '--card-accent-color': plan.accentColor, '--card-bg-color': plan.bgColor }}>
                        {plan.isFeatured && (<motion.div className="featured-badge" initial={{ scale: 0, rotate: -15, y: -20 }} animate={{ scale: 1, rotate: 0, y: 0 }} transition={{ delay: 1.0, type: 'spring', stiffness: 300, damping: 10 }}>Most Popular <FaStar /></motion.div>)}
                        <div className="plan-header">
                            <motion.div className="plan-icon-wrapper" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 250, damping: 12, delay: plan.delay + 0.4 }}>
                                <plan.icon className="plan-icon" style={{ color: plan.accentColor }} />
                            </motion.div>
                            <h2 className="plan-name">{plan.name}</h2>
                            <AnimatePresence mode="wait">
                                <motion.div key={billingCycle + plan.id} className="plan-price-container" initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>
                                    <span className="price-amount">{plan.price[billingCycle]}</span>
                                    <span className="price-cycle">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                </motion.div>
                            </AnimatePresence>
                            <motion.span className="annual-saving" initial={{ opacity: 0, height: 0 }} animate={{ opacity: billingCycle === 'annually' && plan.priceValue.annually > 0 ? 1 : 0, height: billingCycle === 'annually' && plan.priceValue.annually > 0 ? 'auto' : 0, marginTop: billingCycle === 'annually' && plan.priceValue.annually > 0 ? '8px' : '0px', }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                                (Equals ${(plan.priceValue.annually / 12).toFixed(2)}/month)
                            </motion.span>
                        </div>
                        <ul className="plan-features">
                            {plan.features.map((feature, index) => (
                                <motion.li key={index} className="feature-item" variants={featureVariants} custom={index} initial="hidden" animate="visible">
                                    <motion.span className="feature-icon-wrapper" whileHover={{ scale: 1.3, rotate: 10 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}><feature.icon className="feature-icon" style={{ color: plan.accentColor }} /></motion.span>
                                    <span className="feature-text">{feature.text}</span>
                                </motion.li>))}
                        </ul>
                        <motion.button className={`cta-button ${plan.isFeatured ? 'featured-button' : ''}`} onClick={() => handleSignUpClick(plan)} whileHover={{ scale: 1.08, boxShadow: `0px 12px 25px 0px ${plan.accentColor}66`, transition: { type: 'spring', stiffness: 450, damping: 15 } }} whileTap={{ scale: 0.96, transition: { type: 'spring', stiffness: 450, damping: 15 } }} style={{ '--button-base-color': plan.borderColor, '--button-accent-color': plan.accentColor, }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 150, damping: 20, delay: plan.delay + 1.0 }}>
                            {plan.ctaText}
                        </motion.button>
                    </motion.div>))}
            </motion.div>

            <motion.div className="footer-info" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.7, ease: 'easeOut' }}>
                <p>Need a custom solution or have questions? <a href="#contact">Talk to our experts</a>.</p>
                <p>All prices shown in USD. Applicable taxes may be added during checkout.</p>
            </motion.div>


            {/* --- Signup Modal --- */}
            <AnimatePresence>
                {isModalOpen && selectedPlan && (
                    <motion.div
                        className="modal-overlay"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={closeModal}
                    >
                        <motion.div
                            className="modal-content"
                            variants={modalVariants}
                            onClick={(e) => e.stopPropagation()}
                            style={{ '--modal-accent-color': selectedPlan.accentColor }}
                        >
                            <motion.button
                                className="modal-close-button"
                                onClick={closeModal}
                                whileHover={{ scale: 1.2, rotate: 90, color: 'var(--modal-accent-color)' }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FaTimes />
                            </motion.button>

                            <div className="modal-header">
                                <selectedPlan.icon className="modal-plan-icon" />
                                <h2>Signup for {selectedPlan.name}</h2>
                                <p>Complete the steps below to get started.</p>
                            </div>

                             <div className="step-indicator">
                                <div className={`step-number ${currentStep >= 1 ? 'active' : ''}`}>1</div>
                                <div className={`step-line ${currentStep >= 2 ? 'active' : ''}`}></div>
                                <div className={`step-number ${currentStep >= 2 ? 'active' : ''}`}>2</div>
                                <div className={`step-line ${currentStep >= 3 ? 'active' : ''}`}></div>
                                <div className={`step-number ${currentStep >= 3 ? 'active' : ''}`}><FaCheckCircle /></div>
                             </div>

                            <div className="modal-steps-container">
                                <AnimatePresence mode="wait" custom={direction}>
                                    {currentStep === 1 && (
                                        <motion.div key="step1" className="modal-step" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" >
                                            <h3>Step 1: Your Information</h3>
                                            <form onSubmit={(e) => {e.preventDefault(); handleNextStep();}}>
                                                <div className="form-group">
                                                    <label htmlFor="name"><FaUser/> Name</label>
                                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your Full Name" className={formErrors.name ? 'input-error' : ''} maxLength={50} />
                                                    {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                                                </div>
                                                 <div className="form-group">
                                                    <label htmlFor="email"><FaEnvelope/> Email Address</label>
                                                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className={formErrors.email ? 'input-error' : ''} maxLength={100} />
                                                    {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                                                </div>
                                                 <div className="form-group">
                                                    <label htmlFor="phone"><FaPhone/> Phone Number</label>
                                                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 123-4567" className={formErrors.phone ? 'input-error' : ''} maxLength={20} />
                                                    {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                                                </div>
                                                 <div className="form-group">
                                                    <label htmlFor="password"><FaLock/> Create Password</label>
                                                    <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Min. 8 characters" className={formErrors.password ? 'input-error' : ''} maxLength={50} />
                                                    {formErrors.password && <span className="error-message">{formErrors.password}</span>}
                                                </div>
                                                <div className="modal-actions">
                                                   <motion.button type="submit" className="modal-button next" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}> Next <FaArrowRight /> </motion.button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}

                                    {currentStep === 2 && (
                                        <motion.div key="step2" className="modal-step" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" >
                                             <h3>Step 2: Billing Details</h3>
                                             <form onSubmit={handleSubmit}>
                                                <div className="form-group">
                                                    <label htmlFor="cardNumber"><FaRegCreditCard/> Card Number</label>
                                                    <input type="text" id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} placeholder="0000 0000 0000 0000" className={formErrors.cardNumber ? 'input-error' : ''} inputMode="numeric" autoComplete="cc-number" maxLength={19} />
                                                    {formErrors.cardNumber && <span className="error-message">{formErrors.cardNumber}</span>}
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label htmlFor="expiryDate">Expiry Date</label>
                                                        <input type="text" id="expiryDate" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} placeholder="MM / YY" className={formErrors.expiryDate ? 'input-error' : ''} inputMode="numeric" autoComplete="cc-exp" maxLength={7} />
                                                        {formErrors.expiryDate && <span className="error-message">{formErrors.expiryDate}</span>}
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="cvc">CVC</label>
                                                        <input type="text" id="cvc" name="cvc" value={formData.cvc} onChange={handleInputChange} placeholder="123" className={formErrors.cvc ? 'input-error' : ''} inputMode="numeric" autoComplete="cc-csc" maxLength={4} />
                                                        {formErrors.cvc && <span className="error-message">{formErrors.cvc}</span>}
                                                    </div>
                                                </div>
                                                 <div className="modal-actions space-between">
                                                   <motion.button type="button" className="modal-button back" onClick={handlePrevStep} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}> <FaArrowLeft /> Back </motion.button>
                                                    <motion.button type="submit" className="modal-button submit" disabled={isSubmitting} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}> {isSubmitting ? <FaSpinner className="spinner" /> : `Submit Payment`} </motion.button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}

                                     {currentStep === 3 && (
                                        <motion.div key="step3" className="modal-step confirmation-step" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" >
                                             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}> <FaCheckCircle className="confirmation-icon" /> </motion.div>
                                             <h2>Signup Complete!</h2>
                                             <p>Thank you for signing up for the {selectedPlan.name} plan!</p>
                                             <p className="confirmation-note"> This is a demonstration. In a real application, your account would now be active. Backend functionality is required for full activation and billing processing. </p>
                                             <motion.button className="modal-button done" onClick={resetAndClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}> Done </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div> // End of App div
    );
}

export default App;