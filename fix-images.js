const { createClient } = require('@supabase/supabase-js');

// ==========================================
// ১. নতুন সাইটের তথ্য (তোর দেওয়া কী)
// ==========================================
const NEW_SUPABASE_URL = 'https://pojqezagkybsbxieukif.supabase.co';
const NEW_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvanFlemFna3lic2J4aWV1a2lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjMyNjg1MywiZXhwIjoyMTA3OTAyODUzfQ.0rckYWtFsFiqWhBstdk9z4xBxxUtaefW30FJS3nCr4s';

const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SERVICE_ROLE_KEY);
const BUCKET_NAME = 'product-images';

// ==========================================
// ২. তোর ফাইল থেকে সব লিংক
// ==========================================
const oldUrls = [
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/348678e0-9a53-4d95-9a60-d79d7a8caa76/0-1790875042788-img-3129.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/348678e0-9a53-4d95-9a60-d79d7a8caa76/1-1790875045140-img-3130.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/51a67516-87ca-4d22-b0b8-213d6e031769/1-1790874630309-img-3127.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/a83d6560-afc7-4e7d-8694-db5a0508e37a/1-1790875290905-img-3137.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/1adf936c-94c5-4bb9-ad1b-8fe9e32886d9/1-1790875834137-img-3142.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/1adf936c-94c5-4bb9-ad1b-8fe9e32886d9/2-1790875835783-img-3146.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/54adc951-4101-4cb0-8cc4-70e02a9217ef/0-1790876592634-img-3162.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/103b1bd9-2dc4-4df8-8e23-6cb592dc9166/0-1790876301096-img-3159.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/103b1bd9-2dc4-4df8-8e23-6cb592dc9166/1-1790876302521-img-3160.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/c222d3d1-8a65-4f79-8919-8e992c549b42/0-1790876114464-img-3147.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/c222d3d1-8a65-4f79-8919-8e992c549b42/1-1790876116262-img-3148.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/c222d3d1-8a65-4f79-8919-8e992c549b42/2-1790876117990-img-3149.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/c222d3d1-8a65-4f79-8919-8e992c549b42/3-1790876119643-img-3150.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/ebf5abd1-aa6d-413d-a8a8-f1a9f2e6b7ed/0-1792072444950-4ug34hvk-351e8bcc-da27-4977-8602-9abbf795535d.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/575dfe21-de86-4d2e-b824-855cf134882b/1-1790877365958-img-3184.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/575dfe21-de86-4d2e-b824-855cf134882b/2-1790877368011-img-3185.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/575dfe21-de86-4d2e-b824-855cf134882b/3-1790877369841-img-3186.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/5105b61e-a837-44e5-b7b3-ef9013a4c958/0-1791220207204-img-3345.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/5105b61e-a837-44e5-b7b3-ef9013a4c958/1-1791220209323-img-3346.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/a1f6ccbe-418e-4a4e-8e36-f1234066ea07/0-1791221051987-img-3366.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/a1f6ccbe-418e-4a4e-8e36-f1234066ea07/1-1791221053841-img-3367.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/a1f6ccbe-418e-4a4e-8e36-f1234066ea07/2-1791221055443-image.jpg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/94f30d80-dd52-499e-bf35-e6b572fcfb31/0-1791220690930-img-3356.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/94f30d80-dd52-499e-bf35-e6b572fcfb31/1-1791220693066-img-3360.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/301ebc61-aa84-452c-893f-bb11f9effbcf/0-1791221187743-img-3368.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/d2575698-7f4a-4c27-93ce-35098217bea8/0-1791220840627-img-3363.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/d2575698-7f4a-4c27-93ce-35098217bea8/1-1791220843389-img-3365.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/dbe4d39f-80d0-4f75-8ca9-a58f7f0cd60d/0-1791220391323-img-3347.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/dbe4d39f-80d0-4f75-8ca9-a58f7f0cd60d/1-1791220393574-img-3348.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/5d9ed466-50e0-4afd-a1f0-a614df51d545/0-1791220498364-img-3349.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/5d9ed466-50e0-4afd-a1f0-a614df51d545/1-1791220504449-img-3351.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/340a879d-c980-44ab-a872-5375775b87da/0-1790877531235-img-3189.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/340a879d-c980-44ab-a872-5375775b87da/1-1790877533895-img-3192.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/89389ec1-2c21-434b-935a-83b67a3febeb/0-1790877125320-img-3179.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/89389ec1-2c21-434b-935a-83b67a3febeb/1-1790877127497-img-3180.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/cfe9ec14-fb9f-4ee4-8cdf-a0aecc2bcaf9/0-1790876837990-img-3174.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/cfe9ec14-fb9f-4ee4-8cdf-a0aecc2bcaf9/1-1790876840199-img-3175.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/54adc951-4101-4cb0-8cc4-70e02a9217ef/1-1790876594579-img-3164.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/cf75c5b4-a525-4467-b7d5-0f2f1adc27a1/3-1791211862710-img-4299.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/cf75c5b4-a525-4467-b7d5-0f2f1adc27a1/0-1791211858309-img-4297.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/cf75c5b4-a525-4467-b7d5-0f2f1adc27a1/1-1791211859739-img-4298.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/cf75c5b4-a525-4467-b7d5-0f2f1adc27a1/4-1791211863856-img-4302.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/ebf5abd1-aa6d-413d-a8a8-f1a9f2e6b7ed/1-1792072446755-rxyej9in-img-2953.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/8b54a2b1-249d-44e5-8275-6593fd4abbea/1-1791221679723-img-3369.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/ef7879b3-74e9-46ea-ae7b-93e1cda25a44/0-1791395162736-img-3452.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/fe83b8a5-424f-4fca-afeb-3b829e1af561/0-1791224219654-img-3393.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/fe83b8a5-424f-4fca-afeb-3b829e1af561/1-1791224221499-img-3394.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/4d502ea2-3114-42b9-ba2e-56dc9dc96e4d/0-1791223400405-img-3389.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/4d502ea2-3114-42b9-ba2e-56dc9dc96e4d/1-1791223402255-img-3391.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/2f957001-413c-428f-bb02-73008f538e34/0-1791222069143-img-3382.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/2f957001-413c-428f-bb02-73008f538e34/1-1791222071295-img-3384.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/301ebc61-aa84-452c-893f-bb11f9effbcf/1-1791221189828-img-3369.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/8b54a2b1-249d-44e5-8275-6593fd4abbea/0-1791221678023-img-3368.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/8249ae22-5c9e-4138-a563-df09916a253e/0-1791221989580-img-3380.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/8249ae22-5c9e-4138-a563-df09916a253e/1-1791221991421-img-3381.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/61b3e049-f68a-4360-b1ef-e8861ba905ba/0-1791224290419-img-3398.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/61b3e049-f68a-4360-b1ef-e8861ba905ba/1-1791224291597-img-3399.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/9b717ab4-093a-4278-aa1f-f2bf1c3112de/0-1791221419489-img-3373.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/9b717ab4-093a-4278-aa1f-f2bf1c3112de/1-1791221422383-img-3375.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/cdbd86ce-4391-4f50-8123-0af2b1f41891/0-1791224099538-img-3400.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/cdbd86ce-4391-4f50-8123-0af2b1f41891/1-1791224101481-img-3402.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/2d9c4510-e05b-46d9-b337-b9d52ebf49e1/0-1791221698760-img-3376.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/2d9c4510-e05b-46d9-b337-b9d52ebf49e1/3-1791221700401-img-3377.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/d9bd0c43-3d3e-4742-9604-3806de8fa127/0-1791395212176-img-3453.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/e909db12-6198-46aa-be5f-b5f7a2184b79/0-1791395271622-img-3454.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/0bf0a5d9-81ce-4694-b17a-971847cd7774/0-1791395311152-img-3455.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/4c09f68e-f77d-4022-831f-9b6cd681b843/0-1791395334491-img-3455.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/1adf936c-94c5-4bb9-ad1b-8fe9e32886d9/0-1791449461897-f840f12e-99db-431e-b2d7-d9a233ab2749.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/1adf936c-94c5-4bb9-ad1b-8fe9e32886d9/3-1791449463526-img-3140.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/1adf936c-94c5-4bb9-ad1b-8fe9e32886d9/4-1791449465246-img-3142.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/1adf936c-94c5-4bb9-ad1b-8fe9e32886d9/5-1791449466065-img-3146.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/a83d6560-afc7-4e7d-8694-db5a0508e37a/0-1791449570033-4026a96c-aaa7-4b51-9fbe-5343bbc0ab78.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/a83d6560-afc7-4e7d-8694-db5a0508e37a/2-1791449571558-img-3131.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/a83d6560-afc7-4e7d-8694-db5a0508e37a/3-1791449572476-img-3137.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/348678e0-9a53-4d95-9a60-d79d7a8caa76/0-1792235904205-bl6yhuld-94ffec56-b3d3-4e1f-8a07-21253e5b64f0.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/575dfe21-de86-4d2e-b824-855cf134882b/0-1791449644231-84434d87-0223-4d14-b09f-0da4e20dd580.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/575dfe21-de86-4d2e-b824-855cf134882b/4-1791449645572-img-3183.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/575dfe21-de86-4d2e-b824-855cf134882b/5-1791449646822-img-3184.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/51a67516-87ca-4d22-b0b8-213d6e031769/0-1791449723693-a8fa793e-c691-4379-8b24-9c62d28d2d80.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/51a67516-87ca-4d22-b0b8-213d6e031769/2-1791449725058-img-3124.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/51a67516-87ca-4d22-b0b8-213d6e031769/3-1791449726143-img-3127.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/575dfe21-de86-4d2e-b824-855cf134882b/6-1791449764385-img-3437.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/575dfe21-de86-4d2e-b824-855cf134882b/7-1791449764993-img-3183.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/575dfe21-de86-4d2e-b824-855cf134882b/8-1791449766053-img-3184.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/575dfe21-de86-4d2e-b824-855cf134882b/9-1791449767348-img-3185.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/575dfe21-de86-4d2e-b824-855cf134882b/10-1791449768309-img-3186.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/575dfe21-de86-4d2e-b824-855cf134882b/11-1791449874460-img-3183.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/575dfe21-de86-4d2e-b824-855cf134882b/12-1791449876565-img-3184.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/575dfe21-de86-4d2e-b824-855cf134882b/13-1791449877900-img-3185.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/575dfe21-de86-4d2e-b824-855cf134882b/14-1791449879327-img-3186.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/eacf2c09-eeca-4e0c-b795-652918ae017f/0-1791562029702-sq1fzzp5-abb5b8f1-cbbe-4a6c-a41a-4263e7dcf7af.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/eacf2c09-eeca-4e0c-b795-652918ae017f/1-1791562032085-ta90or9q-img-3387.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/eacf2c09-eeca-4e0c-b795-652918ae017f/2-1791562033441-bvuygt6z-img-3388.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/91beb6b9-1a1d-4bc6-a4cc-c0b576064601/0-1791562110988-90j62c2x-de8fb020-b169-4a73-886c-6ba165453eeb.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/91beb6b9-1a1d-4bc6-a4cc-c0b576064601/1-1791562112695-7czz1yfj-img-3395.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/91beb6b9-1a1d-4bc6-a4cc-c0b576064601/2-1791562113822-iksldij2-img-3397.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/98f390cf-54b1-4356-8c7b-d9e964abfc03/0-1791562167444-n4sgp1pz-a77026f2-0e36-4426-901c-cc2451ccd6b9.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/98f390cf-54b1-4356-8c7b-d9e964abfc03/1-1791562168813-260i0kcu-img-3378.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/98f390cf-54b1-4356-8c7b-d9e964abfc03/2-1791562170160-duavrp7q-img-3379.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/3734c4a7-8a1b-428c-aa5a-bedc9f15d43b/0-1791562248102-glivlayj-d8d33134-292a-4f71-8f8f-23600772c1d4.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/3734c4a7-8a1b-428c-aa5a-bedc9f15d43b/1-1791562249658-z66el0su-img-3352.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/3734c4a7-8a1b-428c-aa5a-bedc9f15d43b/2-1791562251233-mz2b7nbg-img-3354.jpeg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/fe83b8a5-424f-4fca-afeb-3b829e1af561/0-1791563563344-vnaofxqe-2ed60fce-6969-4b85-a715-16febd97c1da.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/5105b61e-a837-44e5-b7b3-ef9013a4c958/0-1791563587145-or6cskj6-c9621d03-99ee-43e1-bf1c-905ec1f2edd9.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/4d502ea2-3114-42b9-ba2e-56dc9dc96e4d/0-1791563645877-fg0nb4bp-2f5bd2b8-a93f-412f-b5cb-bd0f71ba1324.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/2f957001-413c-428f-bb02-73008f538e34/0-1791563661650-bn35gp7f-90a054a1-81ce-4877-bb50-725d2db4f9cd.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/a1f6ccbe-418e-4a4e-8e36-f1234066ea07/0-1791563692739-0iykz643-5c07f7cb-da42-45ac-8b72-9e744097b352.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/94f30d80-dd52-499e-bf35-e6b572fcfb31/0-1791563712403-h0guzko1-752dd3f1-9515-4602-9140-75e8b8859bb1.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/301ebc61-aa84-452c-893f-bb11f9effbcf/0-1791563734937-t1cjnm6s-92b20d90-80bf-40aa-a6d5-c46258a044ae.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/8b54a2b1-249d-44e5-8275-6593fd4abbea/2-1791563764770-j3932c4v-92b20d90-80bf-40aa-a6d5-c46258a044ae.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/8249ae22-5c9e-4138-a563-df09916a253e/0-1791563827477-jghou7yu-a3f5c54e-1753-4aba-a6a4-da6b1b2ba6bb.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/d2575698-7f4a-4c27-93ce-35098217bea8/0-1791712419763-wvptm3yv-c53fc3f2-b804-43a0-afbe-6af229469e7b.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/61b3e049-f68a-4360-b1ef-e8861ba905ba/0-1791712452492-3apy8617-3dbffd9f-81f7-488a-8d1e-2680286a82f2.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/9b717ab4-093a-4278-aa1f-f2bf1c3112de/0-1791712480686-thxvbv8p-872e4cfd-b9bc-45db-b7af-001b5d8de087.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/cdbd86ce-4391-4f50-8123-0af2b1f41891/0-1791712522568-ta9rgzye-1c1044a2-dcbd-4904-8149-35b9068792ea.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/2d9c4510-e05b-46d9-b337-b9d52ebf49e1/0-1791712570965-w5we9hb4-097fc2fa-891e-4f6a-b47a-907ad66a9a79.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/dbe4d39f-80d0-4f75-8ca9-a58f7f0cd60d/0-1791712599879-bgpi107u-7ab26335-12be-4df5-9257-2da9d546184a.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/5d9ed466-50e0-4afd-a1f0-a614df51d545/0-1791712713809-ksilctg9-e23f53be-8929-4632-a21a-71313e825b2e.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/340a879d-c980-44ab-a872-5375775b87da/0-1791713218571-4y6g6kjn-39683fd1-8e31-4713-ab7d-60301875bfad.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/89389ec1-2c21-434b-935a-83b67a3febeb/0-1791713328859-c7ztc458-576da832-ffc2-4c7f-be2c-fd5407f806de.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/cfe9ec14-fb9f-4ee4-8cdf-a0aecc2bcaf9/0-1791713413543-fggm4m25-919cab76-bd26-442a-a342-2c2a4c62359a.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/c08121bc-8db0-4720-895b-056a9550ef72/2-1791833795502-lxikuu51-image.jpg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/434e09a3-460d-49c8-b9e8-47d5803dd4a4/0-1791834789746-ckrrptmh-1ac13114-c176-4d18-a8c9-331150946778.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/434e09a3-460d-49c8-b9e8-47d5803dd4a4/1-1791834791615-e688qcvd-9b5704e8-e36a-448c-abe0-cd669a31a178.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/c08121bc-8db0-4720-895b-056a9550ef72/0-1791836037590-pr14n6hy-whatsapp-image-2026-10-13-at-02.09.41--1-.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/c08121bc-8db0-4720-895b-056a9550ef72/3-1791833796733-uopjlg8p-image.jpg",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/c08121bc-8db0-4720-895b-056a9550ef72/3-1791836323700-n76oeyse-1338bef3-5139-436a-b2f6-83b3594f17a1.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/54adc951-4101-4cb0-8cc4-70e02a9217ef/0-1791995398493-psip6wgl-eb6b3263-18e2-4eca-8c41-887498b9fad3.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/103b1bd9-2dc4-4df8-8e23-6cb592dc9166/0-1792002271894-1n1r12nc-526e7419-edc3-4f91-a9b3-132b4669abfb.png",
  "https://uewgiojdjzwwtdwijvaf.supabase.co/storage/v1/object/public/product-images/c222d3d1-8a65-4f79-8919-8e992c549b42/0-1792002299726-fijwerjs-8bf42e86-89be-4cf4-bc84-d01c51ee7b76.png"
];

// ==========================================
// ৩. ডাউনলোড এবং আপলোড লজিক
// ==========================================
async function migrateImages() {
  console.log(`Total ${oldUrls.length} images found. Migration starting...\n`);
  let successCount = 0;

  for (let i = 0; i < oldUrls.length; i++) {
    const url = oldUrls[i];
    // পুরনো সাইটের লিংক থেকে শুধু ফোল্ডার/ফাইলের নাম বের করা
    const filePath = url.split('/product-images/')[1];
    
    process.stdout.write(`[${i + 1}/${oldUrls.length}] Processing: ${filePath} ... `);

    try {
      // ১. পুরনো সাইট থেকে ছবি ডাউনলোড
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // ফাইলের এক্সটেনশন/টাইপ বের করা
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      // ২. নতুন সাইটে আপলোড
      const { error: uploadError } = await newSupabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
          contentType: contentType,
          upsert: true // আগে থাকলে ওভাররাইট করবে
        });

      if (uploadError) {
        console.log(`❌ Upload failed: ${uploadError.message}`);
      } else {
        console.log(`✅ Success`);
        successCount++;
      }

    } catch (err) {
      console.log(`❌ Download failed: ${err.message}`);
    }
  }
  
  console.log(`\n🎉 Migration completed! ${successCount}/${oldUrls.length} images uploaded successfully.`);
}

migrateImages();