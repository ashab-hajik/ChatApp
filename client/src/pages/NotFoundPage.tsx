import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center">
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="text-gray-500">This page doesn&apos;t exist.</p>
      <Link to="/">
        <Button>Back to Chatly</Button>
      </Link>
    </div>
  );
}
