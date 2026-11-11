"""
Rule-based recommendation scoring service.

Scores open projects against a freelancer's skill set.
Pure function — no I/O, fully unit-testable.

Scoring formula
───────────────
Each matched skill contributes a weighted point based on proficiency:
  Advanced     → 3 pts
  Intermediate → 2 pts
  Beginner     → 1 pt

Base score = sum of weights for matched skills.
Max possible score = sum of weights for ALL required skills
  (assuming Advanced for each, i.e. 3 × n_skills).

match_percent = round((base_score / max_score) * 100)   when max_score > 0
             = 0                                          when no skills required

A +5 bonus is added when the project category matches one of the freelancer's
preferred categories (capped at 100).

Reason text is generated transparently so the UI can label it "Rule-based".
"""
from typing import List, Optional


LEVEL_WEIGHTS = {
    "Advanced": 3,
    "Intermediate": 2,
    "Beginner": 1,
}


def score_project(
    project_skills: List[str],
    freelancer_skills: List[dict],           # [{"name": str, "level": str}]
    preferred_categories: Optional[List[str]] = None,
    project_category: Optional[str] = None,
) -> dict:
    """
    Score one project against one freelancer.

    Returns a dict with:
      match_percent   int   0–100
      matched_skills  list  skills present in both sets
      missing_skills  list  skills required but not held
      reason          str   human-readable explanation
    """
    preferred_categories = preferred_categories or []

    # Build a fast lookup: lowercase name → level
    skill_map: dict[str, str] = {
        s["name"].lower(): s.get("level", "Beginner")
        for s in freelancer_skills
    }

    matched: List[str] = []
    missing: List[str] = []
    score = 0

    for ps in project_skills:
        key = ps.lower()
        if key in skill_map:
            matched.append(ps)
            score += LEVEL_WEIGHTS.get(skill_map[key], 1)
        else:
            missing.append(ps)

    # Max score: all skills at Advanced level
    max_score = len(project_skills) * LEVEL_WEIGHTS["Advanced"]

    if max_score == 0:
        # Project has no skill requirements — show it but score 0
        match_percent = 0
        reason = "No specific skills required for this project."
    else:
        raw = round((score / max_score) * 100)

        # Category preference bonus
        if project_category and project_category in preferred_categories:
            raw = min(100, raw + 5)

        match_percent = max(0, min(100, raw))

        if not matched:
            reason = (
                "Limited skill overlap. Add the required skills to improve your match."
            )
        elif not missing:
            reason = (
                f"You have all {len(matched)} required skill(s): "
                f"{', '.join(matched)}."
            )
        else:
            reason = (
                f"You already have {', '.join(matched)}. "
                f"Adding {', '.join(missing)} would strengthen your proposal."
            )

    return {
        "match_percent": match_percent,
        "matched_skills": matched,
        "missing_skills": missing,
        "reason": reason,
    }


def rank_projects(
    projects: List[dict],                    # raw project rows from DB
    freelancer_skills: List[dict],
    preferred_categories: Optional[List[str]] = None,
    saved_ids: Optional[List[str]] = None,
) -> List[dict]:
    """
    Attach scoring metadata to every project and return sorted by match_percent desc.

    Each project dict must include at least:
      id, title, description, budget, project_type, status
    and optionally: skills (list of str), category, deadline.
    """
    saved_ids = saved_ids or []
    results = []

    for project in projects:
        project_skills = project.get("skills") or []
        scoring = score_project(
            project_skills=project_skills,
            freelancer_skills=freelancer_skills,
            preferred_categories=preferred_categories,
            project_category=project.get("category"),
        )
        results.append({
            **project,
            "saved": project.get("id") in saved_ids,
            **scoring,
            "engine": "rule-based",
        })

    results.sort(key=lambda p: p["match_percent"], reverse=True)
    return results
