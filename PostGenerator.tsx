"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Share2, Download, Save, Newspaper } from "lucide-react";
import { savePost } from "../lib/storage";

interface PostGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  image?: string;
  category: string;
  metadata?: Record<string, any>;
}

export default function PostGenerator({
  isOpen,
  onClose,
  title,
  content,
  image,
  category,
  metadata,
}: PostGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    savePost({
      title,
      content,
      image,
      category,
      source: "Multiple Dark News",
      metadata,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const generatePostText = () => {
    let post = `📌 ${title}\n\n`;
    post += `${content}\n\n`;
    
    if (metadata && Object.keys(metadata).length > 0) {
      post += `📋 Details:\n`;
      Object.entries(metadata).forEach(([key, value]) => {
        if (value && value !== "N/A" && value !== "Unknown") {
          post += `• ${key}: ${value}\n`;
        }
      });
      post += `\n`;
    }
    
    post += `🏷️ Category: ${category}\n`;
    post += `🔗 Source: Multiple Dark News\n`;
    post += `#${category.toLowerCase().replace(/\s+/g, "")} #multipledarknews`;
    
    return post;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePostText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: content,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatePostText()], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_post.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#27272a] bg-[#141414]">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-[#27272a] bg-[#141414] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-[#e50914] px-3 py-1 text-xs font-medium text-white">
              {category}
            </span>
            <h2 className="text-lg font-semibold text-white line-clamp-1">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#71717a] hover:bg-[#27272a] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image */}
          {image && (
            <div className="mb-6 overflow-hidden rounded-xl">
              <img
                src={image}
                alt={title}
                className="h-64 w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.jpg";
                }}
              />
            </div>
          )}

          {/* Generated Post */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-[#a1a1aa]">
              Generated Post
            </label>
            <div className="rounded-xl border border-[#27272a] bg-[#0a0a0a] p-4">
              <pre className="whitespace-pre-wrap text-sm text-[#e4e4e7] font-sans">
                {generatePostText()}
              </pre>
            </div>
          </div>

          {/* Metadata */}
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-[#a1a1aa]">
                Additional Information
              </label>
              <div className="grid gap-2 rounded-xl border border-[#27272a] bg-[#0a0a0a] p-4">
                {Object.entries(metadata).map(([key, value]) => (
                  value && value !== "N/A" && value !== "Unknown" && (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-[#71717a]">{key}:</span>
                      <span className="text-white">{value}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-[#27272a] bg-[#141414] px-6 py-4">
          <a
            href="/posts"
            className="flex items-center gap-2 rounded-lg border border-[#27272a] px-4 py-2 text-sm font-medium text-[#a1a1aa] transition-colors hover:bg-[#27272a] hover:text-white"
          >
            <Newspaper className="h-4 w-4" />
            View Saved Posts
          </a>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-lg border border-[#27272a] px-4 py-2 text-sm font-medium text-[#a1a1aa] transition-colors hover:bg-[#27272a] hover:text-white"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-lg border border-[#27272a] px-4 py-2 text-sm font-medium text-[#a1a1aa] transition-colors hover:bg-[#27272a] hover:text-white"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Saved!" : "Save to Site"}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg bg-[#e50914] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#b20710]"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}