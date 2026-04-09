"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { usersApi } from "@/lib/api/daily/user.api";
import {
  Loader2,
  Mail,
  User as UserIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Image as ImageIcon,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/utils/cropImage";

type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function EditProfilePage() {
  const { user, setAuth, token } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ username: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadModal, setUploadModal] = useState<"banner" | "icon" | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user && window !== undefined) {
      router.replace("/sign-in");
    } else if (user) {
      setForm({ username: user.username, email: user.email });
    }
  }, [user, router]);

  if (!user) return null;

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const hasChanges = form.username !== user.username || form.email !== user.email;

  const handleSaveTextChanges = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      const res = await usersApi.update(user.user_id, {
        username: form.username,
        email: form.email,
      });
      // Updating auth store with the new details
      setAuth(token!, { ...user, username: res.data.username, email: res.data.email });
      showToast("Profile updated successfully", "success");
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const validateAndUpload = async (type: "banner" | "icon", file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      showToast("File size goes over 10MB limit", "error");
      return;
    }

    if (type === "banner") {
      setUploadingBanner(true);
      try {
        const res = await usersApi.uploadProfileBanner(user.user_id, file);
        setAuth(token!, { ...user, profile_banner: res.data.profile_banner });
        showToast("Profile banner updated", "success");
        setUploadModal(null);
      } catch {
        showToast("Failed to upload banner", "error");
      } finally {
        setUploadingBanner(false);
      }
    } else {
      setUploadingIcon(true);
      try {
        const res = await usersApi.uploadProfileImage(user.user_id, file);
        setAuth(token!, { ...user, profile_image: res.data.profile_image });
        showToast("Profile picture updated", "success");
        setUploadModal(null);
      } catch {
        showToast("Failed to upload profile picture", "error");
      } finally {
        setUploadingIcon(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        showToast("Image size must be less than 10MB", "error");
        return;
      }
      setSelectedFile(file);
      setFileUrl(URL.createObjectURL(file));
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  };

  const handleCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    if (!fileUrl || !croppedAreaPixels || !uploadModal) return;
    
    // Set a subtle loading state locally or rely on the uploading states. Let's rely on validateAndUpload.
    try {
      const croppedFile = await getCroppedImg(fileUrl, croppedAreaPixels);
      if (croppedFile) validateAndUpload(uploadModal, croppedFile);
    } catch {
      showToast("Error processing cropped image", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-4xl overflow-hidden shadow-xl shadow-yellow-900/5 border border-yellow-100"
      >
        {/* Banner Section */}
        <div className="relative h-48 md:h-64 bg-zinc-100 w-full group">
          {user.profile_banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profile_banner}
              alt="Profile Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-tr from-yellow-200 to-amber-400 opacity-60" />
          )}

          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => {
                setUploadModal("banner");
                setSelectedFile(null);
                setFileUrl(null);
              }}
              className="bg-white/90 backdrop-blur text-zinc-900 px-4 py-2 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 hover:bg-white hover:scale-105 active:scale-95 transition-all"
            >
              <Pencil size={15} />
              Edit Banner
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 md:px-12 pb-12">
          {/* Avatar Area */}
          <div className="relative flex justify-between items-end -mt-16 mb-8">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white bg-zinc-100 shadow-lg overflow-hidden flex items-center justify-center relative">
                {user.profile_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profile_image}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-zinc-400 font-black text-5xl uppercase">
                    {user.username.substring(0, 2)}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setUploadModal("icon");
                  setSelectedFile(null);
                  setFileUrl(null);
                }}
                className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-10 h-10 bg-yellow-400 hover:bg-yellow-300 text-zinc-900 rounded-full shadow-xl flex items-center justify-center border-4 border-white transition-all hover:scale-110 active:scale-95 z-10"
              >
                <Pencil size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="max-w-2xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Identity Form */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-zinc-900 tracking-tight">Identity Details</h2>
                <p className="text-zinc-500 font-medium text-[13px] mt-1">
                  Manage your public identity details. This will be visible to other users.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-1">
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-yellow-300 focus:bg-white pl-11 pr-4 py-3 rounded-2xl outline-none font-bold text-zinc-800 transition-all focus:shadow-[0_0_0_4px_rgba(253,224,71,0.2)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-1">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-yellow-300 focus:bg-white pl-11 pr-4 py-3 rounded-2xl outline-none font-bold text-zinc-800 transition-all focus:shadow-[0_0_0_4px_rgba(253,224,71,0.2)]"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium px-2">Used for communications and login.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  disabled={!hasChanges || saving}
                  onClick={handleSaveTextChanges}
                  className="bg-yellow-400 text-zinc-900 font-black px-8 py-3.5 rounded-2xl flex items-center gap-2 hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-yellow-400/20"
                >
                  {saving ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Save size={20} />
                  )}
                  Save Profile
                </button>
              </div>
            </div>

            {/* Future Integrations / Layout Fillers */}
            <div className="space-y-6 lg:pl-10 lg:border-l border-zinc-100">
              <div>
                <h2 className="text-xl font-black text-zinc-900 tracking-tight">Your Portfolio</h2>
                <p className="text-zinc-500 font-medium text-[13px] mt-1">
                  Blueprints and Ascension plans you&apos;ve created.
                </p>
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-not-allowed group">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:-translate-y-1 transition-transform">
                    <svg className="w-6 h-6 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-zinc-700 text-sm">My Blueprints</h3>
                  <p className="text-[11px] text-zinc-400 mt-1 uppercase tracking-widest font-mono">Coming Soon</p>
                </div>

                <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-not-allowed group">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:-translate-y-1 transition-transform">
                    <svg className="w-6 h-6 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-zinc-700 text-sm">Saved Plans</h3>
                  <p className="text-[11px] text-zinc-400 mt-1 uppercase tracking-widest font-mono">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={20} className="text-emerald-500" />
            ) : (
              <AlertCircle size={20} className="text-red-500" />
            )}
            <span className="font-bold text-sm tracking-tight">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-4xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-xl text-zinc-900 tracking-tight">
                  {uploadModal === "banner" ? "Change Banner" : "Change Avatar"}
                </h3>
                <button
                  onClick={() => {
                    setUploadModal(null);
                    setFileUrl(null);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {!selectedFile || !fileUrl ? (
                <div
                  onClick={() => (uploadModal === "banner" ? bannerInputRef : iconInputRef).current?.click()}
                  className="border-2 border-dashed border-zinc-200 hover:border-yellow-400 hover:bg-yellow-50 bg-zinc-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                >
                  <ImageIcon size={32} className="text-zinc-300 group-hover:text-yellow-500 mb-3 transition-colors" />
                  <p className="font-bold text-sm text-zinc-700">Click to browse file</p>
                  <p className="text-xs text-zinc-400 font-mono mt-1">JPEG, PNG • Max 10MB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-full h-64 rounded-xl bg-zinc-900 overflow-hidden relative">
                    <Cropper
                      image={fileUrl}
                      crop={crop}
                      zoom={zoom}
                      aspect={uploadModal === "banner" ? 3 / 1 : 1 / 1}
                      cropShape={uploadModal === "icon" ? "round" : "rect"}
                      showGrid={false}
                      onCropChange={setCrop}
                      onCropComplete={handleCropComplete}
                      onZoomChange={setZoom}
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setFileUrl(null);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/80 flex items-center justify-center rounded-full text-white backdrop-blur-sm transition-colors z-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  
                  <div className="px-2">
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs font-mono text-zinc-500 truncate max-w-[200px]">{selectedFile.name}</p>
                    <p className="text-xs font-mono font-bold text-zinc-700">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>

                  <button
                    disabled={uploadingBanner || uploadingIcon}
                    onClick={handleCropConfirm}
                    className="w-full py-3.5 mt-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-black rounded-xl shadow-lg shadow-yellow-400/20 active:scale-95 transition-all text-sm flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {(uploadingBanner || uploadingIcon) ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Crop & Upload
                  </button>
                </div>
              )}

              {/* Hidden Inputs utilized by the modal */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={bannerInputRef}
                onChange={handleFileChange}
              />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={iconInputRef}
                onChange={handleFileChange}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
