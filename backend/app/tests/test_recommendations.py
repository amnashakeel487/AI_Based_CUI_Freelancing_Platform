"""Unit tests for the recommendation scoring service."""
import pytest
from app.services.recommendation import score_project, rank_projects


# ── score_project ─────────────────────────────────────────────────────────────

@pytest.mark.unit
def test_perfect_match_all_advanced():
    """All required skills held at Advanced → 100%."""
    result = score_project(
        project_skills=["React", "Python"],
        freelancer_skills=[
            {"name": "React", "level": "Advanced"},
            {"name": "Python", "level": "Advanced"},
        ],
    )
    assert result["match_percent"] == 100
    assert set(result["matched_skills"]) == {"React", "Python"}
    assert result["missing_skills"] == []


@pytest.mark.unit
def test_partial_match():
    """Only some skills matched → score < 100."""
    result = score_project(
        project_skills=["React", "Python", "SQL"],
        freelancer_skills=[{"name": "React", "level": "Advanced"}],
    )
    # 1 Advanced (3) out of max 9 (3 × 3) → 33%
    assert result["match_percent"] == 33
    assert result["matched_skills"] == ["React"]
    assert set(result["missing_skills"]) == {"Python", "SQL"}


@pytest.mark.unit
def test_no_skill_overlap():
    """Zero matched skills → 0%."""
    result = score_project(
        project_skills=["Flutter", "Kotlin"],
        freelancer_skills=[{"name": "React", "level": "Advanced"}],
    )
    assert result["match_percent"] == 0
    assert result["matched_skills"] == []
    assert set(result["missing_skills"]) == {"Flutter", "Kotlin"}


@pytest.mark.unit
def test_no_project_skills_required():
    """Project with no skill requirements → 0%, not an error."""
    result = score_project(
        project_skills=[],
        freelancer_skills=[{"name": "React", "level": "Advanced"}],
    )
    assert result["match_percent"] == 0


@pytest.mark.unit
def test_case_insensitive_matching():
    """Skill matching must be case-insensitive."""
    result = score_project(
        project_skills=["react"],
        freelancer_skills=[{"name": "React", "level": "Intermediate"}],
    )
    assert result["match_percent"] > 0
    assert "react" in result["matched_skills"]


@pytest.mark.unit
def test_beginner_level_lower_score_than_advanced():
    """Beginner weight (1) produces lower score than Advanced (3) for the same skill set."""
    advanced = score_project(
        project_skills=["React"],
        freelancer_skills=[{"name": "React", "level": "Advanced"}],
    )
    beginner = score_project(
        project_skills=["React"],
        freelancer_skills=[{"name": "React", "level": "Beginner"}],
    )
    assert advanced["match_percent"] > beginner["match_percent"]


@pytest.mark.unit
def test_category_bonus_adds_five_points():
    """Matching category adds +5 to score (capped at 100)."""
    # 1 Intermediate skill (2pts) out of 3 Advanced max (9pts) → 22%
    # With category bonus → 27%
    base = score_project(
        project_skills=["React", "Python", "SQL"],
        freelancer_skills=[{"name": "React", "level": "Intermediate"}],
        preferred_categories=["Web Development"],
        project_category="Other",
    )
    bonus = score_project(
        project_skills=["React", "Python", "SQL"],
        freelancer_skills=[{"name": "React", "level": "Intermediate"}],
        preferred_categories=["Web Development"],
        project_category="Web Development",
    )
    assert bonus["match_percent"] == base["match_percent"] + 5


@pytest.mark.unit
def test_category_bonus_capped_at_100():
    """Score + bonus cannot exceed 100."""
    result = score_project(
        project_skills=["React"],
        freelancer_skills=[{"name": "React", "level": "Advanced"}],
        preferred_categories=["Web Development"],
        project_category="Web Development",
    )
    assert result["match_percent"] == 100


@pytest.mark.unit
def test_reason_mentions_matched_skills():
    """Reason text should mention the matched skill names."""
    result = score_project(
        project_skills=["React", "Python"],
        freelancer_skills=[{"name": "React", "level": "Advanced"}],
    )
    assert "React" in result["reason"]


# ── rank_projects ─────────────────────────────────────────────────────────────

@pytest.mark.unit
def test_rank_projects_sorted_by_match_desc():
    """rank_projects returns projects sorted highest match first."""
    projects = [
        {"id": "p1", "title": "A", "description": "", "budget": 1000,
         "project_type": "Fixed price", "status": "open", "skills": ["Flutter"]},
        {"id": "p2", "title": "B", "description": "", "budget": 1000,
         "project_type": "Fixed price", "status": "open", "skills": ["React", "Python"]},
    ]
    freelancer_skills = [
        {"name": "React", "level": "Advanced"},
        {"name": "Python", "level": "Advanced"},
    ]
    ranked = rank_projects(projects, freelancer_skills)
    assert ranked[0]["id"] == "p2"   # better match
    assert ranked[1]["id"] == "p1"


@pytest.mark.unit
def test_rank_projects_includes_engine_field():
    """Every ranked project must carry engine='rule-based'."""
    projects = [
        {"id": "p1", "title": "A", "description": "", "budget": 1000,
         "project_type": "Fixed price", "status": "open", "skills": ["React"]},
    ]
    ranked = rank_projects(projects, [{"name": "React", "level": "Advanced"}])
    assert ranked[0]["engine"] == "rule-based"


@pytest.mark.unit
def test_rank_projects_marks_saved_ids():
    """Projects in saved_ids list should have saved=True."""
    projects = [
        {"id": "p1", "title": "A", "description": "", "budget": 1000,
         "project_type": "Fixed price", "status": "open", "skills": []},
        {"id": "p2", "title": "B", "description": "", "budget": 1000,
         "project_type": "Fixed price", "status": "open", "skills": []},
    ]
    ranked = rank_projects(projects, [], saved_ids=["p1"])
    saved_map = {r["id"]: r["saved"] for r in ranked}
    assert saved_map["p1"] is True
    assert saved_map["p2"] is False
