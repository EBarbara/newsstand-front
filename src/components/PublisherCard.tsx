"use client";

import React from 'react';
import Link from 'next/link';
import { Publisher } from '@/@types/publisher';
import { getMediaUrl } from '@/lib/issues';

interface PublisherCardProps {
    publisher: Publisher;
}

export default function PublisherCard({ publisher }: PublisherCardProps) {
    const flagUrl = publisher.country_code ? `https://flagcdn.com/w40/${publisher.country_code.toLowerCase()}.png` : null;

    // Generates a dynamic background gradient based on slug if logo is missing
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

    const gradient = getGradientClass(publisher.slug);
    const initials = publisher.name.substring(0, 2).toUpperCase();

    // @ts-ignore - magazines_count might be injected by simple serializer
    const magCount = publisher.magazines_count || 0;

    return (
        <Link
            href={`/publishers/${publisher.slug}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/30"
        >
            {/* Background Glow Effect on Hover */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600/0 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:group-hover:from-blue-500/5 dark:group-hover:to-indigo-500/5" />

            <div className="flex flex-col gap-4">
                {/* Header: Logo or Initials */}
                <div className="flex items-center gap-4">
                    {publisher.logo ? (
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center p-1.5 shadow-inner">
                            <img
                                src={getMediaUrl(publisher.logo)}
                                alt={publisher.name}
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
                            {publisher.name}
                        </h2>
                        {publisher.translated_name && (
                            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium truncate">
                                ({publisher.translated_name})
                            </span>
                        )}
                    </div>
                </div>

                {/* Country/Website and Aliases */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {(flagUrl || publisher.country) && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50 uppercase">
                            {flagUrl ? (
                                <img
                                    src={flagUrl}
                                    alt={publisher.country || "Bandeira"}
                                    className="w-3.5 h-auto rounded-[1px] shadow-sm border border-white/10"
                                    title={publisher.country || ""}
                                />
                            ) : (
                                <span>📍</span>
                            )}
                            {publisher.country}
                        </span>
                    )}

                    {publisher.website && (
                        <span 
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            className="inline-flex items-center gap-1 rounded-md bg-zinc-150 dark:bg-zinc-800/80 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-750"
                        >
                            <a href={publisher.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                🔗 Website
                            </a>
                        </span>
                    )}
                </div>

                {publisher.aliases && publisher.aliases.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {publisher.aliases.slice(0, 3).map((alias, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-blue-500/10 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded text-[9px] text-blue-500 dark:text-blue-400 font-bold uppercase">
                                {alias}
                            </span>
                        ))}
                        {publisher.aliases.length > 3 && (
                            <span className="text-[9px] text-zinc-400 font-bold px-1 py-0.5">
                                +{publisher.aliases.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Magazines count at the bottom */}
            <div className="mt-5 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
                        {magCount}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                        {magCount === 1 ? 'Revista' : 'Revistas'}
                    </span>
                </div>
            </div>
        </Link>
    );
}
