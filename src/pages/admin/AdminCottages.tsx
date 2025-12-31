import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

interface Cottage {
  id?: string;
  name: string;
  description?: string;
  price?: number;
  images?: string[];
  amenities?: string[];
  size?: number;
  view?: string;
  guests?: number;
  available?: boolean;
  maintenance?: boolean;
}

const AdminCottages: React.FC = () => {
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Cottage>>({ images: [], amenities: [] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchCottages = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await apiClient.getAllCottages();
      setCottages(Array.isArray(items) ? items : []);
    } catch (e) {
      setError("Could not load cottages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCottages();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;

    // Only split on comma when submitting, not while typing
    if (name === "images" || name === "amenities") {
      setForm((f) => ({ ...f, [name]: value }));
    } else if (type === "number") {
      setForm((f) => ({ ...f, [name]: value === '' ? undefined : Number(value) }));
    } else {
      setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare form data: split amenities/images by comma if they are strings
    const submitForm = {
      ...form,
      images: typeof form.images === "string"
        ? form.images.split(',').map(s => s.trim()).filter(Boolean)
        : form.images,
      amenities: typeof form.amenities === "string"
        ? form.amenities.split(',').map(s => s.trim()).filter(Boolean)
        : form.amenities,
    };
    try {
      if (editingId) {
        await apiClient.updateCottage(editingId, submitForm);
        toast.success("Cottage updated successfully");
      } else {
        await fetch("http://localhost:8080/api/cottages/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(submitForm),
        }).then(async (res) => {
          if (!res.ok) throw new Error(await res.text());
        });
        toast.success("Cottage added successfully");
      }
      setForm({ images: [], amenities: [] });
      setEditingId(null);
      fetchCottages();
      setDialogOpen(false);
    } catch (e) {
      setError("Failed to save cottage.");
      toast.error("Failed to save cottage");
    }
  };

  const handleEdit = (item: Cottage) => {
    setForm({
      ...item,
      images: item.images ? [...item.images] : [],
      amenities: item.amenities ? [...item.amenities] : [],
    });
    setEditingId(item.id || "");
    setDialogOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Delete this cottage?")) return;
    try {
      await apiClient.deleteCottage(id);
      setError(null);
      fetchCottages();
    } catch (e) {
      setError("Failed to delete cottage.");
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h2 className="text-xl font-semibold mb-4">Cottages Management</h2>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <button
            style={{
              marginBottom: 24,
              background: "#b08643",
              color: "#fff",
              border: 0,
              padding: "10px 24px",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 16,
            }}
            onClick={() => {
              setForm({ images: [], amenities: [] });
              setEditingId(null);
              setDialogOpen(true);
            }}
          >
            Add Cottage
          </button>
        </DialogTrigger>
        <DialogContent
          style={{
            maxWidth: 700,
            width: "95vw",
            padding: 32,
            borderRadius: 16,
            background: "#faf8f5",
            boxShadow: "0 8px 32px #0002",
            overflowY: "auto",
            maxHeight: "90vh",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ fontSize: 26, marginBottom: 8 }}>
              {editingId ? "Edit Cottage" : "Add Cottage"}
            </DialogTitle>
            <DialogDescription style={{ fontSize: 16, marginBottom: 16 }}>
              Fill in all the details for the cottage.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Section: Basic Info */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Basic Information</h3>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <input
                  name="name"
                  placeholder="Name"
                  value={form.name || ""}
                  onChange={handleChange}
                  required
                  style={{ flex: 2, minWidth: 180, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
                />
                <input
                  name="price"
                  type="number"
                  placeholder="Price"
                  value={form.price || ""}
                  onChange={handleChange}
                  style={{ flex: 1, minWidth: 120, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
                />
                <input
                  name="size"
                  type="number"
                  placeholder="Size (sqm)"
                  value={form.size || ""}
                  onChange={handleChange}
                  style={{ flex: 1, minWidth: 120, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
                />
                <input
                  name="guests"
                  type="number"
                  placeholder="Guests"
                  value={form.guests || ""}
                  onChange={handleChange}
                  style={{ flex: 1, minWidth: 100, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
                />
                <input
                  name="view"
                  placeholder="View (e.g. Mountain View)"
                  value={form.view || ""}
                  onChange={handleChange}
                  style={{ flex: 2, minWidth: 180, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
                />
              </div>
            </div>
            {/* Section: Images & Amenities */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Images & Amenities</h3>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <input
                  name="images"
                  type="text"
                  placeholder="Image URLs (comma separated)"
                  value={typeof form.images === "string" ? form.images : (form.images?.join(', ') || "")}
                  onChange={handleChange}
                  style={{ flex: 2, minWidth: 250, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
                />
                <input
                  name="amenities"
                  type="text"
                  placeholder="Amenities (comma separated)"
                  value={typeof form.amenities === "string" ? form.amenities : (form.amenities?.join(', ') || "")}
                  onChange={handleChange}
                  style={{ flex: 2, minWidth: 250, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
                />
              </div>
              {/* Preview images */}
              {form.images && form.images.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {form.images.map((img, idx) =>
                    img ? (
                      <img
                        key={idx}
                        src={img}
                        alt=""
                        style={{
                          width: 70,
                          height: 50,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid #eee",
                          background: "#fff",
                        }}
                        onError={e => (e.currentTarget.style.display = "none")}
                      />
                    ) : null
                  )}
                </div>
              )}
            </div>
            {/* Section: Status */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Status</h3>
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16 }}>
                  <input
                    name="available"
                    type="checkbox"
                    checked={form.available ?? true}
                    onChange={handleChange}
                  />{" "}
                  Available
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16 }}>
                  <input
                    name="maintenance"
                    type="checkbox"
                    checked={form.maintenance ?? false}
                    onChange={handleChange}
                  />{" "}
                  Maintenance
                </label>
              </div>
            </div>
            {/* Section: Description */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Description</h3>
              <textarea
                name="description"
                placeholder="Description"
                value={form.description || ""}
                onChange={handleChange}
                style={{
                  width: "100%",
                  minHeight: 80,
                  padding: 12,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 15,
                  resize: "vertical",
                }}
              />
            </div>
            {/* Actions */}
            <div style={{ display: "flex", gap: 12, marginTop: 8, justifyContent: "flex-end" }}>
              <button
                type="submit"
                style={{
                  background: "#b08643",
                  color: "#fff",
                  border: 0,
                  padding: "10px 32px",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 17,
                  letterSpacing: 0.5,
                  boxShadow: "0 2px 8px #b0864333",
                }}
              >
                {editingId ? "Update" : "Add"}
              </button>
              <DialogClose asChild>
                <button
                  type="button"
                  style={{
                    background: "#eee",
                    color: "#333",
                    border: 0,
                    padding: "10px 32px",
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: 17,
                  }}
                >
                  Cancel
                </button>
              </DialogClose>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
          {cottages.map((item) => (
            <div key={item.id} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #0001", width: 350, marginBottom: 24, display: "flex", flexDirection: "column" }}>
              {item.images && item.images.length > 0 ? (
                item.images[0].match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    src={item.images[0]}
                    controls
                    style={{
                      width: "100%",
                      height: 180,
                      objectFit: "cover",
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                      background: "#000"
                    }}
                  />
                ) : (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: 180,
                      objectFit: "cover",
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12
                    }}
                  />
                )
              ) : (
                <div style={{
                  width: "100%",
                  height: 180,
                  background: "#eee",
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#bbb"
                }}>No Image</div>
              )}
              <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{item.name}</h3>
                  <span style={{ color: "#b08643", fontWeight: 700, fontSize: 18 }}>₹{item.price?.toLocaleString() || "-"}</span>
                </div>
                <div style={{ color: "#888", fontSize: 14, margin: "4px 0 8px 0" }}>{item.description}</div>
                <div style={{ display: "flex", gap: 12, fontSize: 13, color: "#555", marginBottom: 8 }}>
                  {item.size && <span>{item.size} sqm</span>}
                {item.guests && <span>{item.guests} guests</span>}
                </div>
                {item.amenities && item.amenities.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <strong style={{ fontSize: 13 }}>Amenities:</strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                      {item.amenities.map((am, idx) => (
                        <span key={idx} style={{ background: "#f0e6d6", color: "#7a5c1c", borderRadius: 6, padding: "2px 8px", fontSize: 12 }}>{am}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: item.available ? '#2a7d2e' : '#b00' }}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                  {item.maintenance && (
                    <span style={{ fontSize: 12, color: '#b00' }}>Maintenance</span>
                  )}
                </div>
                {item.images && item.images.length > 1 && (
                  <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    {item.images.slice(1).map((img, idx) =>
                      img.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video
                          key={idx}
                          src={img}
                          controls
                          style={{
                            width: 40,
                            height: 32,
                            objectFit: "cover",
                            borderRadius: 4,
                            border: "1px solid #eee",
                            background: "#000"
                          }}
                        />
                      ) : (
                        <img
                          key={idx}
                          src={img}
                          alt=""
                          style={{
                            width: 40,
                            height: 32,
                            objectFit: "cover",
                            borderRadius: 4,
                            border: "1px solid #eee"
                          }}
                        />
                      )
                    )}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                  <button onClick={() => handleEdit(item)} style={{ flex: 1, background: "#f0e6d6", color: "#7a5c1c", border: 0, padding: "6px 0", borderRadius: 4 }}>Edit</button>
                  <button onClick={() => handleDelete(item.id)} style={{ flex: 1, background: "#fff0f0", color: "#b00", border: 0, padding: "6px 0", borderRadius: 4 }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCottages;

