/* ═══════════════════════════════════════════════
	 AUTH PAGES — Login, Signup, ForgotPassword, ResetPassword
	 All share an elegant centred card layout
	 ═══════════════════════════════════════════════ */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import supabase from '@/lib/supabaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

/* ═══════════════════════════════════════════════
	 VALIDATION HELPERS
	 ═══════════════════════════════════════════════ */
const validateEmail = (email) => {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!email) return 'Email is required.';
	if (!re.test(email)) return 'Please enter a valid email address.';
	return '';
};

const validatePhone = (phone) => {
	const re = /^\+?[\d\s\-()]{7,15}$/;
	if (!phone.trim()) return 'Phone number is required.';
	if (!re.test(phone.trim())) return 'Enter a valid phone number (7–15 digits, may include +, spaces, or dashes).';
	return '';
};

const validatePassword = (password) => {
	if (!password) return 'Password is required.';
	if (password.length < 6) return 'Password must be at least 6 characters.';
	if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
	if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
	if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
	return '';
};

/* ── Password strength indicator ── */
const PasswordStrength = ({ password }) => {
	if (!password) return null;

	const checks = [
		{ label: '6+ characters', pass: password.length >= 6 },
		{ label: 'Uppercase', pass: /[A-Z]/.test(password) },
		{ label: 'Lowercase', pass: /[a-z]/.test(password) },
		{ label: 'Number', pass: /[0-9]/.test(password) },
	];

	const passed = checks.filter((c) => c.pass).length;
	const strengthColor =
		passed <= 1 ? '#c0392b' : passed <= 2 ? '#e67e22' : passed <= 3 ? '#f1c40f' : '#27ae60';
	const strengthLabel =
		passed <= 1 ? 'Weak' : passed <= 2 ? 'Fair' : passed <= 3 ? 'Good' : 'Strong';

	return (
		<div style={{ marginTop: '8px', marginBottom: '4px' }}>
			{/* Bar */}
			<div
				style={{
					height: '3px',
					background: 'var(--line)',
					borderRadius: '2px',
					marginBottom: '8px',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						height: '100%',
						width: `${(passed / 4) * 100}%`,
						background: strengthColor,
						borderRadius: '2px',
						transition: 'width 0.3s, background 0.3s',
					}}
				/>
			</div>
			{/* Checks */}
			<div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
				{checks.map((c) => (
					<span
						key={c.label}
						style={{
							fontSize: '10px',
							color: c.pass ? '#27ae60' : 'var(--ink-4)',
							display: 'flex',
							alignItems: 'center',
							gap: '3px',
							transition: 'color 0.2s',
						}}
					>
						<svg width="8" height="8" viewBox="0 0 8 8" fill="none">
							{c.pass ? (
								<path
									d="M1.5 4l2 2 3-3"
									stroke="#27ae60"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							) : (
								<circle cx="4" cy="4" r="3" stroke="currentColor" strokeWidth="1" />
							)}
						</svg>
						{c.label}
					</span>
				))}
				<span
					style={{
						fontSize: '10px',
						color: strengthColor,
						marginLeft: 'auto',
						fontWeight: 500,
						transition: 'color 0.2s',
					}}
				>
					{strengthLabel}
				</span>
			</div>
		</div>
	);
};

/* ── Shared Auth Layout ── */
const AuthCard = ({ title, subtitle, children }) => (
	<>
		<Header />
		<main
			id="main"
			style={{
				minHeight: 'calc(100vh - 200px)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '48px 24px',
				background: 'var(--off)',
			}}
		>
			<div
				style={{
					width: '100%',
					maxWidth: '440px',
					background: 'var(--white)',
					border: '1px solid var(--line)',
					padding: '48px 40px',
					borderRadius: '16px',
					boxShadow: '0 4px 24px rgba(0,0,0,0.04)'
				}}
			>
				<div style={{ textAlign: 'center', marginBottom: '36px' }}>
					<Link
						to="/"
						style={{
							fontFamily: 'var(--serif)',
							fontSize: '14px',
							color: 'var(--ink)',
							letterSpacing: '0.03em',
							display: 'block',
							marginBottom: '24px',
						}}
					>
						The Vedic Protocol
					</Link>
					<h1
						style={{
							fontFamily: 'var(--serif)',
							fontSize: '26px',
							fontWeight: 400,
							color: 'var(--ink)',
							marginBottom: '6px',
						}}
					>
						{title}
					</h1>
					{subtitle && (
						<p style={{ fontSize: '12px', color: 'var(--ink-4)', letterSpacing: '0.04em' }}>
							{subtitle}
						</p>
					)}
				</div>
				{children}
			</div>
		</main>
		<Footer />
	</>
);

/* ── Field Component ── */
const F = ({ label, id, error, hint, ...props }) => (
	<div className="field" style={{ marginBottom: '16px' }}>
		<label className="field-label" htmlFor={id}>
			{label}
		</label>
		<input
			className="field-input"
			id={id}
			style={{
				borderColor: error ? '#c0392b' : undefined,
				outline: error ? '1px solid #c0392b' : undefined,
			}}
			{...props}
		/>
		{error && (
			<span
				style={{
					display: 'block',
					fontSize: '11px',
					color: '#c0392b',
					marginTop: '4px',
				}}
			>
				{error}
			</span>
		)}
		{hint && !error && (
			<span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-4)', marginTop: '4px' }}>
				{hint}
			</span>
		)}
	</div>
);

/* ── Error banner ── */
const ErrorBanner = ({ message }) =>
	message ? (
		<p
			style={{
				fontSize: '12px',
				color: '#c0392b',
				padding: '10px 14px',
				background: '#fff5f5',
				border: '1px solid #fecdd3',
				marginBottom: '20px',
				lineHeight: 1.5,
				borderRadius: '8px'
			}}
		>
			{message}
		</p>
	) : null;

/* ── Success banner ── */
const SuccessBanner = ({ message }) =>
	message ? (
		<div
			style={{
				padding: '16px',
				background: '#f0fdf4',
				border: '1px solid #bbf7d0',
				marginBottom: '20px',
				borderRadius: '8px'
			}}
		>
			<p style={{ fontSize: '13px', color: '#166534', lineHeight: 1.5 }}>
				{message}
			</p>
		</div>
	) : null;

/* ═══════════════════════════════════════════════
	 LOGIN PAGE
	 ═══════════════════════════════════════════════ */
export const LoginPage = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [serverError, setServerError] = useState('');
	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from?.pathname || '/dashboard';

	const validate = () => {
		const e = {};
		const emailErr = validateEmail(email);
		if (emailErr) e.email = emailErr;
		if (!password) e.password = 'Password is required.';
		return e;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setServerError('');
		const errs = validate();
		if (Object.keys(errs).length) { setErrors(errs); return; }
		setErrors({});
		setLoading(true);
		const result = await login(email, password);
		if (result.success) {
			navigate(from, { replace: true });
		} else {
			setServerError(result.error || 'Invalid email or password. Please try again.');
			setLoading(false);
		}
	};

	return (
		<>
			<Helmet>
				<title>Log In | The Vedic Protocol</title>
				<meta name="robots" content="noindex" />
			</Helmet>
			<AuthCard title="Welcome back." subtitle="Enter your credentials to continue">
				<ErrorBanner message={serverError} />
				<form onSubmit={handleSubmit} noValidate>
					<F
						label="Email"
						id="l-email"
						type="email"
						value={email}
						onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
						error={errors.email}
						required
						autoComplete="email"
					/>
					<div style={{ marginBottom: '16px' }}>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: '6px',
							}}
						>
							<label className="field-label" htmlFor="l-pass" style={{ margin: 0 }}>
								Password
							</label>
							<Link
								to="/forgot-password"
								style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.06em' }}
							>
								Forgot?
							</Link>
						</div>
						<input
							className="field-input"
							id="l-pass"
							type="password"
							value={password}
							onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
							required
							autoComplete="current-password"
							style={{
								width: '100%',
								borderColor: errors.password ? '#c0392b' : undefined,
								outline: errors.password ? '1px solid #c0392b' : undefined,
							}}
						/>
						{errors.password && (
							<span style={{ display: 'block', fontSize: '11px', color: '#c0392b', marginTop: '4px' }}>
								{errors.password}
							</span>
						)}
					</div>
					<button
						type="submit"
						className="btn btn-dark btn-full btn-lg"
						style={{ marginTop: '8px' }}
						disabled={loading}
					>
						{loading ? 'Signing in…' : 'Log In'}
					</button>
				</form>
				<p
					style={{
						textAlign: 'center',
						fontSize: '12px',
						color: 'var(--ink-4)',
						marginTop: '24px',
						paddingTop: '20px',
						borderTop: '1px solid var(--line)',
					}}
				>
					No account?{' '}
					<Link to="/signup" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>
						Register here
					</Link>
				</p>
			</AuthCard>
		</>
	);
};

/* ═══════════════════════════════════════════════
	 SIGNUP PAGE
	 ═══════════════════════════════════════════════ */
export const SignupPage = () => {
	const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', passwordConfirm: '' });
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [serverError, setServerError] = useState('');
	const [successMsg, setSuccessMsg] = useState('');
	const [agreed, setAgreed] = useState(false);
	const { signup } = useAuth();
	const navigate = useNavigate();

	const validate = () => {
		const e = {};
		if (!form.name.trim()) e.name = 'Full name is required.';
		const emailErr = validateEmail(form.email);
		if (emailErr) e.email = emailErr;
		const phoneErr = validatePhone(form.phone);
		if (phoneErr) e.phone = phoneErr;
		const passErr = validatePassword(form.password);
		if (passErr) e.password = passErr;
		if (!form.passwordConfirm) {
			e.passwordConfirm = 'Please confirm your password.';
		} else if (form.password !== form.passwordConfirm) {
			e.passwordConfirm = 'Passwords do not match.';
		}
		if (!agreed) e.agreed = 'You must agree to the Terms of Service and Privacy Policy to continue.';
		return e;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setServerError('');
		setSuccessMsg('');

		const errs = validate();
		if (Object.keys(errs).length) { setErrors(errs); return; }

		setErrors({});
		setLoading(true);

		// Safety timeout: if signup takes longer than 15 s, unblock the button
		// so the user isn't permanently stuck on "Creating Account…"
		const timeoutId = setTimeout(() => {
			setLoading(false);
			setServerError(
				'The request is taking too long. Your account may have been created — try logging in, or check your email for a confirmation link.'
			);
		}, 15000);

		let result;
		try {
			result = await signup(form.name, form.email, form.password, form.passwordConfirm, form.phone);
		} catch (err) {
			clearTimeout(timeoutId);
			setServerError(err.message || 'Registration failed. Please try again.');
			setLoading(false);
			return;
		}
		clearTimeout(timeoutId);

		if (result.success) {
			if (result.emailConfirmRequired) {
				// Email confirmation is enabled in Supabase — no session yet.
				// Tell the user to check their inbox; the confirmation link will
				// redirect them straight to /dashboard (emailRedirectTo is set).
				setSuccessMsg(
					'Account created! Please check your email and click the confirmation link to activate your account. You will be redirected to your dashboard automatically.'
				);
				setLoading(false);
			} else {
				// Session is live — hard redirect so ProtectedRoute sees the session.
				setSuccessMsg('Account created successfully! Redirecting to the shop…');
				setTimeout(() => { window.location.href = '/shop?welcome=1'; }, 1500);
				// loading stays true — page is about to navigate away
			}
		} else {
			const msg = result.error || '';
			if (msg.toLowerCase().includes('email is already registered') || msg.toLowerCase().includes('email address')) {
				setErrors({ email: msg });
			} else if (msg.toLowerCase().includes('phone number is already registered') || msg.toLowerCase().includes('different number')) {
				setErrors({ phone: msg });
			} else if (msg.includes('Password must be at least')) {
				setErrors({ password: msg });
			} else {
				setServerError(msg || 'Registration failed. Please try again.');
			}
			setLoading(false);
		}
	};

	const set = (k) => (e) => {
		setForm({ ...form, [k]: e.target.value });
		setErrors((prev) => ({ ...prev, [k]: '' }));
	};

	return (
		<>
			<Helmet>
				<title>Create Account | The Vedic Protocol</title>
				<meta name="robots" content="noindex" />
			</Helmet>
			<AuthCard
				title="Join the Protocol."
				subtitle="Create your account to access clinical formulations"
			>
				<ErrorBanner message={serverError} />
				<SuccessBanner message={successMsg} />
				
				<form onSubmit={handleSubmit} noValidate>
					<F
						label="Full Name"
						id="s-name"
						type="text"
						value={form.name}
						onChange={set('name')}
						error={errors.name}
						required
						autoComplete="name"
						disabled={loading || !!successMsg}
					/>
					<F
						label="Email"
						id="s-email"
						type="email"
						value={form.email}
						onChange={set('email')}
						error={errors.email}
						required
						autoComplete="email"
						disabled={loading || !!successMsg}
					/>
					<F
						label="Phone Number"
						id="s-phone"
						type="tel"
						value={form.phone}
						onChange={set('phone')}
						error={errors.phone}
						required
						autoComplete="tel"
						placeholder="e.g. +91 98765 43210"
						disabled={loading || !!successMsg}
					/>

					{/* Password with strength indicator */}
					<div className="field" style={{ marginBottom: '16px' }}>
						<label className="field-label" htmlFor="s-pass">
							Password
						</label>
						<input
							className="field-input"
							id="s-pass"
							type="password"
							value={form.password}
							onChange={set('password')}
							required
							autoComplete="new-password"
							disabled={loading || !!successMsg}
							style={{
								borderColor: errors.password ? '#c0392b' : undefined,
								outline: errors.password ? '1px solid #c0392b' : undefined,
							}}
						/>
						<PasswordStrength password={form.password} />
						{errors.password && (
							<span style={{ display: 'block', fontSize: '11px', color: '#c0392b', marginTop: '4px' }}>
								{errors.password}
							</span>
						)}
					</div>

					<F
						label="Confirm Password"
						id="s-conf"
						type="password"
						value={form.passwordConfirm}
						onChange={set('passwordConfirm')}
						error={errors.passwordConfirm}
						required
						autoComplete="new-password"
						disabled={loading || !!successMsg}
					/>

					{/* Terms checkbox */}
					<div style={{ marginTop: '4px', marginBottom: '20px' }}>
						<label
							style={{
								display: 'flex',
								alignItems: 'flex-start',
								gap: '10px',
								fontSize: '11px',
								color: errors.agreed ? '#c0392b' : 'var(--ink-3)',
								lineHeight: 1.6,
								cursor: 'pointer',
							}}
						>
							<input
								type="checkbox"
								checked={agreed}
								onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, agreed: '' })); }}
								style={{ marginTop: '2px', accentColor: 'var(--gold)' }}
								disabled={loading || !!successMsg}
							/>
							I agree to the{' '}
							<Link to="/terms" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>
								Terms of Service
							</Link>{' '}
							and{' '}
							<Link to="/privacy" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>
								Privacy Policy
							</Link>
							.
						</label>
						{errors.agreed && (
							<span style={{ display: 'block', fontSize: '11px', color: '#c0392b', marginTop: '4px' }}>
								{errors.agreed}
							</span>
						)}
					</div>

					<button
						type="submit"
						className="btn btn-dark btn-full btn-lg"
						disabled={loading || !!successMsg}
					>
						{loading ? 'Creating Account…' : successMsg ? 'Success!' : 'Create Account'}
					</button>
				</form>
				<p
					style={{
						textAlign: 'center',
						fontSize: '12px',
						color: 'var(--ink-4)',
						marginTop: '24px',
						paddingTop: '20px',
						borderTop: '1px solid var(--line)',
					}}
				>
					Already registered?{' '}
					<Link to="/login" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>
						Log in
					</Link>
				</p>
			</AuthCard>
		</>
	);
};

/* ═══════════════════════════════════════════════
	 FORGOT PASSWORD PAGE
	 ═══════════════════════════════════════════════ */
export const ForgotPasswordPage = () => {
	const [email, setEmail] = useState('');
	const [emailError, setEmailError] = useState('');
	const [loading, setLoading] = useState(false);
	const [done, setDone] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const err = validateEmail(email);
		if (err) { setEmailError(err); return; }
		setEmailError('');
		setLoading(true);
		try {
			await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`,
			});
			setDone(true);
		} catch {
			setDone(true); // Always show success to prevent email enumeration
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Helmet>
				<title>Reset Password | The Vedic Protocol</title>
				<meta name="robots" content="noindex" />
			</Helmet>
			<AuthCard title="Reset Password." subtitle="Enter your email to receive a reset link">
				{done ? (
					<div style={{ textAlign: 'center' }}>
						<p
							style={{
								fontSize: '13px',
								color: 'var(--ink-3)',
								lineHeight: 1.8,
								marginBottom: '24px',
							}}
						>
							If an account exists for <strong>{email}</strong>, a password reset link has been
							sent. Please check your inbox.
						</p>
						<Link
							to="/login"
							className="btn btn-light btn-full"
							style={{ textAlign: 'center', display: 'block' }}
						>
							Return to Login
						</Link>
					</div>
				) : (
					<form onSubmit={handleSubmit} noValidate>
						<F
							label="Email Address"
							id="fp-email"
							type="email"
							value={email}
							onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
							error={emailError}
							required
							autoComplete="email"
						/>
						<button
							type="submit"
							className="btn btn-dark btn-full btn-lg"
							style={{ marginTop: '8px' }}
							disabled={loading}
						>
							{loading ? 'Sending…' : 'Send Reset Link'}
						</button>
						<div style={{ textAlign: 'center', marginTop: '16px' }}>
							<Link to="/login" style={{ fontSize: '11px', color: 'var(--ink-4)', letterSpacing: '0.06em' }}>
								Cancel
							</Link>
						</div>
					</form>
				)}
			</AuthCard>
		</>
	);
};

/* ═══════════════════════════════════════════════
	 RESET PASSWORD PAGE
	 ═══════════════════════════════════════════════ */
export const ResetPasswordPage = () => {
	const navigate = useNavigate();
	const [password, setPassword] = useState('');
	const [passwordConfirm, setPasswordConfirm] = useState('');
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [serverError, setServerError] = useState('');

	const validate = () => {
		const e = {};
		const passErr = validatePassword(password);
		if (passErr) e.password = passErr;
		if (!passwordConfirm) {
			e.passwordConfirm = 'Please confirm your password.';
		} else if (password !== passwordConfirm) {
			e.passwordConfirm = 'Passwords do not match.';
		}
		return e;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setServerError('');
		const errs = validate();
		if (Object.keys(errs).length) { setErrors(errs); return; }
		setErrors({});
		setLoading(true);
		try {
			// Supabase exchanges the recovery token from the URL hash automatically.
			// We just call updateUser with the new password.
			const { error } = await supabase.auth.updateUser({ password });
			if (error) throw error;
			navigate('/login');
		} catch {
			setServerError('This reset link is invalid or has expired. Please request a new one.');
			setLoading(false);
		}
	};

	return (
		<>
			<Helmet>
				<title>Set New Password | The Vedic Protocol</title>
				<meta name="robots" content="noindex" />
			</Helmet>
			<AuthCard title="New Password." subtitle="Enter your new credentials">
				<ErrorBanner message={serverError} />
				<form onSubmit={handleSubmit} noValidate>
					<div className="field" style={{ marginBottom: '16px' }}>
						<label className="field-label" htmlFor="rp-pass">
							New Password
						</label>
						<input
							className="field-input"
							id="rp-pass"
							type="password"
							value={password}
							onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
							required
							autoComplete="new-password"
							style={{
								borderColor: errors.password ? '#c0392b' : undefined,
								outline: errors.password ? '1px solid #c0392b' : undefined,
							}}
						/>
						<PasswordStrength password={password} />
						{errors.password && (
							<span style={{ display: 'block', fontSize: '11px', color: '#c0392b', marginTop: '4px' }}>
								{errors.password}
							</span>
						)}
					</div>
					<F
						label="Confirm Password"
						id="rp-conf"
						type="password"
						value={passwordConfirm}
						onChange={(e) => { setPasswordConfirm(e.target.value); setErrors((p) => ({ ...p, passwordConfirm: '' })); }}
						error={errors.passwordConfirm}
						required
						autoComplete="new-password"
					/>
					<button
						type="submit"
						className="btn btn-dark btn-full btn-lg"
						style={{ marginTop: '8px' }}
						disabled={loading}
					>
						{loading ? 'Updating…' : 'Update Password'}
					</button>
				</form>
			</AuthCard>
		</>
	);
};

export default LoginPage;