import { Render } from '@/@types/render';
import styles from './Reader.module.css'

interface CanvasProps {
    render: Render;
}

export default function Canvas({ render }: CanvasProps) {
    const isWide = render.page_type === 'GATEFOLD' || render.page_type === 'SPREAD';
    
    return (
        <div className={`${styles.canvas} ${isWide ? styles.wideCanvas : ''}`}>
            <img 
                src={render.image} 
                className={`${styles.image} ${isWide ? styles.wideImage : ''}`} 
                alt={"page"} 
            />
        </div>
    );
}