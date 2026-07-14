export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS, PUT",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    try {
      if (!action) {
        return new Response("Chat API Active 🟢", { headers: corsHeaders });
      }

      // ၁။ Chat History ယူခြင်း
      if (action === "get_messages") {
        const targetUser = url.searchParams.get("user") || "user";
        const { results } = await env.DB.prepare(`
          SELECT sender, receiver, message, media_url, batch_id, 
                 strftime('%H:%M', created_at, 'localtime') as time 
          FROM chat_messages 
          WHERE (sender = ? AND receiver = 'owner') OR (sender = 'owner' AND receiver = ?)
          ORDER BY id ASC
        `).bind(targetUser, targetUser).all();
        return new Response(JSON.stringify(results), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      // ၂။ စာတိုများ သိမ်းဆည်းခြင်း
      if (action === "messages" && request.method === "POST") {
        const data = await request.json();
        await env.DB.prepare(`
          INSERT INTO chat_messages (sender, receiver, message, media_url, batch_id) 
          VALUES (?, ?, ?, ?, ?)
        `).bind(data.username || "user", data.receiver_user || "owner", data.message || "", data.media_url || "", data.batch_id || "").run();
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      // ၃။ ပုံကို R2 ထဲသိမ်းပြီး VPN Free Link ထုတ်ပေးခြင်း
      if (action === "upload" && request.method === "POST") {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) return new Response(JSON.stringify({ error: "No file" }), { status: 400, headers: corsHeaders });

        const fileExtension = file.name.split('.').pop();
        const fileName = `media_${Date.now()}.${fileExtension}`;
        await env.R2.put(fileName, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });

        // VPN လုံးဝမလိုဘဲ ပွင့်မည့် R2 Custom Domain လင့်ခ်
        const publicUrl = `https://media.shinedigitalstore.com/${fileName}`;
        return new Response(JSON.stringify({ url: publicUrl }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
  }
};
