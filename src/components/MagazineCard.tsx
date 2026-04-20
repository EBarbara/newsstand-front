import Link from "next/link";
import { Magazine } from "@/@types/magazine";

export default function MagazineCard({ mag }: { mag: Magazine }) {
    return (
        <Link
            key={mag.slug}
            href={`/magazines/${mag.slug}`}
            className="p-6 border rounded-lg hover:shadow transition"
        >
            <h2 className="font-semibold text-lg">
                {mag.name}
            </h2>

            <p className="text-sm text-gray-500">
                {mag.slug}
            </p>
        </Link>
    );
}