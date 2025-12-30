// This was a mistake, I need to read AuthForm first.
import AuthForm from '@/components/auth/AuthForm'

export default function LoginPage() {
    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your account</p>
                <AuthForm />
            </div>
        </div>
    )
}
