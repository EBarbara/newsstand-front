import styles from "./layout.module.css"

export default function ReaderLayout({ children, }: { children: React.ReactNode; }) {
    return (
        <div className={styles.readerRoot} >
            {children}
        </div>
    );
}