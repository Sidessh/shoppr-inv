import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  Apple, 
  Utensils, 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  ShoppingBag,
  Plus,
  Route,
  User,
  LogOut,
  Bell,
  Sparkles,
  TrendingUp,
  Gift,
  Heart,
  Zap,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import apiService from '@/lib/api';

interface Store {
  id: string;
  name: string;
  category: string;
  rating: number;
  totalRatings: number;
  deliveryFee: number;
  estimatedDeliveryTime: number;
  address: string;
  city: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  imageUrl?: string;
  store: {
    id: string;
    name: string;
    category: string;
    rating: number;
  };
}

const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [storesResponse, productsResponse] = await Promise.all([
        apiService.getStores({ limit: 6 }),
        apiService.getFeaturedProducts(8)
      ]);
      
      setStores(storesResponse.stores || []);
      setFeaturedProducts(productsResponse.products || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const categoryCards = [
    {
      id: 'pharmacy',
      title: 'Pharmacy',
      icon: <Store className="h-6 w-6" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      href: '/customer/stores?category=PHARMACY',
      description: 'Medicines & Health'
    },
    {
      id: 'dairy',
      title: 'Dairy',
      icon: <Store className="h-6 w-6" />,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      href: '/customer/stores?category=DAIRY',
      description: 'Milk & Dairy Products'
    },
    {
      id: 'grocery',
      title: 'Grocery',
      icon: <Store className="h-6 w-6" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      href: '/customer/stores?category=GROCERY',
      description: 'Daily Essentials'
    },
    {
      id: 'meat',
      title: 'Meat',
      icon: <Store className="h-6 w-6" />,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      href: '/customer/stores?category=MEAT',
      description: 'Fresh Meat & Fish'
    },
    {
      id: 'bakery',
      title: 'Bakery',
      icon: <Store className="h-6 w-6" />,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      href: '/customer/stores?category=BAKERY',
      description: 'Fresh Bread & Pastries'
    },
    {
      id: 'electronics',
      title: 'Electronics',
      icon: <Store className="h-6 w-6" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      href: '/customer/stores?category=ELECTRONICS',
      description: 'Gadgets & Tech'
    }
  ];

  const mainCategoryBoxes = [
    {
      id: 'stores',
      title: 'Stores',
      icon: <Store className="h-8 w-8" />,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
      iconColor: 'text-orange-600',
      href: '/customer/stores',
      description: 'Grocery, Pharmacy & More'
    },
    {
      id: 'fresh',
      title: 'Fresh',
      icon: <Apple className="h-8 w-8" />,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      iconColor: 'text-green-600',
      href: '/customer/fresh',
      description: 'Fruits, Vegetables & More'
    },
    {
      id: 'restaurants',
      title: 'Restaurants',
      icon: <Utensils className="h-8 w-8" />,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      iconColor: 'text-purple-600',
      href: '/customer/restaurants',
      description: 'Delicious Food & Drinks'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-red-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Compact Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-orange-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Bharat Shops Hub
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search stores, products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`pl-10 pr-4 h-9 bg-white/80 backdrop-blur-sm border-orange-200 focus:border-orange-400 focus:ring-orange-400 transition-all duration-300 ${
                    isSearchFocused ? 'ring-2 ring-orange-200 shadow-lg' : ''
                  }`}
                />
                {!isSearchFocused && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    ⌘K
                  </div>
                )}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="relative group">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user?.name || 'User'}</span>
                </Button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 rounded-xl p-4 mb-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <h1 className="text-lg font-bold">Welcome back, {user?.name || 'Customer'}! 👋</h1>
            </div>
            <p className="text-orange-100 text-sm">Discover amazing deals and fresh products near you</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link to="/customer/concierge">
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-orange-100 hover:border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 cursor-pointer overflow-hidden">
              <CardContent className="p-4 relative">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Gift className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Concierge Service</h3>
                    <p className="text-sm text-gray-600">Request items from any store</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-orange-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/customer/multi-stop-orders">
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-blue-100 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 cursor-pointer overflow-hidden">
              <CardContent className="p-4 relative">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Route className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Multi-Stop Orders</h3>
                    <p className="text-sm text-gray-600">Shop from multiple stores</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Category Boxes */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What would you like to shop?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mainCategoryBoxes.map((category) => (
              <Link key={category.id} to={category.href}>
                <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-orange-200 overflow-hidden">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${category.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <div className={`${category.iconColor}`}>{category.icon}</div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{category.title}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Category Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/customer/stores">
              <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoryCards.map((category) => (
              <Link key={category.id} to={category.href}>
                <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-orange-200">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 ${category.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <div className={`${category.iconColor}`}>{category.icon}</div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{category.title}</h3>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Stores */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Popular Stores</h2>
            <Link to="/customer/stores">
              <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-colors">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <Link key={store.id} to="/customer/stores">
                <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-orange-200 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Store className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{store.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">{store.rating}</span>
                            <span className="text-xs text-gray-400">({store.totalRatings})</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{store.estimatedDeliveryTime} min</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{store.address}</span>
                          <Badge variant="secondary" className="text-xs">
                            ₹{store.deliveryFee} delivery
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/customer/stores">
              <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-colors">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 8).map((product) => (
              <Link key={product.id} to="/customer/stores">
                <Card className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-orange-200 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 rounded-lg mb-3 flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{product.name}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-orange-600">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{product.store.name}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">{product.store.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
