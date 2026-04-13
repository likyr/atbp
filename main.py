from fastapi import FastAPI, HTTPException, Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from datetime import date
import calendar

app = FastAPI(title="Subscription API")

payments_db = {
    "user1": {"date": "2024-03-15", "status": "OK"},
    "user2": {"date": "2024-01-31", "status": "OK"},
    "user3": {"date": "2024-03-15", "status": "Declined"},
}

ALLOWED_DURATIONS = {1, 3, 6, 12}


def calc_end_date(start_date: date, duration: int) -> date:
    if duration not in ALLOWED_DURATIONS:
        raise ValueError("Тариф должен быть 1, 3, 6 или 12 месяцев")

    new_month = start_date.month + duration
    new_year = start_date.year + (new_month - 1) // 12
    new_month = (new_month - 1) % 12 + 1
    last_day = calendar.monthrange(new_year, new_month)[1]

    return date(new_year, new_month, min(start_date.day, last_day))


class ExtendRequest(BaseModel):
    user_id: str
    duration_months: int


@app.get("/status")
def status():
    return {"status": "ok"}


@app.get("/api/payments/last-transaction/{user_id}")
def get_last_payment(user_id: str = Path(...)):
    payment = payments_db.get(user_id)

    if not payment:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    return {
        "user_id": user_id,
        "last_payment_date": payment["date"],
        "status": payment["status"]
    }


@app.post("/api/subscription/extend")
def extend_subscription(req: ExtendRequest):
    payment = payments_db.get(req.user_id)

    if not payment:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if payment["status"] != "OK":
        raise HTTPException(
            status_code=400,
            detail="Продление недоступно: статус платежа Declined"
        )

    start_date = date.fromisoformat(payment["date"])

    try:
        end_date = calc_end_date(start_date, req.duration_months)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "user_id": req.user_id,
        "status": "OK",
        "tariff_months": req.duration_months,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat()
    }


app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def root():
    return FileResponse("static/index.html")