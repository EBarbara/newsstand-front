import Link from "next/link";
import { GlobalIssueSection } from "@/@types/issueSection";
import { getMediaUrl } from "@/lib/issues";

type Props = {
    section: GlobalIssueSection;
};

export default function GlobalSectionCard({ section }: Props) {
    const imageUrl = section.first_page_image ? getMediaUrl(section.first_page_image) : null;
    const isSpread = section.first_page_type === 'SPREAD' || section.first_page_type === 'GATEFOLD';

    return (
        <Link
            href={`/reader/${section.issue_id}?page=${section.start_page}`}
            className="group flex flex-col bg-gray-900/40 border border-gray-800 rounded-lg overflow-hidden hover:bg-gray-800/60 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-900/20"
        >
            {/* THUMBNAIL AREA */}
            <div className={`relative bg-black/40 flex items-center justify-center overflow-hidden ${isSpread ? 'aspect-[1.4/1]' : 'aspect-[0.7/1]'}`}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={section.title || section.section_name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="text-gray-700 text-[10px] uppercase font-bold tracking-widest">Sem Imagem</div>
                )}
                
                {isSpread && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-600/90 text-[9px] font-bold text-white rounded uppercase tracking-wider shadow-lg backdrop-blur-sm">
                        {section.first_page_type === 'GATEFOLD' ? 'Desdobrável' : 'Página Dupla'}
                    </div>
                )}
                
                {/* OVERLAY GRADIENT */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* INFO AREA */}
            <div className="p-3 flex flex-col gap-1.5 min-w-0">
                <div className="font-bold text-gray-100 text-sm line-clamp-2 min-h-[2.5rem] leading-tight group-hover:text-blue-300 transition-colors">
                    {section.translated_title ? (
                        <span>
                            {section.title || "Sem título"}{" "}
                            <span className="text-gray-400 font-normal text-xs">
                                ({section.translated_title})
                            </span>
                        </span>
                    ) : (
                        section.title || section.section_name
                    )}
                </div>
                
                <div className="flex flex-col gap-0.5">
                    <div className="text-[11px] text-blue-400 font-bold uppercase tracking-wider truncate">
                        {section.magazine_name}
                    </div>
                    <div className="text-[10px] text-gray-500 flex justify-between items-center font-medium">
                        <span>Edição {section.issue_edition?.replace("-", "/")}</span>
                        <span className="capitalize">{new Date(section.issue_date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}</span>
                    </div>
                </div>

                {/* CREDITS SUMMARY */}
                {section.credits && section.credits.length > 0 && (
                    <div className="mt-1 pt-2 border-t border-gray-800/50 text-[10px] text-gray-400 truncate">
                        <span className="text-gray-600 font-bold uppercase text-[9px]">Créditos: </span>
                        {section.credits.slice(0, 3).map((c, i, arr) => (
                            <span key={c.id}>
                                {c.person?.name}{i < arr.length - 1 ? ", " : ""}
                            </span>
                        ))}
                        {section.credits.length > 3 && <span className="text-blue-500/70"> +{section.credits.length - 3}</span>}
                    </div>
                )}
            </div>
        </Link>
    );
}
