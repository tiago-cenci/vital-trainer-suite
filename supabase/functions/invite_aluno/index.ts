import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller with anon client
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: authError } = await anonClient.auth.getUser();
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, alunoId } = await req.json();
    if (!email || !alunoId) {
      return new Response(JSON.stringify({ error: "email and alunoId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client to create/invite user
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the aluno belongs to the caller
    const { data: aluno, error: alunoError } = await adminClient
      .from("alunos")
      .select("id, user_id")
      .eq("id", alunoId)
      .single();

    if (alunoError || !aluno || aluno.user_id !== caller.id) {
      return new Response(JSON.stringify({ error: "Aluno not found or unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase()
    );

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      console.log("User already exists, linking to aluno:", userId);
    } else {
      // Create user without sending email first, then send magic link
      const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
        email,
        email_confirm: false,
        user_metadata: { invited_as: "aluno" },
      });

      if (createError) {
        // If user already exists (race condition), find them
        if (createError.message?.includes("already been registered")) {
          const { data: users2 } = await adminClient.auth.admin.listUsers();
          const found = users2?.users?.find(
            (u: any) => u.email?.toLowerCase() === email.toLowerCase()
          );
          if (found) {
            userId = found.id;
          } else {
            return new Response(JSON.stringify({ error: createError.message }), {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } else {
          console.error("Create user error:", createError);
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        userId = createData.user.id;
      }

      // Send magic link (password recovery) so user can set password
      // This uses a separate rate limit from inviteUserByEmail
      try {
        const { error: resetError } = await adminClient.auth.admin.generateLink({
          type: "magiclink",
          email,
          options: { redirectTo: "https://muvtrainer.com" },
        });
        if (resetError) {
          console.warn("Magic link error (non-fatal):", resetError.message);
        } else {
          console.log("Magic link generated for:", email);
        }
      } catch (e) {
        console.warn("Magic link send failed (non-fatal):", e);
      }
    }

    // Link the auth user to the aluno record
    const { error: updateError } = await adminClient
      .from("alunos")
      .update({ aluno_user_id: userId })
      .eq("id", alunoId);

    if (updateError) {
      console.error("Update aluno error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to link user to aluno" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, userId, isExisting: !!existingUser }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
