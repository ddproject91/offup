"use client";

import { useState } from "react";

type UploadResult = { ok: true; url: string } | { ok: false; error: string };

export default function ImageField({
  value,
  onChange,
  upload,
}: {
  value: string;
  onChange: (v: string) => void;
  upload: (formData: FormData) => Promise<UploadResult>;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await upload(formData);
      if (result.ok) onChange(result.url);
      else setError(result.error);
    } catch {
      setError("업로드에 실패했습니다. 파일 크기를 확인하고 다시 시도해주세요.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className="field">
      <span className="field-label">이미지</span>
      <div className="image-row">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="이미지 URL 또는 오른쪽에서 파일 업로드"
        />
        <label className="upload-btn">
          {uploading ? "업로드 중..." : "파일 선택"}
          <input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading} hidden />
        </label>
      </div>
      {error && <span className="field-error">{error}</span>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="image-preview" />
      )}
    </label>
  );
}
