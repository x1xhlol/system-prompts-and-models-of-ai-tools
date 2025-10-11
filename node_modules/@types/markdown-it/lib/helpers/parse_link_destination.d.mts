export interface ParseLinkDestinationResult {
    ok: boolean;
    pos: number;
    str: string;
}

export default function parseLinkDestination(str: string, start: number, max: number): ParseLinkDestinationResult;
