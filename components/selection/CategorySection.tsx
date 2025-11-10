"use client";

import { TechStackCard } from "./TechStackCard";

interface TechOption {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  popularity?: string;
  learnMore?: string;
}

interface CategorySectionProps {
  category: string;
  options: TechOption[];
  selectedOption?: string;
  onSelect: (optionName: string) => void;
}

export function CategorySection({
  category,
  options,
  selectedOption,
  onSelect,
}: CategorySectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{category}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose one option for your tech stack
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => (
          <TechStackCard
            key={option.name}
            option={option}
            isSelected={selectedOption === option.name}
            onSelect={() => onSelect(option.name)}
          />
        ))}
      </div>
    </div>
  );
}
