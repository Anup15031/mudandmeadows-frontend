import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Portal</h1>
        <nav className="flex gap-4">
          <Link to="/admin/gallery">Gallery</Link>
          <Link to="/admin/bookings">Bookings</Link>
          <Link to="/admin/dining">Dining</Link>
          <Link to="/admin/cottages">Cottages</Link>
          <Link to="/admin/billing">Billing</Link>
          <Link to="/admin/site">Site Details</Link>
          <Link to="/admin/wellness">Wellness</Link>
          <Link to="/admin/experiences">Experiences</Link>
        </nav>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
