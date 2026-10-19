
from fastapi.testclient import TestClient

from predictive_maintenance_ml.api import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Predictive Maintenance API is running"


def test_predict_valid_input():
    response = client.post(
        "/predict",
        json={
            "Type": "M",
            "Air temperature [K]": 300.1,
            "Process temperature [K]": 310.0,
            "Rotational speed [rpm]": 1500,
            "Torque [Nm]": 40.0,
            "Tool wear [min]": 100,
        },
    )

    assert response.status_code == 200

    result = response.json()
    assert result["machine_failure"] in [0, 1]
    assert result["status"] in ["Failure risk detected", "No failure predicted"]
    assert 0 <= result["failure_probability"] <= 1


def test_predict_invalid_machine_type():
    response = client.post(
        "/predict",
        json={
            "Type": "Z",
            "Air temperature [K]": 300.1,
            "Process temperature [K]": 310.0,
            "Rotational speed [rpm]": 1500,
            "Torque [Nm]": 40.0,
            "Tool wear [min]": 100,
        },
    )

    assert response.status_code == 422
