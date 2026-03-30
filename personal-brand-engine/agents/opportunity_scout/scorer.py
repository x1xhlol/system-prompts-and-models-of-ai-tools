"""Relevance scorer -- uses LLM to evaluate how well an opportunity matches
Sami's profile, skills, and career goals."""

from __future__ import annotations

import json
from typing import Any

from utils.logger import get_logger

logger = get_logger(__name__)

_SCORING_PROMPT = """\
You are a career-opportunity relevance scorer.  Given a professional profile
and an opportunity (job posting, event, or news item), rate how relevant the
opportunity is on a scale from 0.0 to 1.0 and explain your reasoning.

## Scoring guidelines

Award HIGHER scores (0.7 -- 1.0) when:
- The opportunity is at Smiths Detection, METCO, or a direct competitor
  (OSI Systems / Rapiscan, L3Harris, Leidos, Nuctech)
- Role involves airport / aviation security equipment
- Location is Saudi Arabia (especially Riyadh)
- Role is Field Services / Field Engineering
- Requires mechanical engineering background
- Involves project management for large-scale deployments
- Related to GACA or Saudi aviation authority initiatives
- Involves Python, data analytics, or automation in an engineering context

Award MEDIUM scores (0.4 -- 0.69) when:
- Related to broader security / defense industry
- Engineering role in the Middle East (GCC countries)
- Involves transferable skills (project management, maintenance planning)
- Industry news that could create future opportunities

Award LOWER scores (0.0 -- 0.39) when:
- Unrelated industry or geography
- Purely software role with no engineering overlap
- Entry-level position far below current experience
- News with no actionable career relevance

## Professional profile
{profile_json}

## Opportunity
Title: {title}
Company: {company}
Source: {source}
Description:
{description}

## Required output
Respond ONLY with a JSON object (no markdown fences):
{{"score": <float 0.0-1.0>, "explanation": "<one-sentence reason>"}}
"""


async def score_opportunity(
    llm_client: Any,
    opportunity: dict,
    brand_profile: dict,
) -> float:
    """Score an opportunity's relevance to Sami's career profile.

    Parameters
    ----------
    llm_client:
        An LLM client with an ``async generate(prompt, ...)`` method.
    opportunity:
        Dict with keys: title, company, url, description, source.
    brand_profile:
        Parsed brand profile dict from ``brand_profile.yaml``.

    Returns
    -------
    float
        Relevance score between 0.0 and 1.0.
    """
    profile_summary = {
        "name": brand_profile.get("name", "Sami Assiri"),
        "current_role": brand_profile.get(
            "current_role",
            "Field Services Engineer at METCO (Smiths Detection)",
        ),
        "location": brand_profile.get("location", "Riyadh, Saudi Arabia"),
        "skills": brand_profile.get(
            "skills",
            [
                "Mechanical Engineering",
                "Field Services",
                "Airport Security Equipment",
                "Python",
                "Data Analytics",
                "Project Management",
            ],
        ),
        "previous_companies": brand_profile.get(
            "previous_companies", ["Samsung E&A"]
        ),
        "industry": brand_profile.get("industry", "Aviation Security"),
    }

    prompt = _SCORING_PROMPT.format(
        profile_json=json.dumps(profile_summary, indent=2),
        title=opportunity.get("title", "N/A"),
        company=opportunity.get("company", "N/A"),
        source=opportunity.get("source", "N/A"),
        description=(opportunity.get("description", "") or "")[:2000],
    )

    try:
        response = await llm_client.generate(
            prompt,
            system_prompt="You are a precise JSON-only scorer.",
            temperature=0.2,
            max_tokens=300,
        )

        text = response.text.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        result = json.loads(text)
        score = float(result.get("score", 0.0))
        explanation = result.get("explanation", "")
        score = max(0.0, min(1.0, score))

        logger.info(
            "opportunity_scored",
            title=opportunity.get("title"),
            score=score,
            explanation=explanation,
        )
        return score

    except (json.JSONDecodeError, KeyError, ValueError, TypeError) as exc:
        logger.error(
            "scoring_parse_error",
            error=str(exc),
            title=opportunity.get("title"),
        )
        return 0.0
    except Exception as exc:  # noqa: BLE001
        logger.error(
            "scoring_llm_error",
            error=str(exc),
            title=opportunity.get("title"),
        )
        return 0.0
