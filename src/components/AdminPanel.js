import { useState, useEffect, useRef } from "react";
import API from "../api";
import "./AdminPanel.css";

export default function AdminPanel({ loggedIn, setLoggedIn }) {
  const [covers, setCovers] = useState([]);           // album cover images
  const [albumPhotos, setAlbumPhotos] = useState([]); // photos in selected album
  const [coverFile, setCoverFile] = useState(null);   // file for cover
  const [photoFile, setPhotoFile] = useState(null);   // file for album photo
  const [coverName, setCoverName] = useState("");     // album name for cover
  const [searchAlbum, setSearchAlbum] = useState(""); // album to search/view photos
  const [uploadAlbumName, setUploadAlbumName] = useState(""); // album for uploading photo

  const coverFileRef = useRef(null);
  const photoFileRef = useRef(null);

  const MAX_FILE_SIZE = 500 * 1024; // 500 KB

  useEffect(() => {
    fetchCovers();
  }, []);

  const fetchCovers = async () => {
    const res = await API.get("/images");
    setCovers(res.data);
  };

  const fetchAlbumPhotos = async (albumName) => {
    if (!albumName) return;
    const res = await API.get(`/images/album/${albumName}`);
    if (res.data.length === 0) {
      alert("Album not found ❌");
      setAlbumPhotos([]);
      return;
    }
    setAlbumPhotos(res.data);
  };

  const handleUploadCover = async () => {
    if (!coverFile || !coverName) return alert("Enter a name and select an image");

    if (coverFile.size > MAX_FILE_SIZE) {
      return alert("File size must be less than 500 KB ❌");
    }

    const formData = new FormData();
    formData.append("image", coverFile);
    formData.append("name", coverName);

    await API.post("/upload", formData);
    alert("Album cover uploaded ✅");

    setCoverFile(null);
    setCoverName("");
    if (coverFileRef.current) coverFileRef.current.value = "";

    fetchCovers();
  };

  const handleUploadAlbumPhoto = async () => {
    if (!photoFile || !uploadAlbumName) return alert("Select an album and a photo");

    if (photoFile.size > MAX_FILE_SIZE) {
      return alert("File size must be less than 500 KB ❌");
    }

    // Check if album exists in covers
    const albumExists = covers.some(
      (cover) => cover.name.toLowerCase() === uploadAlbumName.toLowerCase()
    );
    if (!albumExists) return alert("Album not found ❌");

    const formData = new FormData();
    formData.append("image", photoFile);
    formData.append("name", uploadAlbumName);

    await API.post("/upload/album", formData);
    alert("Photo uploaded to album ✅");

    setPhotoFile(null);
    if (photoFileRef.current) photoFileRef.current.value = "";

    // Refresh album photos if currently viewing that album
    if (searchAlbum.toLowerCase() === uploadAlbumName.toLowerCase()) {
      fetchAlbumPhotos(searchAlbum);
    }
  };

  const handleDelete = async (id, type) => {
    try {
      await API.delete(`/delete/${id}`, {
        data: { username: "admin", password: "admin123" },
      });
      alert("Image deleted ✅");

      if (type === "cover") {
        setCovers((prev) => prev.filter((img) => img._id !== id));
      } else {
        setAlbumPhotos((prev) => prev.filter((img) => img._id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleLogout = () => {
    window.location.reload();
    setLoggedIn(false);
  };

  if (!loggedIn) return <p>Please login first</p>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>ELYSIA Admin</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Upload Album Cover */}
      <div className="upload-section">
        <h3>Create a Album</h3>
        <h5>(It will be visible on main page)</h5>
        <input
          type="text"
          placeholder="Enter album name"
          value={coverName}
          onChange={(e) => setCoverName(e.target.value)}
        />
        <input
          type="file"
          ref={coverFileRef}
          onChange={(e) => setCoverFile(e.target.files[0])}
        />
        {coverFile && (
          <p>
            Selected: {coverFile.name} ({(coverFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
        <button onClick={handleUploadCover}>Upload Cover</button>
      </div>

      {/* Upload Photo to Album */}
      <div className="upload-section">
        <h3>Upload Photo to Album</h3>
        <h5>(It will be visible inside album page)</h5>
        <input
          type="text"
          placeholder="Enter album name"
          value={uploadAlbumName}
          onChange={(e) => setUploadAlbumName(e.target.value)}
        />
        <input
          type="file"
          ref={photoFileRef}
          onChange={(e) => setPhotoFile(e.target.files[0])}
        />
        {photoFile && (
          <p>
            Selected: {photoFile.name} ({(photoFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
        <button onClick={handleUploadAlbumPhoto}>Upload Photo</button>
      </div>

      {/* Search & View Album Photos */}
      <div className="upload-section">
        <h3>Search Album to View Photos</h3>
        <input
          type="text"
          placeholder="Enter album name"
          value={searchAlbum}
          onChange={(e) => setSearchAlbum(e.target.value)}
        />
        <button onClick={() => fetchAlbumPhotos(searchAlbum)}>Search Album</button>
      </div>

      {/* Display Album Covers */}
      <h3>All Album Covers</h3>
      <div className="images-grid">
        {covers.map((img) => (
          <div key={img._id} className="image-card">
            <img src={img.url} alt={img.name} />
            <p className="image-name">{img.name}</p>
            <p className="image-name">{img.type}</p>
            <button
              className="delete-btn"
              onClick={() => handleDelete(img._id, "cover")}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Display Photos for Searched Album */}
      {searchAlbum && albumPhotos.length > 0 && (
        <>
          <h3>Photos in Album: {searchAlbum}</h3>
          <div className="images-grid">
            {albumPhotos.map((img) => (
              <div key={img._id} className="image-card">
                <img src={img.url} alt={img.name} />
                <p className="image-name">{img.type}</p>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(img._id, "photo")}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
