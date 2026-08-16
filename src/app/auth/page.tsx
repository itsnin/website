import { AuthCard } from "@/components/site/auth-card";

export default function AuthPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 sm:px-6">
      <div className="w-full">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to post in the forum and join the discussion.
        </p>

        <div className="mt-8">
          <AuthCard />
        </div>
      </div>
    </div>
  );
}
