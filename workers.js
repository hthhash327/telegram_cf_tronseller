export default {
  async fetch(request, env) {
    const ADMIN_ID = 6837507882;
    const BOT_TOKEN = env.BOT_TOKEN;
    const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

    if (request.method !== "POST") {
      return new Response("ok");
    }

    const update = await request.json();
    const message = update.message;
    if (!message) return new Response("ok");

    const chatId = message.chat.id;
    const text = message.text;

    // 管理员通过 reply 回复用户
    if (chatId === ADMIN_ID && message.reply_to_message) {
      // 从被回复消息中提取用户ID（格式：[用户ID:xxx]）
      const replyText = message.reply_to_message.text || message.reply_to_message.caption || "";
      const match = replyText.match(/\[用户ID:(\d+)\]/);
      if (match) {
        const userId = match[1];
        await fetch(`${API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: userId,
            text: text,
          }),
        });
        // 给管理员确认
        await fetch(`${API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: ADMIN_ID,
            text: "✅ 消息已发送",
          }),
        });
      }
      return new Response("ok");
    }

    // 用户发送 /start
    if (text === "/start" && chatId !== ADMIN_ID) {
      await fetch(`${API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "你可以跟我通过这个机器人进行对话",
        }),
      });
      return new Response("ok");
    }

    // 用户发送消息，转发给管理员
    if (chatId !== ADMIN_ID && text) {
      const userName = message.from.first_name || "未知用户";
      const userHandle = message.from.username ? `@${message.from.username}` : "无用户名";
      await fetch(`${API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ADMIN_ID,
          text: `📩 来自 ${userName}（${userHandle}）的消息：\n\n${text}\n\n[用户ID:${chatId}]`,
        }),
      });
    }

    return new Response("ok");
  },
};