import { getPersonDetail } from "@/lib/people";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMediaUrl } from "@/lib/issues";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const person = await getPersonDetail(Number(id)).catch(() => null);

    if (!person) return notFound();

    const photoUrl = person.photo ? getMediaUrl(person.photo) : null;

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 text-white">
            <div className="flex flex-col md:flex-row gap-10">
                {/* SIDEBAR: Photo & Basic Info */}
                <div className="w-full md:w-1/3 flex flex-col gap-6">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900 group">
                        {photoUrl ? (
                            <img 
                                src={photoUrl} 
                                alt={person.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-700">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-6 left-6">
                            <h1 className="text-3xl font-bold tracking-tight">{person.name}</h1>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm space-y-4">
                        {person.birth_date && (
                            <div>
                                <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Birth Date</label>
                                <p className="text-gray-200">{new Date(person.birth_date).toLocaleDateString()}</p>
                            </div>
                        )}
                        {person.country && (
                            <div>
                                <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Country</label>
                                <p className="text-gray-200">{person.country}</p>
                            </div>
                        )}
                        {person.links && person.links.length > 0 && (
                            <div>
                                <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Links</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {person.links.map(link => (
                                        <a 
                                            key={link.id}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-full text-sm text-blue-300 transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* MAIN CONTENT: Bio & Credits */}
                <div className="flex-1 space-y-10">
                    {person.biography && (
                        <section>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-blue-500"></span>
                                Biography
                            </h2>
                            <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed whitespace-pre-wrap">
                                {person.biography}
                            </div>
                        </section>
                    )}

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
