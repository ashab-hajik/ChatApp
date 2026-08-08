import { Spinner } from '../ui/Spinner';

export function FullPageSpinner() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <Spinner size="lg" />
    </div>
  );
}
