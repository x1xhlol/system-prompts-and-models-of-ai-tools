"""WS7: Saudi-sensitive proposal send — PDPL + OWASP fields when external contacts."""

import pytest
from pydantic import ValidationError

from app.api.v1.proposals import SendRequest


def test_send_request_allows_without_external_contacts():
    s = SendRequest(channel="email", recipient="x@example.com")
    assert s.external_company_contacts is False


def test_send_request_rejects_external_contacts_without_pdpl():
    with pytest.raises(ValidationError, match="pdpl_processing_class"):
        SendRequest(
            channel="email",
            recipient="x@example.com",
            external_company_contacts=True,
            pdpl_processing_class=None,
            owasp_surface_ref="LLM01",
        )


def test_send_request_rejects_external_contacts_without_owasp():
    with pytest.raises(ValidationError, match="owasp_surface_ref"):
        SendRequest(
            channel="email",
            recipient="x@example.com",
            external_company_contacts=True,
            pdpl_processing_class="personal",
            owasp_surface_ref=None,
        )


def test_send_request_accepts_gated_fields():
    s = SendRequest(
        channel="email",
        recipient="x@example.com",
        external_company_contacts=True,
        pdpl_processing_class="sensitive",
        owasp_surface_ref="LLM01_prompt_injection",
        ecc_control_owner="security@example.com",
    )
    assert s.pdpl_processing_class == "sensitive"
