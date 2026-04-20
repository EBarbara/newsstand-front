/* eslint-disable @next/next/no-img-element */
"use client";

import { SyntheticEvent, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import styles from './IssueCover.module.css';

interface IssueCoverProps {
    imageUrl: string;
    altText?: string;
    unfoldable?: boolean;
    defaultWidth?: number;
}

export default function IssueCover ({ imageUrl, altText = 'Issue Cover', unfoldable = false, defaultWidth = 200 } : IssueCoverProps) {
    const imgRef = useRef<HTMLImageElement>(null);

    const [isDoubleCover, setIsDoubleCover] = useState(false);
    const [isFolded, setIsFolded] = useState(true);
    const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

    // ================= IMAGE PROCESSING =================

    const detectCoverType = (img: HTMLImageElement) => {
        const aspect = img.naturalWidth / img.naturalHeight;
        return aspect > 1.2;
    }

    const handleImageLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
        const img = event.currentTarget;

        const double = detectCoverType(img);
        setIsDoubleCover(double);
        setStatus("loaded");
    };

    const handleError = () => {
        setStatus("error");
    };

    // Handle cached images
    useEffect(() => {
        const img = imgRef.current;
        if (img?.complete) {
            const double = detectCoverType(img);
            setIsDoubleCover(double);
            setStatus("loaded");
        }
    }, [imageUrl]);

    // ================= INTERACTION =================

    const handleClick = () => {
        if (unfoldable && isDoubleCover) {
            setIsFolded((prev) => !prev);
        }
    };

    // ================= DERIVED =================

    const isLoading = status === "loading";
    const hasError = status === "error";

    const width = !isDoubleCover || isFolded
        ? defaultWidth
        : defaultWidth * 2;

    const className = clsx(
        styles.card,
        isDoubleCover && styles.doubleCover,
        isDoubleCover && isFolded && styles.folded,
        isLoading ? styles.loading : styles.loaded
    );

    // ================= RENDER =================

    return (
        <div className={className} onClick={handleClick} style={{ width }}>
            {!hasError ? (
                <img
                    key={imageUrl}
                    ref={imgRef}
                    src={imageUrl}
                    alt={altText}
                    onLoad={handleImageLoad}
                    onError={handleError}
                    className={styles.image}
                />
            ) : (
                <div className={styles.placeholder}>
                    Image unavailable
                </div>
            )}
        </div>
    );
}