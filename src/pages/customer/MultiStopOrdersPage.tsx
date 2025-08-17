import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Route, 
  Plus, 
  Trash2, 
  Save,
  ShoppingCart,
  Clock,
  MapPin,
  CheckCircle,
  Edit
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MultiStopItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes: string;
}

interface MultiStop {
  id: string;
  storeName: string;
  storeAddress: string;
  items: MultiStopItem[];
  notes: string;
}

interface MultiStopOrder {
  id: string;
  name: string;
  description: string;
  stops: MultiStop[];
  deliveryAddress: string;
  deliveryInstructions: string;
  status: 'draft' | 'submitted' | 'completed';
  createdAt: string;
}

const MultiStopOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<MultiStopOrder[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<MultiStopOrder | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deliveryAddress: '',
    deliveryInstructions: '',
    stops: [] as MultiStop[]
  });
  const [newStop, setNewStop] = useState({
    storeName: '',
    storeAddress: '',
    items: [] as MultiStopItem[],
    notes: ''
  });
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: '',
    notes: ''
  });

  useEffect(() => {
    // Load saved orders (mock data for now)
    const mockOrders: MultiStopOrder[] = [
      {
        id: '1',
        name: 'Weekly Groceries',
        description: 'Regular weekly shopping list',
        stops: [
          {
            id: '1',
            storeName: 'Fresh Mart',
            storeAddress: '123 Main St, City',
            items: [
              { id: '1', name: 'Milk', quantity: 2, unit: 'L', notes: 'Full fat' },
              { id: '2', name: 'Bread', quantity: 1, unit: 'pack', notes: 'Whole wheat' }
            ],
            notes: 'Check expiry dates'
          },
          {
            id: '2',
            storeName: 'Pharmacy Plus',
            storeAddress: '456 Oak Ave, City',
            items: [
              { id: '3', name: 'Vitamins', quantity: 1, unit: 'bottle', notes: 'Vitamin D' }
            ],
            notes: ''
          }
        ],
        deliveryAddress: '789 Home St, City',
        deliveryInstructions: 'Ring doorbell twice',
        status: 'draft',
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];
    setOrders(mockOrders);
  }, []);

  const addItemToStop = () => {
    if (newItem.name.trim()) {
      setNewStop({
        ...newStop,
        items: [...newStop.items, { ...newItem, id: Date.now().toString() }]
      });
      setNewItem({ name: '', quantity: 1, unit: '', notes: '' });
    }
  };

  const removeItemFromStop = (itemId: string) => {
    setNewStop({
      ...newStop,
      items: newStop.items.filter(item => item.id !== itemId)
    });
  };

  const addStop = () => {
    if (newStop.storeName.trim() && newStop.items.length > 0) {
      setFormData({
        ...formData,
        stops: [...formData.stops, { ...newStop, id: Date.now().toString() }]
      });
      setNewStop({
        storeName: '',
        storeAddress: '',
        items: [],
        notes: ''
      });
    }
  };

  const removeStop = (stopId: string) => {
    setFormData({
      ...formData,
      stops: formData.stops.filter(stop => stop.id !== stopId)
    });
  };

  const saveOrder = () => {
    if (formData.name.trim() && formData.stops.length > 0) {
      const newOrder: MultiStopOrder = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        stops: formData.stops,
        deliveryAddress: formData.deliveryAddress,
        deliveryInstructions: formData.deliveryInstructions,
        status: 'draft',
        createdAt: new Date().toISOString()
      };

      setOrders([...orders, newOrder]);
      setFormData({
        name: '',
        description: '',
        deliveryAddress: '',
        deliveryInstructions: '',
        stops: []
      });
      setShowCreateForm(false);
    }
  };

  const submitOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: 'submitted' as const }
        : order
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Edit className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/customer/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Route className="h-6 w-6 text-orange-600" />
                <h1 className="text-xl font-bold text-gray-900">Multi-Stop Orders</h1>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Plan
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {showCreateForm ? (
          <div className="space-y-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="planName">Plan Name *</Label>
                  <Input
                    id="planName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Weekly Groceries"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stops */}
            <Card>
              <CardHeader>
                <CardTitle>Stops</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Stop */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-4">Add New Stop</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="storeName">Store Name *</Label>
                        <Input
                          id="storeName"
                          value={newStop.storeName}
                          onChange={(e) => setNewStop({ ...newStop, storeName: e.target.value })}
                          placeholder="Store name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="storeAddress">Store Address</Label>
                        <Input
                          id="storeAddress"
                          value={newStop.storeAddress}
                          onChange={(e) => setNewStop({ ...newStop, storeAddress: e.target.value })}
                          placeholder="Store address"
                        />
                      </div>
                    </div>

                    {/* Add Items to Stop */}
                    <div className="space-y-4">
                      <Label>Items</Label>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div>
                          <Input
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            placeholder="Item name"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            min="1"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                            placeholder="Qty"
                          />
                        </div>
                        <div>
                          <Input
                            value={newItem.unit}
                            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                            placeholder="Unit"
                          />
                        </div>
                        <div>
                          <Button 
                            type="button" 
                            onClick={addItemToStop}
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            disabled={!newItem.name.trim()}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                      </div>

                      {/* Items in Current Stop */}
                      {newStop.items.length > 0 && (
                        <div className="space-y-2">
                          <Label>Items in this stop:</Label>
                          {newStop.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span>{item.name} - {item.quantity} {item.unit}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItemFromStop(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div>
                        <Label htmlFor="stopNotes">Stop Notes</Label>
                        <Textarea
                          id="stopNotes"
                          value={newStop.notes}
                          onChange={(e) => setNewStop({ ...newStop, notes: e.target.value })}
                          placeholder="Any special instructions for this stop"
                          rows={2}
                        />
                      </div>

                      <Button 
                        type="button" 
                        onClick={addStop}
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        disabled={!newStop.storeName.trim() || newStop.items.length === 0}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Stop
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Added Stops */}
                {formData.stops.length > 0 && (
                  <div className="space-y-4">
                    <Label>Stops Added:</Label>
                    {formData.stops.map((stop, index) => (
                      <div key={stop.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">Stop {index + 1}: {stop.storeName}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStop(stop.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{stop.storeAddress}</p>
                        <div className="space-y-1">
                          {stop.items.map((item) => (
                            <div key={item.id} className="text-sm">
                              • {item.name} - {item.quantity} {item.unit}
                              {item.notes && ` (${item.notes})`}
                            </div>
                          ))}
                        </div>
                        {stop.notes && (
                          <p className="text-sm text-gray-500 mt-2">Notes: {stop.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                  <Textarea
                    id="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    placeholder="Enter your delivery address"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                  <Textarea
                    id="deliveryInstructions"
                    value={formData.deliveryInstructions}
                    onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                    placeholder="Any special instructions for delivery"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button 
                onClick={saveOrder}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                disabled={!formData.name.trim() || formData.stops.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Plan
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Saved Orders */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Shopping Plans</h2>
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No shopping plans yet</h3>
                    <p className="text-gray-600 mb-4">Create your first multi-stop shopping plan to get started.</p>
                    <Button 
                      onClick={() => setShowCreateForm(true)}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Plan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{order.name}</h3>
                            <p className="text-sm text-gray-600">{order.description}</p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(order.status)}
                              <span className="capitalize">{order.status}</span>
                            </div>
                          </Badge>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Route className="h-4 w-4" />
                            <span>{order.stops.length} stops</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{order.deliveryAddress}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {order.stops.slice(0, 2).map((stop, index) => (
                            <div key={stop.id} className="text-sm text-gray-600">
                              {index + 1}. {stop.storeName} ({stop.items.length} items)
                            </div>
                          ))}
                          {order.stops.length > 2 && (
                            <div className="text-sm text-gray-500">
                              +{order.stops.length - 2} more stops
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2 mt-4">
                          {order.status === 'draft' && (
                            <>
                              <Button 
                                size="sm"
                                className="flex-1 bg-orange-500 hover:bg-orange-600"
                                onClick={() => submitOrder(order.id)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Submit Order
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingOrder(order);
                                  setFormData({
                                    name: order.name,
                                    description: order.description,
                                    deliveryAddress: order.deliveryAddress,
                                    deliveryInstructions: order.deliveryInstructions,
                                    stops: order.stops
                                  });
                                  setShowCreateForm(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {order.status === 'submitted' && (
                            <Button 
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              disabled
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Processing
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MultiStopOrdersPage;
