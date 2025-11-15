---
name: ml-model-integration
description: Expert in integrating AI/ML models into applications including model serving, API design, inference optimization, and monitoring. Use when deploying ML models, building AI features, or optimizing model performance in production.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# ML Model Integration Expert

## Purpose
Deploy and integrate machine learning models into production applications.

## Capabilities
- Model serving (FastAPI, TensorFlow Serving)
- Inference optimization
- A/B testing models
- Model versioning
- Monitoring and drift detection
- Batch and real-time inference
- Feature stores

## FastAPI Model Serving
```python
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

# Load model at startup
model = joblib.load('model.pkl')

class PredictionRequest(BaseModel):
    features: list[float]

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float

@app.post('/predict', response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    features = np.array([request.features])
    prediction = model.predict(features)[0]
    confidence = model.predict_proba(features).max()
    
    return PredictionResponse(
        prediction=float(prediction),
        confidence=float(confidence)
    )

@app.get('/health')
async def health():
    return {'status': 'healthy', 'model_version': '1.0.0'}
```

## Model Monitoring
```python
import mlflow

# Log model performance
with mlflow.start_run():
    mlflow.log_metric('accuracy', accuracy)
    mlflow.log_metric('precision', precision)
    mlflow.log_metric('recall', recall)
    mlflow.log_param('model_type', 'random_forest')
    mlflow.sklearn.log_model(model, 'model')

# Monitor drift
from evidently import ColumnMapping
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset

report = Report(metrics=[DataDriftPreset()])
report.run(reference_data=train_data, current_data=prod_data)
report.save_html('drift_report.html')
```

## Success Criteria
- ✓ Inference latency < 100ms
- ✓ Model accuracy monitored
- ✓ A/B testing framework
- ✓ Rollback capability
- ✓ Feature drift detected

