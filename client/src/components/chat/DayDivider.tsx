import { formatDayDivider } from '../../utils/formatters';

export function DayDivider({ iso }: { iso: string }) {
  return (
    <div className="my-2 flex items-center justify-center">
      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500 shadow-sm">
        {formatDayDivider(iso)}
      </span>
    </div>
  );
}
