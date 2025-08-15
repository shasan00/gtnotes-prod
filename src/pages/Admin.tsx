import React from "react";
import Layout from "@/components/Layout";
import { NotesService, Note } from "@/services/notesService";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { showError, showSuccess } from "@/utils/toast";

export default function Admin() {
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actioningId, setActioningId] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState<boolean>(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await NotesService.getPendingNotes();
      setNotes(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load pending notes");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);


  const selectNote = async (id: string) => {
    setSelectedId(id);
    setPreviewLoading(true);
    setPreviewUrl(null);
    try {
      const res = await NotesService.getNoteById(id);
      setPreviewUrl(res?.note.fileUrl || null);
    } catch (e) {
      setPreviewUrl(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActioningId(id);
      const ok = await NotesService.approveNote(id);
      if (ok) {
        showSuccess("Approved");
        setNotes((prev) => prev.filter((n) => n.id !== id));
        if (selectedId === id) {
          setSelectedId(null);
          setPreviewUrl(null);
        }
      }
    } catch (e: any) {
      showError(e?.message || "Failed to approve");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActioningId(id);
      const ok = await NotesService.rejectNote(id);
      if (ok) {
        showSuccess("Rejected");
        setNotes((prev) => prev.filter((n) => n.id !== id));
        if (selectedId === id) {
          setSelectedId(null);
          setPreviewUrl(null);
        }
      }
    } catch (e: any) {
      showError(e?.message || "Failed to reject");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-screen-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Pending Notes</h1>
          <Button variant="outline" onClick={load} disabled={loading}>Refresh</Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="rounded-md border divide-y">
              {notes.length === 0 ? (
                <div className="p-4 text-muted-foreground">No pending notes.</div>
              ) : (
                notes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => selectNote(n.id)}
                    className={`w-full text-left p-4 hover:bg-muted/50 ${selectedId === n.id ? "bg-muted" : ""}`}
                  >
                    <div className="truncate font-medium">{n.title}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {n.course} • {n.professor} • {n.semester}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </button>
                ))
              )}
            </div>

            <div className="lg:col-span-3 rounded-md border min-h-[80vh] flex flex-col">
              {!selectedId ? (
                <div className="m-auto text-muted-foreground">Select a note to preview</div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 border-b">
                    <div className="text-sm text-muted-foreground">
                      {notes.find((n) => n.id === selectedId)?.title}
                    </div>
                    <div className="flex gap-2">
                      <Button size="lg" className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprove(selectedId)} disabled={actioningId === selectedId}>Approve</Button>
                      <Button size="lg" className="px-6" variant="destructive" onClick={() => handleReject(selectedId)} disabled={actioningId === selectedId}>Reject</Button>
                    </div>
                  </div>
                  <div className="flex-1">
                    {previewLoading ? (
                      <div className="p-6"><Skeleton className="h-[72vh] w-full" /></div>
                    ) : previewUrl ? (
                      <iframe
                        title="Preview"
                        src={previewUrl + "#view=FitH"}
                        className="w-full h-[calc(80vh-48px)]"
                      />
                    ) : (
                      <div className="p-4 text-muted-foreground">No preview available</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}


