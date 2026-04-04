"""Go-live matrix structure (commercial blocking)."""
from app.config import get_settings
from app.services.go_live_matrix import build_matrix_report, build_check_definitions


def test_matrix_has_blocking_and_optional():
    defs = build_check_definitions()
    blocking = [d for d in defs if d.blocking]
    optional = [d for d in defs if not d.blocking]
    assert len(blocking) >= 10
    assert len(optional) >= 1


def test_matrix_report_includes_categories():
    r = build_matrix_report(get_settings())
    assert "categories" in r
    assert "checks" in r
    assert "secret_key" in r["checks"]
    assert r["blocking"]["total"] > 0
    assert "launch_allowed" in r
