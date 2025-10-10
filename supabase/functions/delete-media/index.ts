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
    const { eventId } = await req.json();

    if (!eventId) {
      return new Response(JSON.stringify({
        error: 'Missing eventId'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('Deleting media for event:', eventId);

    // Get B2 credentials
    const b2ApplicationKeyId = Deno.env.get("B2_APPLICATION_KEY_ID");
    const b2ApplicationKey = Deno.env.get("B2_APPLICATION_KEY");
    const b2BucketName = Deno.env.get("B2_BUCKET_NAME");

    if (!b2ApplicationKeyId || !b2ApplicationKey || !b2BucketName) {
      throw new Error("Missing B2 environment variables");
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all media for the event
    const { data: mediaFiles, error: fetchError } = await supabase
      .from('media')
      .select('*')
      .eq('event_id', eventId);

    if (fetchError) {
      console.error('Error fetching media:', fetchError);
      throw fetchError;
    }

    if (!mediaFiles || mediaFiles.length === 0) {
      console.log('No media files found for event');
      return new Response(JSON.stringify({
        success: true,
        message: 'No media files to delete'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log(`Found ${mediaFiles.length} media files to delete`);

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

    // Delete each file from B2
    let deletedCount = 0;
    for (const mediaFile of mediaFiles) {
      try {
        console.log(`Deleting file from B2: ${mediaFile.file_name} (${mediaFile.b2_file_id})`);
        
        const deleteResponse = await fetch(`${apiUrl}/b2api/v2/b2_delete_file_version`, {
          method: "POST",
          headers: {
            Authorization: authorizationToken,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fileName: mediaFile.file_name,
            fileId: mediaFile.b2_file_id
          })
        });

        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text();
          console.error(`Failed to delete file from B2: ${errorText}`);
          // Continue with other files even if one fails
        } else {
          deletedCount++;
        }
      } catch (error) {
        console.error(`Error deleting file ${mediaFile.file_name}:`, error);
        // Continue with other files
      }
    }

    console.log(`Deleted ${deletedCount} files from B2`);

    // Delete metadata from database
    const { error: deleteError } = await supabase
      .from('media')
      .delete()
      .eq('event_id', eventId);

    if (deleteError) {
      console.error('Error deleting media metadata:', deleteError);
      throw deleteError;
    }

    console.log('Successfully deleted all media metadata from database');

    return new Response(JSON.stringify({
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} files from storage and ${mediaFiles.length} records from database`
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in delete-media:', error);
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
