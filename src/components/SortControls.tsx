// This file uses client-side code.
"use client";

import type { FC } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SortControlsProps {
  sortBy: string;
  onSortChange: (value: string) => void;
}

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "most_votes_total", label: "Most Votes (Total)" },
  { value: "most_approved", label: "Most Approved (Yes)" },
  { value: "most_disapproved", label: "Most Disapproved (No)" },
  { value: "most_discussed", label: "Most Discussed" },
];

const SortControls: FC<SortControlsProps> = ({ sortBy, onSortChange }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Label htmlFor="sort-by" className="text-sm font-medium">Sort by:</Label>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger id="sort-by" className="w-[180px] bg-card border-border shadow-sm">
          <SelectValue placeholder="Select sort order" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortControls;
