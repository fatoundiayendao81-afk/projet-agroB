// Types de base
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
  status?: string;
}

export interface CartItem extends Product {
  quantity: number;
  name: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
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

// Props pour les composants
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export interface ProductCardProps {
  product: Product;
}

export interface ProductFormProps {
  onSubmit: (product: Product) => void;
  initialData?: Partial<Product>;
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
