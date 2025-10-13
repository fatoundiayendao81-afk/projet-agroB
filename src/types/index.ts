// types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "producer" | "client";
  phone?: string;
  address?: string;
  farmName?: string;
  description?: string;
  blocked: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  sellerId: string;
  sellerName: string;
  farmName?: string;
  unit?: string;
  available: boolean;
  stock: number;
  createdAt: string;
  status?: "pending" | "approved" | "rejected";
}

export interface CartItem extends Product {
  quantity: number;
  name: string;
}

export interface Order {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  orderNumber: string;
  date: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  sellerId: string;
}

export interface Stats {
  productsCount: number;
  ordersCount: number;
  pendingProducts: number;
  totalSales: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  shippedOrders: number;
  totalUsers: number;
  totalProducers: number;
  totalClients: number;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  authChecked: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: Partial<User>) => Promise<User>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<User>;
  hasRole: (role: User["role"]) => boolean;
  hasAnyRole: (roles: User["role"][]) => boolean;
  isAuthenticated: () => boolean;
  isBlocked: () => boolean;
  getUserRole: () => string;
  isAdmin: () => boolean;
  isProducer: () => boolean;
  isClient: () => boolean;
  blockUser: (userId: string) => Promise<boolean>;
  unblockUser: (userId: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}
