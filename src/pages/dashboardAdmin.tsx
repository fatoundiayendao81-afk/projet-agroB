import React, { useEffect, useState } from "react";
import { Users, Package, ShoppingCart, BarChart3, X, Edit } from "lucide-react";
import authService from "../services/authService";
import { productService } from "../services/productService";
import { adminService } from "../services/AdminService";
import type { Product, Stats } from "../types";
import Swal from "sweetalert2";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    title: "",
    category: "",
    price: 0,
    description: "",
    stock: 0,
    image: ""
  });

  // Fonction isAdmin utilisant le service
  const isAdmin = (): boolean => {
    return authService.isAdmin();
  };

  // --- Chargement des stats ---
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin()) {
        setLoadingStats(false);
        return;
      }

      try {
        setError(null);
        const data = await adminService.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Erreur chargement stats:", err);
        setError("Impossible de charger les statistiques");
        Swal.fire("Erreur", "Impossible de charger les statistiques", "error");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // --- Chargement des produits ---
  useEffect(() => {
    const fetchProducts = async () => {
      if (!isAdmin()) {
        setLoadingProducts(false);
        return;
      }

      try {
        setError(null);
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Erreur chargement produits:", err);
        setError("Impossible de charger les produits");
        Swal.fire("Erreur", "Impossible de charger les produits", "error");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // --- Gestion du formulaire ---
  const openModalForAdd = () => {
    setEditingProduct(null);
    setFormData({
      title: "",
      category: "",
      price: 0,
      description: "",
      stock: 0,
      image: ""
    });
    setModalOpen(true);
  };

  const openModalForEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setModalOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...formData } : p))
        );
        Swal.fire("Modifié !", "Produit mis à jour avec succès.", "success");
      } else {
        const newProduct = await productService.addProduct(formData);
        setProducts((prev) => [prev, newProduct]);
        Swal.fire("Ajouté !", "Produit ajouté avec succès.", "success");
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      Swal.fire("Erreur", "Une erreur est survenue lors de l'opération.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler"
    });

    if (result.isConfirmed) {
      try {
        await productService.deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        Swal.fire("Supprimé !", "Le produit a été supprimé.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Erreur", "Impossible de supprimer le produit.", "error");
      }
    }
  };

  if (!isAdmin()) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-center text-red-600 text-xl">Accès refusé. Administrateur requis.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* --- STATISTIQUES ADMIN --- */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Tableau de bord administrateur</h2>
        
        {loadingStats ? (
          <div className="flex justify-center">
            <p>Chargement des statistiques...</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={28} />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {stats.totalProducers} producteurs • {stats.totalClients} clients
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Produits</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.productsCount}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Package className="text-green-600" size={28} />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">{stats.pendingProducts} en attente</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commandes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.ordersCount}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ShoppingCart className="text-purple-600" size={28} />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">{stats.completedOrders} livrées</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalSales?.toLocaleString() || 0} FCFA
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BarChart3 className="text-orange-600" size={28} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune donnée statistique disponible</p>
          </div>
        )}
      </div>

      {/* --- CRUD PRODUITS --- */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Gestion des produits</h2>
          <button
            onClick={openModalForAdd}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Ajouter un produit
          </button>
        </div>

        {loadingProducts ? (
          <div className="flex justify-center">
            <p>Chargement des produits...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white p-4 rounded-xl shadow flex flex-col hover:shadow-lg transition-shadow">
                <img
                  src={product.image || "/placeholder.png"}
                  alt={product.title}
                  className="h-40 w-full object-cover rounded-lg mb-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.png";
                  }}
                />
                <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                <p className="text-gray-600 text-sm mb-1">{product.category}</p>
                <p className="font-bold text-green-600 mb-2">{product.price} FCFA</p>
                <p className="text-sm text-gray-500 mb-3">Stock: {product.stock}</p>

                <div className="mt-auto flex justify-between gap-2">
                  <button
                    className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center gap-1 transition-colors flex-1 justify-center"
                    onClick={() => openModalForEdit(product)}
                  >
                    <Edit size={16} /> Modifier
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors flex-1"
                    onClick={() => handleDelete(product.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun produit disponible</p>
          </div>
        )}
      </div>

      {/* --- MODAL AJOUT/MODIFICATION --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Nom du produit"
                  value={formData.title || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <input
                  type="text"
                  name="category"
                  placeholder="Catégorie"
                  value={formData.category || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix *
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Prix"
                    value={formData.price || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    placeholder="Stock"
                    value={formData.stock || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de l'image
                </label>
                <input
                  type="text"
                  name="image"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  placeholder="Description du produit..."
                  value={formData.description || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
                >
                  {editingProduct ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;