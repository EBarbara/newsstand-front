type Props = {
    page: number
    image: string
    sectionId: number | null
    onClick: () => void
}

export default function PageThumbnail({ page, image, sectionId, onClick }: Props) {
    return (
        <div
            onClick={(e) => {
                e.stopPropagation()
                onClick()
            }}
            style={{
                border: sectionId ? "3px solid blue" : "1px solid #ccc",
                cursor: "pointer"
            }}
        >
            <img src={image} style={{ width: "100%" }} />
            <div style={{ textAlign: "center" }}>{page}</div>
        </div>
    )
}