-- Fix existing media URLs that are missing the https:// protocol
UPDATE media 
SET b2_file_url = 'https://' || b2_file_url 
WHERE b2_file_url NOT LIKE 'https://%' AND b2_file_url NOT LIKE 'http://%';