// types.ts - Ajoutez cette interface
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  onGuestCheckout?: (userData: {
    name: string;
    email: string;
    phone: string;
  }) => void;
  onUserCheckout?: () => void;
}

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
  discountedPrice?: number;
  category: string;
  image: string;
  sellerId: string;
  sellerName: string;
  farmName?: string;
  unit?: string;
   promo?: number;
  available: boolean;
  stock: number;
  createdAt: string;
  updatedAt?: string;
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
  cancellationReason?: string;
  cancelledAt?: string;
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
  promo?: number;
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

// Nouvelles interfaces pour le système d'approbation
export interface ProductApproval {
  id: string;
  productId: string;
  action: "create" | "update" | "delete";
  productData?: Partial<Product>;
  status: "pending" | "approved" | "rejected";
  producerId: string;
  producerName?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComment?: string;
}

export interface OrderApproval {
  id: string;
  orderId: string;
  action: "create" | "update" | "cancel";
  orderData?: Partial<Order>;
  status: "pending" | "approved" | "rejected";
  clientId: string;
  clientName?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComment?: string;
}

export interface ApprovalStats {
  pendingProductApprovals: number;
  pendingOrderApprovals: number;
  totalApprovals: number;
}
