import { Search } from 'lucide-react';

interface SidebarSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function SidebarSearch({ value, onChange }: SidebarSearchProps) {
  return (
    <div className="border-b border-gray-100 p-2">
      <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
        <Search size={16} className="text-gray-500" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search or start new chat"
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
        />
      </div>
    </div>
  );
}
