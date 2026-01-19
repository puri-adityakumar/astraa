"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterOptions: { value: string; label: string }[];
  filterLabel?: string;
  placeholder?: string;
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  filterLabel = "Filter",
  placeholder = "Search...",
}: SearchFilterProps) {
  return (
    <div className="flex flex-col gap-3 px-4 sm:flex-row sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="min-h-touch pl-9 pr-9"
          aria-label="Search"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Select value={filterValue} onValueChange={onFilterChange}>
        <SelectTrigger
          className="min-h-touch w-full sm:w-[180px]"
          aria-label={filterLabel}
        >
          <SelectValue placeholder={filterLabel} />
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
