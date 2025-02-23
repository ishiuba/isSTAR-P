import unittest
from myapp.app import app


class TestApp(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_home_status_code(self):
        result = self.app.get("/")
        self.assertEqual(result.status_code, 200)

    def test_streaming_status_code(self):
        result = self.app.get("/streaming")
        self.assertEqual(result.status_code, 200)

    def test_about_status_code(self):
        result = self.app.get("/about")
        self.assertEqual(result.status_code, 200)

    def test_invalid_route(self):
        result = self.app.get("/invalid")
        self.assertEqual(result.status_code, 404)

    def test_health_check(self):
        result = self.app.get("/health")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json, {"status": "healthy"})
