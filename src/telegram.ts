import { config } from "./config";

export async function sendTelegram(message: string): Promise<void> {
  const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.telegramChatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Gagal kirim ke Telegram (${res.status}):`, body);
    }
  } catch (error) {
    console.error("Error saat kirim Telegram:", error);
  }
}
