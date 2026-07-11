export default {
  async fetch(request, env, context) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 💡 [အရေးကြီးဆုံးပြင်ဆင်ချက်] ပုံမှန် Website အနေနဲ့ ဝင်လာရင် အောက်က HTML စာမျက်နှာကို ပြပေးမည်
    if (url.pathname === "/" && !url.searchParams.has("action")) {
      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Shine Digital Store</title>
          <style>
              body { font-family: Arial, sans-serif; text-align: center; background-color: #121212; color: white; padding: 50px; }
              h1 { color: #00ffcc; }
              .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #333; border-radius: 10px; background: #1e1e1e; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Welcome to Shine Digital Store</h1>
              <p>Your ultimate digital solutions and platform.</p>
              <small style="color: #888;">API Status: Active & Ready 🟢</small>
          </div>
      </body>
      </html>
      `;
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    try {
      // 1️⃣ ဓာတ်ပုံ Upload တင်သည့်အပိုင်း
      if (url.searchParams.get("action") === "upload" && request.method === "POST") {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) return new Response("No file", { status: 400, headers: corsHeaders });

        const fileName = `${Date.now()}-${file.name}`;
        await env.SHINE_MEDIA.put(fileName, file.stream(), {
          httpMetadata: { contentType: file.type }
        });

        const publicUrl = `https://pub-66982f7d56c64e21bf92f50ad81c0.r2.dev/${fileName}`;
        return new Response(JSON.stringify({ url: publicUrl }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 2️⃣ မက်ဆေ့ခ်ျအသစ် ပို့သည့်အပိုင်း
      if (url.searchParams.get("action") === "messages" && request.method === "POST") {
        const { username, message, media_url, batch_id, receiver_user } = await request.json();
        const receiver = receiver_user || "owner";
        
        await env.DB.prepare(
          "INSERT INTO chat_messages (sender, receiver, message, is_read, batch_id, media_url) VALUES (?, ?, ?, 0, ?, ?)"
        ).bind(username, receiver, message, batch_id || null, media_url || null).run();
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 3️⃣ မက်ဆေ့ခ်ျဟောင်းများ ပြန်ထုတ်ယူသည့်အပိုင်း
      if (url.searchParams.get("action") === "get_messages") {
        const target_user = url.searchParams.get("user") || "user";
        const { results } = await env.DB.prepare(
          "SELECT * FROM chat_messages WHERE (sender='owner' AND receiver=?) OR (sender=? AND receiver='owner') ORDER BY id ASC"
        ).bind(target_user, target_user).all();
        
        const formatted = results.map(msg => ({
          sender: msg.sender,
          message: msg.message,
          media_url: msg.media_url,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        return new Response(JSON.stringify(formatted), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (error) {
      return new Response(error.message, { status: 500, headers: corsHeaders });
    }
  }
};
