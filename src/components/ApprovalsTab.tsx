import React, { useState, useEffect } from "react";
import { approvalService } from "../services/approvalService";
import { productService } from "../services/productService";
import orderService from "../services/orderService";
import type { ProductApproval, OrderApproval, User } from "../types";
import {
  CheckCircle,
  XCircle,
  Package,
  ShoppingCart,
  Clock,
  MessageCircle,
} from "lucide-react";

interface ApprovalsTabProps {
  currentUser: User;
  onDataUpdate: () => void;
}

const ApprovalsTab: React.FC<ApprovalsTabProps> = ({
  currentUser,
  onDataUpdate,
}) => {
  const [productApprovals, setProductApprovals] = useState<ProductApproval[]>(
    []
  );
  const [orderApprovals, setOrderApprovals] = useState<OrderApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewComment, setReviewComment] = useState<{ [key: string]: string }>(
    {}
  );
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      const [productApprovalsData, orderApprovalsData] = await Promise.all([
        approvalService.getPendingProductApprovals(),
        approvalService.getPendingOrderApprovals(),
      ]);
      setProductApprovals(productApprovalsData);
      setOrderApprovals(orderApprovalsData);
    } catch (error) {
      console.error("Erreur lors du chargement des approbations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (approval: ProductApproval) => {
    try {
      const comment = reviewComment[approval.id] || "";
      await approvalService.approveProductAction(
        approval.id,
        currentUser.id,
        comment
      );
      await productService.executeProductAction(approval);
      await loadApprovals();
      onDataUpdate();
      setReviewComment((prev) => ({ ...prev, [approval.id]: "" }));
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      alert("Erreur lors de l'approbation: " + (error as Error).message);
    }
  };

  const handleRejectProduct = async (approval: ProductApproval) => {
    try {
      const comment =
        reviewComment[approval.id] || "Action rejetée par l'administrateur";
      await approvalService.rejectProductAction(
        approval.id,
        currentUser.id,
        comment
      );
      await loadApprovals();
      setReviewComment((prev) => ({ ...prev, [approval.id]: "" }));
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      alert("Erreur lors du rejet: " + (error as Error).message);
    }
  };

  const handleApproveOrder = async (approval: OrderApproval) => {
    try {
      const comment = reviewComment[approval.id] || "";
      await approvalService.approveOrderAction(
        approval.id,
        currentUser.id,
        comment
      );
      await orderService.executeOrderAction(approval);
      await loadApprovals();
      onDataUpdate();
      setReviewComment((prev) => ({ ...prev, [approval.id]: "" }));
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      alert("Erreur lors de l'approbation: " + (error as Error).message);
    }
  };

  const handleRejectOrder = async (approval: OrderApproval) => {
    try {
      const comment =
        reviewComment[approval.id] || "Action rejetée par l'administrateur";
      await approvalService.rejectOrderAction(
        approval.id,
        currentUser.id,
        comment
      );
      await loadApprovals();
      setReviewComment((prev) => ({ ...prev, [approval.id]: "" }));
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      alert("Erreur lors du rejet: " + (error as Error).message);
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "create":
        return "Création";
      case "update":
        return "Modification";
      case "delete":
        return "Suppression";
      case "cancel":
        return "Annulation";
      default:
        return action;
    }
  };

  const toggleComment = (approvalId: string) => {
    setSelectedApproval(selectedApproval === approvalId ? null : approvalId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">
          Chargement des validations...
        </span>
      </div>
    );
  }

  const totalApprovals = productApprovals.length + orderApprovals.length;

  return (
    <div className="space-y-8">
      {/* En-tête des statistiques */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Validations en attente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-3xl font-bold text-blue-600">
              {productApprovals.length}
            </div>
            <div className="text-gray-600">Produits en attente</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-3xl font-bold text-green-600">
              {orderApprovals.length}
            </div>
            <div className="text-gray-600">Commandes en attente</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-3xl font-bold text-orange-600">
              {totalApprovals}
            </div>
            <div className="text-gray-600">Total des validations</div>
          </div>
        </div>
      </div>

      {/* Validations de produits */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package size={24} className="text-blue-600" />
          Validations de Produits
          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
            {productApprovals.length}
          </span>
        </h3>

        {productApprovals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Aucune validation de produit en attente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {productApprovals.map((approval) => (
              <div
                key={approval.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg text-gray-800">
                        {getActionText(approval.action)} de produit
                      </h4>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock size={12} />
                        En attente
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <strong>Producteur:</strong>{" "}
                        {approval.producerName || approval.producerId}
                      </div>
                      <div>
                        <strong>Date:</strong>{" "}
                        {new Date(approval.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                      {approval.productData && (
                        <>
                          <div className="md:col-span-2">
                            <strong>Produit:</strong>{" "}
                            {approval.productData.title}
                          </div>
                          {approval.productData.description && (
                            <div className="md:col-span-2">
                              <strong>Description:</strong>{" "}
                              {approval.productData.description}
                            </div>
                          )}
                          {approval.productData.price && (
                            <div>
                              <strong>Prix:</strong>{" "}
                              {approval.productData.price.toLocaleString()} FCFA
                            </div>
                          )}
                          {approval.productData.category && (
                            <div>
                              <strong>Catégorie:</strong>{" "}
                              {approval.productData.category}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Commentaire */}
                <div className="mb-3">
                  <button
                    onClick={() => toggleComment(approval.id)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <MessageCircle size={16} />
                    {selectedApproval === approval.id
                      ? "Masquer le commentaire"
                      : "Ajouter un commentaire"}
                  </button>

                  {selectedApproval === approval.id && (
                    <div className="mt-2">
                      <textarea
                        value={reviewComment[approval.id] || ""}
                        onChange={(e) =>
                          setReviewComment((prev) => ({
                            ...prev,
                            [approval.id]: e.target.value,
                          }))
                        }
                        placeholder="Commentaire optionnel..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveProduct(approval)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <CheckCircle size={18} />
                    Approuver
                  </button>
                  <button
                    onClick={() => handleRejectProduct(approval)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <XCircle size={18} />
                    Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validations de commandes */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ShoppingCart size={24} className="text-green-600" />
          Validations de Commandes
          <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
            {orderApprovals.length}
          </span>
        </h3>

        {orderApprovals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Aucune validation de commande en attente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderApprovals.map((approval) => (
              <div
                key={approval.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg text-gray-800">
                        {getActionText(approval.action)} de commande
                      </h4>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock size={12} />
                        En attente
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <strong>Client:</strong>{" "}
                        {approval.clientName || approval.clientId}
                      </div>
                      <div>
                        <strong>Date:</strong>{" "}
                        {new Date(approval.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                      <div>
                        <strong>Commande:</strong> {approval.orderId}
                      </div>
                      {approval.orderData?.cancellationReason && (
                        <div className="md:col-span-2">
                          <strong>Raison:</strong>{" "}
                          {approval.orderData.cancellationReason}
                        </div>
                      )}
                      {approval.orderData?.total && (
                        <div>
                          <strong>Total:</strong>{" "}
                          {approval.orderData.total.toLocaleString()} FCFA
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Commentaire */}
                <div className="mb-3">
                  <button
                    onClick={() => toggleComment(approval.id)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <MessageCircle size={16} />
                    {selectedApproval === approval.id
                      ? "Masquer le commentaire"
                      : "Ajouter un commentaire"}
                  </button>

                  {selectedApproval === approval.id && (
                    <div className="mt-2">
                      <textarea
                        value={reviewComment[approval.id] || ""}
                        onChange={(e) =>
                          setReviewComment((prev) => ({
                            ...prev,
                            [approval.id]: e.target.value,
                          }))
                        }
                        placeholder="Commentaire optionnel..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveOrder(approval)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <CheckCircle size={18} />
                    Approuver
                  </button>
                  <button
                    onClick={() => handleRejectOrder(approval)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <XCircle size={18} />
                    Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalsTab;
