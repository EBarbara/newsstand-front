"use client";

import React, { useState, useEffect, use, useRef } from "react";
import { getTag, getTags, updateTag } from "@/lib/tags";
import { getPeople } from "@/lib/people";
import { getIssues, getMediaUrl } from "@/lib/issues";
import { Tag } from "@/@types/tag";
import { Person } from "@/@types/person";
import { Issue } from "@/@types/issue";
import { PaginatedResponse } from "@/@types/api";
import PersonCard from "@/components/PersonCard";
import IssueCard from "@/components/issueCard/IssueCard";
import Pagination from "@/components/Pagination";
import styles from "../page.module.css";
import detailStyles from "./detail.module.css";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function TagDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    return (
        <React.Suspense fallback={<div className={styles.empty}><p>Carregando...</p></div>}>
            <TagDetailContent slug={slug} />
        </React.Suspense>
    );
}

function TagDetailContent({ slug }: { slug: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Data states
    const [tag, setTag] = useState<Tag | null>(null);
    const [peopleDirectData, setPeopleDirectData] = useState<PaginatedResponse<Person> | null>(null);
    const [issuesDirectData, setIssuesDirectData] = useState<PaginatedResponse<Issue> | null>(null);
    const [allPeopleMatches, setAllPeopleMatches] = useState<Person[]>([]);
    const [allIssuesMatches, setAllIssuesMatches] = useState<Issue[]>([]);
    
    // UI states
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"people" | "issues">("people");
    const currentPage = parseInt(searchParams.get('page') || '1');

    // Editing states
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editParentId, setEditParentId] = useState<number | null>(null);
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
    const [clearImage, setClearImage] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Parent tags selector states
    const [allTagsList, setAllTagsList] = useState<Tag[]>([]);
    const [parentSearch, setParentSearch] = useState("");
    const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
    const parentContainerRef = useRef<HTMLDivElement>(null);

    // Initial Load & Tab/Page changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const tagRes = await getTag(slug);
                setTag(tagRes);

                // Initialize edit fields
                setEditName(tagRes.name);
                setEditDescription(tagRes.description || "");
                setEditParentId(tagRes.parent_id || null);

                // Fetch direct matches (paginated based on current active tab)
                const [pDirectRes, iDirectRes] = await Promise.all([
                    getPeople(activeTab === "people" ? currentPage : 1, 20, { tag_direct: slug }),
                    getIssues(activeTab === "issues" ? currentPage : 1, { tag_direct: slug })
                ]);
                setPeopleDirectData(pDirectRes);
                setIssuesDirectData(iDirectRes);

                // Fetch ALL matches in hierarchy (limit 1000) for recursive tree rendering
                const [pAllRes, iAllRes] = await Promise.all([
                    getPeople(1, 1000, { tag: slug }),
                    getIssues(1, { tag: slug, page_size: 1000 })
                ]);
                setAllPeopleMatches(pAllRes.results);
                setAllIssuesMatches(iAllRes.results);

            } catch (error) {
                console.error("Error loading tag data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [slug, activeTab, currentPage]);

    // Click outside handler for parent tag search dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (parentContainerRef.current && !parentContainerRef.current.contains(event.target as Node)) {
                setIsParentDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load tag choices when editing is enabled
    useEffect(() => {
        if (isEditing) {
            const fetchAllTags = async () => {
                try {
                    const res = await getTags(1, 1000);
                    setAllTagsList(res.results);
                } catch (e) {
                    console.error("Failed to load all tags:", e);
                }
            };
            fetchAllTags();
        }
    }, [isEditing]);

    if (loading && !tag) {
        return <div className={styles.empty}><p>Carregando detalhes da tag...</p></div>;
    }

    if (!tag) {
        return <div className={styles.empty}><p>Tag não encontrada.</p></div>;
    }

    // Direct matches total pages
    const directTotalPages = activeTab === "people"
        ? (peopleDirectData ? Math.ceil(peopleDirectData.count / 20) : 0)
        : (issuesDirectData ? Math.ceil(issuesDirectData.count / 20) : 0);

    // Recursively collect all descendant IDs of this tag (to avoid circular parent selection)
    const getDescendantIds = (nodes: Tag[] | undefined): number[] => {
        if (!nodes) return [];
        const ids: number[] = [];
        for (const node of nodes) {
            ids.push(node.id);
            if (node.children) {
                ids.push(...getDescendantIds(node.children));
            }
        }
        return ids;
    };

    const descendantIds = getDescendantIds(tag.descendants_tree);
    const parentOptions = allTagsList.filter(
        t => t.id !== tag.id && !descendantIds.includes(t.id) &&
        t.name.toLowerCase().includes(parentSearch.toLowerCase())
    );

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditImageFile(file);
            setEditImagePreview(URL.createObjectURL(file));
            setClearImage(false);
        }
    };

    const handleClearPhoto = () => {
        setEditImageFile(null);
        setEditImagePreview(null);
        setClearImage(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("name", editName.trim());
            formData.append("description", editDescription.trim());
            
            if (editParentId !== null) {
                formData.append("parent_id", editParentId.toString());
            } else {
                formData.append("parent_id", "");
            }

            if (editImageFile) {
                formData.append("image", editImageFile);
            } else if (clearImage) {
                formData.append("image", "");
            }

            const result = await updateTag(tag.slug, formData);
            setTag(result);
            setIsEditing(false);
            setEditImageFile(null);
            setEditImagePreview(null);
            setClearImage(false);

            // Redirect if name slug changes to prevent 404
            if (result.slug !== slug) {
                router.push(`/tags/${result.slug}`);
            } else {
                router.refresh();
            }
        } catch (err) {
            console.error("Failed to save tag details:", err);
            alert("Erro ao atualizar a tag. Verifique se o nome é único ou se há dependência circular.");
        } finally {
            setIsSaving(false);
        }
    };

    // Tree Check: does a subnode tag (or any of its recursive subchildren) have any items matched?
    const hasNodeMatches = (n: Tag): boolean => {
        const hasDirect = activeTab === "people"
            ? allPeopleMatches.some(p => p.tags?.some(t => t.id === n.id))
            : allIssuesMatches.some(i => i.tags?.some(t => t.id === n.id));
        if (hasDirect) return true;
        return n.children?.some(hasNodeMatches) || false;
    };

    // Recursive Tag Tree Node Component
    const TagTreeNode = ({ node, level, parentPath }: { node: Tag; level: number; parentPath: string }) => {
        if (!hasNodeMatches(node)) return null;

        const nodePeople = allPeopleMatches.filter(p => p.tags?.some(t => t.id === node.id));
        const nodeIssues = allIssuesMatches.filter(i => i.tags?.some(t => t.id === node.id));
        const hasDirectItems = activeTab === "people" ? nodePeople.length > 0 : nodeIssues.length > 0;

        return (
            <div className={detailStyles.treeNode}>
                <div className={detailStyles.treeNodeHeader}>
                    <Link href={`/tags/${node.slug}`} className={detailStyles.treeTagLink}>
                        #{node.name}
                    </Link>
                    <span className={detailStyles.treeBreadcrumb}>
                        ({parentPath} › {node.name})
                    </span>
                </div>

                {hasDirectItems && (
                    <div className={detailStyles.treeItemsSection}>
                        {activeTab === "people" ? (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
                                {nodePeople.map(p => (
                                    <PersonCard key={p.id} person={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
                                {nodeIssues.map(i => (
                                    <IssueCard key={i.id} issue={i} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {node.children && node.children.length > 0 && (
                    <div className={detailStyles.treeChildren}>
                        {node.children.map(child => (
                            <TagTreeNode
                                key={child.id}
                                node={child}
                                level={level + 1}
                                parentPath={`${parentPath} › ${node.name}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Image banners
    const activeImageSrc = editImagePreview || (tag.image ? getMediaUrl(tag.image) : null);

    return (
        <div className={styles.container}>
            {/* Action Bar (Top) */}
            <div className="flex justify-between items-center mb-6">
                {/* Breadcrumbs Path */}
                <div className={detailStyles.breadcrumbs}>
                    <Link href="/tags" className={detailStyles.breadcrumbLink}>Tags</Link>
                    <span className={detailStyles.breadcrumbSeparator}>/</span>
                    {tag.ancestors && tag.ancestors.map(anc => (
                        <React.Fragment key={anc.id}>
                            <Link href={`/tags/${anc.slug}`} className={detailStyles.breadcrumbLink}>
                                {anc.name}
                            </Link>
                            <span className={detailStyles.breadcrumbSeparator}>/</span>
                        </React.Fragment>
                    ))}
                    <span className={detailStyles.breadcrumbActive}>#{tag.name}</span>
                </div>

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white transition-colors"
                    >
                        Editar Tag
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditImageFile(null);
                                setEditImagePreview(null);
                                setClearImage(false);
                                setEditName(tag.name);
                                setEditDescription(tag.description || "");
                                setEditParentId(tag.parent_id || null);
                            }}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-bold text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold text-white transition-colors disabled:opacity-50"
                        >
                            {isSaving ? "Salvando..." : "Salvar"}
                        </button>
                    </div>
                )}
            </div>

            {/* EDIT VIEW */}
            {isEditing ? (
                <div className={detailStyles.editContainer}>
                    <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Configurações da Tag</h2>
                    
                    <div className={detailStyles.editFormGrid}>
                        {/* Left Column (Meta Info) */}
                        <div className="space-y-4">
                            <div className={detailStyles.formField}>
                                <label className={detailStyles.formLabel}>Nome da Tag</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Ex: Anos 80, Entrevista, Praia..."
                                    className={detailStyles.inputField}
                                />
                            </div>

                            <div className={detailStyles.formField}>
                                <label className={detailStyles.formLabel}>Descrição</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Descreva o propósito ou contexto desta categoria..."
                                    className={`${detailStyles.inputField} ${detailStyles.textareaField}`}
                                />
                            </div>
                        </div>

                        {/* Right Column (Hierarchy & Cover) */}
                        <div className="space-y-4">
                            {/* Parent Selector */}
                            <div className={detailStyles.formField} ref={parentContainerRef}>
                                <label className={detailStyles.formLabel}>Tag Pai (Subcategoria de)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={
                                            editParentId 
                                                ? allTagsList.find(t => t.id === editParentId)?.name || "Selecione..." 
                                                : "Nenhuma (Tag Raiz)"
                                        }
                                        value={parentSearch}
                                        onChange={(e) => {
                                            setParentSearch(e.target.value);
                                            setIsParentDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsParentDropdownOpen(true)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:border-blue-500 outline-none transition-colors"
                                    />
                                    {isParentDropdownOpen && (
                                        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-h-48 overflow-y-auto backdrop-blur-xl">
                                            {editParentId && (
                                                <button
                                                    onClick={() => {
                                                        setEditParentId(null);
                                                        setParentSearch("");
                                                        setIsParentDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-white/5 transition-colors border-b border-white/5"
                                                >
                                                    [Remover Relação Pai]
                                                </button>
                                            )}
                                            {parentOptions.length === 0 ? (
                                                <div className="p-3 text-xs text-gray-500 italic">Nenhuma tag encontrada</div>
                                            ) : (
                                                parentOptions.map((t) => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => {
                                                            setEditParentId(t.id);
                                                            setParentSearch("");
                                                            setIsParentDropdownOpen(false);
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 text-xs text-gray-200 hover:bg-blue-600/10 transition-colors border-b border-white/5 last:border-0"
                                                    >
                                                        {t.name}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cover Selector */}
                            <div className={detailStyles.formField}>
                                <label className={detailStyles.formLabel}>Imagem de Capa (Banner)</label>
                                <div className={detailStyles.imageUploadWrapper}>
                                    {activeImageSrc ? (
                                        <img
                                            src={activeImageSrc}
                                            alt="Pré-visualização"
                                            className={detailStyles.previewThumb}
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-gray-950 border border-white/10 flex items-center justify-center text-gray-700 shrink-0">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className={detailStyles.uploadActions}>
                                        <label className={detailStyles.uploadBtn}>
                                            Fazer Upload
                                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoSelect} />
                                        </label>
                                        {activeImageSrc && (
                                            <button
                                                type="button"
                                                onClick={handleClearPhoto}
                                                className={detailStyles.clearImageBtn}
                                            >
                                                Remover imagem
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* DISPLAY VIEW - PREMIUM CAPA BANNER */
                <div className={detailStyles.bannerContainer}>
                    {tag.image && (
                        <div
                            className={detailStyles.bannerBg}
                            style={{ backgroundImage: `url(${getMediaUrl(tag.image)})` }}
                        />
                    )}
                    <div className={detailStyles.bannerOverlay} />
                    <div className={detailStyles.bannerContent}>
                        <div className={detailStyles.tagTitleWrapper}>
                            {tag.image && (
                                <img
                                    src={getMediaUrl(tag.image)}
                                    alt={tag.name}
                                    className={detailStyles.tagImageThumbnail}
                                />
                            )}
                            <div className={detailStyles.tagTitleInfo}>
                                <h1 className={detailStyles.tagTitle}>#{tag.name}</h1>
                                {tag.parent && (
                                    <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mt-1">
                                        Subcategoria de: <Link href={`/tags/${tag.parent.slug}`} className="hover:underline">#{tag.parent.name}</Link>
                                    </p>
                                )}
                            </div>
                        </div>
                        {tag.description && (
                            <p className={detailStyles.tagDescription}>{tag.description}</p>
                        )}
                    </div>
                </div>
            )}

            {/* TABS */}
            <div className={detailStyles.tabs}>
                <button
                    className={`${detailStyles.tab} ${activeTab === "people" ? detailStyles.activeTab : ""}`}
                    onClick={() => {
                        setActiveTab("people");
                        router.replace(`${pathname}?page=1`);
                    }}
                >
                    Pessoas <span className={detailStyles.count}>{peopleDirectData?.count || 0}</span>
                </button>
                <button
                    className={`${detailStyles.tab} ${activeTab === "issues" ? detailStyles.activeTab : ""}`}
                    onClick={() => {
                        setActiveTab("issues");
                        router.replace(`${pathname}?page=1`);
                    }}
                >
                    Edições <span className={detailStyles.count}>{issuesDirectData?.count || 0}</span>
                </button>
            </div>

            {/* TAB CONTENT */}
            <div className={detailStyles.tabContent}>
                {/* 1. DIRECT ASSOCIATIONS SECTION */}
                <div>
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                        Associações Diretas
                    </h2>
                    
                    {activeTab === "people" ? (
                        !peopleDirectData || peopleDirectData.results.length === 0 ? (
                            <div className={styles.empty}>
                                <p className="text-sm text-gray-500 italic">
                                    Nenhuma pessoa associada diretamente. Explore as tags filhas abaixo!
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
                                {peopleDirectData.results.map(p => (
                                    <PersonCard key={p.id} person={p} />
                                ))}
                            </div>
                        )
                    ) : (
                        !issuesDirectData || issuesDirectData.results.length === 0 ? (
                            <div className={styles.empty}>
                                <p className="text-sm text-gray-500 italic">
                                    Nenhuma edição associada diretamente. Explore as tags filhas abaixo!
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
                                {issuesDirectData.results.map(i => (
                                    <IssueCard key={i.id} issue={i} />
                                ))}
                            </div>
                        )
                    )}

                    {/* DIRECT PAGINATION */}
                    {directTotalPages > 1 && (
                        <div className="mt-8">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={directTotalPages}
                                baseUrl={pathname}
                            />
                        </div>
                    )}
                </div>

                {/* 2. RECURSIVE HIERARCHICAL DESCENDANTS SECTION */}
                {tag.descendants_tree && tag.descendants_tree.length > 0 && tag.descendants_tree.some(hasNodeMatches) && (
                    <div>
                        <h2 className={detailStyles.hierarchyTitle}>
                            Associações por Descendência
                        </h2>
                        
                        <div className={detailStyles.treeContainer}>
                            {tag.descendants_tree.map(child => (
                                <TagTreeNode
                                    key={child.id}
                                    node={child}
                                    level={1}
                                    parentPath={tag.name}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
