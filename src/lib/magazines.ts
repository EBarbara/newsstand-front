import { request } from "./api";
import { Magazine } from "@/@types/magazine";
import { PaginatedResponse } from "@/@types/api";

export function getMagazines() {
    return request<PaginatedResponse<Magazine>>("/magazines/");
}