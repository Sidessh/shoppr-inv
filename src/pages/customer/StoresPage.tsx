import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Store, 
  Clock, 
  Star, 
  MapPin, 
  ArrowLeft,
  Filter,
  Grid,
  List,
  Sparkles,
  TrendingUp,
  Zap,
  Heart,
  ArrowRight,
  ChevronRight,
  X
} from 'lucide-react';
import apiService from '@/lib/api';

interface Store {
  id: string;
  name: string;
  description?: string;
  category: string;
  rating: number;
  totalRatings: number;
  deliveryFee: number;
  minOrderAmount: number;
  estimatedDeliveryTime: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  merchant: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    products: number;
  };
}

const StoresPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    sortBy: 'rating',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadStores();
  }, [filters]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        limit: '20',
        offset: '0'
      };
      
      const response = await apiService.getStores(params);
      setStores(response.stores || []);
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadStores();
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.searchStores(searchQuery, filters);
      setStores(response.stores || []);
    } catch (error) {
      console.error('Error searching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(key, value);
    } else {
      newSearchParams.delete(key);
    }
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      city: '',
      sortBy: 'rating',
      sortOrder: 'desc'
    });
    setSearchParams({});
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ');
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'PHARMACY': 'bg-blue-100 text-blue-800 border-blue-200',
      'DAIRY': 'bg-green-100 text-green-800 border-green-200',
      'GROCERY': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'MEAT': 'bg-red-100 text-red-800 border-red-200',
      'BAKERY': 'bg-purple-100 text-purple-800 border-purple-200',
      'ELECTRONICS': 'bg-gray-100 text-gray-800 border-gray-200',
      'CLOTHING': 'bg-pink-100 text-pink-800 border-pink-200',
      'OTHER': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || colors['OTHER'];
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'PHARMACY': <Store className="h-4 w-4" />,
      'DAIRY': <Store className="h-4 w-4" />,
      'GROCERY': <Store className="h-4 w-4" />,
      'MEAT': <Store className="h-4 w-4" />,
      'BAKERY': <Store className="h-4 w-4" />,
      'ELECTRONICS': <Store className="h-4 w-4" />,
      'CLOTHING': <Store className="h-4 w-4" />,
      'OTHER': <Store className="h-4 w-4" />
    };
    return icons[category] || icons['OTHER'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-red-500 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Discovering amazing stores...</h3>
          <p className="text-gray-600">Finding the best options for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Enhanced Header with Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-orange-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/customer/dashboard">
                <Button variant="ghost" size="sm" className="hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Discover Stores</h1>
                  <p className="text-xs text-gray-500">Find the best local stores</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`${viewMode === 'grid' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'hover:bg-orange-50'} transition-all duration-200`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`${viewMode === 'list' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'hover:bg-orange-50'} transition-all duration-200`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-orange-100">Local Stores</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Discover Amazing Stores</h2>
              <p className="text-orange-100 text-lg mb-4">Find the best stores in your area with fast delivery</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">30-45 min</span>
                </div>
                <span className="text-sm text-orange-100">average delivery time</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="text-right">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <TrendingUp className="h-10 w-10" />
                </div>
                <p className="text-sm text-orange-100">Fast Delivery</p>
                <p className="text-2xl font-bold">30-45 min</p>
                <p className="text-sm text-orange-100">Average Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Enhanced Search */}
            <div className="flex-1">
              <div className="relative group">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${isSearchFocused ? 'text-orange-500' : 'text-gray-400'}`} />
                <Input
                  type="text"
                  placeholder="Search stores by name, location, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className={`pl-12 pr-4 h-12 bg-white/70 border-2 transition-all duration-300 ${
                    isSearchFocused 
                      ? 'border-orange-300 shadow-lg shadow-orange-100/50' 
                      : 'border-gray-200 hover:border-orange-200'
                  } rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400`}
                />
                {isSearchFocused && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">⌘K</kbd>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Filters */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`border-2 transition-all duration-200 ${
                  showFilters 
                    ? 'border-orange-300 bg-orange-50 text-orange-600' 
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>

              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-200 hover:border-orange-200"
              >
                <option value="">All Categories</option>
                <option value="PHARMACY">Pharmacy</option>
                <option value="DAIRY">Dairy</option>
                <option value="GROCERY">Grocery</option>
                <option value="MEAT">Meat</option>
                <option value="BAKERY">Bakery</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="CLOTHING">Clothing</option>
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-200 hover:border-orange-200"
              >
                <option value="rating">Best Rated</option>
                <option value="name">Name A-Z</option>
                <option value="createdAt">Newest</option>
              </select>

              <Button 
                onClick={handleSearch} 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.category || filters.city) && (
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.category && (
                <Badge className={`${getCategoryColor(filters.category)} border`}>
                  {getCategoryIcon(filters.category)}
                  <span className="ml-1">{getCategoryLabel(filters.category)}</span>
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className="ml-2 hover:bg-black/10 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.city && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <MapPin className="h-3 w-3 mr-1" />
                  {filters.city}
                  <button
                    onClick={() => handleFilterChange('city', '')}
                    className="ml-2 hover:bg-black/10 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-red-500 hover:bg-red-50"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Concierge Entry Point */}
        <div className="mb-8">
          <Link to="/customer/concierge">
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-orange-200 hover:border-orange-400 bg-gradient-to-br from-orange-50 to-red-50 cursor-pointer overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-200 to-red-200 rounded-full -translate-y-12 translate-x-12 opacity-20 group-hover:scale-110 transition-transform duration-300"></div>
                <div className="relative flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-xl mb-2">Can't find a store?</h3>
                    <p className="text-gray-600 text-lg mb-3">Request items from any local store not listed here</p>
                    <div className="flex items-center text-orange-600 font-semibold text-lg">
                      <span>Request Items Now</span>
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg group-hover:scale-105 transition-transform">
                    Request Items
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Enhanced Stores Grid/List */}
        <div className="space-y-6">
          {stores.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No stores found</h3>
              <p className="text-gray-600 text-lg mb-6">Try adjusting your search or filters</p>
              <Button 
                onClick={clearFilters}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {stores.map((store) => (
                <Card key={store.id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-orange-200 overflow-hidden">
                  <CardContent className={viewMode === 'list' ? 'p-6' : 'p-6'}>
                    <div className={viewMode === 'list' ? 'flex items-center space-x-6' : ''}>
                      {/* Enhanced Store Icon */}
                      <div className={`${viewMode === 'list' ? 'w-20 h-20' : 'w-16 h-16'} bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Store className={`${viewMode === 'list' ? 'h-10 w-10' : 'h-8 w-8'} text-orange-600`} />
                      </div>

                      {/* Enhanced Store Info */}
                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{store.name}</h3>
                            <p className="text-gray-600">{store.description}</p>
                          </div>
                          <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-bold text-yellow-700">{store.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 mb-3">
                          <Badge className={`${getCategoryColor(store.category)} border`}>
                            {getCategoryIcon(store.category)}
                            <span className="ml-1">{getCategoryLabel(store.category)}</span>
                          </Badge>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600 font-medium">{store._count.products} products</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">{store.estimatedDeliveryTime} min</span>
                          </div>
                          <span className="font-bold text-orange-600">₹{store.deliveryFee} delivery</span>
                        </div>

                        {viewMode === 'list' && (
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{store.address}, {store.city}</span>
                            </div>
                            <p className="text-sm text-gray-500">Min order: ₹{store.minOrderAmount}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StoresPage;
