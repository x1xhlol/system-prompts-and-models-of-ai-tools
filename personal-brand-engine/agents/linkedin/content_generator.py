"""Generate LinkedIn posts using LLM with Sami's brand voice."""

from __future__ import annotations

import logging
import random
from pathlib import Path

import yaml

logger = logging.getLogger(__name__)

_TEMPLATES_DIR = Path(__file__).resolve().parent / "prompts"

# Content pillars that align with Sami's brand strategy
PILLARS = [
    "tech_insights",
    "field_life",
    "professional_growth",
    "industry_news",
]

SYSTEM_PROMPT = """\
You are a LinkedIn ghostwriter for Sami Mohammed Assiri.

=== ABOUT SAMI ===
- Field Services Engineer at METCO (Smiths Detection) specialising in airport \
security screening systems (X-ray, CT, EDS, trace detection).
- Previously worked at Samsung Engineering & Advanced Technology (Samsung E&A) \
on large-scale EPC projects.
- President of the SPE (Society of Petroleum Engineers) Alasala University Chapter.
- Based in Saudi Arabia; fluent in Arabic and English.
- 10,000+ LinkedIn followers.
- LinkedIn: https://www.linkedin.com/in/sami-assiri-a300622b2/

=== VOICE & TONE ===
- Professional yet personable -- Sami shares real field experiences.
- Confident expertise without arrogance; generous with knowledge.
- Occasionally uses light humour to keep posts engaging.
- Blends technical depth with accessible language so non-engineers also benefit.
- Passionate about aviation security, engineering excellence, and mentorship.

=== FORMATTING RULES ===
- Use short paragraphs (2-3 sentences max) separated by blank lines.
- Open with a hook -- a bold statement, question, or surprising fact.
- End with a clear call-to-action or thought-provoking question.
- Keep total length between 150 and 300 words.
- Include 3-5 relevant hashtags at the very end.
- Do NOT use bullet-point lists in every post -- vary the structure.
- When writing in Arabic, use Modern Standard Arabic (فصحى) with a Saudi touch.

=== IMPORTANT ===
- Never fabricate certifications, experiences, or statistics.
- Align with the content pillar and topic provided.
- Make it feel authentic -- like Sami typed it himself.
"""


def _load_templates() -> dict:
    """Load post_templates.yaml once and cache it."""
    path = _TEMPLATES_DIR / "post_templates.yaml"
    if not path.exists():
        logger.warning("post_templates.yaml not found at %s", path)
        return {}
    with open(path, "r", encoding="utf-8") as fh:
        return yaml.safe_load(fh) or {}


def _pick_language(brand_profile: dict) -> str:
    """Choose a language for this post based on brand profile preferences."""
    languages = brand_profile.get("languages", ["english", "arabic"])
    # Weighted towards English (60/40) unless overridden
    weights = brand_profile.get("language_weights", [60, 40])
    if len(weights) != len(languages):
        weights = [1] * len(languages)
    return random.choices(languages, weights=weights, k=1)[0]


def _pick_pillar(content_strategy: dict, pillar: str | None) -> str:
    """Return the pillar to use -- explicit or random weighted choice."""
    if pillar and pillar in PILLARS:
        return pillar
    pillars = content_strategy.get("pillars", PILLARS)
    return random.choice(pillars)


def _build_user_prompt(
    pillar: str,
    language: str,
    brand_profile: dict,
    content_strategy: dict,
    templates: dict,
) -> str:
    """Assemble the user prompt sent to the LLM."""
    hashtags = content_strategy.get("hashtags", {}).get(pillar, [])
    hashtag_str = " ".join(f"#{h}" for h in hashtags) if hashtags else ""

    # Try to pick a template for extra guidance
    template_block = ""
    pillar_templates = templates.get(pillar, {}).get(language, [])
    if pillar_templates:
        template_block = (
            f"\nHere is a sample template for inspiration (do NOT copy verbatim):\n"
            f"---\n{random.choice(pillar_templates)}\n---\n"
        )

    lang_instruction = (
        "Write the post in Arabic (فصحى with a Saudi touch)."
        if language == "arabic"
        else "Write the post in English."
    )

    return (
        f"Content pillar: {pillar}\n"
        f"Language: {language}\n"
        f"{lang_instruction}\n"
        f"{template_block}\n"
        f"Suggested hashtags to weave in at the end: {hashtag_str}\n\n"
        f"Now write a LinkedIn post for Sami. Return ONLY the post text -- "
        f"no preamble, no labels, no markdown formatting."
    )


async def generate_post(
    llm_client,
    brand_profile: dict,
    content_strategy: dict,
    pillar: str | None = None,
) -> str:
    """Generate a single LinkedIn post using the configured LLM.

    Parameters
    ----------
    llm_client:
        An ``LLMClient`` instance with an ``async generate()`` method.
    brand_profile:
        Parsed ``brand_profile.yaml`` dict.
    content_strategy:
        Parsed ``content_strategy.yaml`` dict.
    pillar:
        Optional content pillar override.  If ``None`` a random pillar is
        chosen based on the content strategy weights.

    Returns
    -------
    str
        The generated post text ready for publishing.
    """
    templates = _load_templates()
    language = _pick_language(brand_profile)
    chosen_pillar = _pick_pillar(content_strategy, pillar)

    user_prompt = _build_user_prompt(
        chosen_pillar, language, brand_profile, content_strategy, templates
    )

    response = await llm_client.generate(
        prompt=user_prompt,
        system_prompt=SYSTEM_PROMPT,
        temperature=0.8,
        max_tokens=1500,
    )

    post_text = response.text.strip()

    # Sanity-check length -- if the LLM went overboard, truncate gracefully
    words = post_text.split()
    if len(words) > 400:
        post_text = " ".join(words[:350]) + "\n\n..."
        logger.warning("Post was too long (%d words); truncated.", len(words))

    logger.info(
        "Generated %s post for pillar=%s (%d words, provider=%s)",
        language,
        chosen_pillar,
        len(post_text.split()),
        response.provider,
    )
    return post_text
