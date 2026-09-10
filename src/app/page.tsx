import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <p className="text-primary text-sm font-semibold tracking-widest uppercase">
          Axxes Music
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Playlists worth sharing.
        </h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          Browse the catalog, build playlists together and listen to previews.
          Available in English, Dutch and German.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg">Create an account</Button>
          <Button size="lg" variant="outline">
            Sign in
          </Button>
        </div>
      </div>
    </main>
  );
}
