import { getMediaUrl } from "@/lib/issues";

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
            className={`cursor-pointer border ${sectionId ? "border-[3px] border-blue-500" : "border-[#ccc]"}`}
        >
            <img src={getMediaUrl(image)} className="w-full" alt={`Page ${page}`} />
            <div className="text-center">{page}</div>
        </div>
    )
}