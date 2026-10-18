const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ==========================================
// এখানে আপনার তথ্যগুলো বসান
// ==========================================
const OLD_SUPABASE_URL = 'https://uewgiojdjzwwtdwijvaf.supabase.co'; // আপনার পুরনো URL
const OLD_SERVICE_ROLE_KEY = 'এখানে_পুরনো_সাইটের_service_role_key_বসান';

const NEW_SUPABASE_URL = 'https://pojqezagkybsbxieukif.supabase.co'; // আপনার নতুন URL
const NEW_SERVICE_ROLE_KEY = 'এখানে_নতুন_সাইটের_service_role_key_বসান';

const BUCKET_NAME = 'product-images';

// ক্লায়েন্ট তৈরি
const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SERVICE_ROLE_KEY);
const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SERVICE_ROLE_KEY);

async function migrate() {
  console.log('Fetching file list from old bucket...');
  
  // পুরনো বাকেট থেকে সব ফাইলের লিস্ট আনা
  const { data: files, error: listError } = await oldSupabase.storage.from(BUCKET_NAME).list('', {
    limit: 1000,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });

  if (listError) {
    console.error('Error fetching list:', listError);
    return;
  }

  // ফোল্ডারগুলোর ভেতরের ফাইল খোঁজা
  let allFiles = [];
  for (const item of files) {
    if (item.id === null) { // এটি একটি ফোল্ডার
      const { data: subFiles } = await oldSupabase.storage.from(BUCKET_NAME).list(item.name, { limit: 100 });
      if (subFiles) {
        subFiles.forEach(subFile => {
          if (subFile.id !== null) {
            allFiles.push(`${item.name}/${subFile.name}`);
          }
        });
      }
    } else {
      allFiles.push(item.name);
    }
  }

  console.log(`Total files found: ${allFiles.length}. Starting migration...`);

  // প্রতিটি ফাইল ডাউনলোড এবং নতুন সাইটে আপলোড
  for (let i = 0; i < allFiles.length; i++) {
    const filePath = allFiles[i];
    process.stdout.write(`Migrating (${i + 1}/${allFiles.length}): ${filePath} ... `);

    // ১. ডাউনলোড
    const { data: fileData, error: downloadError } = await oldSupabase.storage.from(BUCKET_NAME).download(filePath);
    
    if (downloadError) {
      console.log(`❌ Download failed.`);
      continue;
    }

    // ২. আপলোড
    const buffer = Buffer.from(await fileData.arrayBuffer());
    const { error: uploadError } = await newSupabase.storage.from(BUCKET_NAME).upload(filePath, buffer, {
      contentType: fileData.type,
      upsert: true
    });

    if (uploadError) {
      console.log(`❌ Upload failed: ${uploadError.message}`);
    } else {
      console.log(`✅ Success`);
    }
  }
  console.log('Migration completed!');
}

migrate();