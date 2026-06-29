import Link from "next/link";
import { Magazine } from "@/@types/magazine";
import { getMediaUrl } from "@/lib/issues";

export default function MagazineCard({ mag }: { mag: Magazine }) {
    // Dynamic background gradient based on the slug to make cards look vibrant if there's no logo
    const getGradientClass = (slug: string) => {
        const hash = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const gradients = [
            "from-blue-600 to-indigo-700 dark:from-blue-500/20 dark:to-indigo-500/20",
            "from-purple-600 to-pink-700 dark:from-purple-500/20 dark:to-pink-500/20",
            "from-emerald-600 to-teal-700 dark:from-emerald-500/20 dark:to-teal-500/20",
            "from-amber-500 to-orange-600 dark:from-amber-500/20 dark:to-orange-500/20",
            "from-rose-500 to-red-600 dark:from-rose-500/20 dark:to-red-500/20",
        ];
        return gradients[hash % gradients.length];
    };

    const gradient = getGradientClass(mag.slug);
    const initials = mag.name.substring(0, 2).toUpperCase();
    const flagUrl = mag.country_code ? `https://flagcdn.com/w40/${mag.country_code.toLowerCase()}.png` : null;

    // Standardize language tag to uppercase for cleaner badge representation (e.g. PT-BR, EN-US)
    const formatLanguage = (lang?: string) => {
        if (!lang) return "";
        return lang.trim().toUpperCase();
    };

    return (
        <Link
            key={mag.slug}
            href={`/magazines/${mag.slug}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/30"
        >
            {/* Background Glow Effect on Hover */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600/0 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:group-hover:from-blue-500/5 dark:group-hover:to-indigo-500/5" />

            <div className="flex flex-col gap-4">
                {/* Header: Logo or Initials */}
                <div className="flex items-center gap-4">
                    {mag.logo ? (
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center p-1.5 shadow-inner">
                            <img
                                src={getMediaUrl(mag.logo)}
                                alt={mag.name}
                                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                    ) : (
                        <div className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br text-white dark:text-blue-300 font-extrabold text-xl shadow-md dark:shadow-none ${gradient}`}>
                            {initials}
                        </div>
                    )}

                    <div className="flex flex-col min-w-0">
                        <h2 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors truncate">
                            {mag.name}
                        </h2>
                        {mag.publishers && mag.publishers.length > 0 ? (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold truncate">
                                🏢 {mag.publishers.map(p => p.publisher.name).join(', ')}
                            </span>
                        ) : (
                            <span className="text-xs text-zinc-400 dark:text-zinc-550 truncate">
                                Sem editora registrada
                            </span>
                        )}
                    </div>
                </div>

                {/* Description snippet if present */}
                {mag.description ? (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 min-h-[2rem] leading-relaxed">
                        {mag.description}
                    </p>
                ) : (
                    <p className="text-xs text-zinc-400 dark:text-zinc-600 italic line-clamp-2 min-h-[2rem]">
                        Sem descrição disponível.
                    </p>
                )}

                {/* Country/Language and Tags */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {(flagUrl || mag.language || mag.country) && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50 uppercase">
                            {flagUrl ? (
                                <img 
                                    src={flagUrl} 
                                    alt={mag.country || "Bandeira"} 
                                    className="w-3.5 h-auto rounded-[1px] shadow-sm border border-white/10"
                                    title={mag.country}
                                />
                            ) : (
                                <span>{mag.language ? "🌐" : "📍"}</span>
                            )}
                            {formatLanguage(mag.language) || mag.country}
                        </span>
                    )}
                    {mag.tags?.slice(0, 2).map(tag => (
                        <span
                            key={tag.id}
                            className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"
                        >
                            #{tag.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* Counts segment at the bottom */}
            <div className="mt-5 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
                        {mag.issues_count || 0}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                        Edições
                    </span>
                </div>

                <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            {mag.periodic_issues_count || 0}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                            Periódicas
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            {mag.special_issues_count || 0}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                            Especiais
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}