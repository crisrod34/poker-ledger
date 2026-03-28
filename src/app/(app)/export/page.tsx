"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";

export default function ExportPage() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pibardos-poker-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Export" subtitle="Download your data as CSV" />
      <div className="text-center py-16">
        <Download className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground mb-6">Export all session data to a CSV file</p>
        <Button
          onClick={handleExport}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          {loading ? "Exporting..." : "Download CSV"}
        </Button>
      </div>
    </>
  );
}
