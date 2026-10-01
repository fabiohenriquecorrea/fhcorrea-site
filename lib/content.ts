import data from "@/content/portfolio.json";
import type { Content } from "./types";

export const content = data as Content;

export const whatsappUrl = (n: string) => `https://wa.me/${n.replace(/\D/g, "")}`;
