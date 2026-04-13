from behave import given, when, then
from fastapi.testclient import TestClient
import main

client = TestClient(main.app)


@given("the service is available")
def step_service_available(context):
    response = client.get("/status")
    context.response = response
    assert response.status_code == 200


@when('I request last payment for "{user_id}"')
def step_request_last_payment(context, user_id):
    response = client.get(f"/api/payments/last-transaction/{user_id}")
    context.response = response
    context.user_id = user_id


@when('I send extension request for "{user_id}" with date "{start_date}" and duration {duration:d}')
def step_send_extension_request(context, user_id, start_date, duration):
    context.user_id = user_id

    if user_id in main.payments_db:
        main.payments_db[user_id]["date"] = start_date

    response = client.post(
        "/api/subscription/extend",
        json={
            "user_id": user_id,
            "duration_months": duration
        }
    )
    context.response = response


@then('the response status should be {status_code:d}')
def step_check_status(context, status_code):
    assert context.response.status_code == status_code, context.response.text


@then('the end date should be "{expected_end_date}"')
def step_check_end_date(context, expected_end_date):
    data = context.response.json()
    assert data["end_date"] == expected_end_date, f'should be "{expected_end_date}"'


@then('status response should contain service "{service_name}" and version "{version}"')
def step_check_status_metadata(context, service_name, version):
    data = context.response.json()
    assert data["status"] == "ok"
    assert data["service"] == service_name
    assert data["version"] == version