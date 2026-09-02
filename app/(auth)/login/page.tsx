import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-extrabold text-primary-foreground">
              V
            </div>
            <span className="text-sm font-bold text-foreground">Verafi Admin</span>
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">
            Sign in
          </h1>
          <p className="text-sm text-muted-foreground">
            Super admin access to methodologies, organisations, and users.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
