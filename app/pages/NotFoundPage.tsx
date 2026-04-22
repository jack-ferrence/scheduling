import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-semibold tracking-tight text-primary tabular-nums">404</h1>
        <h2 className="text-2xl font-semibold">We can't find that page</h2>
        <p className="text-muted-foreground">
          The link may be broken, or the page may have moved. Head back to the dashboard to find what you need.
        </p>
        <Link to="/">
          <Button>
            <Home className="size-4 mr-2" />
            Back to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
