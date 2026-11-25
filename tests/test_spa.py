import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.app.api.routers.spa import FORM_ROUTES, router


def test_administration_url_serves_frontend():
    app = FastAPI()
    app.include_router(router)
    assert TestClient(app).get('/administracion').status_code == 200


@pytest.mark.parametrize("path", [f"/{module}/{form}" for module, forms in FORM_ROUTES.items() for form in forms])
def test_direct_form_urls_serve_frontend(path):
    app = FastAPI()
    app.include_router(router)
    response = TestClient(app).get(path)
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]


@pytest.mark.parametrize("path", ["/api/missing", "/calidad/missing", "/assets/missing.js"])
def test_unknown_urls_remain_404(path):
    app = FastAPI()
    app.include_router(router)
    assert TestClient(app).get(path).status_code == 404


@pytest.mark.parametrize('module,target', [('jarabe', 'jarabe'), ('sala-jarabe', 'jarabe'), ('agua', 'agua')])
def test_old_dashboard_urls_redirect_to_dashboard_module(module, target):
    app = FastAPI()
    app.include_router(router)
    response = TestClient(app).get(f'/{module}/dashboard', follow_redirects=False)
    assert response.status_code == 307
    assert response.headers['location'] == f'/dashboard/{target}'
