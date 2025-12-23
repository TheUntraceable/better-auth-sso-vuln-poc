import { Button } from '@heroui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to <span className="text-primary">Untraceable Stack</span>
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          A modern Next.js application with TailwindCSS, ShadCN UI, and more.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="shadow" color="primary">
            <a href="https://heroui.org/docs" target="_blank" rel="noopener noreferrer">
              Next.js Docs
            </a>
          </Button>
          <Button variant="bordered">
            <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer">
              ShadCN UI
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
