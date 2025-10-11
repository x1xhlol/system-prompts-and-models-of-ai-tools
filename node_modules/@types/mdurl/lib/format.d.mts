import { Url } from "./parse.mjs";

export default function format(url: Omit<Url, "parse" | "parseHost">): string;
