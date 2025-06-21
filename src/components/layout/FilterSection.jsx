import { Search, Filter } from 'lucide-react';
import Button from '../common/Button';

const FilterSection = ({ activeFilter, setActiveFilter, searchTerm, setSearchTerm }) => {
  const categories = ['all', 'full stack', 'frontend', 'backend', 'mobile'];

  return (
    <section className="py-12 bg-white shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white  rounded-lg focus:ring-2 focus:ring-blue-500  focus:border-transparent text-gray-900 "
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="light:text-gray-600 " />
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={
                    activeFilter === category
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100  text-gray-700  hover:bg-gray-200 '
                  }
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterSection;