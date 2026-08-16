// ============================================================================
// forum/new/page.tsx — "start a new thread" page.
// ----------------------------------------------------------------------------
// Gated on auth status. If auth isn't ready, shows a coming-soon notice.
// Otherwise renders a client-side composer form.
//
// Docs: https://nextjs.org/docs/app/building-your-application/routing
// ==========================================================================
import { NewThreadComposer } from "@/components/forum/new-thread-composer";

export default function NewThreadPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Start a thread
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Share a question, idea, or discussion topic with the community.
      </p>
      <div className="mt-8">
        {/* Client component handles auth-gating + submission. */}
        <NewThreadComposer />
      </div>
    </div>
  );
}
