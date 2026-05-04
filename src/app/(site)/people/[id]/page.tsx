"use client";

import { useEffect, useState, use, useRef } from "react";
import { getPersonDetail, updatePerson } from "@/lib/people";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { getMediaUrl } from "@/lib/issues";
import { Person, PersonLink } from "@/@types/person";

// --- Image Cropper Component ---
interface CropperProps {
    image: string;
    onCrop: (blob: Blob) => void;
    onCancel: () => void;
}

function ImageCropper({ image, onCrop, onCancel }: CropperProps) {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - startPos.x,
            y: e.clientY - startPos.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleConfirm = () => {
        if (!imgRef.current || !containerRef.current) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Output size (high quality)
        const width = 600;
        const height = 800;
        canvas.width = width;
        canvas.height = height;

        const rect = containerRef.current.getBoundingClientRect();
        const img = imgRef.current;

        // Calculate source rectangle
        const containerRatio = width / height;
        const scaleFactor = img.naturalWidth / (img.width * scale);
        
        const dx = (offset.x - (img.width * scale - rect.width) / 2) * scaleFactor;
        const dy = (offset.y - (img.height * scale - rect.height) / 2) * scaleFactor;

        // For simplicity, we'll draw what's visible in the container
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);
        
        const drawW = img.naturalWidth;
        const drawH = img.naturalHeight;
        
        // Final implementation of manual crop calculation
        // To keep it robust, we use the container's relative view
        const viewW = rect.width;
        const viewH = rect.height;
        const zoom = scale;
        
        // Source X/Y on natural image
        const sx = ( (viewW/2 - offset.x) / zoom - viewW/2 ) * (img.naturalWidth / img.width) + (img.naturalWidth/2 - (viewW/2) * (img.naturalWidth / (img.width * zoom)));
        // This is getting complex, let's use a simpler approach: 
        // Render current view to canvas
        
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = width;
        outputCanvas.height = height;
        const oCtx = outputCanvas.getContext('2d');
        if (!oCtx) return;

        // Fill background
        oCtx.fillStyle = '#111';
        oCtx.fillRect(0, 0, width, height);

        // Draw image with current transform
        const ratio = width / viewW;
        oCtx.save();
        oCtx.translate(width/2 + offset.x * ratio, height/2 + offset.y * ratio);
        oCtx.scale(scale * ratio, scale * ratio);
        oCtx.drawImage(img, -img.width/2, -img.height/2, img.width, img.height);
        oCtx.restore();

        outputCanvas.toBlob((blob) => {
            if (blob) onCrop(blob);
        }, 'image/jpeg', 0.9);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-md">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <h3 className="text-xl font-bold text-white">Adjust Photo</h3>
                    <p className="text-gray-400 text-sm">Drag to move, slider to zoom</p>
                </div>

                <div 
                    ref={containerRef}
                    className="relative aspect-[3/4] w-full bg-gray-800 rounded-xl overflow-hidden cursor-move border-2 border-blue-500/50 shadow-2xl"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <img 
                        ref={imgRef}
                        src={image} 
                        alt="Crop preview"
                        draggable={false}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none transition-transform duration-75 ease-out"
                        style={{ 
                            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
                        }}
                    />
                    {/* Overlay grid */}
                    <div className="absolute inset-0 pointer-events-none border border-white/20 grid grid-cols-3 grid-rows-3">
                        <div className="border-r border-b border-white/10"></div>
                        <div className="border-r border-b border-white/10"></div>
                        <div className="border-b border-white/10"></div>
                        <div className="border-r border-b border-white/10"></div>
                        <div className="border-r border-b border-white/10"></div>
                        <div className="border-b border-white/10"></div>
                        <div className="border-r border-white/10"></div>
                        <div className="border-r border-white/10"></div>
                        <div></div>
                    </div>
                </div>

                <div className="space-y-4">
                    <input 
                        type="range" 
                        min="0.5" max="3" step="0.01" 
                        value={scale} 
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={onCancel}
                            className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirm}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors"
                        >
                            Crop & Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Main Page Component ---

export default function PersonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    
    const [person, setPerson] = useState<Person | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Edit state
    const [editName, setEditName] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editBirthDate, setEditBirthDate] = useState("");
    const [editCountry, setEditCountry] = useState("");
    const [editLinks, setEditLinks] = useState<Omit<PersonLink, 'id'>[]>([]);
    
    // Photo management
    const [photoFile, setPhotoFile] = useState<File | Blob | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        getPersonDetail(Number(id))
            .then(data => {
                setPerson(data);
                setEditName(data.name);
                setEditBio(data.biography || "");
                setEditBirthDate(data.birth_date || "");
                setEditCountry(data.country || "");
                setEditLinks(data.links || []);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [id]);

    const handleSave = async () => {
        if (!person) return;
        setIsSaving(true);

        try {
            const formData = new FormData();
            formData.append("name", editName);
            formData.append("biography", editBio);
            formData.append("birth_date", editBirthDate);
            formData.append("country", editCountry);

            // Filter out empty links
            const validLinks = editLinks.filter(l => l.url.trim() && l.label.trim());
            formData.append("links", JSON.stringify(validLinks));

            if (photoFile) {
                // If it's a blob from cropper, we give it a name
                const fileToUpload = photoFile instanceof Blob && !(photoFile instanceof File) 
                    ? new File([photoFile], "profile.jpg", { type: "image/jpeg" })
                    : photoFile;
                formData.append("photo", fileToUpload);
            }

            const result = await updatePerson(person.id, formData);
            setPerson(result);
            setIsEditing(false);
            setPhotoFile(null);
            setPhotoPreview(null);
            router.refresh();
        } catch (error) {
            console.error("Failed to update person:", error);
            alert("Failed to update person.");
        } finally {
            setIsSaving(false);
        }
    };

    const addLink = () => {
        setEditLinks([...editLinks, { url: "", label: "" }]);
    };

    const removeLink = (index: number) => {
        setEditLinks(editLinks.filter((_, i) => i !== index));
    };

    const updateLink = (index: number, field: 'url' | 'label', value: string) => {
        const newLinks = [...editLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setEditLinks(newLinks);
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setTempPhotoUrl(reader.result as string);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        setPhotoFile(croppedBlob);
        setPhotoPreview(URL.createObjectURL(croppedBlob));
        setIsCropping(false);
        setTempPhotoUrl(null);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "Unknown";
        const [year, month, day] = dateStr.split('-');
        if (!year || !month || !day) return dateStr;
        return `${day}/${month}/${year}`;
    };

    if (loading) return <div className="p-10 text-white">Loading...</div>;
    if (!person) return notFound();

    const photoUrl = photoPreview || (person.photo ? getMediaUrl(person.photo) : null);

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 text-white">
            {isCropping && tempPhotoUrl && (
                <ImageCropper 
                    image={tempPhotoUrl} 
                    onCrop={handleCropComplete} 
                    onCancel={() => {
                        setIsCropping(false);
                        setTempPhotoUrl(null);
                    }}
                />
            )}

            <div className="flex justify-end mb-6">
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                setIsEditing(false);
                                setPhotoPreview(null);
                                setPhotoFile(null);
                            }}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-10">
                {/* SIDEBAR: Photo & Basic Info */}
                <div className="w-full md:w-1/3 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <div 
                            className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900 group"
                        >
                            {photoUrl ? (
                                <img 
                                    src={photoUrl} 
                                    alt={person.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-700">
                                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                            )}
                            
                            {isEditing && (
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                    <div className="bg-white/20 p-3 rounded-full border border-white/30">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoSelect} />
                                </label>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                            <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                                {!isEditing && <h1 className="text-3xl font-bold tracking-tight">{person.name}</h1>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm space-y-4">
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Full Name</label>
                            {isEditing ? (
                                <input 
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 mt-1 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            ) : (
                                <p className="text-gray-200">{person.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Birth Date</label>
                            {isEditing ? (
                                <input 
                                    type="date"
                                    value={editBirthDate}
                                    onChange={(e) => setEditBirthDate(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 mt-1 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            ) : (
                                <p className="text-gray-200">{formatDate(person.birth_date)}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Country</label>
                            {isEditing ? (
                                <input 
                                    value={editCountry}
                                    onChange={(e) => setEditCountry(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 mt-1 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            ) : (
                                <p className="text-gray-200">{person.country || "Unknown"}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Links</label>
                            <div className="flex flex-col gap-2 mt-2">
                                {(isEditing ? editLinks : person.links || []).map((link, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        {isEditing ? (
                                            <div className="flex flex-col gap-1 flex-1">
                                                <input 
                                                    value={link.label}
                                                    onChange={(e) => updateLink(idx, 'label', e.target.value)}
                                                    placeholder="Label"
                                                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[10px] text-gray-200 focus:border-blue-500 transition-colors"
                                                />
                                                <div className="flex gap-1">
                                                    <input 
                                                        value={link.url}
                                                        onChange={(e) => updateLink(idx, 'url', e.target.value)}
                                                        placeholder="URL"
                                                        className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[10px] text-gray-200 focus:border-blue-500 transition-colors"
                                                    />
                                                    <button onClick={() => removeLink(idx)} className="text-red-500 hover:text-red-400 p-1">✕</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <a 
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-full text-sm text-blue-300 transition-colors w-fit"
                                            >
                                                {link.label}
                                            </a>
                                        )}
                                    </div>
                                ))}
                                {isEditing && (
                                    <button 
                                        onClick={addLink}
                                        className="text-xs text-blue-400 hover:text-blue-300 mt-1 font-bold"
                                    >
                                        + Add Link
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT: Bio & Credits */}
                <div className="flex-1 space-y-10">
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
                            <span className="w-8 h-[1px] bg-blue-500"></span>
                            Biography
                        </h2>
                        {isEditing ? (
                            <textarea 
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                className="w-full h-64 bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-300 leading-relaxed focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Write something about this person..."
                            />
                        ) : (
                            <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed whitespace-pre-wrap text-lg">
                                {person.biography || "No biography available."}
                            </div>
                        )}
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-400">
                            <span className="w-8 h-[1px] bg-blue-500"></span>
                            Contributions
                        </h2>
                        
                        {!person.credits || person.credits.length === 0 ? (
                            <p className="text-gray-500 italic">No recorded credits yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {Object.values(person.credits.reduce((acc, credit) => {
                                    const key = credit.issue_id;
                                    if (!acc[key]) {
                                        acc[key] = {
                                            issue_id: credit.issue_id,
                                            magazine_name: credit.magazine_name,
                                            magazine_slug: credit.magazine_slug,
                                            issue_edition: credit.issue_edition,
                                            issue_cover: credit.issue_cover,
                                            items: [] as any[]
                                        };
                                    }
                                    acc[key].items.push(credit);
                                    return acc;
                                }, {} as Record<number, any>)).map((group: any) => (
                                    <Link 
                                        key={group.issue_id}
                                        href={`/magazines/${group.magazine_slug}/${group.issue_edition}`}
                                        className={`group bg-white/5 hover:bg-white/10 border border-white/10 overflow-hidden flex flex-col sm:flex-row transition-all hover:scale-[1.01] active:scale-100 shadow-lg ${group.issue_cover ? 'rounded-r-2xl rounded-l-none' : 'rounded-2xl'}`}
                                    >
                                        {/* Issue Cover */}
                                        <div className="w-full sm:w-24 aspect-[3/4] bg-gray-800 shrink-0">
                                            {group.issue_cover ? (
                                                <img 
                                                    src={getMediaUrl(group.issue_cover)} 
                                                    alt={`Issue ${group.issue_edition}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 p-5 flex flex-col justify-center min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{group.magazine_name}</span>
                                                <span className="text-xs text-gray-700">/</span>
                                                <span className="text-sm text-gray-300 font-medium">Edition {group.issue_edition}</span>
                                            </div>

                                            <div className="space-y-3">
                                                {group.items.map((item: any) => (
                                                    <div key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                        <h3 className="font-semibold text-gray-100 group-hover:text-blue-200 transition-colors">
                                                            {item.section_title || item.section_type}
                                                        </h3>
                                                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                                                            {item.role || "Contributor"}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="hidden sm:flex items-center px-6 text-gray-600 group-hover:text-blue-400 transition-colors">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
