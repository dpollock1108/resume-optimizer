import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from google.api_core.exceptions import PermissionDenied

import main
import rate_limit


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(main.app)

    def test_health_check(self):
        response = self.client.get("/healthz")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_production_api_rejects_missing_iap_token(self):
        with patch.dict(
            os.environ,
            {"APP_ENV": "production", "IAP_AUDIENCE": "test-audience"},
        ):
            response = self.client.get("/api/me")
        self.assertEqual(response.status_code, 401)

    def test_analysis_validates_request_size_before_calling_ai(self):
        response = self.client.post(
            "/api/analyze",
            json={"resume": "", "job_posting": ""},
        )
        self.assertEqual(response.status_code, 422)

    def test_database_errors_are_safe_for_clients(self):
        with patch.object(
            main,
            "ensure_user",
            side_effect=PermissionDenied("internal database detail"),
        ):
            response = self.client.get("/api/profiles")
        self.assertEqual(response.status_code, 503)
        self.assertNotIn("internal database detail", response.text)


class RateLimitTests(unittest.TestCase):
    def setUp(self):
        rate_limit._requests.clear()

    def test_rate_limit_is_per_user(self):
        with patch.dict(os.environ, {"AI_REQUESTS_PER_HOUR": "1"}):
            rate_limit.enforce_ai_rate_limit("first-user")
            rate_limit.enforce_ai_rate_limit("second-user")
            with self.assertRaisesRegex(Exception, "Hourly AI request limit"):
                rate_limit.enforce_ai_rate_limit("first-user")


if __name__ == "__main__":
    unittest.main()
