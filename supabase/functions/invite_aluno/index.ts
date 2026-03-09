import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 2000;

async function inviteWithRetry(adminClient: any, email: string) {
  let lastError: any = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: "https://muvtrainer.com",
        data: { invited_as: "aluno" },
      }
    );

    if (!error) {
      return { data, error: null };
    }

    lastError = error;

    // Only retry on rate limit errors
    if (error.status === 429 || error.message?.includes("rate limit")) {
      const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
      console.warn(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    // Non-rate-limit error, don't retry
    return { data: null, error };
  }

  return { data: null, error: lastError };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    let emailSent = false;

    if (existingUser) {
      userId = existingUser.id;
      console.log("User already exists, linking to aluno:", userId);
    } else {
      // Invite with retry + backoff
      const { data: inviteData, error: inviteError } = await inviteWithRetry(adminClient, email);

      if (inviteError) {
        console.error("Invite error after retries:", inviteError);

        // Even if invite fails, try to create user without email
        const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
          email,
          email_confirm: false,
          user_metadata: { invited_as: "aluno" },
        });

        if (createError) {
          return new Response(
            JSON.stringify({
              error: `Não foi possível convidar o aluno. ${inviteError.message}`,
              rateLimited: true,
            }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        userId = createData.user.id;
        console.log("User created without email (rate limited):", userId);
      } else {
        userId = inviteData.user.id;
        emailSent = true;
        console.log("User invited successfully:", userId);
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
      JSON.stringify({
        success: true,
        userId,
        emailSent,
        isExisting: !!existingUser,
      }),
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
