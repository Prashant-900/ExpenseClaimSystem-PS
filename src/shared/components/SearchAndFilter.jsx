import { useState } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';

const SearchAndFilter = ({ onSearch, onFilter, showFilters = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    expenseType: '',
    status: '',
    dateRange: '',
    amountRange: ''
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      expenseType: '',
      status: '',
      dateRange: '',
      amountRange: ''
    };
    setFilters(clearedFilters);
    setSearchTerm('');
    onSearch('');
    onFilter(clearedFilters);
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 mb-6">
      {/* Search Bar */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, description, or amount..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <HiOutlineMagnifyingGlass className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <HiOutlineXMark className="w-4 h-4" />
          Clear All
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {showFilters.expenseType && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
            <select
              value={filters.expenseType}
              onChange={(e) => handleFilterChange('expenseType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="">All Types</option>
              <option value="Travel">Travel</option>
              <option value="Meal">Meal</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Misc">Miscellaneous</option>
            </select>
          </div>
        )}

        {showFilters.status && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="">All Status</option>
              <option value="Pending - Faculty">Pending - Faculty</option>
              <option value="Pending - Audit">Pending - Audit</option>
              <option value="Pending - Finance">Pending - Finance</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
              <option value="Sent Back - Faculty">Sent Back - Faculty</option>
              <option value="Sent Back - Audit">Sent Back - Audit</option>
              <option value="Sent Back - Finance">Sent Back - Finance</option>
            </select>
          </div>
        )}

        {showFilters.dateRange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        )}

        {showFilters.amountRange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
            <select
              value={filters.amountRange}
              onChange={(e) => handleFilterChange('amountRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="">All Amounts</option>
              <option value="0-100">$0 - $100</option>
              <option value="100-500">$100 - $500</option>
              <option value="500-1000">$500 - $1,000</option>
              <option value="1000+">$1,000+</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilter;