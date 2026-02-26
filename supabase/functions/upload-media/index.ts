import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;
    const guestId = formData.get('guestId') as string | null;

    if (!file || !eventId) {
      return new Response(JSON.stringify({
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Sanitize filename to remove spaces and special characters
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}-${sanitizedFileName}`;
    const fileBuffer = await file.arrayBuffer();

    // Get B2 credentials
    const b2ApplicationKeyId = Deno.env.get("B2_APPLICATION_KEY_ID");
    const b2ApplicationKey = Deno.env.get("B2_APPLICATION_KEY");
    const b2BucketName = Deno.env.get("B2_BUCKET_NAME");
    const b2Endpoint = Deno.env.get("B2_ENDPOINT");
    const b2DownloadUrl = Deno.env.get("B2_DOWNLOAD_URL");

    if (!b2ApplicationKeyId || !b2ApplicationKey || !b2BucketName || !b2Endpoint || !b2DownloadUrl) {
      throw new Error("Missing B2 environment variables");
    }

    console.log("Authenticating with B2...");

    // Authorize with B2
    const authResponse = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
      method: "GET",
      headers: {
        Authorization: "Basic " + btoa(`${b2ApplicationKeyId}:${b2ApplicationKey}`)
      }
    });

    if (!authResponse.ok) {
      throw new Error(`B2 auth failed: ${await authResponse.text()}`);
    }

    const authData = await authResponse.json();
    const { authorizationToken, apiUrl } = authData;

    // Get bucket ID
    let bucketId = authData.allowed?.bucketId;

    if (!bucketId) {
      const listBucketsResponse = await fetch(`${apiUrl}/b2api/v2/b2_list_buckets`, {
        method: "POST",
        headers: {
          Authorization: authorizationToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          accountId: authData.accountId
        })
      });

      if (!listBucketsResponse.ok) {
        throw new Error(`Failed to list buckets: ${await listBucketsResponse.text()}`);
      }

      const bucketList = await listBucketsResponse.json();
      const bucket = bucketList.buckets.find((b: any) => b.bucketName === b2BucketName);

      if (!bucket) {
        throw new Error(`Bucket "${b2BucketName}" not found`);
      }

      bucketId = bucket.bucketId;
    }

    console.log("Getting upload URL...");

    // Get upload URL
    const uploadUrlResponse = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: "POST",
      headers: {
        Authorization: authorizationToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        bucketId
      })
    });

    if (!uploadUrlResponse.ok) {
      throw new Error(`Failed to get upload URL: ${await uploadUrlResponse.text()}`);
    }

    const uploadData = await uploadUrlResponse.json();

    console.log("Uploading file to B2...");

    // URL encode the filename for B2
    const encodedFileName = encodeURIComponent(fileName);

    // Upload to B2
    const uploadResponse = await fetch(uploadData.uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': uploadData.authorizationToken,
        'X-Bz-File-Name': encodedFileName,
        'Content-Type': file.type,
        'X-Bz-Content-Sha1': 'do_not_verify'
      },
      body: fileBuffer
    });

    if (!uploadResponse.ok) {
      throw new Error(`B2 upload failed: ${await uploadResponse.text()}`);
    }

    const b2Response = await uploadResponse.json();

    console.log("Saving metadata to database...");

    // Construct the download URL using the public download endpoint
    const downloadUrl = `https://${b2DownloadUrl}/file/${b2BucketName}/${encodeURIComponent(fileName)}`;

    // Save metadata to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    const { data, error } = await supabase.from('media').insert({
      event_id: eventId,
      guest_id: guestId || null,
      file_name: fileName,
      file_size: file.size,
      mime_type: file.type,
      b2_file_id: b2Response.fileId,
      b2_file_url: downloadUrl
    }).select().single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log("Upload successful!");

    return new Response(JSON.stringify({
      success: true,
      media: data
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in upload-media:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
