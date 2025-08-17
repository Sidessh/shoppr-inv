import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Search, Apple, Filter, Grid, List, Star, Clock, ShoppingBag,
  Sparkles, Zap, Heart, ArrowRight, ChevronRight, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import apiService from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  imageUrl?: string;
  category: string;
  store: {
    id: string;
    name: string;
    rating: number;
  };
}

const FreshPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  useEffect(() => {
    loadFreshProducts();
  }, [filters]);

  const loadFreshProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts({ 
        category: 'FRESH',
        limit: 20,
        ...filters
      });
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading fresh products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'FRUITS': 'Fruits',
      'VEGETABLES': 'Vegetables',
      'LEAFY_GREENS': 'Leafy Greens',
      'ROOT_VEGETABLES': 'Root Vegetables',
      'SEASONAL': 'Seasonal Specials'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'FRUITS': 'bg-red-100 text-red-600 border-red-200',
      'VEGETABLES': 'bg-green-100 text-green-600 border-green-200',
      'LEAFY_GREENS': 'bg-emerald-100 text-emerald-600 border-emerald-200',
      'ROOT_VEGETABLES': 'bg-orange-100 text-orange-600 border-orange-200',
      'SEASONAL': 'bg-purple-100 text-purple-600 border-purple-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'FRUITS': <Apple className="h-4 w-4" />,
      'VEGETABLES': <Apple className="h-4 w-4" />,
      'LEAFY_GREENS': <Apple className="h-4 w-4" />,
      'ROOT_VEGETABLES': <Apple className="h-4 w-4" />,
      'SEASONAL': <Apple className="h-4 w-4" />
    };
    return icons[category] || <Apple className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-emerald-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading fresh products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-green-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4">
              <Link to="/customer/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Apple className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-bold text-gray-900">Fresh</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 mb-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-bold">Today's Fresh Arrivals</h1>
            </div>
            <p className="text-green-100 text-sm">Fresh fruits, vegetables, and farmer's market items</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search fresh products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`pl-10 pr-4 h-9 bg-white/80 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400 transition-all duration-300 ${
                    isSearchFocused ? 'ring-2 ring-green-200 shadow-lg' : ''
                  }`}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger className="border-green-200">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="FRUITS">Fruits</SelectItem>
                    <SelectItem value="VEGETABLES">Vegetables</SelectItem>
                    <SelectItem value="LEAFY_GREENS">Leafy Greens</SelectItem>
                    <SelectItem value="ROOT_VEGETABLES">Root Vegetables</SelectItem>
                    <SelectItem value="SEASONAL">Seasonal Specials</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger className="border-green-200">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
                  <SelectTrigger className="border-green-200">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Active Filters */}
            {(filters.category || filters.sortBy !== 'name' || filters.sortOrder !== 'asc') && (
              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.category && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                    {getCategoryLabel(filters.category)}
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className="ml-2 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  Clear all
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Products Grid/List */}
        <div className="space-y-6">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Apple className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No fresh products found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
              <Button onClick={clearFilters} className="bg-green-500 hover:bg-green-600">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-4'}>
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-green-200 overflow-hidden">
                  <CardContent className={viewMode === 'list' ? 'p-4' : 'p-4'}>
                    {viewMode === 'list' ? (
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Apple className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{product.name}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={`text-xs ${getCategoryColor(product.category)}`}>
                              {getCategoryIcon(product.category)}
                              <span className="ml-1">{getCategoryLabel(product.category)}</span>
                            </Badge>
                            <span className="text-xs text-gray-500">{product.store.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-green-600">₹{product.price}</span>
                              {product.originalPrice && (
                                <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                              )}
                              <span className="text-xs text-gray-500">per {product.unit}</span>
                            </div>
                            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg mb-3 flex items-center justify-center">
                          <Apple className="h-12 w-12 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{product.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`text-xs ${getCategoryColor(product.category)}`}>
                            {getCategoryLabel(product.category)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-green-600">₹{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{product.store.name}</span>
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
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

export default FreshPage;
