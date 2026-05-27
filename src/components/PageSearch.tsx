"use client";

import React, { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import SearchBar from "./SearchBar";

interface PageSearchProps {
    placeholder?: string;
    paramName?: string;
    className?: string;
}

function PageSearchContent({ placeholder, paramName, className }: PageSearchProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryValue = searchParams.get(paramName || "search") || "";

    const handleChange = (newValue: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const param = paramName || "search";
        if (newValue) {
            params.set(param, newValue);
        } else {
            params.delete(param);
        }
        // Always reset page to 1 when search query changes
        params.delete("page");
        
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <SearchBar
            value={queryValue}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
        />
    );
}

export default function PageSearch(props: PageSearchProps) {
    return (
        <Suspense fallback={
            <div className={`relative flex items-center ${props.className || ""}`}>
                <span className="absolute left-3.5 text-gray-400 pointer-events-none select-none text-sm">🔍</span>
                <input
                    type="text"
                    disabled
                    placeholder={props.placeholder || "Buscar..."}
                    className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-9 py-2 rounded-xl focus:outline-none transition-all placeholder:text-gray-500 text-sm font-medium opacity-50 cursor-not-allowed"
                />
            </div>
        }>
            <PageSearchContent {...props} />
        </Suspense>
    );
}
