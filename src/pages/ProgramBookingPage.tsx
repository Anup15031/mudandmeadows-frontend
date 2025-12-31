import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

export default function ProgramBookingPage() {
  const [searchParams] = useSearchParams();
  const programId = searchParams.get("program");
  const [program, setProgram] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [cottages, setCottages] = useState<any[]>([]);
  const [selectedCottage, setSelectedCottage] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentReady, setPaymentReady] = useState(false);
  const navigate = useNavigate();

  // Fetch program details
  useEffect(() => {
    if (!programId) return;
    fetch(`/api/programs/${programId}`)
      .then(res => res.json())
      .then(setProgram)
      .catch(() => setError("Failed to load program details"));
  }, [programId]);

  // Check cottage availability
  const checkAvailability = async () => {
    setLoading(true);
    setError(null);
    setCottages([]);
    setSelectedCottage("");
    try {
      // Calculate end date based on program.days
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + (program.days || 1));
      const endDate = end.toISOString().split("T")[0];
      const res = await fetch(`/api/cottages?availableStart=${startDate}&availableEnd=${endDate}`);
      if (!res.ok) throw new Error("No cottages available for selected dates");
      const data = await res.json();
      setCottages(data);
      setStep(2);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Proceed to payment
  const handleBook = () => {
    setPaymentReady(true);
    // Here you would redirect to payment or show payment UI
  };

  if (!program) return <Layout><div className="container-padding py-12">Loading…</div></Layout>;

  return (
    <Layout>
      <main className="container-padding py-12 max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl font-bold mb-6">Book: {program.name}</h1>
        {step === 1 && (
          <div className="mb-8">
            <label className="block mb-2 font-medium">Select Start Date</label>
            <input
              type="date"
              className="border rounded px-3 py-2 mb-4 w-full"
              value={startDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={e => setStartDate(e.target.value)}
            />
            <Button disabled={!startDate || loading} onClick={checkAvailability} className="w-full">
              {loading ? "Checking availability…" : `Check Cottage Availability for ${program.days} days`}
            </Button>
            {error && <div className="text-destructive mt-2">{error}</div>}
          </div>
        )}
        {step === 2 && (
          <div className="mb-8">
            <label className="block mb-2 font-medium">Select Cottage</label>
            <div className="grid gap-4">
              {cottages.length === 0 && <div className="text-destructive">No cottages available for these dates.</div>}
              {cottages.map((c: any) => (
                <div key={c._id || c.id} className={`border rounded-lg p-4 flex items-center gap-4 ${selectedCottage === (c._id || c.id) ? 'border-primary bg-primary/5' : 'border-cream'}`}>
                  <input
                    type="radio"
                    name="cottage"
                    value={c._id || c.id}
                    checked={selectedCottage === (c._id || c.id)}
                    onChange={() => setSelectedCottage(c._id || c.id)}
                    className="mr-2"
                  />
                  <div>
                    <div className="font-semibold">{c.name || c.title}</div>
                    <div className="text-sm text-muted-foreground">{c.type || c.category}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button disabled={!selectedCottage} onClick={handleBook} className="w-full mt-4">
              Proceed to Payment
            </Button>
            <Button variant="outline" className="w-full mt-2" onClick={() => setStep(1)}>
              ← Change Dates
            </Button>
          </div>
        )}
        {paymentReady && (
          <div className="mb-8">
            <div className="text-success mb-4">Cottage reserved! (Payment integration goes here.)</div>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </div>
        )}
      </main>
    </Layout>
  );
}
