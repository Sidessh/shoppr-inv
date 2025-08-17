import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Plus, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Sparkles,
  Gift,
  Clock,
  Star,
  Zap,
  Heart,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ConciergeItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes: string;
}

const ConciergePage: React.FC = () => {
  const { user } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [items, setItems] = useState<ConciergeItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const addItem = () => {
    if (newItem.name.trim()) {
      setItems([...items, { ...newItem, id: Date.now().toString() }]);
      setNewItem({ name: '', quantity: 1, unit: '', notes: '' });
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !storeAddress.trim() || items.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement API call to create concierge request
      console.log('Submitting concierge request:', {
        storeName,
        storeAddress,
        deliveryAddress,
        deliveryInstructions,
        items
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting concierge request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card className="text-center border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Your concierge request has been submitted successfully. A delivery partner will contact you soon to confirm details and pricing.
              </p>
              <div className="space-y-4">
                <Link to="/customer/dashboard">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg h-12 text-lg font-semibold">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-lg font-semibold border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50"
                  onClick={() => setIsSubmitted(false)}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Submit Another Request
                </Button>
              </div>
            </CardContent>
          </Card>
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
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Concierge Service</h1>
                  <p className="text-xs text-gray-500">Request items from any store</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Enhanced Store Information */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>Store Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="storeName" className="text-sm font-semibold text-gray-700 mb-2 block">Store Name *</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Enter store name (e.g., Local Pharmacy, Corner Store)"
                  required
                  className="h-12 border-2 border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-xl transition-all duration-200"
                />
              </div>
              <div>
                <Label htmlFor="storeAddress" className="text-sm font-semibold text-gray-700 mb-2 block">Store Address *</Label>
                <Textarea
                  id="storeAddress"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="Enter complete store address with landmarks"
                  rows={3}
                  required
                  className="border-2 border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-xl transition-all duration-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Items */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <span>Items to Purchase</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Enhanced Add New Item */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-blue-600" />
                  Add New Item
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="itemName" className="text-sm font-medium text-gray-700 mb-2 block">Item Name *</Label>
                    <Input
                      id="itemName"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="e.g., Milk, Bread, Medicine"
                      className="border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity" className="text-sm font-medium text-gray-700 mb-2 block">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                      className="border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit" className="text-sm font-medium text-gray-700 mb-2 block">Unit</Label>
                    <Input
                      id="unit"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      placeholder="e.g., kg, pcs, bottles"
                      className="border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-200"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      onClick={addItem}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg h-10 transition-all duration-200 transform hover:scale-105"
                      disabled={!newItem.name.trim()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Enhanced Items List */}
              {items.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2 text-blue-600" />
                    Items Added ({items.length})
                  </Label>
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-100 hover:border-green-200 transition-all duration-200">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} {item.unit}
                          {item.notes && ` • ${item.notes}`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Delivery Information */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>Delivery Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="deliveryAddress" className="text-sm font-semibold text-gray-700 mb-2 block">Delivery Address *</Label>
                <Textarea
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your complete delivery address"
                  rows={3}
                  required
                  className="border-2 border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 rounded-xl transition-all duration-200"
                />
              </div>
              <div>
                <Label htmlFor="deliveryInstructions" className="text-sm font-semibold text-gray-700 mb-2 block">Delivery Instructions (Optional)</Label>
                <Textarea
                  id="deliveryInstructions"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="Any special instructions for delivery (e.g., call before delivery, leave at gate)"
                  rows={2}
                  className="border-2 border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 rounded-xl transition-all duration-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Price Disclaimer */}
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-orange-900 text-lg mb-2">Important Information</h4>
                  <div className="space-y-2 text-orange-800">
                    <p className="flex items-start">
                      <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Delivery partner will contact you within 30 minutes to confirm pricing and availability.</span>
                    </p>
                    <p className="flex items-start">
                      <Star className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Final prices will be confirmed after purchasing the items from the store.</span>
                    </p>
                    <p className="flex items-start">
                      <Gift className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>You'll receive a detailed receipt with actual costs and delivery charges.</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Submit Button */}
          <div className="flex space-x-4">
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl h-14 text-lg font-bold transition-all duration-300 transform hover:scale-105"
              disabled={isSubmitting || !storeName.trim() || !storeAddress.trim() || items.length === 0}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ConciergePage;
