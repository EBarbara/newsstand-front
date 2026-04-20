import { request } from "./api";
import { Magazine } from "@/@types/magazine";

export function getMagazines() {
    return request<Magazine[]>("/magazines/");
}