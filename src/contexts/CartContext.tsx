import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { toast } from 'react-toastify';

interface CartItem {
  id: string | number;
  title: string;
  price: string;          // Display price (with currency symbol)
  numericPrice: number;  // Numeric price for calculations
  imageUrl: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  toggleCart: () => void;
  totalItems: number;
  calculateTotal: () => string;
  cartTotal: string;
  sendOrderViaWhatsApp: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cleanPrice = (price: string | number): { display: string; numeric: number } => {
    // If price is already a number, use it directly
    if (typeof price === 'number') {
      return {
        display: price.toString(),
        numeric: price
      };
    }
    
    // Extract the first number from the string (including decimal points and commas)
    const match = price.match(/\d+([,.]\d+)?/);
    let numericValue = 0;
    
    if (match) {
      // Convert to number, handling both . and , as decimal separators
      numericValue = parseFloat(match[0].replace(',', '.'));
    }
    
    return {
      display: price.trim(),
      numeric: isNaN(numericValue) ? 0 : numericValue
    };
  };

  const addToCart = (item: Omit<CartItem, 'quantity' | 'numericPrice'>) => {
    const { display, numeric } = cleanPrice(item.price);
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { 
                ...cartItem, 
                quantity: cartItem.quantity + 1,
                // Update numeric price in case it changed
                numericPrice: numeric
              }
            : cartItem
        );
      }
      
      return [...prevItems, { 
        ...item, 
        price: display,
        numericPrice: numeric,
        quantity: 1 
      }];
    });
    
    toast.success('تمت إضافة المنتج إلى السلة', {
      position: 'bottom-right',
      autoClose: 2000,
    });
  };

  const removeFromCart = (id: string | number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const totalItems = useMemo(() => 
    cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const cartTotal = useMemo(() => {
    let total = 0;
    
    cartItems.forEach(item => {
      // Ensure we have a valid numeric price and quantity
      const price = typeof item.numericPrice === 'number' ? item.numericPrice : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      total += price * quantity;
    });
    
    // Format to 2 decimal places
    return total.toFixed(2);
  }, [cartItems]);

  const calculateTotal = () => cartTotal;

  const sendOrderViaWhatsApp = () => {
    if (cartItems.length === 0) {
      toast.warning('السلة فارغة، أضف منتجات أولاً');
      return;
    }

    // Format order details
    const orderDetails = cartItems.map(item => 
      `- ${item.title} (${item.quantity} × ${item.price})`
    ).join('%0A');

    // Create the message with order details and total
    const message = `مرحباً، أود طلب المنتجات التالية:%0A%0A${orderDetails}%0A%0Aالإجمالي: ${cartTotal} ج%0A%0Aشكراً لكم!`;
    
    // Open WhatsApp with the order details
    window.open(`https://wa.me/201027381559?text=${message}`, '_blank');
    
    // Close the cart after sending
    toggleCart();
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        toggleCart,
        totalItems,
        calculateTotal,
        cartTotal,
        sendOrderViaWhatsApp
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
