import React, { useState, useEffect, useRef } from "react";



export default function AdminGallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/gallery")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch gallery");
        return res.json();
      })
      .then((data) => {
        setGallery(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unknown error");
        setLoading(false);
      });
  }, []);

  // Upload handler
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    if (caption) formData.append("caption", caption);
    if (category) formData.append("category", category);
    try {
      const res = await fetch("/api/gallery/", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const newItem = await res.json();
      setGallery([newItem, ...gallery]);
      setFile(null);
      setCaption("");
      setCategory("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setUploading(false);
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this image?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setGallery(gallery.filter((g) => g.id !== id));
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
  };

  // Edit handler (only editable fields)
  const handleEdit = async (id: string, updates: any) => {
    setError(null);
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setGallery(gallery.map((g) => (g.id === id ? { ...g, ...updated } : g)));
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
  };


  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Gallery Management</h2>
      <p className="mb-6">Upload, update, or remove gallery images here.</p>

      <form className="mb-8 flex flex-col sm:flex-row gap-4 items-end" onSubmit={handleUpload}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
          className="border rounded px-2 py-1"
          required
        />
        <input
          type="text"
          placeholder="Caption"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded" disabled={uploading}>
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>

      {loading && <div>Loading gallery…</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {gallery.map((item) => (
          <GalleryCard key={item.id} item={item} onDelete={handleDelete} onEdit={handleEdit} />
        ))}
      </div>
    </div>
  );
}


// GalleryCard component for edit/delete
function GalleryCard({ item, onDelete, onEdit }: { item: any, onDelete: (id: string) => void, onEdit: (id: string, updates: any) => void }) {
  const [editMode, setEditMode] = React.useState(false);
  const [title, setTitle] = React.useState(item.title || "");
  const [caption, setCaption] = React.useState(item.caption || "");
  const [description, setDescription] = React.useState(item.description || "");
  const [type, setType] = React.useState(item.type || "");
  const [category, setCategory] = React.useState(item.category || "");
  const [visible, setVisible] = React.useState(item.visible ?? true);
  return (
    <div className="border rounded-lg p-3 bg-white shadow">
      {item.image_url || item.imageUrl ? (
        <img src={item.image_url || item.imageUrl} alt={item.title || caption || "Gallery image"} className="w-full h-40 object-cover rounded mb-2" />
      ) : null}
      {editMode ? (
        <>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border rounded px-2 py-1 mb-1 w-full"
            placeholder="Title"
          />
          <input
            type="text"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            className="border rounded px-2 py-1 mb-1 w-full"
            placeholder="Caption"
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="border rounded px-2 py-1 mb-1 w-full"
            placeholder="Description"
          />
          <input
            type="text"
            value={type}
            onChange={e => setType(e.target.value)}
            className="border rounded px-2 py-1 mb-1 w-full"
            placeholder="Type (photo/video)"
          />
          <input
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border rounded px-2 py-1 mb-1 w-full"
            placeholder="Category"
          />
          <label className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              checked={visible}
              onChange={e => setVisible(e.target.checked)}
            />
            Visible
          </label>
          <div className="flex gap-2 mt-2">
            <button
              className="text-green-700 hover:underline text-xs"
              onClick={() => {
                onEdit(item.id, { title, caption, description, type, category, visible });
                setEditMode(false);
              }}
            >Save</button>
            <button className="text-gray-500 hover:underline text-xs" onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <div className="font-semibold">{item.title || item.caption || "Untitled"}</div>
          {item.category && <div className="text-xs text-muted-foreground mb-1">{item.category}</div>}
          {item.description && <div className="text-sm mb-1">{item.description}</div>}
          <div className="text-xs text-gray-400">{item.created_at ? new Date(item.created_at).toLocaleString() : ""}</div>
          <div className="flex gap-2 mt-2">
            <button className="text-blue-600 hover:underline text-xs" onClick={() => setEditMode(true)}>Edit</button>
            <button className="text-red-600 hover:underline text-xs" onClick={() => onDelete(item.id)}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
}