import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';
import { ShoppingBag, Store, Truck, Users, Star, Shield, Zap, Search } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full Page Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/src/assets/hero-shoppr.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 via-amber-300/25 to-red-400/35"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 bg-gradient-to-r from-black/40 via-black/30 to-black/40 backdrop-blur-xl shadow-2xl border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">S</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-orange-300 leading-tight">Shoppr</span>
                <span className="text-xs text-orange-300 font-medium">Local Shopping Hub</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {/* Removed login buttons */}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative text-white py-32">
        {/* Floating Elements */}
        <div className="absolute inset-0 z-5">
          <div className="absolute top-20 left-10 w-20 h-20 bg-orange-500/20 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-red-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-yellow-500/20 rounded-full blur-xl"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-white drop-shadow-2xl font-black" style={{textShadow: '4px 4px 8px rgba(0,0,0,0.9)'}}>
                  Local Shopping
                </span>
                <br />
                <span className="text-orange-300 drop-shadow-2xl font-black" style={{textShadow: '4px 4px 8px rgba(0,0,0,0.9)'}}>
                  Made Simple
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white leading-relaxed max-w-3xl mx-auto drop-shadow-2xl font-semibold" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.9)'}}>
                Connect with local stores, kiranas, restaurants, and markets. Get fresh products delivered to your doorstep with lightning speed.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link to="/auth/customer/signin">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 hover:from-orange-600 hover:via-red-600 hover:to-orange-700 text-white px-10 py-4 text-lg font-semibold shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 border-0 h-14">
                  <ShoppingBag className="mr-3 h-6 w-6" />
                  Login
                </Button>
              </Link>
              <button 
                onClick={() => {
                  document.getElementById('business-cards')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
                className="border-2 border-white/80 text-white hover:bg-white/20 hover:border-white backdrop-blur-sm px-12 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg bg-white/5 rounded-lg h-14 flex items-center justify-center"
              >
                <Store className="mr-3 h-6 w-6" />
                Start a Business with Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Business Cards Section */}
      <section id="business-cards" className="relative z-10 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-2xl font-black">
              Join Our <span className="bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent font-black">Business Network</span>
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto drop-shadow-xl font-semibold" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.9)'}}>
              Partner with us to grow your business and reach more customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link to="/auth/merchant/signin" className="group">
              <div className="bg-white/35 backdrop-blur-xl rounded-2xl p-8 border-2 border-white/40 hover:bg-white/45 hover:border-white/60 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl text-center shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Store className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-2xl font-black">Merchant</h3>
                <p className="text-white leading-relaxed mb-6 drop-shadow-xl font-semibold">
                  List your store and reach more customers. Grow your business with our platform.
                </p>
                <div className="text-orange-300 font-bold group-hover:text-orange-200 transition-colors drop-shadow-lg">
                  Start Selling →
                </div>
              </div>
            </Link>

            <Link to="/auth/rider/signin" className="group">
              <div className="bg-white/35 backdrop-blur-xl rounded-2xl p-8 border-2 border-white/40 hover:bg-white/45 hover:border-white/60 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl text-center shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Truck className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-2xl font-black">Delivery Partner</h3>
                <p className="text-white leading-relaxed mb-6 drop-shadow-xl font-semibold">
                  Join our delivery network. Earn money by delivering orders in your area.
                </p>
                <div className="text-orange-300 font-bold group-hover:text-orange-200 transition-colors drop-shadow-lg">
                  Start Delivering →
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Normal size with proper background */}
      <div className="relative z-20 bg-gray-900">
      <Footer />
      </div>
    </div>
  );
};

export default Index;




