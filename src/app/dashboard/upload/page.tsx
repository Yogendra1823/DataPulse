"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { setGlobalData, DEFAULT_DATA } from "@/hooks/use-sales-data";
import { detectColumnMapping, normalizeData } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

export default function UploadPage() {
  const router = useRouter();
  const inputRef  = useRef<HTMLInputElement>(null);
  const [drag,    setDrag]    = useState(false);
  const [status,  setStatus]  = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<Record<string,unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const processRows = useCallback((rows: Record<string, unknown>[], fileName: string) => {
    if (!rows.length) { setStatus("error"); setMessage("File is empty or has no valid data."); return; }
    const hdrs = Object.keys(rows[0]);
    const mapping = detectColumnMapping(hdrs);
    const normalized = normalizeData(rows, mapping);
    setGlobalData(normalized);
    setHeaders(hdrs);
    setPreview(rows.slice(0, 8));
    setStatus("success");
    setMessage(`✅ ${rows.length.toLocaleString()} rows · ${hdrs.length} columns parsed from "${fileName}"`);
    toast.success("Data imported successfully!");
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv","xls","xlsx"].includes(ext ?? "")) {
      setStatus("error"); setMessage("Unsupported file type. Use CSV or XLSX."); return;
    }
    setStatus("loading"); setMessage(`Parsing "${file.name}"…`);

    if (ext === "csv") {
      const { default: Papa } = await import("papaparse");
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: r => processRows(r.data as Record<string,unknown>[], file.name),
        error:   e => { setStatus("error"); setMessage(e.message); },
      });
    } else {
      const { read, utils } = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb  = read(buf, { type: "array" });
      const ws  = wb.Sheets[wb.SheetNames[0]];
      processRows(utils.sheet_to_json(ws) as Record<string,unknown>[], file.name);
    }
  }, [processRows]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  function loadSample() {
    setGlobalData(DEFAULT_DATA);
    const hdrs = Object.keys(DEFAULT_DATA[0]);
    setHeaders(hdrs);
    setPreview(DEFAULT_DATA.slice(0, 8) as unknown as Record<string,unknown>[]);
    setStatus("success");
    setMessage(`✅ Sample data loaded — ${DEFAULT_DATA.length} months · ${hdrs.length} columns`);
    toast.success("Sample data loaded!");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-dp-text-primary">Import Data</h1>
        <p className="text-sm text-dp-text-dim mt-0.5">Upload your CSV or Excel sales data to begin analysis</p>
      </div>

      {/* Drop zone */}
      <div
        className={`dp-drop-zone p-14 mb-5 ${drag ? "dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(99,102,241,.15)" }}>
          <Upload size={28} style={{ color: "#6366F1" }} />
        </div>
        <h3 className="text-lg font-bold text-dp-text-primary mb-2">
          {drag ? "Drop to import!" : "Drop your file here, or click to browse"}
        </h3>
        <p className="text-sm text-dp-text-muted mb-4">Supports CSV, XLS, XLSX — up to 50 MB</p>
        <div className="flex justify-center gap-2">
          {["CSV","XLS","XLSX"].map(f => (
            <span key={f} className="dp-badge text-[11px]"
              style={{ background: "rgba(99,102,241,.12)", color: "#818CF8", border: "1px solid rgba(99,102,241,.2)" }}>{f}</span>
          ))}
        </div>
        <input ref={inputRef} type="file" accept=".csv,.xls,.xlsx" className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {/* Sample data */}
      <div className="text-center mb-6">
        <button className="dp-btn-secondary text-sm" onClick={loadSample}>
          <FileSpreadsheet size={15} /> Load sample sales data
        </button>
      </div>

      {/* Status */}
      {status === "loading" && (
        <div className="dp-card p-8 text-center mb-5">
          <div className="w-10 h-10 border-2 border-[#6366F1]/20 border-t-[#6366F1] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-dp-text-secondary">{message}</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-start gap-3 p-4 rounded-xl mb-5"
          style={{ background: "rgba(244,63,94,.09)", border: "1px solid rgba(244,63,94,.25)" }}>
          <AlertCircle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-400">{message}</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex items-start gap-3 p-4 rounded-xl mb-5"
          style={{ background: "rgba(16,185,129,.09)", border: "1px solid rgba(16,185,129,.25)" }}>
          <CheckCircle size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-400">{message}</p>
        </div>
      )}

      {/* Preview table */}
      {preview.length > 0 && status === "success" && (
        <>
          <div className="dp-card overflow-hidden mb-5">
            <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,.06)" }}>
              <h2 className="text-sm font-bold text-dp-text-primary">Data Preview</h2>
              <p className="text-xs text-dp-text-dim mt-0.5">First {preview.length} rows</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,.04)" }}>
                    {headers.slice(0, 9).map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-semibold whitespace-nowrap"
                        style={{ color: "#64748B", fontSize: 11.5, borderBottom: "1px solid rgba(255,255,255,.06)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-white/[0.025]">
                      {headers.slice(0, 9).map(h => (
                        <td key={h} className="px-4 py-2 whitespace-nowrap"
                          style={{ color: "#94A3B8", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                          {String(row[h] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="dp-btn-primary" onClick={() => router.push("/dashboard")}>
              View Dashboard <ArrowRight size={15} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
