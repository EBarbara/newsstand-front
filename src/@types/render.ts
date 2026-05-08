export type Render = {
    id: number;
    order: number;
    image: string;
    is_cover: boolean;
    page_type: 'NORMAL' | 'SPREAD' | 'GATEFOLD';
    focus_x: number;
    focus_y: number;
    width: number;
    height: number;
}