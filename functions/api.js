export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (url.searchParams.get("action") === "upload" && request.method === "POST") {
    try {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file) return new Response("No file provided", { status: 400, headers: corsHeaders });

      const fileName = `${Date.now()}-${file.name}`;
      await env.SHINE_MEDIA.put(fileName, file.stream(), {
        httpMetadata: { contentType: file.type }
      });

      const publicUrl = `https://pub-66982f7d56c64e21bf92f50ad81c0.r2.dev/${fileName}`;
      return new Response(JSON.stringify({ url: publicUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(e.message, { status: 500, headers: corsHeaders });
    }
  }

  if (url.searchParams.get("action") === "messages" && request.method === "POST") {
    try {
      const { username, message, media_url, batch_id, receiver_user } = await request.json();
      const receiver = receiver_user || "owner";
      
      await env.DB.prepare(
        "INSERT INTO chat_messages (sender, receiver, message, is_read, batch_id, media_url) VALUES (?, ?, ?, 0, ?, ?)"
      ).bind(username, receiver, message, batch_id || null, media_url || null).run();
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(e.message, { status: 500, headers: corsHeaders });
    }
  }

  return new Response("Not Found", { status: 404, headers: corsHeaders });
                  }
