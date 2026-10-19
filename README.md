# Predictive Maintenance System

A machine learning project that predicts potential machine failures from equipment operating conditions. Built with Python, scikit-learn, FastAPI, SQLite, and Docker.

## Features

- Trains a Random Forest classifier using the AI4I 2020 Predictive Maintenance dataset.
- Preprocesses categorical and numerical features using a scikit-learn pipeline.
- Evaluates model performance against a dummy baseline.
- Exposes predictions through a REST API built with FastAPI.
- Stores prediction history in SQLite.
- Includes API tests using pytest.
- Supports containerized execution with Docker.

## Tech Stack

- **Language:** Python
- **Machine Learning:** pandas, scikit-learn
- **API:** FastAPI, Uvicorn, Pydantic
- **Database:** SQLite, SQLAlchemy
- **Testing:** pytest, HTTPX
- **Environment Management:** uv
- **Containerization:** Docker

## Input Features

The model uses six features:

- Machine type (`L`, `M`, or `H`)
- Air temperature
- Process temperature
- Rotational speed
- Torque
- Tool wear

The target is `Machine failure`. Failure-mode columns are excluded from the input features to prevent data leakage.

## Model Evaluation

The Random Forest model achieved the following results on the held-out test set:

| Metric                    | Result |
| ------------------------- | -----: |
| Accuracy                  | 98.15% |
| Precision — failure class |    75% |
| Recall — failure class    |    68% |
| F1-score — failure class  |    71% |

The dataset is imbalanced, so accuracy alone is insufficient. Failure-class precision and recall are also evaluated. The model is a portfolio demonstration and should not be used for real industrial safety decisions without further validation.

## Run Locally

### Requirements

- Python compatible with the project configuration
- uv

Install dependencies:

```powershell
uv sync
```

Start the API:

```powershell
uv run uvicorn predictive_maintenance_ml.api:app --reload --app-dir src
```

Open the interactive API documentation:

http://127.0.0.1:8000/docs

## API Endpoints

| Method | Endpoint   | Purpose                     |
| ------ | ---------- | --------------------------- |
| GET    | `/`        | Check API status            |
| POST   | `/predict` | Predict machine failure     |
| GET    | `/history` | Retrieve stored predictions |

### Example Prediction Request

```json
{
  "Type": "L",
  "Air temperature [K]": 300.5,
  "Process temperature [K]": 310.5,
  "Rotational speed [rpm]": 1200,
  "Torque [Nm]": 60,
  "Tool wear [min]": 250
}
```

The response includes a prediction ID, failure classification, status, and estimated failure probability.

## Run with Docker

Build the image:

```powershell
docker build -t predictive-maintenance-api .
```

Run the container:

```powershell
docker run --rm -p 8000:8000 predictive-maintenance-api
```

Open http://localhost:8000/docs.

**Note:** The default Docker command stores SQLite data inside the container. Prediction history is not retained after the container is removed.

## Run Tests

```powershell
uv run pytest -v
```

## Project Structure

```text
predictive-maintenance-ml/
├── data/
│   └── raw/
├── models/
│   └── predictive_maintenance.joblib
├── notebooks/
│   └── exploratory_data_analysis.ipynb
├── src/
│   └── predictive_maintenance_ml/
│       ├── api.py
│       ├── database.py
│       └── models.py
├── tests/
│   └── test_api.py
├── Dockerfile
├── .dockerignore
├── pyproject.toml
├── uv.lock
└── README.md
```

## Dataset

AI4I 2020 Predictive Maintenance Dataset, available from the UCI Machine Learning Repository.

This project is intended for learning and portfolio demonstration.
