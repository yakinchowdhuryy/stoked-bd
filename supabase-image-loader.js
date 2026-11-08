export default function supabaseLoader({ src, width, quality }) {
  const projectId = 'pojqezagkybsbxieukif'; // নতুন সাইটের আইডি
  
  let imagePath = src;
  
  // যদি লিংক পুরনো সাইটের হয়, তবে শুধু path টুকু বের করব
  if (src.includes('/storage/v1/object/public/')) {
    imagePath = src.split('/storage/v1/object/public/')[1];
  }

  // Supabase-এর Image Transformation URL
  return `https://${projectId}.supabase.co/storage/v1/render/image/public/${imagePath}?width=${width}&quality=${quality || 75}`;
}