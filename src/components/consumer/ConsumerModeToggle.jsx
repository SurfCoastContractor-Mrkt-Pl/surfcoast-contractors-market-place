import React from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { useConsumerMode } from '@/lib/ConsumerModeContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function ConsumerModeToggle() {
  const { isConsumerMode, toggleConsumerMode, cartCount } = useConsumerMode();
  const navigate = useNavigate();

  const handleEnterConsumerMode = () => {
    toggleConsumerMode(true);
    navigate('/MarketDirectory');
  };

  const handleExitConsumerMode = () => {
    toggleConsumerMode(false);
  };

  if (isConsumerMode) {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <ShoppingBag className="w-5 h-5 text-blue-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">Consumer Mode Active</p>
          <p className="text-xs text-blue-700">{cartCount} item(s) in cart</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExitConsumerMode}
          className="text-xs"
        >
          <X className="w-3 h-3 mr-1" />
          Exit
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleEnterConsumerMode}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
    >
      <ShoppingBag className="w-4 h-4" />
      Browse MarketShop as Customer
    </Button>
  );
}