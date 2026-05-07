"use client";

import React from 'react';
import Link from 'next/link';
import styles from './PersonCard.module.css';
import { Person } from '@/@types/person';
import { getMediaUrl } from '@/lib/issues';

interface PersonCardProps {
    person: Person;
}

const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

const getCountryCode = (country: string) => {
    const map: Record<string, string> = {
        'brasil': 'br',
        'brazil': 'br',
        'eua': 'us',
        'usa': 'us',
        'united states': 'us',
        'frança': 'fr',
        'france': 'fr',
        'itália': 'it',
        'italy': 'it',
        'espanha': 'es',
        'spain': 'es',
        'alemanha': 'de',
        'germany': 'de',
        'reino unido': 'gb',
        'united kingdom': 'gb',
        'uk': 'gb',
        'japão': 'jp',
        'japan': 'jp',
        'portugal': 'pt',
        'argentina': 'ar',
        'canadá': 'ca',
        'canada': 'ca',
    };
    
    const normalized = country.toLowerCase().trim();
    // Se já for um código de 2 letras, retorna ele mesmo
    if (normalized.length === 2) return normalized;
    // Tenta encontrar no mapa, senão retorna o próprio nome (pode falhar no flagcdn se não for código)
    return map[normalized] || null;
};

export default function PersonCard({ person }: PersonCardProps) {
    const age = person.birth_date ? calculateAge(person.birth_date) : null;
    
    const countryCode = person.country ? getCountryCode(person.country) : null;
    const flagUrl = countryCode ? `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png` : null;

    return (
        <Link href={`/people/${person.id}`} className={styles.card}>
            {/* Flag Badge */}
            {flagUrl && (
                <img 
                    src={flagUrl} 
                    alt={person.country} 
                    className={styles.flag}
                    title={person.country}
                />
            )}

            {/* Photo Background */}
            <div className={styles.photoContainer}>
                {person.photo ? (
                    <img 
                        src={getMediaUrl(person.photo)} 
                        alt={person.name} 
                        className={styles.photo}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>SEM FOTO</span>
                    </div>
                )}
            </div>

            <div className={styles.overlay}>
                <div className={styles.info}>
                    <h3 className={styles.name}>
                        {person.name}
                        {age !== null && <span className={styles.age}>({age} anos)</span>}
                    </h3>
                    {person.gender_display && (
                        <span className="text-[10px] text-blue-300 font-bold uppercase opacity-80 mt-1 block tracking-wider">
                            {person.gender_display}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
