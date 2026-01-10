import { useEffect, useState } from 'react';
import { buttonClasses } from '../ui/classes';

interface RecipeFiltersProps {
  categories: string[];
  cuisines: string[];
}

type SortOption = 'newest' | 'title' | 'quickest';

export function RecipeFilters({ categories, cuisines }: RecipeFiltersProps) {
  const [category, setCategory] = useState<string>('');
  const [cuisine, setCuisine] = useState<string>('');
  const [sort, setSort] = useState<SortOption>('newest');

  // Read initial state from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCategory(params.get('category') || '');
    setCuisine(params.get('cuisine') || '');
    setSort((params.get('sort') as SortOption) || 'newest');
  }, []);

  const updateURL = (newCategory: string, newCuisine: string, newSort: SortOption) => {
    const params = new URLSearchParams();
    if (newCategory) params.set('category', newCategory);
    if (newCuisine) params.set('cuisine', newCuisine);
    if (newSort && newSort !== 'newest') params.set('sort', newSort);

    window.location.search = params.toString();
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    updateURL(newCategory, cuisine, sort);
  };

  const handleCuisineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCuisine = e.target.value;
    setCuisine(newCuisine);
    updateURL(category, newCuisine, sort);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value as SortOption;
    setSort(newSort);
    updateURL(category, cuisine, newSort);
  };

  const handleClear = () => {
    setCategory('');
    setCuisine('');
    setSort('newest');
    window.location.search = '';
  };

  const hasFilters = category || cuisine || (sort && sort !== 'newest');

  return (
    <div className="mb-2">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-2 min-w-[120px] flex-1 sm:flex-initial">
          <label
            htmlFor="filter-category"
            className="text-xs uppercase tracking-wider text-[color:var(--muted)] font-medium"
          >
            Category
          </label>
          <select
            id="filter-category"
            value={category}
            onChange={handleCategoryChange}
            className="bg-[color:var(--glass-bg)] border border-[color:var(--glass-border)] rounded-lg text-[color:var(--text)] text-[0.9375rem] px-3 py-2 cursor-pointer transition-all duration-200 font-inherit hover:bg-[color:var(--glass-bg-hover)] hover:border-[color:var(--glass-border-hover)] focus:outline-none focus:border-[color:var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-muted)]"
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 min-w-[120px] flex-1 sm:flex-initial">
          <label
            htmlFor="filter-cuisine"
            className="text-xs uppercase tracking-wider text-[color:var(--muted)] font-medium"
          >
            Cuisine
          </label>
          <select
            id="filter-cuisine"
            value={cuisine}
            onChange={handleCuisineChange}
            className="bg-[color:var(--glass-bg)] border border-[color:var(--glass-border)] rounded-lg text-[color:var(--text)] text-[0.9375rem] px-3 py-2 cursor-pointer transition-all duration-200 font-inherit hover:bg-[color:var(--glass-bg-hover)] hover:border-[color:var(--glass-border-hover)] focus:outline-none focus:border-[color:var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-muted)]"
          >
            <option value="">All</option>
            {cuisines.map((cui) => (
              <option key={cui} value={cui}>
                {cui}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 min-w-[120px] flex-1 sm:flex-initial">
          <label
            htmlFor="filter-sort"
            className="text-xs uppercase tracking-wider text-[color:var(--muted)] font-medium"
          >
            Sort
          </label>
          <select
            id="filter-sort"
            value={sort}
            onChange={handleSortChange}
            className="bg-[color:var(--glass-bg)] border border-[color:var(--glass-border)] rounded-lg text-[color:var(--text)] text-[0.9375rem] px-3 py-2 cursor-pointer transition-all duration-200 font-inherit hover:bg-[color:var(--glass-bg-hover)] hover:border-[color:var(--glass-border-hover)] focus:outline-none focus:border-[color:var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-muted)]"
          >
            <option value="newest">Newest</option>
            <option value="title">Title</option>
            <option value="quickest">Quickest</option>
          </select>
        </div>

        {hasFilters && (
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-[color:var(--muted)] font-medium opacity-0 pointer-events-none">
              Actions
            </label>
            <button
              onClick={handleClear}
              className={buttonClasses({ variant: 'ghost', size: 'md' })}
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

