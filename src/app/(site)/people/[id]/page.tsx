"use client";

import React, { useEffect, useState, use, useRef, useMemo } from "react";
import { getPersonDetail, updatePerson, getPersonCredits } from "@/lib/people";
import { notFound, useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getMediaUrl } from "@/lib/issues";
import { Person, PersonLink, PersonCredit, PaginatedResponse, PersonRelationship } from "@/@types/person";
import { getPeople } from "@/lib/people";
import Pagination from "@/components/Pagination";
import TagEditor from "@/components/TagEditor";
import { Tag } from "@/@types/tag";

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
        const sx = ((viewW / 2 - offset.x) / zoom - viewW / 2) * (img.naturalWidth / img.width) + (img.naturalWidth / 2 - (viewW / 2) * (img.naturalWidth / (img.width * zoom)));
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
        oCtx.translate(width / 2 + offset.x * ratio, height / 2 + offset.y * ratio);
        oCtx.scale(scale * ratio, scale * ratio);
        oCtx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
        oCtx.restore();

        outputCanvas.toBlob((blob) => {
            if (blob) onCrop(blob);
        }, 'image/jpeg', 0.9);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-md">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <h3 className="text-xl font-bold text-white">Ajustar Foto</h3>
                    <p className="text-gray-400 text-sm">Arraste para mover, use o controle para zoom</p>
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
                        crossOrigin="anonymous"
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
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors"
                        >
                            Recortar e Salvar
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
    return (
        <React.Suspense fallback={<div className="flex items-center justify-center min-h-[400px] text-gray-500">Carregando...</div>}>
            <PersonPageContent id={id} />
        </React.Suspense>
    );
}

function PersonPageContent({ id }: { id: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [person, setPerson] = useState<Person | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Edit state
    const [editName, setEditName] = useState("");
    const [editDisambiguation, setEditDisambiguation] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editBirthDate, setEditBirthDate] = useState("");
    const [editCountry, setEditCountry] = useState("");
    const [editLinks, setEditLinks] = useState<Omit<PersonLink, 'id'>[]>([]);
    const [editAliases, setEditAliases] = useState<string[]>([]);
    const [editGender, setEditGender] = useState("");
    const [editDeathDate, setEditDeathDate] = useState("");
    const [editRelationships, setEditRelationships] = useState<PersonRelationship[]>([]);
    const [editTags, setEditTags] = useState<Tag[]>([]);

    // Relationship search
    const [relSearch, setRelSearch] = useState("");
    const [relSearchResults, setRelSearchResults] = useState<Person[]>([]);
    const [isSearchingRel, setIsSearchingRel] = useState(false);

    // Photo management
    const [photoFile, setPhotoFile] = useState<File | Blob | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(null);

    // Credits pagination
    const [creditsResponse, setCreditsResponse] = useState<PaginatedResponse<PersonCredit> | null>(null);
    const [creditsLoading, setCreditsLoading] = useState(true);
    const creditsPage = parseInt(searchParams.get('page') || '1');

    useEffect(() => {
        getPersonDetail(Number(id))
            .then(data => {
                setPerson(data);
                setEditName(data.name);
                setEditDisambiguation(data.disambiguation || "");
                setEditBio(data.biography || "");
                setEditBirthDate(data.birth_date || "");
                setEditCountry(data.country || "");
                setEditLinks(data.links || []);
                setEditAliases(data.aliases || []);
                setEditGender(data.gender || "");
                setEditDeathDate(data.death_date || "");
                setEditRelationships(data.relationships || []);
                setEditTags(data.tags || []);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        setCreditsLoading(true);
        getPersonCredits(Number(id), creditsPage)
            .then(data => {
                setCreditsResponse(data);
                setCreditsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load credits", err);
                setCreditsLoading(false);
            });
    }, [id, creditsPage]);

    useEffect(() => {
        if (!relSearch.trim()) {
            setRelSearchResults([]);
            return;
        }
        setIsSearchingRel(true);
        const timer = setTimeout(() => {
            getPeople(1, 10, { search: relSearch })
                .then(res => {
                    // Exclude current person from results
                    setRelSearchResults(res.results.filter(p => p.id !== Number(id)));
                })
                .finally(() => setIsSearchingRel(false));
        }, 500);
        return () => clearTimeout(timer);
    }, [relSearch, id]);

    const handleSave = async () => {
        if (!person) return;
        setIsSaving(true);

        try {
            const formData = new FormData();
            formData.append("name", editName);
            formData.append("disambiguation", editDisambiguation);
            formData.append("biography", editBio);
            formData.append("birth_date", editBirthDate);
            formData.append("death_date", editDeathDate);
            formData.append("country", editCountry);
            formData.append("gender", editGender);

            // Filter out empty links
            const validLinks = editLinks.filter(l => l.url.trim() && l.label.trim());
            formData.append("links", JSON.stringify(validLinks));

            // Append aliases
            formData.append("aliases", JSON.stringify(editAliases.filter(a => a.trim())));

            // Append relationships (only those where this person is the source)
            const relationshipsToSave = editRelationships.filter(r => r.is_from !== false);
            formData.append("relationships", JSON.stringify(relationshipsToSave));

            // Append tags
            editTags.forEach(tag => formData.append("tag_ids", tag.id.toString()));

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
            alert("Falha ao atualizar pessoa.");
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

    const addRelationship = (toPerson: Person) => {
        const newRel: PersonRelationship = {
            id: 0,
            person_id: toPerson.id,
            person_name: toPerson.name,
            label: "",
            inverse_label: "",
            is_from: true,
            order: editRelationships.length
        };
        setEditRelationships([...editRelationships, newRel]);
        setRelSearch("");
        setRelSearchResults([]);
    };

    const removeRelationship = (index: number) => {
        setEditRelationships(editRelationships.filter((_, i) => i !== index));
    };

    const updateRelationship = (index: number, field: keyof PersonRelationship, value: any) => {
        const newRels = [...editRelationships];
        newRels[index] = { ...newRels[index], [field]: value };
        setEditRelationships(newRels);
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

    const handlePhotoUrlImport = async () => {
        const url = window.prompt("Cole a URL da imagem (ex: https://site.com/foto.jpg):");
        if (!url) return;

        try {
            // We try to fetch to avoid "Tainted Canvas" during cropping
            const response = await fetch(url);
            if (!response.ok) throw new Error("Falha ao carregar imagem");
            const blob = await response.blob();
            const localUrl = URL.createObjectURL(blob);
            setTempPhotoUrl(localUrl);
            setIsCropping(true);
        } catch (error) {
            console.error("Error fetching image URL:", error);
            // Fallback: try direct URL, though it might fail in canvas if CORS is strict
            setTempPhotoUrl(url);
            setIsCropping(true);
            alert("Atenção: A imagem pode não permitir recorte devido a restrições do site de origem (CORS). Se falhar ao salvar, tente baixar a imagem e fazer o upload manual.");
        }
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        setPhotoFile(croppedBlob);
        setPhotoPreview(URL.createObjectURL(croppedBlob));
        setIsCropping(false);
        setTempPhotoUrl(null);
    };

    const calculateAge = (birthDate: string, deathDate?: string) => {
        const birth = new Date(birthDate);
        const today = new Date();
        const end = deathDate ? new Date(deathDate) : today;

        let age = end.getFullYear() - birth.getFullYear();
        const m = end.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "Desconhecido";
        const [year, month, day] = dateStr.split('-');
        if (!year || !month || !day) return dateStr;
        return `${day}/${month}/${year}`;
    };

    const formatIssueMonth = (dateStr?: string) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split('-');
        if (!year || !month) return "";
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const monthIdx = parseInt(month) - 1;
        return `${monthNames[monthIdx]}/${year.slice(2)}`;
    };

    if (loading) return <div className="p-10 text-white">Carregando...</div>;
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
                        Editar Perfil
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
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                        >
                            {isSaving ? "Salvando..." : "Salvar Alterações"}
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
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                    {/* File Upload */}
                                    <label className="bg-white/20 p-3 rounded-full border border-white/30 cursor-pointer hover:bg-white/40 transition-colors group/btn" title="Upload de arquivo">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoSelect} />
                                    </label>

                                    {/* URL Import */}
                                    <button
                                        onClick={handlePhotoUrlImport}
                                        className="bg-white/20 p-3 rounded-full border border-white/30 hover:bg-white/40 transition-colors group/btn"
                                        title="Importar por URL"
                                    >
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                            <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                                {!isEditing && <h1 className="text-3xl font-bold tracking-tight">{person.name}</h1>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm space-y-4">
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Nome Completo</label>
                            {isEditing ? (
                                <>
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 mt-1 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                    <input
                                        value={editDisambiguation}
                                        onChange={(e) => setEditDisambiguation(e.target.value)}
                                        placeholder="Desambiguação (ex: Ator, UK, etc.)"
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 mt-1 text-xs text-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </>
                            ) : (
                                <div className="flex flex-col">
                                    <p className="text-gray-200">{person.name}</p>
                                    {person.disambiguation && (
                                        <p className="text-xs text-blue-400 font-bold">[{person.disambiguation}]</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Pseudônimos / Aliases</label>
                            {isEditing ? (
                                <div className="flex flex-col gap-2 mt-1">
                                    <div className="flex flex-wrap gap-1.5">
                                        {editAliases.map((alias, idx) => (
                                            <span key={idx} className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-md text-xs text-blue-300">
                                                {alias}
                                                <button
                                                    type="button"
                                                    onClick={() => setEditAliases(editAliases.filter((_, i) => i !== idx))}
                                                    className="hover:text-red-400 font-bold"
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Novo apelido (aperte Enter)..."
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const val = (e.target as HTMLInputElement).value.trim();
                                                if (val && !editAliases.includes(val)) {
                                                    setEditAliases([...editAliases, val]);
                                                    (e.target as HTMLInputElement).value = "";
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {person.aliases && person.aliases.length > 0 ? (
                                        person.aliases.map((alias, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-xs text-gray-400">
                                                {alias}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-600 italic">Nenhum pseudônimo</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Data de Nascimento</label>
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
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Data de Falecimento</label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    value={editDeathDate}
                                    onChange={(e) => setEditDeathDate(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 mt-1 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            ) : (
                                <p className="text-gray-200">{person.death_date ? formatDate(person.death_date) : "—"}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">País</label>
                            {isEditing ? (
                                <input
                                    value={editCountry}
                                    onChange={(e) => setEditCountry(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 mt-1 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            ) : (
                                <p className="text-gray-200">{person.country || "Desconhecido"}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Gênero</label>
                            {isEditing ? (
                                <select
                                    value={editGender}
                                    onChange={(e) => setEditGender(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 mt-1 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Não informado</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                    <option value="TM">Transsexual Masculino</option>
                                    <option value="TF">Transsexual Feminino</option>
                                    <option value="I">Intersexual</option>
                                    <option value="NB">Não-binário</option>
                                </select>
                            ) : (
                                <p className="text-gray-200">{person.gender_display || "Não informado"}</p>
                            )}
                        </div>

                        <div>
                            {isEditing ? (
                                <TagEditor
                                    selectedTags={editTags}
                                    onChange={setEditTags}
                                />
                            ) : (
                                <>
                                    <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Tags</label>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {person.tags && person.tags.length > 0 ? (
                                            person.tags.map((tag) => (
                                                <span key={tag.id} className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                                                    {tag.name}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-600 italic">Nenhuma tag</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {person.birth_date && !isEditing && (
                            <div>
                                <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Idade</label>
                                <p className="text-gray-200">
                                    {calculateAge(person.birth_date, person.death_date)} anos
                                    {person.death_date && " †"}
                                </p>
                            </div>
                        )}

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
                                                    placeholder="Rótulo"
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
                                        + Adicionar Link
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Relacionamentos</label>
                            <div className="flex flex-col gap-3 mt-2">
                                {(isEditing ? editRelationships : person.relationships || []).map((rel, idx) => (
                                    <div key={idx} className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        {isEditing ? (
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{rel.person_name}</span>
                                                    <button onClick={() => removeRelationship(idx)} className="text-red-400 hover:text-red-300 text-[10px] font-bold uppercase">Remover</button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[8px] uppercase text-gray-500 font-bold">Vínculo (com {rel.person_name})</label>
                                                        <input
                                                            value={rel.label}
                                                            onChange={(e) => updateRelationship(idx, 'label', e.target.value)}
                                                            placeholder="ex: Ex-esposa"
                                                            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[10px] text-gray-200 focus:border-blue-500 outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[8px] uppercase text-gray-500 font-bold">Volta ({rel.person_name} é...)</label>
                                                        <input
                                                            value={rel.inverse_label}
                                                            onChange={(e) => updateRelationship(idx, 'inverse_label', e.target.value)}
                                                            placeholder="ex: Ex-marido"
                                                            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[10px] text-gray-200 focus:border-blue-500 outline-none transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-sm">
                                                <span className="text-gray-400">{rel.label} de </span>
                                                <Link href={`/people/${rel.person_id}`} className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                                                    {rel.person_name}
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {isEditing && (
                                    <div className="relative mt-2">
                                        <input
                                            value={relSearch}
                                            onChange={(e) => setRelSearch(e.target.value)}
                                            placeholder="Vincular outra pessoa..."
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:border-blue-500 outline-none transition-colors"
                                        />
                                        {isSearchingRel && <div className="absolute right-3 top-2 text-[10px] text-gray-500 animate-pulse">Buscando...</div>}

                                        {relSearchResults.length > 0 && (
                                            <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto backdrop-blur-xl">
                                                {relSearchResults.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => addRelationship(p)}
                                                        className="w-full text-left px-4 py-2.5 text-xs hover:bg-blue-600/10 transition-colors border-b border-white/5 last:border-0 flex justify-between items-center group"
                                                    >
                                                        <span className="group-hover:text-blue-400 transition-colors">{p.name} {p.disambiguation ? <span className="text-gray-500">[{p.disambiguation}]</span> : ""}</span>
                                                        <span className="text-blue-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
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
                            Biografia
                        </h2>
                        {isEditing ? (
                            <textarea
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                className="w-full h-64 bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-300 leading-relaxed focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Escreva algo sobre esta pessoa..."
                            />
                        ) : (
                            <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed whitespace-pre-wrap text-lg">
                                {person.biography || "Nenhuma biografia disponível."}
                            </div>
                        )}
                    </section>

                    <section>
                        {(() => {
                            if (creditsLoading && !creditsResponse) {
                                return (
                                    <div className="space-y-12 animate-pulse">
                                        <section>
                                            <div className="h-8 w-48 bg-white/5 rounded mb-6"></div>
                                            <div className="space-y-6">
                                                <div className="h-32 w-full bg-white/5 rounded-2xl"></div>
                                                <div className="h-32 w-full bg-white/5 rounded-2xl"></div>
                                            </div>
                                        </section>
                                    </div>
                                );
                            }

                            const credits = creditsResponse?.results || [];
                            if (!creditsLoading && credits.length === 0) {
                                return (
                                    <>
                                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-400">
                                            <span className="w-8 h-[1px] bg-blue-500"></span>
                                            Contribuições
                                        </h2>
                                        <p className="text-gray-500 italic">Nenhum crédito registrado ainda.</p>
                                    </>
                                );
                            }

                            // 1. Group by issue (preserving order from API)
                            const groups: any[] = [];
                            const groupsMap = new Map<number, any>();

                            credits.forEach((credit) => {
                                const key = credit.issue_id;
                                if (!groupsMap.has(key)) {
                                    const newGroup = {
                                        issue_id: credit.issue_id,
                                        magazine_name: credit.magazine_name,
                                        magazine_slug: credit.magazine_slug,
                                        issue_edition: credit.issue_edition,
                                        issue_volume: credit.issue_volume,
                                        issue_date: credit.issue_date,
                                        issue_cover: credit.issue_cover,
                                        issue_cover_focus_x: credit.issue_cover_focus_x,
                                        issue_cover_focus_y: credit.issue_cover_focus_y,
                                        maxImportance: 3, // Default to lowest
                                        items: [] as any[]
                                    };
                                    groups.push(newGroup);
                                    groupsMap.set(key, newGroup);
                                }

                                const group = groupsMap.get(key);
                                group.items.push(credit);
                                // Update max importance (lower number is higher importance)
                                const importance = credit.importance || 2;
                                if (importance < group.maxImportance) {
                                    group.maxImportance = importance;
                                }
                            });
                            const mainGroups = groups.filter((g: any) => g.maxImportance < 3);
                            const minorGroups = groups.filter((g: any) => g.maxImportance === 3);

                            const totalPages = creditsResponse ? Math.ceil(creditsResponse.count / 20) : 0;

                            return (
                                <div className={`space-y-12 transition-opacity duration-300 ${creditsLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                                    {/* MAIN APPEARANCES SECTION */}
                                    {mainGroups.length > 0 && (
                                        <section>
                                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-400">
                                                <span className="w-8 h-[1px] bg-blue-500"></span>
                                                Aparições Principais
                                            </h2>
                                            <div className="grid grid-cols-1 gap-6">
                                                {mainGroups.map((group: any) => (
                                                    <div
                                                        key={group.issue_id}
                                                        className="group bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start transition-all shadow-lg rounded-xl hover:border-white/20 min-h-[160px] overflow-hidden"
                                                    >
                                                        <div className="p-4 shrink-0 self-stretch flex items-center justify-center bg-black/20">
                                                            <Link
                                                                href={group.issue_volume ? `/magazines/${group.magazine_slug}/${group.issue_volume}/${group.issue_edition}` : `/magazines/${group.magazine_slug}/${group.issue_edition}`}
                                                                className="w-24 sm:w-28 aspect-[3/4] bg-gray-800 shrink-0 block hover:opacity-90 transition-all relative rounded-sm overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:scale-[1.02]"
                                                            >
                                                                {group.issue_cover ? (
                                                                    <>
                                                                        <img
                                                                            src={getMediaUrl(group.issue_cover)}
                                                                            alt={`Issue ${group.issue_edition}`}
                                                                            className="w-full h-full object-cover"
                                                                            style={{
                                                                                objectPosition: `${group.issue_cover_focus_x ?? 0}% ${group.issue_cover_focus_y ?? 50}%`
                                                                            }}
                                                                        />
                                                                        {/* Subtle paper-like gradient overlay */}
                                                                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none" />
                                                                    </>
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
                                                                    </div>
                                                                )}
                                                            </Link>
                                                        </div>

                                                        <div className="flex-1 p-5 flex flex-col justify-center min-w-0 self-stretch">
                                                            <Link
                                                                href={group.issue_volume ? `/magazines/${group.magazine_slug}/${group.issue_volume}/${group.issue_edition}` : `/magazines/${group.magazine_slug}/${group.issue_edition}`}
                                                                className="flex items-center gap-2 mb-3 group/title"
                                                            >
                                                                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest group-hover/title:text-blue-300 transition-colors">{group.magazine_name}</span>
                                                                <span className="text-xs text-gray-700">/</span>
                                                                <span className="text-sm text-gray-300 font-medium group-hover/title:text-white transition-colors">
                                                                    {group.issue_date && <span className="mr-2 text-gray-500 font-normal">{formatIssueMonth(group.issue_date)}</span>}
                                                                    Edição {group.issue_edition}
                                                                </span>
                                                            </Link>

                                                            <div className="space-y-2">
                                                                {group.items.sort((a: any, b: any) => (a.importance || 2) - (b.importance || 2)).map((item: any) => (
                                                                    <Link
                                                                        key={item.id}
                                                                        href={item.start_page ? `/reader/${item.issue_id}?page=${item.start_page}` : (item.issue_volume ? `/magazines/${item.magazine_slug}/${item.issue_volume}/${item.issue_edition}` : `/magazines/${item.magazine_slug}/${item.issue_edition}`)}
                                                                        className="flex flex-wrap items-center gap-x-3 gap-y-1 p-2 -mx-2 rounded-xl hover:bg-white/5 transition-all group/item"
                                                                    >
                                                                        <h3 className={`font-semibold transition-colors ${item.importance === 1 ? "text-amber-400 group-hover/item:text-amber-300" : item.importance === 3 ? "text-gray-500 text-sm" : "text-gray-100 group-hover/item:text-blue-300"}`}>
                                                                            {item.section_title || item.section_type}
                                                                            {item.age_at_issue && <span className="ml-2 text-xs font-normal text-gray-500">{item.age_at_issue}</span>}
                                                                        </h3>
                                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${item.importance === 1
                                                                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                                                : item.importance === 3
                                                                                    ? "bg-gray-500/5 text-gray-500 border-gray-500/10"
                                                                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                                            }`}>
                                                                            {item.role || (item.importance === 1 ? "Estrela" : item.importance === 3 ? "Citação" : "Colaborador")}
                                                                        </span>
                                                                        {item.start_page && (
                                                                            <span className="ml-auto opacity-0 group-hover/item:opacity-100 text-[10px] font-bold text-blue-500 uppercase tracking-tighter transition-all translate-x-2 group-hover/item:translate-x-0">
                                                                                Ler Seção →
                                                                            </span>
                                                                        )}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <Link
                                                            href={`/magazines/${group.magazine_slug}/${group.issue_edition}`}
                                                            className="hidden sm:flex items-center px-6 text-gray-700 hover:text-blue-400 transition-colors border-l border-white/5"
                                                            title="Ver detalhes da edição"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* MINOR CREDITS (MENTIONS) SECTION */}
                                    {minorGroups.length > 0 && (
                                        <section className="pt-6 border-t border-white/5">
                                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-400">
                                                <span className="w-6 h-[1px] bg-gray-600"></span>
                                                Menções e Notas
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {minorGroups.map((group: any) => (
                                                    <div key={group.issue_id} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                                                        <div className="px-3 py-1.5 bg-white/[0.03] border-b border-white/5 flex justify-between items-center">
                                                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
                                                                {group.magazine_name} · {group.issue_date && <span className="mr-1">{formatIssueMonth(group.issue_date)}</span>} Ed. {group.issue_edition}
                                                            </span>
                                                            <Link href={group.issue_volume ? `/magazines/${group.magazine_slug}/${group.issue_volume}/${group.issue_edition}` : `/magazines/${group.magazine_slug}/${group.issue_edition}`} className="text-[10px] text-blue-500/50 hover:text-blue-400 transition-colors">
                                                                Ver Edição →
                                                            </Link>
                                                        </div>
                                                        <div className="p-2 space-y-1">
                                                            {group.items.map((item: any) => (
                                                                <Link
                                                                    key={item.id}
                                                                    href={item.start_page ? `/reader/${item.issue_id}?page=${item.start_page}` : (item.issue_volume ? `/magazines/${item.magazine_slug}/${item.issue_volume}/${item.issue_edition}` : `/magazines/${item.magazine_slug}/${item.issue_edition}`)}
                                                                    className="flex items-center justify-between text-sm text-gray-400 px-2 py-1 rounded-lg hover:bg-white/5 hover:text-blue-300 transition-all group/minor"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{item.section_title || item.section_type}</span>
                                                                        {item.age_at_issue && <span className="text-[10px] text-gray-600">{item.age_at_issue}</span>}
                                                                        <span className="text-[9px] text-gray-600 uppercase tracking-tighter">({item.role || "Citação"})</span>
                                                                    </div>
                                                                    {item.start_page && (
                                                                        <span className="text-[9px] font-bold text-blue-500/50 group-hover/minor:text-blue-400 opacity-0 group-hover/minor:opacity-100 transition-opacity">
                                                                            P.{item.start_page} ↗
                                                                        </span>
                                                                    )}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* PAGINATION */}
                                    {totalPages > 1 && (
                                        <div className="mt-12 pt-8 border-t border-white/5">
                                            <Pagination
                                                currentPage={creditsPage}
                                                totalPages={totalPages}
                                                baseUrl={pathname}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </section>
                </div>
            </div>
        </div>
    );
}
