import styles from './Reader.module.css'

interface CanvasProps {
    image: string;
}

export default function Canvas({ image }: CanvasProps) {
    return (
        <div className={styles.canvas}>
            <img src={image} className={styles.image} alt={"page"} />
        </div>
    );
}