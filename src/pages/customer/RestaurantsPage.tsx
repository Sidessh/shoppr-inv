import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Search, Utensils, Filter, Grid, List, Star, Clock, MapPin,
  Sparkles, Heart, ArrowRight, ChevronRight, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import apiService from '@/lib/api';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  totalRatings: number;
  deliveryFee: number;
  estimatedDeliveryTime: number;
  address: string;
  city: string;
  imageUrl?: string;
  isOpen: boolean;
}

const RestaurantsPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    cuisine: '',
    rating: '',
    sortBy: 'rating',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadRestaurants();
  }, [filters]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      // For now, using mock data since restaurants are not yet implemented in the backend
      const mockRestaurants: Restaurant[] = [
        {
          id: '1',
          name: 'Spice Garden',
          cuisine: 'Indian',
          rating: 4.5,
          totalRatings: 128,
          deliveryFee: 30,
          estimatedDeliveryTime: 35,
          address: '123 Main Street',
          city: 'Mumbai',
          isOpen: true
        },
        {
          id: '2',
          name: 'Pizza Palace',
          cuisine: 'Italian',
          rating: 4.2,
          totalRatings: 89,
          deliveryFee: 25,
          estimatedDeliveryTime: 40,
          address: '456 Oak Avenue',
          city: 'Mumbai',
          isOpen: true
        },
        {
          id: '3',
          name: 'Sushi Express',
          cuisine: 'Japanese',
          rating: 4.7,
          totalRatings: 156,
          deliveryFee: 35,
          estimatedDeliveryTime: 45,
          address: '789 Pine Road',
          city: 'Mumbai',
          isOpen: false
        },
        {
          id: '4',
          name: 'Burger House',
          cuisine: 'American',
          rating: 4.0,
          totalRatings: 67,
          deliveryFee: 20,
          estimatedDeliveryTime: 30,
          address: '321 Elm Street',
          city: 'Mumbai',
          isOpen: true
        },
        {
          id: '5',
          name: 'Thai Delight',
          cuisine: 'Thai',
          rating: 4.3,
          totalRatings: 94,
          deliveryFee: 30,
          estimatedDeliveryTime: 38,
          address: '654 Maple Drive',
          city: 'Mumbai',
          isOpen: true
        },
        {
          id: '6',
          name: 'Chinese Wok',
          cuisine: 'Chinese',
          rating: 4.1,
          totalRatings: 112,
          deliveryFee: 25,
          estimatedDeliveryTime: 35,
          address: '987 Cedar Lane',
          city: 'Mumbai',
          isOpen: true
        }
      ];
      setRestaurants(mockRestaurants);
    } catch (error) {
      console.error('Error loading restaurants:', error);
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
      cuisine: '',
      rating: '',
      sortBy: 'rating',
      sortOrder: 'desc'
    });
  };

  const getCuisineColor = (cuisine: string) => {
    const colors: { [key: string]: string } = {
      'Indian': 'bg-orange-100 text-orange-600 border-orange-200',
      'Italian': 'bg-green-100 text-green-600 border-green-200',
      'Japanese': 'bg-red-100 text-red-600 border-red-200',
      'American': 'bg-blue-100 text-blue-600 border-blue-200',
      'Thai': 'bg-purple-100 text-purple-600 border-purple-200',
      'Chinese': 'bg-yellow-100 text-yellow-600 border-yellow-200'
    };
    return colors[cuisine] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-pink-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-purple-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4">
              <Link to="/customer/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Utensils className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">Restaurants</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-purple-500 hover:bg-purple-600' : ''}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-purple-500 hover:bg-purple-600' : ''}
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
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 mb-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Heart className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-bold">Delicious Food Delivered</h1>
            </div>
            <p className="text-purple-100 text-sm">Order from your favorite restaurants and cafes</p>
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
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`pl-10 pr-4 h-9 bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-300 ${
                    isSearchFocused ? 'ring-2 ring-purple-200 shadow-lg' : ''
                  }`}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <Select value={filters.cuisine} onValueChange={(value) => handleFilterChange('cuisine', value)}>
                  <SelectTrigger className="border-purple-200">
                    <SelectValue placeholder="Cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cuisines</SelectItem>
                    <SelectItem value="Indian">Indian</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="American">American</SelectItem>
                    <SelectItem value="Thai">Thai</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
                  <SelectTrigger className="border-purple-200">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Rating</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="4.0">4.0+ Stars</SelectItem>
                    <SelectItem value="3.5">3.5+ Stars</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger className="border-purple-200">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="deliveryTime">Delivery Time</SelectItem>
                    <SelectItem value="deliveryFee">Delivery Fee</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
                  <SelectTrigger className="border-purple-200">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Active Filters */}
            {(filters.cuisine || filters.rating || filters.sortBy !== 'rating' || filters.sortOrder !== 'desc') && (
              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.cuisine && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                    {filters.cuisine}
                    <button
                      onClick={() => handleFilterChange('cuisine', '')}
                      className="ml-2 hover:text-purple-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.rating && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                    {filters.rating}+ Stars
                    <button
                      onClick={() => handleFilterChange('rating', '')}
                      className="ml-2 hover:text-purple-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  Clear all
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Restaurants Grid/List */}
        <div className="space-y-6">
          {restaurants.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="h-12 w-12 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No restaurants found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
              <Button onClick={clearFilters} className="bg-purple-500 hover:bg-purple-600">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {restaurants.map((restaurant) => (
                <Card key={restaurant.id} className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-purple-200 overflow-hidden">
                  <CardContent className={viewMode === 'list' ? 'p-4' : 'p-4'}>
                    {viewMode === 'list' ? (
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Utensils className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{restaurant.name}</h3>
                            {restaurant.isOpen ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Open</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Closed</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={`text-xs ${getCuisineColor(restaurant.cuisine)}`}>
                              {restaurant.cuisine}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-gray-600">{restaurant.rating}</span>
                              <span className="text-xs text-gray-400">({restaurant.totalRatings})</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{restaurant.estimatedDeliveryTime} min</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{restaurant.address}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-gray-500">Delivery</span>
                              <div className="font-bold text-purple-600">₹{restaurant.deliveryFee}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-3 flex items-center justify-center relative">
                          <Utensils className="h-12 w-12 text-purple-600" />
                          {restaurant.isOpen ? (
                            <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs">Open</Badge>
                          ) : (
                            <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">Closed</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{restaurant.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`text-xs ${getCuisineColor(restaurant.cuisine)}`}>
                            {restaurant.cuisine}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">{restaurant.rating}</span>
                            <span className="text-xs text-gray-400">({restaurant.totalRatings})</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{restaurant.estimatedDeliveryTime} min</span>
                          </div>
                          <span className="font-bold text-purple-600 text-sm">₹{restaurant.deliveryFee}</span>
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

export default RestaurantsPage;
