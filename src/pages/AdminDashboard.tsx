import React, { useState } from "react";
import type { User } from "../types";

const AdminDashboard: React.FC = () => {
  const [users] = useState<User[]>([
    {
      id: "1",
      name: "Alice Martin",
      email: "alice@email.com",
      password: "client123",
      role: "client",
      phone: "",
      address: "",
      blocked: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Bob Wilson",
      email: "bob@email.com",
      password: "producer123",
      role: "producer",
      phone: "",
      address: "",
      farmName: "Ferme Wilson",
      blocked: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Charlie Brown",
      email: "charlie@email.com",
      password: "client123",
      role: "client",
      phone: "",
      address: "",
      blocked: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Diana Prince",
      email: "diana@email.com",
      password: "admin123",
      role: "admin",
      phone: "",
      address: "",
      blocked: false,
      createdAt: new Date().toISOString(),
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Tableau de Bord Administrateur
        </h1>
        <p className="text-gray-600">
          Gérez les utilisateurs et surveillez l'activité de la plateforme
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Utilisateurs totaux
              </p>
              <p className="text-2xl font-bold text-gray-800">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Utilisateurs actifs
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter((user) => !user.blocked).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg mr-4">
              <span className="text-2xl">❌</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Utilisateurs bloqués
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter((user) => user.blocked).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Gestion des Utilisateurs
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Liste de tous les utilisateurs inscrits sur la plateforme
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "producer"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        !user.blocked
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {!user.blocked ? "✅ Actif" : "❌ Bloqué"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                        Modifier
                      </button>

                      {!user.blocked ? (
                        <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                          Bloquer
                        </button>
                      ) : (
                        <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                          Débloquer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Affichage de {users.length} utilisateur(s)
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
