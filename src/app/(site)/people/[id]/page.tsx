"use client";

import { useEffect, useState, use, useRef } from "react";
import { getPersonDetail, updatePerson } from "@/lib/people";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { getMediaUrl } from "@/lib/issues";
import { Person, PersonLink } from "@/@types/person";

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
    const [focusX, setFocusX] = useState(50);
    const [focusY, setFocusY] = useState(50);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const photoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getPersonDetail(Number(id))
            .then(data => {
                setPerson(data);
                setEditName(data.name);
                setEditBio(data.biography || "");
                setEditBirthDate(data.birth_date || "");
                setEditCountry(data.country || "");
                setEditLinks(data.links || []);
                setFocusX(data.photo_focus_x ?? 50);
                setFocusY(data.photo_focus_y ?? 50);
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
            formData.append("photo_focus_x", focusX.toString());
            formData.append("photo_focus_y", focusY.toString());
            formData.append("links", JSON.stringify(editLinks));

            if (photoFile) {
                formData.append("photo", photoFile);
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

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handlePhotoClick = (e: React.MouseEvent) => {
        if (!isEditing || !photoRef.current) return;
        const rect = photoRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setFocusX(Math.round(x));
        setFocusY(Math.round(y));
    };

    if (loading) return <div className="p-10 text-white">Loading...</div>;
    if (!person) return notFound();

    const photoUrl = photoPreview || (person.photo ? getMediaUrl(person.photo) : null);

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 text-white">
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
                                // Reset to current values
                                setFocusX(person.photo_focus_x ?? 50);
                                setFocusY(person.photo_focus_y ?? 50);
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
                            ref={photoRef}
                            onClick={handlePhotoClick}
                            className={`relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900 group ${isEditing ? 'cursor-crosshair' : ''}`}
                        >
                            {photoUrl ? (
                                <img 
                                    src={photoUrl} 
                                    alt={person.name}
                                    style={{ objectPosition: `${focusX}% ${focusY}%` }}
                                    className="w-full h-full object-cover transition-all duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-700">
                                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                            )}
                            
                            {isEditing && (
                                <>
                                    <div 
                                        className="absolute w-6 h-6 border-2 border-white rounded-full shadow-lg pointer-events-none flex items-center justify-center"
                                        style={{ left: `${focusX}%`, top: `${focusY}%`, transform: 'translate(-50%, -50%)' }}
                                    >
                                        <div className="w-1 h-1 bg-white rounded-full" />
                                    </div>
                                    <label className="absolute bottom-4 right-4 bg-black/60 p-2 rounded-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                    </label>
                                </>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                            <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                                {!isEditing && <h1 className="text-3xl font-bold tracking-tight">{person.name}</h1>}
                            </div>
                        </div>
                        {isEditing && <p className="text-[10px] text-gray-500 text-center">Click on image to set focus point</p>}
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm space-y-4">
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Full Name</label>
                            {isEditing ? (
                                <input 
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 mt-1 text-sm text-gray-200 focus:outline-none"
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
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 mt-1 text-sm text-gray-200 focus:outline-none"
                                />
                            ) : (
                                <p className="text-gray-200">{person.birth_date ? new Date(person.birth_date).toLocaleDateString() : "Unknown"}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Country</label>
                            {isEditing ? (
                                <input 
                                    value={editCountry}
                                    onChange={(e) => setEditCountry(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 mt-1 text-sm text-gray-200 focus:outline-none"
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
                                                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[10px] text-gray-200"
                                                />
                                                <div className="flex gap-1">
                                                    <input 
                                                        value={link.url}
                                                        onChange={(e) => updateLink(idx, 'url', e.target.value)}
                                                        placeholder="URL"
                                                        className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[10px] text-gray-200"
                                                    />
                                                    <button onClick={() => removeLink(idx)} className="text-red-500 hover:text-red-400">✕</button>
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
                                        className="text-xs text-blue-400 hover:text-blue-300 mt-1"
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
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-blue-500"></span>
                            Biography
                        </h2>
                        {isEditing ? (
                            <textarea 
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                className="w-full h-48 bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-300 leading-relaxed focus:outline-none focus:border-blue-500"
                                placeholder="Write something about this person..."
                            />
                        ) : (
                            <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed whitespace-pre-wrap">
                                {person.biography || "No biography available."}
                            </div>
                        )}
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-blue-500"></span>
                            Contributions
                        </h2>
                        
                        {!person.credits || person.credits.length === 0 ? (
                            <p className="text-gray-500 italic">No recorded credits yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {person.credits.map(credit => (
                                    <Link 
                                        key={credit.id}
                                        href={`/magazines/${credit.magazine_slug}/${credit.issue_edition}`}
                                        className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 flex items-center justify-between transition-all hover:scale-[1.01] active:scale-100"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-blue-400 uppercase">{credit.magazine_name}</span>
                                                <span className="text-xs text-gray-600">|</span>
                                                <span className="text-xs text-gray-400">Ed. {credit.issue_edition}</span>
                                            </div>
                                            <h3 className="font-semibold text-gray-200 truncate group-hover:text-white">
                                                {credit.section_title || credit.section_type}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                                {credit.role || "Contributor"}
                                            </span>
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
