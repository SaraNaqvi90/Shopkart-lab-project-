const CATEGORIES = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home'];

export default function SearchBar({ search, onSearchChange, category, onCategoryChange }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search products..."
        className="w-full border-0 border-b-2 border-charcoal/15 bg-transparent px-0 py-2 font-body text-charcoal outline-none transition-colors focus:border-marigold sm:max-w-sm"
      />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full border-0 border-b-2 border-charcoal/15 bg-transparent px-0 py-2 font-body text-charcoal outline-none transition-colors focus:border-marigold sm:w-auto"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c === 'All Categories' ? '' : c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
