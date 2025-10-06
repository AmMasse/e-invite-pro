import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, contentType } = await req.json();

    if (!fileName || !contentType) {
      return new Response(
        JSON.stringify({ error: "fileName and contentType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 🔐 Environment variables
    const b2ApplicationKeyId = Deno.env.get("B2_APPLICATION_KEY_ID");
    const b2ApplicationKey = Deno.env.get("B2_APPLICATION_KEY");
    const b2BucketName = Deno.env.get("B2_BUCKET_NAME");
    const b2Endpoint = Deno.env.get("B2_ENDPOINT");

    if (!b2ApplicationKeyId || !b2ApplicationKey || !b2BucketName || !b2Endpoint) {
      throw new Error("Missing required Backblaze B2 environment variables");
    }

    console.log("Authenticating with Backblaze B2...");

    // Step 1: Authorize with B2
    const authResponse = await fetch(
      "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + btoa(`${b2ApplicationKeyId}:${b2ApplicationKey}`),
        },
      }
    );

    if (!authResponse.ok) {
      const error = await authResponse.text();
      console.error("B2 auth failed:", error);
      throw new Error(`Failed to authorize with B2: ${error}`);
    }

    const authData = await authResponse.json();
    const { authorizationToken, apiUrl } = authData;

    // 🪣 Step 2: Determine bucketId
    let bucketId = authData.allowed?.bucketId;

    if (!bucketId) {
      console.log(`Fetching bucket ID for bucket: ${b2BucketName}`);

      const listBucketsResponse = await fetch(`${apiUrl}/b2api/v2/b2_list_buckets`, {
        method: "POST",
        headers: {
          Authorization: authorizationToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: authData.accountId,
        }),
      });

      if (!listBucketsResponse.ok) {
        const error = await listBucketsResponse.text();
        console.error("Failed to list buckets:", error);
        throw new Error(`Could not fetch bucket ID: ${error}`);
      }

      const bucketList = await listBucketsResponse.json();
      const bucket = bucketList.buckets.find((b: any) => b.bucketName === b2BucketName);

      if (!bucket) {
        throw new Error(`Bucket with name "${b2BucketName}" not found`);
      }

      bucketId = bucket.bucketId;
    }

    console.log("Getting upload URL from B2...");

    // Step 3: Get upload URL
    const uploadUrlResponse = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: "POST",
      headers: {
        Authorization: authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bucketId }),
    });

    if (!uploadUrlResponse.ok) {
      const error = await uploadUrlResponse.text();
      console.error("Failed to get upload URL:", error);
      throw new Error(`Failed to get upload URL: ${error}`);
    }

    const uploadData = await uploadUrlResponse.json();

    console.log("✅ Upload URL generated successfully");

    // Step 4: Return upload info
    return new Response(
      JSON.stringify({
        uploadUrl: uploadData.uploadUrl,
        authorizationToken: uploadData.authorizationToken,
        fileName,
        b2FileUrl: `${b2Endpoint}/file/${b2BucketName}/${fileName}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-upload-url:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
