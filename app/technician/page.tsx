"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Tv,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  TrendingUp,
  Loader2,
  UploadCloud,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  Activity,
  Sliders,
  LogOut,
  X,
} from "lucide-react";

const TECH_STATUSES = [
  "Confirmed",
  "On the way",
  "Installing",
  "Completed",
];

export default function TechnicianDashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  // Job states
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Status update drawer modal
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [techNote, setTechNote] = useState("");
  const [images, setImages] = useState<string[]>([]); // base64 images
  const [updating, setUpdating] = useState(false);
  const [drawerMsg, setDrawerMsg] = useState("");

  // Redirect if unauthorized
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login?callbackUrl=/technician");
    } else if (session && (session.user as any)?.role !== "technician" && (session.user as any)?.role !== "admin") {
      router.push("/");
    }
  }, [session, authStatus, router]);

  // Load assigned jobs
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    async function loadJobs() {
      setLoading(true);
      try {
        const res = await fetch("/api/technician/jobs");
        const data = await res.json();
        if (res.ok && data.success) {
          setJobs(data.data);
        }
      } catch (err) {
        console.error("Could not fetch assigned jobs: ", err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [authStatus, refreshKey]);

  // Dropzone setup
  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Str = reader.result as string;
        setImages((prev) => [...prev, base64Str]);
      };
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 6 * 1024 * 1024, // 6MB
  });

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const openDrawer = (job: any) => {
    setSelectedJob(job);
    setNewStatus(job.status);
    setTechNote(job.technicianNotes || "");
    setImages([]); // Start fresh with new uploads
    setDrawerOpen(true);
    setDrawerMsg("");
  };

  // Submit job progress
  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setUpdating(true);
    setDrawerMsg("");

    try {
      const res = await fetch(`/api/technician/jobs/${selectedJob._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          note: techNote,
          images,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setDrawerMsg("Job state updated successfully! Customer notified.");
        setRefreshKey((k) => k + 1);

        setTimeout(() => {
          setDrawerOpen(false);
          setSelectedJob(null);
          setDrawerMsg("");
        }, 1500);
      } else {
        setDrawerMsg(data.message || "Failed to update job status.");
      }
    } catch (err: any) {
      console.error(err);
      setDrawerMsg("Failed to connect to system database.");
    } finally {
      setUpdating(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-dark">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-cyan mx-auto" />
          <p className="text-xs text-slate-400 font-semibold tracking-wider font-syne">
            Loading assigned TV installations...
          </p>
        </div>
      </div>
    );
  }

  // Summary counts
  const totalAssigned = jobs.length;
  const activeInstallations = jobs.filter((j) => ["On the way", "Installing"].includes(j.status)).length;
  const completedJobs = jobs.filter((j) => j.status === "Completed").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8 mb-10">
        <div>
          <span className="text-xs text-brand-mint font-bold uppercase tracking-wider">
            Field Technician Console
          </span>
          <h1 className="font-syne text-3xl font-extrabold text-white mt-1">
            TV Setup & Installation Hub
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-semibold">Logged in as:</p>
            <p className="text-sm font-bold text-white">{session?.user?.name || "Field Operator"}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-xl border border-white/5 bg-brand-dark/40 hover:bg-red-950/20 hover:border-red-500/20 p-3 text-slate-400 hover:text-red-400 transition-all duration-300"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* METRICS CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Total Assigned */}
        <div className="glass-card p-6 border-white/5 bg-brand-dark/40 relative overflow-hidden">
          <div className="absolute top-4 right-4 h-9 w-9 rounded-xl bg-brand-dark border border-white/10 flex items-center justify-center text-slate-400">
            <ListTodo className="h-5 w-5" />
          </div>
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">Assigned Installations</span>
          <span className="font-syne text-3xl font-extrabold text-white mt-2 block">
            {totalAssigned}
          </span>
          <span className="text-[10px] text-slate-400 mt-2 block">Total tasks assigned to you</span>
        </div>

        {/* Active Installations */}
        <div className="glass-card p-6 border-brand-cyan/20 bg-brand-navy/15 relative overflow-hidden">
          <div className="absolute top-4 right-4 h-9 w-9 rounded-xl bg-brand-dark border border-brand-cyan/15 flex items-center justify-center text-brand-cyan shadow-neon">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">Active Jobs</span>
          <span className="font-syne text-3xl font-extrabold text-brand-cyan text-neon mt-2 block">
            {activeInstallations}
          </span>
          <span className="text-[10px] text-brand-mint font-semibold mt-2 block flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> In progress / On the way
          </span>
        </div>

        {/* Completed Jobs */}
        <div className="glass-card p-6 border-brand-mint/20 bg-brand-navy/15 relative overflow-hidden">
          <div className="absolute top-4 right-4 h-9 w-9 rounded-xl bg-brand-dark border border-brand-mint/15 flex items-center justify-center text-brand-mint shadow-neon-mint">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">Completed Jobs</span>
          <span className="font-syne text-3xl font-extrabold text-brand-mint text-neon-mint mt-2 block">
            {completedJobs}
          </span>
          <span className="text-[10px] text-slate-400 mt-2 block">Finished setups closed this month</span>
        </div>
      </div>

      {/* ACTIVE TASKS CONTAINER */}
      <div className="glass-card p-6 md:p-8 border-white/5 bg-brand-dark/40">
        <h3 className="font-syne text-lg font-bold text-white mb-6 border-l-4 border-brand-cyan pl-3 flex items-center gap-2">
          <Tv className="h-5 w-5 text-brand-cyan" /> Assigned Work Orders
        </h3>

        {jobs.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="h-12 w-12 rounded-full bg-brand-navy/60 border border-brand-cyan/25 flex items-center justify-center text-brand-cyan mx-auto shadow-neon">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="font-syne text-base font-bold text-white">All Caught Up!</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              No TV installation or repair orders are currently assigned to your account. Check in with the admin panel if you expect new work.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="glass-card p-5 border border-white/5 bg-brand-navy/5 hover:border-brand-cyan/25 hover:bg-brand-navy/10 transition-all duration-300 flex flex-col justify-between gap-5 relative group"
              >
                {/* Upper Details */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-brand-cyan font-bold tracking-wider block">
                        {job.trackingId}
                      </span>
                      <h4 className="font-bold text-white text-base mt-1 font-syne">
                        {job.deviceModel} Setup
                      </h4>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">
                        {job.installationType}
                      </span>
                    </div>

                    <span className={`rounded-xl border px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-neon ${
                      job.status === "Completed"
                        ? "bg-brand-navy border-brand-mint/30 text-brand-mint shadow-neon-mint"
                        : "bg-brand-navy border-brand-cyan/30 text-brand-cyan"
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  {/* Booking meta info */}
                  <div className="space-y-2 text-xs text-slate-300">
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500 shrink-0" />
                      <span>{job.customerName}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                      <a href={`tel:${job.customerPhone}`} className="hover:text-brand-cyan transition-colors">
                        {job.customerPhone}
                      </a>
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {job.installationLocationDetails || job.issueDescription}
                      </span>
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2 bg-brand-dark/40 rounded-xl p-3 border border-white/5">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">Date & Slot</span>
                        <span className="font-semibold text-slate-200">{new Date(job.date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">Visit Time</span>
                        <span className="font-semibold text-brand-mint capitalize">{job.preferredVisitTime || "Morning"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drawer trigger button */}
                <button
                  onClick={() => openDrawer(job)}
                  disabled={job.status === "Completed"}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-brand-navy/60 hover:bg-brand-navy border border-brand-cyan/20 hover:border-brand-cyan/40 text-brand-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sliders className="h-4 w-4" />
                  {job.status === "Completed" ? "Installation Finished" : "Update Job Status"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* JOB UPDATE DRAWER MODAL */}
      {drawerOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-brand-dark border-l border-white/5 p-6 space-y-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-syne text-lg font-bold text-white flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-brand-cyan" /> Job Status Panel
                  </h3>
                  <span className="text-xs text-slate-400">Task Ref: {selectedJob.trackingId}</span>
                </div>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setSelectedJob(null);
                    setDrawerMsg("");
                  }}
                  className="rounded-lg p-1.5 hover:bg-white/5 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status/Notification Messages */}
              {drawerMsg && (
                <div className={`rounded-xl border p-4 text-xs font-semibold ${
                  drawerMsg.includes("successfully")
                    ? "bg-brand-navy/60 border-brand-mint/20 text-brand-mint"
                    : "bg-red-950/20 border-red-500/20 text-red-400"
                }`}>
                  {drawerMsg}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleUpdateJob} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Progression Status *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-xl bg-brand-dark border border-white/10 p-3.5 text-xs text-white focus:border-brand-cyan focus:outline-none"
                  >
                    {TECH_STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Service Notes & Completion Logs *</label>
                  <textarea
                    rows={4}
                    value={techNote}
                    onChange={(e) => setTechNote(e.target.value)}
                    required
                    className="w-full rounded-xl bg-brand-dark border border-white/10 p-3.5 text-xs text-white focus:border-brand-cyan focus:outline-none font-sans"
                    placeholder="Provide details on installation alignment, cable specs, signal levels, or troubleshoot notes..."
                  />
                </div>

                {/* react-dropzone upload container */}
                <div className="space-y-3">
                  <label className="text-xs text-slate-400 font-semibold">Upload Completion Photos (Optional)</label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? "border-brand-cyan bg-brand-cyan/5 shadow-neon"
                        : "border-white/10 hover:border-brand-cyan/25 hover:bg-white/5"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <UploadCloud className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-200 font-semibold">Drag & drop photo proofs</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Accepts PNG, JPG, JPEG (Max 6MB)</p>
                  </div>

                  {/* Uploaded thumbnails */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2.5 mt-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative h-14 w-14 rounded-lg overflow-hidden border border-white/10 group">
                          <img src={img} alt="proof" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute inset-0 bg-red-950/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="neon-btn-primary w-full py-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 mt-4"
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Save & Email Updates
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="border-t border-white/5 pt-4 text-[10px] text-slate-500 leading-relaxed">
              📢 <strong>Customer Tracking Loop:</strong> Updating status logs here will immediately refresh the user's progress bar on the tracking page in real-time, and trigger an automated email notifying the customer of the technician's findings and status.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
