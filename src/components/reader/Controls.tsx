import styles from './Reader.module.css'

interface ControlsProps {
    page: number,
    total: number,
    onPrev: () => void,
    onNext: () => void,
    visible: boolean,
    canPrev: boolean,
    canNext: boolean
}

export default function Controls({ page, total, onPrev, onNext, visible, canPrev, canNext }: ControlsProps) {
    return (
        <div
            className={styles.nav}
            style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none', }}
        >
            <button onClick={onPrev} disabled={!canPrev}>◀</button>
            <span>{page} / {total}</span>
            <button onClick={onNext} disabled={!canNext}>▶</button>
        </div>
    );
}