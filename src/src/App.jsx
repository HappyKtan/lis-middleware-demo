import React, { useState, useEffect } from "react";
import { Play, Pause, Download } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function App() {
  const [orders, setOrders] = useState([]);
  const [results, setResults] = useState([]);
  const [messages, setMessages] = useState([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      if (orders.length === 0) return;
      const order = orders[Math.floor(Math.random() * orders.length)];
      const res = {
        orderId: order.id,
        analyte: "WBC",
        value: (4 + Math.random() * 6).toFixed(1),
        unit: "x10^9/L",
        status: Math.random() > 0.8 ? "Held" : "Auto-Verified",
        time: new Date().toLocaleTimeString()
      };
      setResults(prev => [res, ...prev]);
      setMessages(prev => [
        {
          type: "HL7 ORU^R01",
          payload: `MSH|^~\\&|ANALYZER|LAB|LIS|HOSP|${new Date().toISOString()}||ORU^R01|123|P|2.3
PID|1||${order.patientId}
OBR|1||${order.id}||CBC
OBX|1|NM|WBC||${res.value}|${res.unit}|||F`
        },
        ...prev
      ]);
    }, 3500);
    return () => clearInterval(interval);
  }, [running, orders]);

  const addOrder = () => {
    const id = "S-" + String(orders.length + 1).padStart(4, "0");
    const patientId = "P-" + String(orders.length + 1).padStart(4, "0");
    setOrders([...orders, { id, patientId }]);
    toast.success(`Order created: ${id}`);
  };

  const downloadMsg = (msg) => {
    const blob = new Blob([msg.payload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "message.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 20 }}>
      <Toaster />
      <h1>Cloud LIS Middleware Demo</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setRunning(!running)} style={{ padding: "8px 12px" }}>
          {running ? <><Pause size={14}/> Stop</> : <><Play size={14}/> Start</>}
        </button>
        <button onClick={addOrder} style={{ padding: "8px 12px" }}>+ New Order</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div style={{ padding: 12, borderRadius: 8, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h3>Orders</h3>
          <ul>{orders.map(o => <li key={o.id}>{o.id} – {o.patientId}</li>)}</ul>
        </div>

        <div style={{ padding: 12, borderRadius: 8, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h3>Results</h3>
          <ul>
            {results.map((r, i) => (
              <li key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{r.orderId} {r.analyte}: {r.value} {r.unit}</span>
                <span style={{ color: r.status === "Held" ? "crimson" : "green" }}>{r.status}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ padding: 12, borderRadius: 8, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h3>Messages</h3>
          <ul style={{ fontSize: 12 }}>
            {messages.map((m, idx) => (
              <li key={idx} style={{ marginBottom: 8, borderRadius: 6, padding: 8, background: "#f7f7f7" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontFamily: "monospace" }}>{m.type}</strong>
                  <button onClick={() => downloadMsg(m)} style={{ fontSize: 12, color: "#0b5fff", display: "flex", gap: 6, alignItems: "center" }}>
                    <Download size={12}/> Save
                  </button>
                </div>
                <pre style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{m.payload}</pre>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
