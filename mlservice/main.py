import os
import numpy as np
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
from jose import jwt, JWTError

app = FastAPI(title="ML Service")
JWT_SECRET = os.getenv("JWT_SECRET", "")

def verify_subscription(authorization: str) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization 헤더가 없습니다.")
    token = authorization[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Access Token만 사용 가능합니다.")
        if payload.get("subscYn", 0) != 1:
            raise HTTPException(status_code=403, detail="구독자만 서버 ML을 사용할 수 있습니다.")
        return int(payload["sub"])
    except JWTError:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")

class LstmRequest(BaseModel):
    data: List[float]
    window_size: int = 10
    neurons: int = 64
    epochs: int = 50
    batch_size: int = 32
    learning_rate: float = 0.001
    optimizer: str = "adam"
    test_ratio: float = 0.2   # 검증 세트 비율

class RfRequest(BaseModel):
    data: List[float]
    window_size: int = 10
    n_estimators: int = 100
    max_depth: Optional[int] = 10
    min_samples_split: int = 2
    criterion: str = "squared_error"
    test_ratio: float = 0.2

class PredictionRow(BaseModel):
    index: int
    actual: float
    predicted: float
    diff: float          # 예측 오차
    diff_pct: float      # 오차율(%)
    direction_ok: bool   # 방향 일치 여부 (상승/하락)

class MlResponse(BaseModel):
    # 학습 결과
    train_loss_history: List[float]
    train_final_loss: float

    # 검증 세트 결과
    test_predictions: List[PredictionRow]  # 정확한 예측값 목록
    test_mse: float
    test_mae: float
    test_rmse: float
    direction_accuracy: float   # 방향 정확도(%)
    accuracy: Optional[float]   # 전체 추정 정확도

    # 차트용
    train_chart: List[dict]     # 학습 세트 actual vs predicted
    test_chart:  List[dict]     # 검증 세트 actual vs predicted


@app.post("/api/ml/lstm", response_model=MlResponse)
async def run_lstm(req: LstmRequest, authorization: str = Header(None)):
    verify_subscription(authorization)
    import tensorflow as tf

    data = np.array(req.data, dtype=np.float32)
    if len(data) < req.window_size + 10:
        raise HTTPException(status_code=400, detail="데이터가 부족합니다.")

    # 정규화
    d_min, d_max = data.min(), data.max()
    scale = d_max - d_min if d_max != d_min else 1.0
    scaled = (data - d_min) / scale

    # 윈도우 슬라이딩
    xs, ys = [], []
    for i in range(len(scaled) - req.window_size):
        xs.append(scaled[i:i + req.window_size].reshape(-1, 1))
        ys.append(scaled[i + req.window_size])
    xs, ys = np.array(xs), np.array(ys)

    # Train / Test 분리
    split = int(len(xs) * (1 - req.test_ratio))
    X_train, X_test = xs[:split], xs[split:]
    y_train, y_test = ys[:split], ys[split:]

    # 모델
    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(req.neurons, input_shape=(req.window_size, 1)),
        tf.keras.layers.Dense(1)
    ])
    opt = tf.keras.optimizers.Adam(req.learning_rate) if req.optimizer.lower() == "adam" \
          else tf.keras.optimizers.SGD(req.learning_rate)
    model.compile(optimizer=opt, loss="mse")

    loss_history = []
    class LossCallback(tf.keras.callbacks.Callback):
        def on_epoch_end(self, epoch, logs=None):
            loss_history.append(float(logs.get("loss", 0)))

    model.fit(X_train, y_train, epochs=req.epochs,
              batch_size=req.batch_size, verbose=0, callbacks=[LossCallback()])

    # 학습 세트 예측
    train_preds_s = model.predict(X_train, verbose=0).flatten()
    train_preds   = train_preds_s * scale + d_min
    train_actual  = y_train * scale + d_min

    # 검증 세트 예측
    test_preds_s = model.predict(X_test, verbose=0).flatten()
    test_preds   = test_preds_s * scale + d_min
    test_actual  = y_test * scale + d_min

    # 검증 지표
    test_mse  = float(np.mean((test_actual - test_preds) ** 2))
    test_mae  = float(np.mean(np.abs(test_actual - test_preds)))
    test_rmse = float(np.sqrt(test_mse))

    # 방향 정확도: 실제 변화 방향 vs 예측 변화 방향
    actual_dir = np.diff(test_actual) > 0
    pred_dir   = np.diff(test_preds)  > 0
    dir_acc    = float(np.mean(actual_dir == pred_dir) * 100) if len(actual_dir) > 0 else 0.0

    accuracy = max(0.0, 1.0 - test_rmse / (d_max - d_min + 1e-9)) * 100

    # 정확한 예측값 목록 (검증 세트 전체)
    pred_rows = []
    for i in range(len(test_actual)):
        act = round(float(test_actual[i]), 2)
        prd = round(float(test_preds[i]),  2)
        diff = round(prd - act, 2)
        diff_pct = round(abs(diff) / (abs(act) + 1e-9) * 100, 2)
        dir_ok = False
        if i > 0:
            dir_ok = bool((test_actual[i] > test_actual[i-1]) == (test_preds[i] > test_preds[i-1]))
        pred_rows.append(PredictionRow(
            index=split + i,
            actual=act, predicted=prd,
            diff=diff, diff_pct=diff_pct, direction_ok=dir_ok
        ))

    return MlResponse(
        train_loss_history=loss_history,
        train_final_loss=loss_history[-1] if loss_history else 0.0,
        test_predictions=pred_rows,
        test_mse=round(test_mse, 6),
        test_mae=round(test_mae, 4),
        test_rmse=round(test_rmse, 4),
        direction_accuracy=round(dir_acc, 2),
        accuracy=round(accuracy, 2),
        train_chart=[{"index": i, "실제값": round(float(train_actual[i]),2), "예측값": round(float(train_preds[i]),2)} for i in range(len(train_actual))],
        test_chart= [{"index": split+i, "실제값": round(float(test_actual[i]),2), "예측값": round(float(test_preds[i]),2)} for i in range(len(test_actual))],
    )


@app.post("/api/ml/rf", response_model=MlResponse)
async def run_rf(req: RfRequest, authorization: str = Header(None)):
    verify_subscription(authorization)
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.metrics import mean_squared_error, mean_absolute_error

    data = np.array(req.data, dtype=np.float32)
    if len(data) < req.window_size + 10:
        raise HTTPException(status_code=400, detail="데이터가 부족합니다.")

    d_min, d_max = data.min(), data.max()
    scale = d_max - d_min if d_max != d_min else 1.0
    scaled = (data - d_min) / scale

    xs, ys = [], []
    for i in range(len(scaled) - req.window_size):
        xs.append(scaled[i:i + req.window_size])
        ys.append(scaled[i + req.window_size])
    xs, ys = np.array(xs), np.array(ys)

    split = int(len(xs) * (1 - req.test_ratio))
    X_train, X_test = xs[:split], xs[split:]
    y_train, y_test = ys[:split], ys[split:]

    model = RandomForestRegressor(
        n_estimators=req.n_estimators, max_depth=req.max_depth,
        min_samples_split=req.min_samples_split, criterion=req.criterion, n_jobs=-1
    )
    model.fit(X_train, y_train)

    train_preds_s = model.predict(X_train)
    test_preds_s  = model.predict(X_test)

    train_preds  = train_preds_s * scale + d_min
    test_preds   = test_preds_s  * scale + d_min
    train_actual = y_train * scale + d_min
    test_actual  = y_test  * scale + d_min

    test_mse  = float(mean_squared_error(test_actual, test_preds))
    test_mae  = float(mean_absolute_error(test_actual, test_preds))
    test_rmse = float(np.sqrt(test_mse))
    train_mse = float(mean_squared_error(train_actual, train_preds))

    actual_dir = np.diff(test_actual) > 0
    pred_dir   = np.diff(test_preds)  > 0
    dir_acc    = float(np.mean(actual_dir == pred_dir) * 100) if len(actual_dir) > 0 else 0.0

    accuracy = max(0.0, 1.0 - test_rmse / (d_max - d_min + 1e-9)) * 100

    pred_rows = []
    for i in range(len(test_actual)):
        act = round(float(test_actual[i]), 2)
        prd = round(float(test_preds[i]),  2)
        diff = round(prd - act, 2)
        diff_pct = round(abs(diff) / (abs(act) + 1e-9) * 100, 2)
        dir_ok = False
        if i > 0:
            dir_ok = bool((test_actual[i] > test_actual[i-1]) == (test_preds[i] > test_preds[i-1]))
        pred_rows.append(PredictionRow(
            index=split + i,
            actual=act, predicted=prd,
            diff=diff, diff_pct=diff_pct, direction_ok=dir_ok
        ))

    return MlResponse(
        train_loss_history=[train_mse],
        train_final_loss=train_mse,
        test_predictions=pred_rows,
        test_mse=round(test_mse, 6),
        test_mae=round(test_mae, 4),
        test_rmse=round(test_rmse, 4),
        direction_accuracy=round(dir_acc, 2),
        accuracy=round(accuracy, 2),
        train_chart=[{"index": i, "실제값": round(float(train_actual[i]),2), "예측값": round(float(train_preds[i]),2)} for i in range(len(train_actual))],
        test_chart= [{"index": split+i, "실제값": round(float(test_actual[i]),2), "예측값": round(float(test_preds[i]),2)} for i in range(len(test_actual))],
    )

@app.get("/health")
async def health():
    return {"status": "ok"}
