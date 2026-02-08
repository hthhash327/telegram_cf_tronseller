export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("ok")
    }

    const update = await request.json()
    const message = update.message
    if (!message) return new Response("ok")

    const chatId = message.chat.id
    const text = message.text

    if (text) {
      await fetch(
        `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "你刚才说的是：\n" + text
          })
        }
      )
    }

    return new Response("ok")
  }
}
