import React, { useState } from 'react';
import { Upload, Camera, Shield, FileText, X } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function StepVerifyIdentity({ data, update, onNext, onBack, isAdult }) {
  const [noSchoolId, setNoSchoolId] = useState(false);
  const [errors, setErrors] = useState({});
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [idType, setIdType] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleIdChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({ ...prev, id: 'File size exceeds 10MB limit.' }));
      return;
    }
    setErrors(prev => ({ ...prev, id: null }));
    setIdFile(file);
    if (file.type.includes('pdf')) {
      setIdType('pdf');
      setIdPreview(null);
      update({ id_document_name: file.name, id_document_type: 'pdf' });
    } else {
      setIdType('image');
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdPreview(reader.result);
        update({ id_document_name: file.name, id_document_type: 'image', id_document_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({ ...prev, photo: 'File size exceeds 10MB limit.' }));
      return;
    }
    setErrors(prev => ({ ...prev, photo: null }));
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      update({ face_photo_name: file.name, face_photo_url: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const removeIdFile = () => {
    setIdFile(null); setIdPreview(null); setIdType('');
    update({ id_document_name: '', id_document_type: '', id_document_url: '' });
  };

  const removePhotoFile = () => {
    setPhotoFile(null); setPhotoPreview(null);
    update({ face_photo_name: '', face_photo_url: '' });
  };

  const canContinue = isAdult
    ? (idFile && photoFile)
    : (noSchoolId ? !!photoFile : !!(idFile || photoFile));

  return (
    <div className="flex flex-col items-center text-center gap-6">
      <div>
        <div className="text-4xl mb-3">🪪</div>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>Verify Your Identity</h2>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          We verify all GGU mentors to ensure a safe, supportive space for our community.
        </p>
      </div>

      <div className="w-full space-y-6 text-left">
        {/* ID Document */}
        {!noSchoolId && (
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-pink-400" />
              {isAdult ? 'Government-Issued Photo ID' : 'School-Issued Student ID'}
              <span className="text-pink-400">*</span>
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {isAdult ? 'Accepted: Driver\'s license, State ID, or Passport.' : 'Accepted: Photo of school ID card or digital screenshot.'}
              <br />File types: <strong className="text-white">JPG, PNG, PDF</strong> · Max: <strong className="text-white">10MB</strong>
            </p>
            {idFile ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
                <div className="flex items-center gap-3 min-w-0">
                  {idType === 'pdf' ? (
                    <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0"><FileText size={18} /></div>
                  ) : idPreview ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-pink-500/30">
                      <img src={idPreview} alt="ID" className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{idFile.name}</p>
                    <p className="text-xs text-gray-400">{(idFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button type="button" onClick={removeIdFile} className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"><X size={16} /></button>
              </div>
            ) : (
              <>
                <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleIdChange} className="hidden" id="id-file-upload" />
                <label htmlFor="id-file-upload" className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-dashed border-white/20 hover:border-pink-500/50 hover:bg-white/5 cursor-pointer transition text-center">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Choose ID File</span>
                  <span className="text-xs text-gray-500">JPG, PNG, or PDF up to 10MB</span>
                </label>
              </>
            )}
            {errors.id && <p className="text-red-400 text-xs">{errors.id}</p>}
          </div>
        )}

        {/* Teen no-ID option */}
        {!isAdult && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <input type="checkbox" id="no-school-id" checked={noSchoolId}
              onChange={(e) => { setNoSchoolId(e.target.checked); if (e.target.checked) removeIdFile(); }}
              className="w-5 h-5 mt-0.5 accent-pink-500 cursor-pointer" />
            <div className="flex-1">
              <label htmlFor="no-school-id" className="text-sm text-white font-medium cursor-pointer">I do not have a school ID card</label>
              {noSchoolId && (
                <p className="text-xs text-amber-300 mt-2 leading-relaxed">
                  Your parent or guardian can verify your identity by contacting us at{' '}
                  <a href="mailto:mentors@girlsglowingup.com" className="underline font-semibold">mentors@girlsglowingup.com</a>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Face Photo */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Camera className="h-4 w-4 text-pink-400" />
            {isAdult ? 'Professional Headshot or Clear Recent Photo' : 'Clear Recent Photo of Your Face'}
            <span className="text-pink-400">*</span>
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Clear, forward-facing photo. For GGU staff validation only.
            <br />File types: <strong className="text-white">JPG, PNG</strong> · Max: <strong className="text-white">10MB</strong>
          </p>
          {photoFile ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
              <div className="flex items-center gap-3 min-w-0">
                {photoPreview && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-pink-500/30">
                    <img src={photoPreview} alt="Face" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{photoFile.name}</p>
                  <p className="text-xs text-gray-400">{(photoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button type="button" onClick={removePhotoFile} className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"><X size={16} /></button>
            </div>
          ) : (
            <>
              <input type="file" accept="image/jpeg,image/png" onChange={handlePhotoChange} className="hidden" id="photo-file-upload" />
              <label htmlFor="photo-file-upload" className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-dashed border-white/20 hover:border-pink-500/50 hover:bg-white/5 cursor-pointer transition text-center">
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Choose Face Photo</span>
                <span className="text-xs text-gray-500">JPG or PNG up to 10MB</span>
              </label>
            </>
          )}
          {errors.photo && <p className="text-red-400 text-xs">{errors.photo}</p>}
        </div>

        {isAdult && (
          <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/10 flex gap-3">
            <Shield className="h-5 w-5 text-pink-400 shrink-0" />
            <p className="text-xs text-pink-200/90 leading-relaxed">
              Your ID is used for identity verification only. It is reviewed by GGU admin and is never shared publicly.
            </p>
          </div>
        )}
      </div>

      <div className="w-full flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 rounded-2xl font-semibold text-sm text-gray-400"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          Back
        </button>
        <button onClick={onNext} disabled={!canContinue}
          className="flex-1 py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
          style={{ background: canContinue ? 'linear-gradient(135deg, #ec4899, #a855f7)' : '#374151' }}>
          Continue
        </button>
      </div>
    </div>
  );
}