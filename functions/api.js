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

    // 1️⃣ ဓာတ်ပုံ/ဗီဒီယို Upload တင်သည့်အပိုင်း
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

    // 2️⃣ မက်ဆေ့ခ်ျအသစ် ပို့ပြီး Database ထဲသိမ်းသည့်အပိုင်း
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

    // 3️⃣ မက်ဆေ့ခ်ျဟောင်းများ ပြန်ထုတ်ယူသည့်အပိုင်း (Get Messages)
    if (url.searchParams.get("action") === "get_messages") {
      try {
        const target_user = url.searchParams.get("user") || "user";
        
        // ဝယ်သူနှင့် ဆိုင်ရှင်ကြားက စာတွေကို အကုန်ထုတ်ယူခြင်း
        const { results } = await env.DB.prepare(
          "SELECT * FROM chat_messages WHERE (sender='owner' AND receiver=?) OR (sender=? AND receiver='owner') ORDER BY id ASC"
        ).bind(target_user, target_user).all();
        
        // Front-end ဘက်က နားလည်အောင် ပုံစံပြောင်းပေးခြင်း
        const formattedMessages = results.map(msg => ({
          sender: msg.sender,
          message: msg.message,
          media_url: msg.media_url,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        return new Response(JSON.stringify(formattedMessages), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(e.message, { status: 500, headers: corsHeaders });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};      const { username, message, media_url, batch_id, receiver_user } = await request.json();
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
