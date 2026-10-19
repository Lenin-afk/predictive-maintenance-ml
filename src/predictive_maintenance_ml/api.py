
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from predictive_maintenance_ml.database import Base, SessionLocal, engine
from predictive_maintenance_ml.models import PredictionRecord

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Predictive Maintenance API")

MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "models"
    / "predictive_maintenance.joblib"
)

model = joblib.load(MODEL_PATH)


class MachineData(BaseModel):
    Type: str = Field(pattern="^[LMH]$")
    air_temperature: float = Field(alias="Air temperature [K]")
    process_temperature: float = Field(alias="Process temperature [K]")
    rotational_speed: float = Field(alias="Rotational speed [rpm]")
    torque: float = Field(alias="Torque [Nm]")
    tool_wear: float = Field(alias="Tool wear [min]")


@app.get("/")
def root():
    return {"message": "Predictive Maintenance API is running"}


@app.post("/predict")
def predict(data: MachineData):
    features = pd.DataFrame([{
        "Type": data.Type,
        "Air temperature [K]": data.air_temperature,
        "Process temperature [K]": data.process_temperature,
        "Rotational speed [rpm]": data.rotational_speed,
        "Torque [Nm]": data.torque,
        "Tool wear [min]": data.tool_wear,
    }])

    prediction = int(model.predict(features)[0])
    probability = float(model.predict_proba(features)[0][1])

    record = PredictionRecord(
        machine_type=data.Type,
        air_temperature=data.air_temperature,
        process_temperature=data.process_temperature,
        rotational_speed=data.rotational_speed,
        torque=data.torque,
        tool_wear=data.tool_wear,
        machine_failure=prediction,
        failure_probability=probability,
    )

    with SessionLocal() as session:
        session.add(record)
        session.commit()
        session.refresh(record)
        record_id = record.id

    return {
        "id": record_id,
        "machine_failure": prediction,
        "status": (
            "Failure risk detected"
            if prediction == 1
            else "No failure predicted"
        ),
        "failure_probability": round(probability, 4),
    }


@app.get("/history")
def get_prediction_history():
    with SessionLocal() as session:
        records = (
            session.query(PredictionRecord)
            .order_by(PredictionRecord.id.desc())
            .all()
        )

        return [
            {
                "id": record.id,
                "machine_type": record.machine_type,
                "machine_failure": record.machine_failure,
                "failure_probability": round(
                    record.failure_probability, 4
                ),
                "created_at": record.created_at.isoformat()
                if record.created_at else None,
            }
            for record in records
        ]
