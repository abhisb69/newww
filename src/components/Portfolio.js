import { useState, useEffect } from "react";
import API from "../api";
import "./Portfolio.css";

export default function Portfolio() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      const res = await API.get("/images");
      setImages(res.data);
    };
    fetchImages();
  }, []);

  return (
    <div className="portfolio-container">
      <h2>Portfolio</h2>
      <div className="gallery">
        {images.map(img => (
          <img key={img._id} src={img.url} alt="Portfolio" />
        ))}
      </div>
    </div>
  );
}
