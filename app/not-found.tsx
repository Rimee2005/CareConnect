import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-4xl">404</CardTitle>
            <CardDescription>Page not found</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-text-muted">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Link href="/">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go to home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

