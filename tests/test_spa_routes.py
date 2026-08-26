"""SPA routes must serve the built React app (or the fallback hint)."""

import os
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
DIST_INDEX = REPO_ROOT / "frontend" / "dist" / "index.html"

SPA_ROUTES = ["/", "/calidad", "/jarabe", "/preparacion-jarabe", "/produccion-jarabe", "/portal", "/dashboard"]


@pytest.mark.parametrize("route", SPA_ROUTES)
def test_spa_route_serves_html(client, route):
    resp = client.get(route)
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/html")
    body = resp.text

    if DIST_INDEX.exists():
        # Built app served from frontend/dist
        assert '<div id="root">' in body
    else:
        # Fallback hint when the frontend has not been built
        assert "Frontend React no compilado" in body


def test_all_routes_agree_with_dist_state(client):
    """All routes behave consistently: either all serve dist or all the hint."""
    for route in SPA_ROUTES:
        body = client.get(route).text
        if DIST_INDEX.exists():
            assert '<div id="root">' in body, route
        else:
            assert "Frontend React no compilado" in body, route
