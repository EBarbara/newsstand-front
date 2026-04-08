import { request } from "./api";
import { Magazine } from "@/types/api";

export function getMagazines() {
    return request<Magazine[]>("/magazines/");
}