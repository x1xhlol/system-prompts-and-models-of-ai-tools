"""CV rendering and PDF generation -- Jinja2 templates + WeasyPrint."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from jinja2 import BaseLoader, Environment, FileSystemLoader

logger = logging.getLogger(__name__)


def render_cv_html(
    brand_profile: dict,
    template_path: str,
    language: str = "en",
) -> str:
    """Render a CV as HTML from the Jinja2 template.

    Parameters
    ----------
    brand_profile:
        Full (optionally enhanced) brand profile dict.
    template_path:
        Absolute path to the ``.html`` Jinja2 template file.
    language:
        ``"en"`` or ``"ar"`` -- passed into the template context.

    Returns
    -------
    str
        Fully rendered HTML string.
    """
    tpl_path = Path(template_path)
    tpl_dir = str(tpl_path.parent)
    tpl_name = tpl_path.name

    env = Environment(
        loader=FileSystemLoader(tpl_dir),
        autoescape=True,
    )
    template = env.get_template(tpl_name)

    # Build the template context from the profile
    context = _build_template_context(brand_profile, language)

    html = template.render(**context)
    logger.info("CV HTML rendered (%s chars, lang=%s)", len(html), language)
    return html


def generate_pdf(html_content: str, output_path: str) -> Path:
    """Convert rendered HTML to a PDF file using WeasyPrint.

    Parameters
    ----------
    html_content:
        The full HTML string to convert.
    output_path:
        Destination file path for the generated PDF.

    Returns
    -------
    Path
        The path to the written PDF file.
    """
    from weasyprint import HTML

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)

    HTML(string=html_content).write_pdf(str(out))
    logger.info("PDF generated: %s (%.1f KB)", out, out.stat().st_size / 1024)
    return out


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------


def _build_template_context(profile: dict, language: str) -> dict:
    """Flatten the nested profile dict into a template-friendly context."""
    personal = profile.get("personal", {})
    employment = profile.get("employment", {})
    education = profile.get("education", {})
    enhanced = profile.get("enhanced", {})
    lang_suffix = f"_{language}"

    # Use enhanced summary if available, otherwise fall back to bio
    summary = enhanced.get(f"summary_{language}", "") or personal.get(
        f"bio_{language}", ""
    )

    # Current role bullets: prefer enhanced, fall back to raw description
    current = employment.get("current", {})
    current_bullets = enhanced.get("current_role_bullets", [])
    if not current_bullets:
        raw_desc = current.get(f"description_{language}", "")
        current_bullets = [
            line.strip().lstrip("- ")
            for line in raw_desc.strip().splitlines()
            if line.strip()
        ]

    # Previous roles: prefer enhanced
    previous_roles_enhanced = enhanced.get("previous_roles", [])
    previous_roles_raw = employment.get("previous", [])
    if previous_roles_enhanced:
        previous_roles = previous_roles_enhanced
    else:
        previous_roles = [
            {
                "company": r.get("company", ""),
                "title": r.get("title", ""),
                "period": r.get("period", ""),
                "bullets": r.get("highlights", []),
            }
            for r in previous_roles_raw
        ]

    # Leadership: prefer enhanced
    leadership_enhanced = enhanced.get("leadership", [])
    leadership_raw = profile.get("leadership", [])
    if leadership_enhanced:
        leadership = leadership_enhanced
    else:
        leadership = [
            {
                "role": entry.get("role", ""),
                "organization": entry.get("organization", ""),
                "period": entry.get("period", ""),
                "bullets": entry.get("highlights", []),
            }
            for entry in leadership_raw
        ]

    # Skills grouped by category
    skills = profile.get("skills", {})
    skill_categories = []
    _category_labels = {
        "data_analytics": {"en": "Data Analytics", "ar": "تحليل البيانات"},
        "project_management": {"en": "Project Management", "ar": "إدارة المشاريع"},
        "engineering": {"en": "Engineering", "ar": "الهندسة"},
        "leadership": {"en": "Leadership", "ar": "القيادة"},
        "languages": {"en": "Languages", "ar": "اللغات"},
    }
    for cat_key, items in skills.items():
        label = _category_labels.get(cat_key, {}).get(language, cat_key.replace("_", " ").title())
        if cat_key == "languages":
            formatted_items = [
                f"{lang['name']} ({lang['level']})" for lang in items
            ]
        else:
            formatted_items = list(items)
        skill_categories.append({"name": label, "items": formatted_items})

    return {
        "language": language,
        "name": personal.get(f"name_{language}", personal.get("name_en", "")),
        "title": personal.get(f"title_{language}", personal.get("title_en", "")),
        "headline": personal.get(f"headline_{language}", ""),
        "email": personal.get("email", ""),
        "phone": personal.get("phone", ""),
        "location": personal.get(f"location_{language}", ""),
        "linkedin": profile.get("links", {}).get("linkedin", ""),
        "summary": summary,
        "current_company": current.get("company", current.get("company_ar", "")),
        "current_title": current.get("title", current.get("title_ar", "")),
        "current_location": current.get("location", current.get("location_ar", "")),
        "current_start_date": current.get("start_date", ""),
        "current_bullets": current_bullets,
        "previous_roles": previous_roles,
        "leadership": leadership,
        "education_degree": education.get("degree", ""),
        "education_institution": education.get("institution", ""),
        "education_location": education.get("location", ""),
        "education_period": education.get("period", ""),
        "education_highlights": education.get("highlights", []),
        "certifications": profile.get("certifications", []),
        "awards": profile.get("awards", []),
        "skill_categories": skill_categories,
        "ats_keywords": enhanced.get("skills_keywords", []),
        "references": profile.get("references", []),
    }
