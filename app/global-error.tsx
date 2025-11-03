"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Keep this component minimal and free of hooks to avoid build-time issues
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4 px-4">
            <h1 className="text-4xl font-bold">Something went wrong!</h1>
            <p className="text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>
            {error.digest ? (
              <p className="text-sm text-muted-foreground">Error ID: {error.digest}</p>
            ) : null}
            <button
              onClick={() => {
                try {
                  reset();
                } catch {
                  if (typeof window !== "undefined") {
                    window.location.reload();
                  }
                }
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

