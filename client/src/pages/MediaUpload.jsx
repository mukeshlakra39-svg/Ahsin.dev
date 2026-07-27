import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Upload, Image, Video } from "lucide-react";

const MediaUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("media", file);
      fd.append("caption", caption);
      await API.post("/media", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Uploaded successfully!");
      navigate("/feed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="form-card">
        <h2><Upload size={24} /> Upload Media</h2>
        <p className="form-subtitle">Share photos and videos</p>
        <form onSubmit={handleSubmit}>
          <div className="upload-area" onClick={() => fileInputRef.current.click()}>
            {preview ? (
              file?.type.startsWith("video") ? (
                <video src={preview} controls className="upload-preview" />
              ) : (
                <img src={preview} alt="Preview" className="upload-preview" />
              )
            ) : (
              <div className="upload-placeholder">
                <Image size={48} />
                <Video size={48} />
                <p>Click to select image or video</p>
                <small>JPG, PNG, GIF, WebP, MP4, WebM (max 50MB)</small>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
          <div className="form-group">
            <label>Caption</label>
            <textarea
              rows={3}
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !file}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MediaUpload;
