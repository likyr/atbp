const userIdInput = document.getElementById("userId");
const durationSelect = document.getElementById("duration");
const extendBtn = document.getElementById("extendBtn");
const resultDiv = document.getElementById("result");

extendBtn.addEventListener("click", async () => {
  const userId = userIdInput.value.trim();
  const duration = Number(durationSelect.value);

  resultDiv.textContent = "";
  resultDiv.className = "result";

  if (!userId) {
    resultDiv.textContent = "Введите ID пользователя";
    resultDiv.classList.add("error");
    return;
  }

  try {
    const response = await fetch("/api/subscription/extend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: userId,
        duration_months: duration
      })
    });

    const data = await response.json();

    if (!response.ok) {
      resultDiv.textContent = data.detail || "Ошибка";
      resultDiv.classList.add("error");
      return;
    }

    resultDiv.textContent = `Новая дата окончания подписки: ${data.end_date}`;
    resultDiv.classList.add("success");
  } catch (error) {
    resultDiv.textContent = "Ошибка соединения с сервером";
    resultDiv.classList.add("error");
  }
});