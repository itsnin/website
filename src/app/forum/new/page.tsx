// otherwise renders a client-side composer form
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
        <NewThreadComposer />
      </div>
    </div>
  );
}
