import React, { useEffect, useState, ChangeEvent } from "react";
import { apiClient } from "@/lib/api-client";

interface MenuItem {
  id?: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  available?: boolean;
}

export default function AdminDining() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<MenuItem>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await apiClient.getAllDiningMenuItems();
      setMenuItems(Array.isArray(items) ? items : []);
    } catch (e) {
      setError("Could not load menu items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, image: e.target.value }));
    setImagePreview(e.target.value || null);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = form.image || "";
      // If a file is selected, upload it (implement upload logic if backend supports it)
      if (imageFile) {
        // TODO: Implement actual upload logic to backend and get the URL
        // For now, just use a placeholder or skip
        alert("Image file upload is not implemented. Please use an image URL.");
        return;
      }
      const payload = { ...form, image: imageUrl };
      if (editingId) {
        await apiClient.updateDiningMenuItem(editingId, payload);
      } else {
        await apiClient.createDiningMenuItem(payload);
      }
      setForm({});
      setEditingId(null);
      setImageFile(null);
      setImagePreview(null);
      fetchMenu();
    } catch (e) {
      setError("Failed to save menu item.");
    }
  };

  const handleEdit = (item: MenuItem) => {
    setForm(item);
    setEditingId(item.id || "");
    setImagePreview(item.image || null);
    setImageFile(null);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    setError(null); // Clear error before attempting delete
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await apiClient.deleteDiningMenuItem(id);
      setError(null); // Clear error on success
      fetchMenu();
    } catch (e) {
      setError("Failed to delete menu item.");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h2 className="text-xl font-semibold mb-4">Dining Menu Management</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32, background: "#fafafa", padding: 16, borderRadius: 8 }}>
        <h3>{editingId ? "Edit Menu Item" : "Add Menu Item"}</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input name="name" placeholder="Name" value={form.name || ""} onChange={handleChange} required style={{ flex: 1 }} />
          <input name="price" type="number" placeholder="Price" value={form.price || ""} onChange={handleChange} style={{ width: 120 }} />
          <input name="category" placeholder="Category" value={form.category || ""} onChange={handleChange} style={{ width: 120 }} />
          <input name="image" placeholder="Image URL" value={form.image || ""} onChange={handleImageUrlChange} style={{ flex: 2 }} />
          <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input name="available" type="checkbox" checked={form.available ?? true} onChange={handleChange} /> Available
          </label>
        </div>
        {imagePreview && (
          <div style={{ marginTop: 8 }}>
            <img src={imagePreview} alt="Preview" style={{ maxWidth: 200, maxHeight: 120, borderRadius: 8 }} />
          </div>
        )}
        <textarea name="description" placeholder="Description" value={form.description || ""} onChange={handleChange} style={{ width: "100%", marginTop: 8 }} />
        <button type="submit" style={{ marginTop: 8, background: "#b08643", color: "#fff", border: 0, padding: "8px 16px", borderRadius: 4 }}>
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setForm({}); setEditingId(null); setImageFile(null); setImagePreview(null); }} style={{ marginLeft: 8 }}>
            Cancel
          </button>
        )}
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <table style={{ width: "100%", background: "#fff", borderRadius: 8, overflow: "hidden" }}>
          <thead>
            <tr style={{ background: "#f0e6d6" }}>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Available</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.price}</td>
                <td>{item.category}</td>
                <td>{item.available ? "Yes" : "No"}</td>
                <td>{item.image ? <img src={item.image} alt="" style={{ maxWidth: 60, maxHeight: 40, borderRadius: 4 }} /> : null}</td>
                <td>
                  <button onClick={() => handleEdit(item)} style={{ marginRight: 8 }}>Edit</button>
                  <button onClick={() => handleDelete(item.id)} style={{ color: "red" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}