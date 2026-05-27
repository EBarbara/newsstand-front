"use client";

import React, { useState, useEffect, useRef } from "react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Buscar...", className = "" }: SearchBarProps) {
    const [localValue, setLocalValue] = useState(value);
    const prevValueRef = useRef(value);

    // Sync external value with local value if it changes externally
    useEffect(() => {
        if (value !== prevValueRef.current) {
            setLocalValue(value);
            prevValueRef.current = value;
        }
    }, [value]);

    // Handle debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue);
                prevValueRef.current = localValue;
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localValue, onChange, value]);

    const handleClear = () => {
        setLocalValue("");
        onChange("");
        prevValueRef.current = "";
    };

    return (
        <div className={`relative flex items-center ${className}`}>
            <span className="absolute left-3.5 text-gray-400 pointer-events-none select-none text-sm">
                🔍
            </span>
            <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500/50 hover:bg-white/10 focus:bg-white/10 text-white pl-10 pr-9 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-500 text-sm font-medium"
            />
            {localValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5 text-xs"
                    title="Limpar busca"
                >
                    ✕
                </button>
            )}
        </div>
    );
}
