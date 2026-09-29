"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  quantity: number;
};

type DeliveryZone =
  | "inside-dhaka"
  | "sub-urban"
  | "outside-dhaka"
  | "";

type CustomerInfo = {
  name: string;
  phone: string;
  email: string;
  address: string;
  deliveryZone: DeliveryZone;
  district: string;
  thana: string;
};

const CART_KEY = "stoked-cart";

const SPIDER_IMAGE =
  "https://scontent.fdac5-2.fna.fbcdn.net/v/t1.15752-9/825309130_1563241724996165_990897618114404117_n.png?stp=dst-png_s960x960&_nc_cat=101&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=9f807c&_nc_ohc=jq1XOrX6tlUQ7kNvwFEQUB9&_nc_oc=AdpqFpc6mein9ETDVhyiS1f2iZM9qr-IUWI31CtQffkjMcuHVLMOTaAMCxv2kB2vWr4&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.fdac5-2.fna&_nc_ss=7a22e&oh=03_Q7cD6gFXbcr5ZmFULWMoEzYqAhj43DGf2gPyljrIPHYw9xyzQg&oe=6AE1DAAE";

const DELIVERY_CHARGES: Record<
  Exclude<DeliveryZone, "">,
  number
> = {
  "inside-dhaka": 80,
  "sub-urban": 110,
  "outside-dhaka": 150,
};

/*
  BUSINESS DELIVERY RULE

  Inside Dhaka:
  - Dhaka

  Sub-Urban:
  - Gazipur
  - Narayanganj
  - Narsingdi
  - Manikganj
  - Munshiganj

  Everything else:
  - Outside Dhaka
*/

const SUB_URBAN_DISTRICTS = [
  "Gazipur",
  "Narayanganj",
  "Narsingdi",
  "Manikganj",
  "Munshiganj",
];

const ALL_DISTRICTS = [
  "Bagerhat",
  "Bandarban",
  "Barguna",
  "Barishal",
  "Bhola",
  "Bogura",
  "Brahmanbaria",
  "Chandpur",
  "Chattogram",
  "Chuadanga",
  "Cox's Bazar",
  "Cumilla",
  "Dhaka",
  "Dinajpur",
  "Faridpur",
  "Feni",
  "Gaibandha",
  "Gazipur",
  "Gopalganj",
  "Habiganj",
  "Jamalpur",
  "Jashore",
  "Jhalokathi",
  "Jhenaidah",
  "Joypurhat",
  "Khagrachhari",
  "Khulna",
  "Kishoreganj",
  "Kurigram",
  "Kushtia",
  "Lakshmipur",
  "Lalmonirhat",
  "Madaripur",
  "Magura",
  "Manikganj",
  "Meherpur",
  "Moulvibazar",
  "Munshiganj",
  "Mymensingh",
  "Naogaon",
  "Narail",
  "Narayanganj",
  "Narsingdi",
  "Natore",
  "Netrokona",
  "Nilphamari",
  "Noakhali",
  "Pabna",
  "Panchagarh",
  "Patuakhali",
  "Pirojpur",
  "Rajbari",
  "Rajshahi",
  "Rangamati",
  "Rangpur",
  "Satkhira",
  "Shariatpur",
  "Sherpur",
  "Sirajganj",
  "Sunamganj",
  "Sylhet",
  "Tangail",
  "Thakurgaon",
];

const DISTRICT_THANA_MAP: Record<string, string[]> = {
  Dhaka: [
    "Adabor",
    "Airport",
    "Badda",
    "Bangshal",
    "Cantonment",
    "Chak Bazar",
    "Darus Salam",
    "Demra",
    "Dhanmondi",
    "Gandaria",
    "Gulshan",
    "Hazaribagh",
    "Jatrabari",
    "Kadamtali",
    "Kafrul",
    "Kalabagan",
    "Kamrangirchar",
    "Khilgaon",
    "Khilkhet",
    "Kotwali",
    "Lalbagh",
    "Mirpur",
    "Mohammadpur",
    "Motijheel",
    "Mugda",
    "New Market",
    "Pallabi",
    "Paltan",
    "Ramna",
    "Rampura",
    "Sabujbagh",
    "Shah Ali",
    "Shahbagh",
    "Shahjahanpur",
    "Sher-e-Bangla Nagar",
    "Shyampur",
    "Sutrapur",
    "Tejgaon",
    "Tejgaon Industrial Area",
    "Turag",
    "Uttara East",
    "Uttara West",
    "Uttarkhan",
    "Vatara",
    "Wari",
  ],

  Gazipur: [
    "Gazipur Sadar",
    "Kaliakair",
    "Kaliganj",
    "Kapasia",
    "Sreepur",
  ],

  Narayanganj: [
    "Narayanganj Sadar",
    "Bandar",
    "Rupganj",
    "Sonargaon",
    "Araihazar",
  ],

  Narsingdi: [
    "Narsingdi Sadar",
    "Belabo",
    "Monohardi",
    "Palash",
    "Raipura",
    "Shibpur",
  ],

  Manikganj: [
    "Manikganj Sadar",
    "Daulatpur",
    "Ghior",
    "Harirampur",
    "Saturia",
    "Shibalaya",
    "Singair",
  ],

  Munshiganj: [
    "Munshiganj Sadar",
    "Gazaria",
    "Lohajang",
    "Sirajdikhan",
    "Sreenagar",
    "Tongibari",
  ],

  Bagerhat: [
    "Bagerhat Sadar",
    "Chitalmari",
    "Fakirhat",
    "Kachua",
    "Mollahat",
    "Mongla",
    "Morrelganj",
    "Rampal",
    "Sharankhola",
  ],

  Bandarban: [
    "Bandarban Sadar",
    "Alikadam",
    "Lama",
    "Naikhongchhari",
    "Rowangchhari",
    "Ruma",
    "Thanchi",
  ],

  Barguna: [
    "Barguna Sadar",
    "Amtali",
    "Bamna",
    "Betagi",
    "Patharghata",
    "Taltali",
  ],

  Barishal: [
    "Barishal Sadar",
    "Agailjhara",
    "Babuganj",
    "Bakerganj",
    "Banaripara",
    "Gaurnadi",
    "Hizla",
    "Mehendiganj",
    "Muladi",
    "Wazirpur",
  ],

  Bhola: [
    "Bhola Sadar",
    "Borhanuddin",
    "Char Fasson",
    "Daulatkhan",
    "Lalmohan",
    "Manpura",
    "Tazumuddin",
  ],

  Bogura: [
    "Bogura Sadar",
    "Adamdighi",
    "Dhunat",
    "Dupchanchia",
    "Gabtali",
    "Kahaloo",
    "Nandigram",
    "Sariakandi",
    "Shajahanpur",
    "Sherpur",
    "Shibganj",
    "Sonatala",
  ],

  Brahmanbaria: [
    "Brahmanbaria Sadar",
    "Akhaura",
    "Ashuganj",
    "Bancharampur",
    "Bijoynagar",
    "Kasba",
    "Nabinagar",
    "Nasirnagar",
    "Sarail",
  ],

  Chandpur: [
    "Chandpur Sadar",
    "Faridganj",
    "Haimchar",
    "Hajiganj",
    "Kachua",
    "Matlab Dakshin",
    "Matlab Uttar",
    "Shahrasti",
  ],

  Chattogram: [
    "Chattogram Sadar",
    "Anwara",
    "Banshkhali",
    "Boalkhali",
    "Chandanaish",
    "Fatikchhari",
    "Hathazari",
    "Lohagara",
    "Mirsharai",
    "Patiya",
    "Rangunia",
    "Raozan",
    "Sandwip",
    "Satkania",
    "Sitakunda",
    "Karnaphuli",
  ],

  Chuadanga: [
    "Chuadanga Sadar",
    "Alamdanga",
    "Damurhuda",
    "Jibannagar",
  ],

  "Cox's Bazar": [
    "Cox's Bazar Sadar",
    "Chakaria",
    "Eidgaon",
    "Kutubdia",
    "Maheshkhali",
    "Pekua",
    "Ramu",
    "Teknaf",
    "Ukhiya",
  ],

  Cumilla: [
    "Cumilla Sadar",
    "Barura",
    "Brahmanpara",
    "Burichang",
    "Chandina",
    "Chauddagram",
    "Daudkandi",
    "Debidwar",
    "Homna",
    "Laksam",
    "Lalmai",
    "Meghna",
    "Monoharganj",
    "Muradnagar",
    "Nangalkot",
    "Titas",
  ],

  Dinajpur: [
    "Dinajpur Sadar",
    "Birampur",
    "Birganj",
    "Biral",
    "Bochaganj",
    "Chirirbandar",
    "Fulbari",
    "Ghoraghat",
    "Hakimpur",
    "Kaharole",
    "Khansama",
    "Nawabganj",
    "Parbatipur",
  ],

  Faridpur: [
    "Faridpur Sadar",
    "Alfadanga",
    "Bhanga",
    "Boalmari",
    "Charbhadrasan",
    "Madhukhali",
    "Nagarkanda",
    "Sadarpur",
    "Saltha",
  ],

  Feni: [
    "Feni Sadar",
    "Chhagalnaiya",
    "Daganbhuiyan",
    "Fulgazi",
    "Parshuram",
    "Sonagazi",
  ],

  Gaibandha: [
    "Gaibandha Sadar",
    "Fulchhari",
    "Gobindaganj",
    "Palashbari",
    "Sadullapur",
    "Saghata",
    "Sundarganj",
  ],

  Gopalganj: [
    "Gopalganj Sadar",
    "Kashiani",
    "Kotalipara",
    "Muksudpur",
    "Tungipara",
  ],

  Habiganj: [
    "Habiganj Sadar",
    "Ajmiriganj",
    "Bahubal",
    "Baniachong",
    "Chunarughat",
    "Lakhai",
    "Madhabpur",
    "Nabiganj",
    "Shayestaganj",
  ],

  Jamalpur: [
    "Jamalpur Sadar",
    "Bakshiganj",
    "Dewanganj",
    "Islampur",
    "Madarganj",
    "Melandaha",
    "Sarishabari",
  ],

  Jashore: [
    "Jashore Sadar",
    "Abhaynagar",
    "Bagherpara",
    "Chaugachha",
    "Jhikargachha",
    "Keshabpur",
    "Manirampur",
    "Sharsha",
  ],

  Jhalokathi: [
    "Jhalokathi Sadar",
    "Kathalia",
    "Nalchity",
    "Rajapur",
  ],

  Jhenaidah: [
    "Jhenaidah Sadar",
    "Harinakunda",
    "Kaliganj",
    "Kotchandpur",
    "Maheshpur",
    "Shailkupa",
  ],

  Joypurhat: [
    "Joypurhat Sadar",
    "Akkelpur",
    "Kalai",
    "Khetlal",
    "Panchbibi",
  ],

  Khagrachhari: [
    "Khagrachhari Sadar",
    "Dighinala",
    "Guimara",
    "Lakshmichhari",
    "Mahalchhari",
    "Manikchhari",
    "Matiranga",
    "Panchhari",
    "Ramgarh",
  ],

  Khulna: [
    "Khulna Sadar",
    "Batiaghata",
    "Dakop",
    "Dumuria",
    "Dighalia",
    "Dacope",
    "Koyra",
    "Paikgachha",
    "Phultala",
    "Rupsa",
    "Terokhada",
  ],

  Kishoreganj: [
    "Kishoreganj Sadar",
    "Austagram",
    "Bajitpur",
    "Bhairab",
    "Hossainpur",
    "Itna",
    "Karimganj",
    "Katiadi",
    "Kuliarchar",
    "Mithamain",
    "Nikli",
    "Pakundia",
    "Tarail",
  ],

  Kurigram: [
    "Kurigram Sadar",
    "Bhurungamari",
    "Char Rajibpur",
    "Chilmari",
    "Phulbari",
    "Nageshwari",
    "Rajarhat",
    "Raomari",
    "Ulipur",
  ],

  Kushtia: [
    "Kushtia Sadar",
    "Bheramara",
    "Daulatpur",
    "Khoksa",
    "Kumarkhali",
    "Mirpur",
  ],

  Lakshmipur: [
    "Lakshmipur Sadar",
    "Kamalnagar",
    "Raipur",
    "Ramganj",
    "Ramgati",
    "Chandraganj",
  ],

  Lalmonirhat: [
    "Lalmonirhat Sadar",
    "Aditmari",
    "Hatibandha",
    "Kaliganj",
    "Patgram",
  ],

  Madaripur: [
    "Madaripur Sadar",
    "Kalkini",
    "Rajoir",
    "Shibchar",
    "Dasar",
  ],

  Magura: [
    "Magura Sadar",
    "Mohammadpur",
    "Shalikha",
    "Sreepur",
  ],

  Meherpur: [
    "Meherpur Sadar",
    "Gangni",
    "Mujibnagar",
  ],

  Moulvibazar: [
    "Moulvibazar Sadar",
    "Barlekha",
    "Juri",
    "Kamalganj",
    "Kulaura",
    "Rajnagar",
    "Sreemangal",
  ],

  Mymensingh: [
    "Mymensingh Sadar",
    "Bhaluka",
    "Dhobaura",
    "Fulbaria",
    "Gaffargaon",
    "Gauripur",
    "Haluaghat",
    "Ishwarganj",
    "Muktagachha",
    "Nandail",
    "Phulpur",
    "Tarakanda",
    "Trishal",
  ],

  Naogaon: [
    "Naogaon Sadar",
    "Atrai",
    "Badalgachhi",
    "Dhamoirhat",
    "Manda",
    "Mahadebpur",
    "Niamatpur",
    "Patnitala",
    "Porsha",
    "Raninagar",
    "Sapahar",
  ],

  Narail: [
    "Narail Sadar",
    "Kalia",
    "Lohagara",
  ],

  Natore: [
    "Natore Sadar",
    "Bagatipara",
    "Baraigram",
    "Gurudaspur",
    "Lalpur",
    "Naldanga",
    "Singra",
  ],

  Netrokona: [
    "Netrokona Sadar",
    "Atpara",
    "Barhatta",
    "Durgapur",
    "Khaliajuri",
    "Kalmakanda",
    "Kendua",
    "Madan",
    "Mohanganj",
    "Purbadhala",
  ],

  Nilphamari: [
    "Nilphamari Sadar",
    "Dimla",
    "Domar",
    "Jaldhaka",
    "Kishoreganj",
    "Saidpur",
  ],

  Noakhali: [
    "Noakhali Sadar",
    "Begumganj",
    "Chatkhil",
    "Companiganj",
    "Hatiya",
    "Kabirhat",
    "Senbagh",
    "Sonaimuri",
    "Subarnachar",
  ],

  Pabna: [
    "Pabna Sadar",
    "Atgharia",
    "Bera",
    "Bhangura",
    "Chatmohar",
    "Faridpur",
    "Ishwardi",
    "Santhia",
    "Sujanagar",
  ],

  Panchagarh: [
    "Panchagarh Sadar",
    "Atwari",
    "Boda",
    "Debiganj",
    "Tetulia",
  ],

  Patuakhali: [
    "Patuakhali Sadar",
    "Bauphal",
    "Dashmina",
    "Dumki",
    "Galachipa",
    "Kalapara",
    "Mirzaganj",
    "Rangabali",
  ],

  Pirojpur: [
    "Pirojpur Sadar",
    "Bhandaria",
    "Kawkhali",
    "Mathbaria",
    "Nazirpur",
    "Nesarabad",
    "Indurkani",
  ],

  Rajbari: [
    "Rajbari Sadar",
    "Baliakandi",
    "Goalanda",
    "Kalukhali",
    "Pangsha",
  ],

  Rajshahi: [
    "Rajshahi Sadar",
    "Bagha",
    "Bagmara",
    "Charghat",
    "Durgapur",
    "Godagari",
    "Mohanpur",
    "Paba",
    "Puthia",
    "Tanore",
  ],

  Rangamati: [
    "Rangamati Sadar",
    "Baghaichhari",
    "Barkal",
    "Belaichhari",
    "Juraichhari",
    "Kaptai",
    "Kawkhali",
    "Langadu",
    "Naniarchar",
    "Rajasthali",
  ],

  Rangpur: [
    "Rangpur Sadar",
    "Badarganj",
    "Gangachara",
    "Kaunia",
    "Mithapukur",
    "Pirganj",
    "Pirgachha",
    "Taraganj",
  ],

  Satkhira: [
    "Satkhira Sadar",
    "Assasuni",
    "Debhata",
    "Kalaroa",
    "Kaliganj",
    "Shyamnagar",
    "Tala",
  ],

  Shariatpur: [
    "Shariatpur Sadar",
    "Bhedarganj",
    "Damudya",
    "Gosairhat",
    "Naria",
    "Zajira",
  ],

  Sherpur: [
    "Sherpur Sadar",
    "Jhenaigati",
    "Nakla",
    "Nalitabari",
    "Sreebardi",
  ],

  Sirajganj: [
    "Sirajganj Sadar",
    "Belkuchi",
    "Chauhali",
    "Kamarkhanda",
    "Kazipur",
    "Raiganj",
    "Shahjadpur",
    "Tarash",
    "Ullapara",
  ],

  Sunamganj: [
    "Sunamganj Sadar",
    "Bishwambharpur",
    "Chhatak",
    "Derai",
    "Dharampasha",
    "Dowarabazar",
    "Jagannathpur",
    "Jamalganj",
    "Madhyanagar",
    "Shalla",
    "Shantiganj",
    "Tahirpur",
  ],

  Sylhet: [
    "Sylhet Sadar",
    "Balaganj",
    "Beanibazar",
    "Bishwanath",
    "Companiganj",
    "Dakshin Surma",
    "Fenchuganj",
    "Golapganj",
    "Gowainghat",
    "Jaintiapur",
    "Kanaighat",
    "Osmani Nagar",
    "Zakiganj",
  ],

  Tangail: [
    "Tangail Sadar",
    "Basail",
    "Bhuapur",
    "Delduar",
    "Dhanbari",
    "Ghatail",
    "Gopalpur",
    "Kalihati",
    "Madhupur",
    "Mirzapur",
    "Nagarpur",
    "Sakhipur",
  ],

  Thakurgaon: [
    "Thakurgaon Sadar",
    "Baliadangi",
    "Haripur",
    "Pirganj",
    "Ranishankail",
  ],
};

function getDistrictsForZone(zone: DeliveryZone) {
  if (zone === "inside-dhaka") {
    return ["Dhaka"];
  }

  if (zone === "sub-urban") {
    return SUB_URBAN_DISTRICTS;
  }

  if (zone === "outside-dhaka") {
    return ALL_DISTRICTS.filter(
      (district) =>
        district !== "Dhaka" &&
        !SUB_URBAN_DISTRICTS.includes(district)
    );
  }

  return [];
}

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    address: "",
    deliveryZone: "",
    district: "",
    thana: "",
  });

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);

      if (savedCart) {
        const parsed = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (error) {
      console.error("CHECKOUT CART LOAD ERROR:", error);
      setCart([]);
    }

    setLoaded(true);
  }, []);

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  const totalItems = cart.reduce(
    (total, item) =>
      total + Number(item.quantity),
    0
  );

  const deliveryCharge =
    customer.deliveryZone === ""
      ? 0
      : DELIVERY_CHARGES[customer.deliveryZone];

  const total = subtotal + deliveryCharge;

  const availableDistricts = getDistrictsForZone(
    customer.deliveryZone
  );

  const availableThanas = customer.district
    ? DISTRICT_THANA_MAP[customer.district] || []
    : [];

  function updateCustomer(
    field: keyof CustomerInfo,
    value: string
  ) {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function selectDeliveryZone(zone: Exclude<DeliveryZone, "">) {
    setCustomer((prev) => ({
      ...prev,
      deliveryZone: zone,
      district: "",
      thana: "",
    }));
  }

  function selectDistrict(value: string) {
    setCustomer((prev) => ({
      ...prev,
      district: value,
      thana: "",
    }));
  }

  async function handlePlaceOrder(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (cart.length === 0) {
    router.push("/cart");
    return;
  }

  if (!customer.deliveryZone) {
    alert("Please select a delivery area.");
    return;
  }

  if (!customer.district) {
    alert("Please select your district.");
    return;
  }

  if (!customer.thana) {
    alert("Please select your thana / area.");
    return;
  }

  setPlacingOrder(true);

  const generatedOrderNumber =
    `STK-${Date.now().toString().slice(-8)}`;

  setOrderNumber(generatedOrderNumber);

  try {
    /*
     * ------------------------------------------------
     * 1. CREATE ORDER
     * ------------------------------------------------
     */
const shippingAddress = [
  customer.address,
  customer.thana,
  customer.district,
  customer.deliveryZone,
]
  .filter(Boolean)
  .join(", ");

// Get currently logged-in customer
const {
  data: { user },
} = await supabase.auth.getUser();

const { data: createdOrder, error: orderError } =
  await supabase
    .from("orders")
    .insert({
      user_id: user?.id || null,

      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email || null,
      shipping_address: shippingAddress,
      total_amount: total,
      payment_method: "Cash on Delivery",
      status: "PENDING",
    })
    .select("id")
    .single();

if (orderError) {
  console.error(
    "ORDER INSERT ERROR FULL:",
    JSON.stringify(orderError, null, 2)
  );

  alert(
    `Order Error:\n\nCode: ${orderError.code}\nMessage: ${orderError.message}\nDetails: ${orderError.details}\nHint: ${orderError.hint}`
  );

  throw orderError;
}

    if (!createdOrder) {
      throw new Error("Order was not created.");
    }

    /*
     * ------------------------------------------------
     * 2. CREATE ORDER ITEMS
     * ------------------------------------------------
     */

    const orderItems = cart.map((item) => ({
      order_id: createdOrder.id,
      product_id: item.id,
      product_name: item.name,
      size: item.size || null,
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
  console.error(
    "ORDER ITEMS INSERT ERROR FULL:",
    JSON.stringify(itemsError, null, 2)
  );

  alert(
    `Order Items Error:\n\nCode: ${itemsError.code}\nMessage: ${itemsError.message}\nDetails: ${itemsError.details}\nHint: ${itemsError.hint}`
  );

  await supabase
    .from("orders")
    .delete()
    .eq("id", createdOrder.id);

  throw itemsError;
}
    /*
     * ------------------------------------------------
     * 3. KEEP LAST ORDER LOCALLY
     * ------------------------------------------------
     */

    const order = {
      orderNumber: generatedOrderNumber,
      databaseOrderId: createdOrder.id,
      customer,
      deliveryZone: customer.deliveryZone,
      district: customer.district,
      thana: customer.thana,
      items: cart,
      subtotal,
      deliveryCharge,
      total,
      paymentMethod: "Cash on Delivery",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "stoked-last-order",
      JSON.stringify(order)
    );

    /*
     * ------------------------------------------------
     * 4. CLEAR CART
     * ------------------------------------------------
     */

    localStorage.removeItem(CART_KEY);

    window.dispatchEvent(
      new Event("cart-updated")
    );

    /*
     * ------------------------------------------------
     * 5. SHOW SUCCESS SCREEN
     * ------------------------------------------------
     */

    setTimeout(() => {
      setPlacingOrder(false);
      setOrderPlaced(true);
    }, 700);
  } catch (error) {
    console.error("ORDER ERROR:", error);

    alert(
      "Something went wrong while placing your order. Please try again."
    );

    setPlacingOrder(false);
  }
}

  if (!loaded) {
    return (
      <main className="loading-page">
        <div className="loading-box">
          <span className="loading-dot" />
          <span>LOADING CHECKOUT</span>
        </div>

        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            width: 100%;
            background: #070202;
            color: #f5f5f3;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Inter, Arial, sans-serif;
          }

          .loading-box {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 9px;
            letter-spacing: 0.24em;
          }

          .loading-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #ff2020;
            box-shadow: 0 0 18px rgba(255, 32, 32, 0.9);
            animation: loadingPulse 1s ease-in-out infinite;
          }

          @keyframes loadingPulse {
            0%,
            100% {
              opacity: 0.4;
              transform: scale(0.8);
            }

            50% {
              opacity: 1;
              transform: scale(1.25);
            }
          }
        `}</style>
      </main>
    );
  }

  if (orderPlaced) {
    return (
      <main className="checkout-page">
        <div className="background-grid" />
        <div className="background-glow glow-one" />
        <div className="background-glow glow-two" />
        <div className="red-vignette" />

        <div className="ambient-web web-one" />
        <div className="ambient-web web-two" />
        <div className="ambient-web web-three" />
        <div className="ambient-web web-four" />

        <div className="spider spider-one">
          <span className="spider-thread" />
          <div className="spider-body">
            <img src={SPIDER_IMAGE} alt="" />
          </div>
        </div>

        <div className="spider spider-two">
          <span className="spider-thread" />
          <div className="spider-body">
            <img src={SPIDER_IMAGE} alt="" />
          </div>
        </div>

        <div className="spider spider-three">
          <span className="spider-thread" />
          <div className="spider-body">
            <img src={SPIDER_IMAGE} alt="" />
          </div>
        </div>

        <div className="spider spider-four">
          <span className="spider-thread" />
          <div className="spider-body">
            <img src={SPIDER_IMAGE} alt="" />
          </div>
        </div>

        <header className="site-header">
          <Link href="/" className="home-button">
            <span className="home-blood home-blood-1" />
            <span className="home-blood home-blood-2" />
            <span className="home-web" />
            <span className="home-text">HOME</span>
            <span className="home-arrow">↗</span>
          </Link>
        </header>

        <section className="success-container">
  <div className="success-card">

    <div className="success-top-line" />

    <div className="success-kicker">
      <span />
      STOKED BD / ORDER CONFIRMED
      <span />
    </div>

    <div className="success-icon">
      ✓
    </div>

    <h1>
      THANK YOU
      <br />
      <span>FOR YOUR ORDER.</span>
    </h1>

    <p className="success-message">
      Your order has been received successfully.
      <br />
      We’ll get in touch with you shortly.
    </p>

    <div className="order-number-box">
      <span>ORDER NUMBER</span>
      <strong>{orderNumber}</strong>
    </div>

    <div className="success-meta">
      <div>
        <span>PAYMENT</span>
        <strong>CASH ON DELIVERY</strong>
      </div>

      <div>
        <span>TOTAL</span>
        <strong>
          ৳{total.toLocaleString()}
        </strong>
      </div>
    </div>

    <div className="success-actions">
      <Link
        href="/shop"
        className="success-button primary"
      >
        <span>CONTINUE SHOPPING</span>
        <span>→</span>
      </Link>

      <Link
        href="/"
        className="success-button secondary"
      >
        <span>BACK HOME</span>
        <span>↗</span>
      </Link>
    </div>

    <div className="success-footer-text">
      STOKED BD — BUILT FOR THE STREETS
    </div>

  </div>
</section>
        <footer className="checkout-footer">
          <div>STOKED BD</div>
          <div>© {new Date().getFullYear()} STOKED</div>
          <div>BUILT FOR THE STREETS</div>
        </footer>

        <style jsx>{`
          * {
            box-sizing: border-box;
          }

          .checkout-page {
            position: relative;
            width: 100%;
            min-height: 100vh;
            overflow-x: hidden;
            background:
              radial-gradient(
                circle at 50% 0%,
                rgba(120, 0, 0, 0.18),
                transparent 32%
              ),
              #070202;
            color: #f5f5f3;
            font-family:
              Inter,
              Arial,
              Helvetica,
              sans-serif;
          }

          .background-grid {
            position: fixed;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            opacity: 0.13;
            background-image:
              linear-gradient(
                rgba(255, 255, 255, 0.025) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.025) 1px,
                transparent 1px
              );
            background-size: 70px 70px;
            mask-image:
              linear-gradient(
                to bottom,
                black,
                transparent 92%
              );
          }

          .background-glow {
            position: fixed;
            z-index: 0;
            pointer-events: none;
            border-radius: 50%;
            filter: blur(90px);
          }

          .glow-one {
            width: 420px;
            height: 420px;
            top: -190px;
            left: 25%;
            background: rgba(180, 0, 0, 0.1);
          }

          .glow-two {
            width: 320px;
            height: 320px;
            right: -100px;
            top: 48%;
            background: rgba(180, 0, 0, 0.07);
          }

          .red-vignette {
            position: fixed;
            inset: 0;
            z-index: 1;
            pointer-events: none;
            box-shadow:
              inset 0 0 180px rgba(0, 0, 0, 0.85),
              inset 0 0 45px rgba(120, 0, 0, 0.1);
          }

          .ambient-web {
            position: fixed;
            width: 180px;
            height: 180px;
            border-radius: 50%;
            z-index: 1;
            pointer-events: none;
            opacity: 0.07;
            background:
              repeating-radial-gradient(
                circle,
                transparent 0,
                transparent 18px,
                rgba(255, 60, 60, 0.7) 19px,
                transparent 20px
              );
            animation:
              webPulse 7s ease-in-out infinite;
          }

          .web-one {
            top: 90px;
            left: -70px;
          }

          .web-two {
            top: 35%;
            right: -80px;
            animation-delay: 1.5s;
          }

          .web-three {
            bottom: 8%;
            left: -70px;
            animation-delay: 3s;
          }

          .web-four {
            bottom: -60px;
            right: -40px;
            animation-delay: 4.5s;
          }

          @keyframes webPulse {
            0%,
            100% {
              opacity: 0.035;
              transform: scale(0.95);
            }

            50% {
              opacity: 0.09;
              transform: scale(1.05);
            }
          }

          .spider {
            position: fixed;
            z-index: 2;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            opacity: 0;
            animation:
              spiderAppear 1.2s ease-out forwards,
              spiderFloat 6s ease-in-out infinite;
          }

          .spider-thread {
            width: 1px;
            height: 80px;
            background:
              linear-gradient(
                to bottom,
                transparent,
                rgba(255, 255, 255, 0.25),
                rgba(255, 40, 40, 0.55)
              );
          }

          .spider-body {
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            filter:
              drop-shadow(
                0 0 12px rgba(255, 0, 0, 0.4)
              );
          }

          .spider-body img {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: contain;
          }

          .spider-one {
            top: 125px;
            left: 7%;
            animation-delay:
              0.2s,
              0.2s;
          }

          .spider-two {
            top: 255px;
            right: 8%;
            transform: scale(0.72);
            animation-delay:
              0.4s,
              1s;
          }

          .spider-three {
            top: 56%;
            left: 4%;
            transform: scale(0.6);
            animation-delay:
              0.6s,
              2s;
          }

          .spider-four {
            top: 67%;
            right: 5%;
            transform: scale(0.8);
            animation-delay:
              0.8s,
              3s;
          }

          @keyframes spiderAppear {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }

            to {
              opacity: 0.48;
            }
          }

          @keyframes spiderFloat {
            0%,
            100% {
              margin-top: 0;
            }

            50% {
              margin-top: 18px;
            }
          }

          .site-header {
            position: relative;
            z-index: 10;
            width: 100%;
            height: 82px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding:
              0 clamp(22px, 5vw, 70px);
            border-bottom:
              1px solid rgba(255, 255, 255, 0.06);
            background:
              rgba(7, 2, 2, 0.48);
            backdrop-filter: blur(18px);
          }

          .home-button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-width: 78px;
            height: 36px;
            padding: 0 14px;
            overflow: hidden;
            isolation: isolate;
            color: #eeeeeb;
            text-decoration: none;
            background:
              linear-gradient(
                145deg,
                rgba(105, 7, 7, 0.96),
                rgba(28, 3, 3, 0.99)
              );
            border:
              1px solid rgba(190, 30, 30, 0.7);
            box-shadow:
              inset 0 0 20px rgba(140, 0, 0, 0.2),
              0 0 16px rgba(110, 0, 0, 0.18);
            backdrop-filter: blur(14px);
            transition:
              transform 0.3s ease,
              border-color 0.3s ease,
              background 0.3s ease,
              box-shadow 0.3s ease;
          }

          .home-button::before {
            content: "";
            position: absolute;
            inset: 0;
            background:
              radial-gradient(
                circle at 15% 100%,
                rgba(190, 0, 0, 0.35),
                transparent 38%
              ),
              radial-gradient(
                circle at 90% 0%,
                rgba(130, 0, 0, 0.28),
                transparent 40%
              );
            pointer-events: none;
            z-index: 0;
          }

          .home-blood {
            position: absolute;
            bottom: -1px;
            width: 3px;
            background:
              linear-gradient(
                to bottom,
                #a30a0a,
                #4c0101
              );
            border-radius: 0 0 50% 50%;
            opacity: 0.8;
            z-index: 2;
            pointer-events: none;
            filter:
              drop-shadow(
                0 0 4px rgba(150, 0, 0, 0.6)
              );
          }

          .home-blood-1 {
            left: 18%;
            height: 8px;
            box-shadow:
              13px 1px 0 rgba(90, 2, 2, 0.9),
              31px -1px 0 rgba(125, 4, 4, 0.75);
          }

          .home-blood-2 {
            right: 17%;
            height: 5px;
            box-shadow:
              -12px 1px 0 rgba(85, 2, 2, 0.8),
              -27px 0 0 rgba(120, 3, 3, 0.65);
          }

          .home-web {
            position: absolute;
            width: 34px;
            height: 34px;
            top: -16px;
            right: -12px;
            opacity: 0.28;
            pointer-events: none;
            background:
              repeating-conic-gradient(
                from 0deg,
                transparent 0deg 12deg,
                rgba(255, 255, 255, 0.4) 12.5deg 13.2deg,
                transparent 13.7deg 25deg
              );
            border-radius: 50%;
            mask-image:
              radial-gradient(
                circle,
                transparent 0 6px,
                #000 6.5px 7px,
                transparent 7.5px 12px,
                #000 12.5px 13px,
                transparent 13.5px 18px,
                #000 18.5px 19px,
                transparent 19.5px
              );
            -webkit-mask-image:
              radial-gradient(
                circle,
                transparent 0 6px,
                #000 6.5px 7px,
                transparent 7.5px 12px,
                #000 12.5px 13px,
                transparent 13.5px 18px,
                #000 18.5px 19px,
                transparent 19.5px
              );
            z-index: 1;
          }

          .home-text {
            position: relative;
            z-index: 5;
            color: rgba(235, 235, 232, 0.88);
            font-family:
              "Space Grotesk",
              Inter,
              Arial,
              sans-serif;
            font-size: 8px;
            font-weight: 600;
            letter-spacing: 0.24em;
          }

          .home-arrow {
            position: relative;
            z-index: 5;
            color: rgba(235, 235, 235, 0.65);
            font-family: Arial, sans-serif;
            font-size: 13px;
            font-weight: 300;
          }

          .home-button:hover {
            transform: translateY(-2px);
            border-color: rgba(225, 40, 40, 0.95);
            background:
              linear-gradient(
                145deg,
                rgba(125, 8, 8, 0.98),
                rgba(30, 3, 3, 1)
              );
            box-shadow:
              inset 0 0 25px rgba(170, 0, 0, 0.25),
              0 0 20px rgba(145, 0, 0, 0.3),
              0 0 35px rgba(100, 0, 0, 0.14);
          }

          .home-button:hover .home-text {
            color: #f4f4f1;
            letter-spacing: 0.27em;
          }

          .home-button:hover .home-arrow {
            color: #ffffff;
            transform: translate(2px, -2px);
          }

          .home-button:hover .home-web {
            opacity: 0.5;
          }

          .success-container {
            position: relative;
            z-index: 5;
            width:
              min(
                1380px,
                calc(100% - 44px)
              );
            min-height:
              calc(100vh - 167px);
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 70px 0;
          }

          .success-card {
            position: relative;
            width: min(650px, 100%);
            overflow: hidden;
            text-align: center;
            padding: 65px 45px;
            border:
              1px solid rgba(255, 255, 255, 0.09);
            background:
              linear-gradient(
                145deg,
                rgba(255, 255, 255, 0.035),
                rgba(100, 0, 0, 0.045)
              );
            box-shadow:
              0 30px 100px rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(20px);
          }

          .success-glow {
            position: absolute;
            width: 280px;
            height: 280px;
            top: -160px;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 50%;
            background: rgba(180, 0, 0, 0.18);
            filter: blur(70px);
            pointer-events: none;
          }

          .success-kicker {
            position: relative;
            color: rgba(255, 50, 50, 0.65);
            font-size: 7px;
            letter-spacing: 0.22em;
          }

          .success-icon {
            position: relative;
            width: 54px;
            height: 54px;
            margin: 25px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            border:
              1px solid rgba(255, 45, 45, 0.6);
            border-radius: 50%;
            color: #ff3030;
            font-size: 22px;
            box-shadow:
              0 0 30px rgba(255, 0, 0, 0.12);
          }

          .success-card h1 {
            position: relative;
            margin: 0;
            font-family:
              "Space Grotesk",
              Inter,
              sans-serif;
            font-size:
              clamp(42px, 7vw, 70px);
            line-height: 0.92;
            font-weight: 500;
            letter-spacing: -0.055em;
          }

          .success-card h1 span {
            color: transparent;
            -webkit-text-stroke:
              1px rgba(245, 245, 243, 0.45);
          }

          .success-line {
            width: 45px;
            height: 1px;
            margin: 20px auto;
            background:
              linear-gradient(
                90deg,
                transparent,
                #ff2020,
                transparent
              );
          }

          .success-card > p {
            position: relative;
            margin: 0;
            color: rgba(245, 245, 243, 0.34);
            font-size: 8px;
            line-height: 1.8;
            letter-spacing: 0.08em;
          }

          .order-number-box {
            position: relative;
            margin: 28px auto 20px;
            padding: 17px 20px;
            border:
              1px solid rgba(255, 255, 255, 0.07);
            background: rgba(255, 255, 255, 0.018);
          }

          .order-number-box span {
            display: block;
            margin-bottom: 8px;
            color: rgba(245, 245, 243, 0.27);
            font-size: 6px;
            letter-spacing: 0.18em;
          }

          .order-number-box strong {
            color: rgba(255, 60, 60, 0.8);
            font-family:
              "Space Grotesk",
              Inter,
              sans-serif;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 0.15em;
          }

          .success-meta {
            position: relative;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .success-meta div {
            padding: 14px;
            border:
              1px solid rgba(255, 255, 255, 0.06);
          }

          .success-meta span {
            display: block;
            margin-bottom: 6px;
            color: rgba(245, 245, 243, 0.24);
            font-size: 6px;
            letter-spacing: 0.16em;
          }

          .success-meta strong {
            color: rgba(245, 245, 243, 0.7);
            font-size: 7px;
            letter-spacing: 0.12em;
          }

          .success-actions {
            position: relative;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 22px;
          }

          .success-button {
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-height: 48px;
            padding: 0 15px;
            text-decoration: none;
            font-size: 7px;
            letter-spacing: 0.14em;
            transition:
              transform 0.25s ease,
              border-color 0.25s ease,
              background 0.25s ease;
          }

          .success-button:hover {
            transform: translateY(-2px);
          }

          .success-button.primary {
            color: #fff;
            border:
              1px solid rgba(255, 40, 40, 0.45);
            background:
              linear-gradient(
                100deg,
                #9d0000,
                #e31b1b
              );
          }

          .success-button.secondary {
            color: rgba(245, 245, 243, 0.65);
            border:
              1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.025);
          }

          .checkout-footer {
            position: relative;
            z-index: 5;
            width:
              min(
                1380px,
                calc(100% - 44px)
              );
            margin: 0 auto;
            min-height: 85px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            align-items: center;
            border-top:
              1px solid rgba(255, 255, 255, 0.06);
            color: rgba(245, 245, 243, 0.25);
            font-size: 7px;
            letter-spacing: 0.18em;
          }

          .checkout-footer div:nth-child(2) {
            text-align: center;
          }

          .checkout-footer div:nth-child(3) {
            text-align: right;
          }

          @media (max-width: 600px) {
            .success-container {
              width:
                calc(100% - 28px);
              min-height:
                calc(100vh - 166px);
              padding: 45px 0;
            }

            .success-card {
              padding: 50px 20px;
            }

            .success-card h1 {
              font-size: 42px;
            }

            .success-meta {
              grid-template-columns: 1fr;
            }

            .success-actions {
              grid-template-columns: 1fr;
            }

            .checkout-footer {
              width:
                calc(100% - 28px);
              min-height: 100px;
              grid-template-columns: 1fr 1fr;
              row-gap: 12px;
              padding: 20px 0;
              font-size: 6px;
            }

            .checkout-footer div:nth-child(2) {
              text-align: right;
            }

            .checkout-footer div:nth-child(3) {
              grid-column: 1 / -1;
              text-align: left;
            }
          }
        `}</style>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <div className="background-grid" />
        <div className="background-glow glow-one" />
        <div className="background-glow glow-two" />
        <div className="red-vignette" />

        <div className="ambient-web web-one" />
        <div className="ambient-web web-two" />
        <div className="ambient-web web-three" />
        <div className="ambient-web web-four" />

        <header className="site-header">
          <Link href="/" className="home-button">
            <span className="home-blood home-blood-1" />
            <span className="home-blood home-blood-2" />
            <span className="home-web" />
            <span className="home-text">HOME</span>
            <span className="home-arrow">↗</span>
          </Link>
        </header>

        <section className="empty-checkout">
          <div className="empty-box">
            <span>00 / CHECKOUT STATUS</span>

            <h1>
              YOUR BAG
              <br />
              IS EMPTY
            </h1>

            <p>
              Add something to your bag
              <br />
              before heading to checkout.
            </p>

            <Link
              href="/shop"
              className="empty-button"
            >
              <span>EXPLORE COLLECTION</span>
              <span>↗</span>
            </Link>
          </div>
        </section>

        <footer className="checkout-footer">
          <div>STOKED BD</div>
          <div>© {new Date().getFullYear()} STOKED</div>
          <div>BUILT FOR THE STREETS</div>
        </footer>

        <style jsx>{`
          * {
            box-sizing: border-box;
         .success-container {
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 20px 80px;
  position: relative;
  z-index: 5;
}

.success-card {
  width: min(560px, 100%);
  position: relative;
  padding: 48px 42px 36px;
  background:
    linear-gradient(
      145deg,
      rgba(20, 20, 20, 0.97),
      rgba(5, 5, 5, 0.99)
    );
  border: 1px solid rgba(150, 17, 30, 0.45);
  box-shadow:
    0 30px 100px rgba(0, 0, 0, 0.75),
    0 0 60px rgba(150, 17, 30, 0.12);
  text-align: center;
  overflow: hidden;
}

.success-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      135deg,
      transparent,
      rgba(150, 17, 30, 0.06),
      transparent
    );
  pointer-events: none;
}

.success-top-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    #96111e,
    #d11f34,
    #96111e,
    transparent
  );
  box-shadow: 0 0 20px rgba(150, 17, 30, 0.7);
}

.success-kicker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.38);
  font-size: 8px;
  letter-spacing: 0.25em;
  margin-bottom: 25px;
}

.success-kicker span {
  width: 35px;
  height: 1px;
  background: rgba(150, 17, 30, 0.7);
}

.success-icon {
  width: 50px;
  height: 50px;
  margin: 0 auto 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(150, 17, 30, 0.6);
  color: #d52a3d;
  font-size: 20px;
  box-shadow:
    inset 0 0 20px rgba(150, 17, 30, 0.1),
    0 0 30px rgba(150, 17, 30, 0.12);
}

.success-card h1 {
  margin: 0;
  color: #fff;
  font-family: "Space Grotesk", sans-serif;
  font-size: clamp(34px, 5vw, 52px);
  line-height: 0.95;
  letter-spacing: -0.045em;
  font-weight: 600;
}

.success-card h1 span {
  color: rgba(255, 255, 255, 0.42);
}

.success-message {
  margin: 20px 0 28px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 11px;
  line-height: 1.8;
}

.order-number-box {
  padding: 17px 20px;
  margin-bottom: 10px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.025);
}

.order-number-box span,
.success-meta span {
  display: block;
  color: rgba(255, 255, 255, 0.3);
  font-size: 8px;
  letter-spacing: 0.2em;
  margin-bottom: 7px;
}

.order-number-box strong {
  color: #fff;
  font-size: 14px;
  letter-spacing: 0.12em;
}

.success-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 25px;
}

.success-meta div {
  padding: 15px;
}

.success-meta div + div {
  border-left: 1px solid rgba(255, 255, 255, 0.06);
}

.success-meta strong {
  color: rgba(255, 255, 255, 0.7);
  font-size: 9px;
  letter-spacing: 0.08em;
}

.success-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.success-button {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 17px;
  text-decoration: none;
  font-size: 8px;
  letter-spacing: 0.15em;
  transition: 0.25s ease;
}

.success-button.primary {
  color: #fff;
  background: #96111e;
  border: 1px solid #a71929;
  box-shadow: 0 0 25px rgba(150, 17, 30, 0.15);
}

.success-button.primary:hover {
  background: #b5182b;
  box-shadow: 0 0 35px rgba(150, 17, 30, 0.3);
  transform: translateY(-2px);
}

.success-button.secondary {
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.09);
}

.success-button.secondary:hover {
  color: #fff;
  border-color: rgba(150, 17, 30, 0.5);
  background: rgba(150, 17, 30, 0.08);
}

.success-footer-text {
  margin-top: 26px;
  color: rgba(255, 255, 255, 0.18);
  font-size: 7px;
  letter-spacing: 0.3em;
}

@media (max-width: 600px) {
  .success-container {
    min-height: calc(100vh - 100px);
    padding: 30px 16px 60px;
  }

  .success-card {
    padding: 38px 20px 30px;
  }

  .success-card h1 {
    font-size: 34px;
  }

  .success-actions {
    grid-template-columns: 1fr;
  }

  .success-meta {
    grid-template-columns: 1fr;
  }

  .success-meta div + div {
    border-left: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .success-kicker {
    font-size: 7px;
  }
}
            }

          .checkout-page {
            position: relative;
            width: 100%;
            min-height: 100vh;
            overflow-x: hidden;
            background:
              radial-gradient(
                circle at 50% 0%,
                rgba(120, 0, 0, 0.18),
                transparent 32%
              ),
              #070202;
            color: #f5f5f3;
            font-family:
              Inter,
              Arial,
              Helvetica,
              sans-serif;
          }

          .background-grid {
            position: fixed;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            opacity: 0.13;
            background-image:
              linear-gradient(
                rgba(255, 255, 255, 0.025) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.025) 1px,
                transparent 1px
              );
            background-size: 70px 70px;
          }

          .background-glow {
            position: fixed;
            z-index: 0;
            pointer-events: none;
            border-radius: 50%;
            filter: blur(90px);
          }

          .glow-one {
            width: 420px;
            height: 420px;
            top: -190px;
            left: 25%;
            background: rgba(180, 0, 0, 0.1);
          }

          .glow-two {
            width: 320px;
            height: 320px;
            right: -100px;
            top: 48%;
            background: rgba(180, 0, 0, 0.07);
          }

          .red-vignette {
            position: fixed;
            inset: 0;
            z-index: 1;
            pointer-events: none;
            box-shadow:
              inset 0 0 180px rgba(0, 0, 0, 0.85),
              inset 0 0 45px rgba(120, 0, 0, 0.1);
          }

          .ambient-web {
            position: fixed;
            width: 180px;
            height: 180px;
            border-radius: 50%;
            z-index: 1;
            pointer-events: none;
            opacity: 0.07;
            background:
              repeating-radial-gradient(
                circle,
                transparent 0,
                transparent 18px,
                rgba(255, 60, 60, 0.7) 19px,
                transparent 20px
              );
            animation:
              webPulse 7s ease-in-out infinite;
          }

          .web-one {
            top: 90px;
            left: -70px;
          }

          .web-two {
            top: 35%;
            right: -80px;
            animation-delay: 1.5s;
          }

          .web-three {
            bottom: 8%;
            left: -70px;
            animation-delay: 3s;
          }

          .web-four {
            bottom: -60px;
            right: -40px;
            animation-delay: 4.5s;
          }

          @keyframes webPulse {
            0%,
            100% {
              opacity: 0.035;
              transform: scale(0.95);
            }

            50% {
              opacity: 0.09;
              transform: scale(1.05);
            }
          }

          .site-header {
            position: relative;
            z-index: 10;
            width: 100%;
            height: 82px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding:
              0 clamp(22px, 5vw, 70px);
            border-bottom:
              1px solid rgba(255, 255, 255, 0.06);
            background:
              rgba(7, 2, 2, 0.48);
            backdrop-filter: blur(18px);
          }

          .home-button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-width: 78px;
            height: 36px;
            padding: 0 14px;
            color: #eeeeeb;
            text-decoration: none;
            background:
              linear-gradient(
                145deg,
                rgba(105, 7, 7, 0.96),
                rgba(28, 3, 3, 0.99)
              );
            border:
              1px solid rgba(190, 30, 30, 0.7);
            box-shadow:
              inset 0 0 20px rgba(140, 0, 0, 0.2),
              0 0 16px rgba(110, 0, 0, 0.18);
          }

          .home-blood {
            position: absolute;
            bottom: -1px;
            width: 3px;
            background:
              linear-gradient(
                to bottom,
                #a30a0a,
                #4c0101
              );
            border-radius: 0 0 50% 50%;
            opacity: 0.8;
          }

          .home-blood-1 {
            left: 18%;
            height: 8px;
          }

          .home-blood-2 {
            right: 17%;
            height: 5px;
          }

          .home-web {
            position: absolute;
            width: 34px;
            height: 34px;
            top: -16px;
            right: -12px;
            opacity: 0.28;
            background:
              repeating-conic-gradient(
                from 0deg,
                transparent 0deg 12deg,
                rgba(255, 255, 255, 0.4) 12.5deg 13.2deg,
                transparent 13.7deg 25deg
              );
            border-radius: 50%;
          }

          .home-text {
            position: relative;
            z-index: 5;
            font-family:
              "Space Grotesk",
              Inter,
              Arial,
              sans-serif;
            font-size: 8px;
            font-weight: 600;
            letter-spacing: 0.24em;
          }

          .home-arrow {
            position: relative;
            z-index: 5;
            font-size: 13px;
          }

          .empty-checkout {
            position: relative;
            z-index: 5;
            width:
              min(
                1380px,
                calc(100% - 44px)
              );
            min-height: 70vh;
            margin: 0 auto;
            padding: 100px 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .empty-box {
            text-align: center;
          }

          .empty-box span {
            color: rgba(255, 50, 50, 0.65);
            font-size: 7px;
            letter-spacing: 0.22em;
          }

          .empty-box h1 {
            margin: 18px 0;
            font-family:
              "Space Grotesk",
              Inter,
              sans-serif;
            font-size:
              clamp(38px, 6vw, 65px);
            line-height: 0.95;
            font-weight: 500;
            letter-spacing: -0.055em;
          }

          .empty-box p {
            margin: 0 0 28px;
            color: rgba(245, 245, 243, 0.3);
            font-size: 8px;
            line-height: 1.8;
            letter-spacing: 0.08em;
          }

          .empty-button {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            height: 42px;
            padding: 0 17px;
            color: #fff;
            text-decoration: none;
            border:
              1px solid rgba(180, 25, 25, 0.65);
            background:
              linear-gradient(
                145deg,
                rgba(55, 4, 4, 0.98),
                rgba(12, 4, 4, 1)
              );
            font-size: 7px;
            letter-spacing: 0.18em;
          }

          .checkout-footer {
            position: relative;
            z-index: 5;
            width:
              min(
                1380px,
                calc(100% - 44px)
              );
            margin: 0 auto;
            min-height: 85px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            align-items: center;
            border-top:
              1px solid rgba(255, 255, 255, 0.06);
            color: rgba(245, 245, 243, 0.25);
            font-size: 7px;
            letter-spacing: 0.18em;
          }

          .checkout-footer div:nth-child(2) {
            text-align: center;
          }

          .checkout-footer div:nth-child(3) {
            text-align: right;
          }

          @media (max-width: 600px) {
            .checkout-footer {
              width:
                calc(100% - 28px);
              min-height: 100px;
              grid-template-columns: 1fr 1fr;
              row-gap: 12px;
              padding: 20px 0;
              font-size: 6px;
            }

            .checkout-footer div:nth-child(2) {
              text-align: right;
            }

            .checkout-footer div:nth-child(3) {
              grid-column: 1 / -1;
              text-align: left;
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="background-grid" />
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />
      <div className="red-vignette" />

      <div className="ambient-web web-one" />
      <div className="ambient-web web-two" />
      <div className="ambient-web web-three" />
      <div className="ambient-web web-four" />

      <div className="spider spider-one">
        <span className="spider-thread" />
        <div className="spider-body">
          <img src={SPIDER_IMAGE} alt="" />
        </div>
      </div>

      <div className="spider spider-two">
        <span className="spider-thread" />
        <div className="spider-body">
          <img src={SPIDER_IMAGE} alt="" />
        </div>
      </div>

      <div className="spider spider-three">
        <span className="spider-thread" />
        <div className="spider-body">
          <img src={SPIDER_IMAGE} alt="" />
        </div>
      </div>

      <div className="spider spider-four">
        <span className="spider-thread" />
        <div className="spider-body">
          <img src={SPIDER_IMAGE} alt="" />
        </div>
      </div>

      <header className="site-header">
        <Link href="/" className="home-button">
          <span className="home-blood home-blood-1" />
          <span className="home-blood home-blood-2" />
          <span className="home-web" />
          <span className="home-text">HOME</span>
          <span className="home-arrow">↗</span>
        </Link>
      </header>

      <section className="checkout-container">
        <div className="checkout-hero">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" />
              <span>STOKED BD / CHECKOUT</span>
            </div>

            <div className="title-wrap">
              <h1 className="checkout-title">
                CHECKOUT
              </h1>
              <span className="title-number">
                02
              </span>
            </div>

            <div className="title-line" />
          </div>

          <span className="hero-label">
            {totalItems}{" "}
            {totalItems === 1 ? "ITEM" : "ITEMS"} / READY
          </span>
        </div>

        <div className="checkout-layout">
          <form
            className="form-card"
            onSubmit={handlePlaceOrder}
          >
            <div className="form-top-line" />

            <div className="form-heading">
              <span>CUSTOMER INFORMATION</span>
              <span>REQUIRED</span>
            </div>

            <div className="form-content">
              {/* PERSONAL */}
              <div className="section-label">
                <span className="section-label-number">
                  01
                </span>

                <span className="section-label-text">
                  PERSONAL DETAILS
                </span>

                <span className="section-label-line" />
              </div>

              <div className="form-grid">
                <label className="field">
                  <span className="field-label">
                    FULL NAME *
                  </span>

                  <input
                    className="field-input"
                    type="text"
                    placeholder="Your full name"
                    value={customer.name}
                    onChange={(e) =>
                      updateCustomer(
                        "name",
                        e.target.value
                      )
                    }
                    required
                  />
                </label>

                <label className="field">
                  <span className="field-label">
                    PHONE NUMBER *
                  </span>

                  <input
                    className="field-input"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={customer.phone}
                    onChange={(e) =>
                      updateCustomer(
                        "phone",
                        e.target.value
                      )
                    }
                    required
                  />
                </label>

                <label className="field full">
                  <span className="field-label">
                    EMAIL / OPTIONAL
                  </span>

                  <input
                    className="field-input"
                    type="email"
                    placeholder="your@email.com"
                    value={customer.email}
                    onChange={(e) =>
                      updateCustomer(
                        "email",
                        e.target.value
                      )
                    }
                  />
                </label>
              </div>

              {/* DELIVERY ADDRESS */}
              <div className="address-section">
                <div className="section-label">
                  <span className="section-label-number">
                    02
                  </span>

                  <span className="section-label-text">
                    DELIVERY ADDRESS
                  </span>

                  <span className="section-label-line" />
                </div>

                {/* DELIVERY ZONES */}
                <div className="delivery-zone-label">
                  <span>SELECT DELIVERY AREA *</span>

                  <span className="delivery-zone-current">
                    {customer.deliveryZone
                      ? customer.deliveryZone ===
                        "inside-dhaka"
                        ? "৳80"
                        : customer.deliveryZone ===
                          "sub-urban"
                        ? "৳110"
                        : "৳150"
                      : "REQUIRED"}
                  </span>
                </div>

                <div className="delivery-zones">
                  <button
                    type="button"
                    className={`delivery-zone-card ${
                      customer.deliveryZone ===
                      "inside-dhaka"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      selectDeliveryZone(
                        "inside-dhaka"
                      )
                    }
                  >
                    <span className="zone-number">
                      01
                    </span>

                    <span className="zone-info">
                      <strong>
                        INSIDE DHAKA
                      </strong>

                      <small>
                        DHAKA CITY
                      </small>
                    </span>

                    <span className="zone-price">
                      ৳80
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`delivery-zone-card ${
                      customer.deliveryZone ===
                      "sub-urban"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      selectDeliveryZone(
                        "sub-urban"
                      )
                    }
                  >
                    <span className="zone-number">
                      02
                    </span>

                    <span className="zone-info">
                      <strong>
                        SUB-URBAN
                      </strong>

                      <small>
                        NEAR DHAKA
                      </small>
                    </span>

                    <span className="zone-price">
                      ৳110
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`delivery-zone-card ${
                      customer.deliveryZone ===
                      "outside-dhaka"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      selectDeliveryZone(
                        "outside-dhaka"
                      )
                    }
                  >
                    <span className="zone-number">
                      03
                    </span>

                    <span className="zone-info">
                      <strong>
                        OUTSIDE DHAKA
                      </strong>

                      <small>
                        OTHER DISTRICTS
                      </small>
                    </span>

                    <span className="zone-price">
                      ৳150
                    </span>
                  </button>
                </div>

                <div className="form-grid address-fields">
                  <label className="field">
                    <span className="field-label">
                      DISTRICT *
                    </span>

                    <select
                      className="field-select"
                      value={customer.district}
                      onChange={(e) =>
                        selectDistrict(
                          e.target.value
                        )
                      }
                      required
                      disabled={
                        !customer.deliveryZone
                      }
                    >
                      <option value="">
                        {!customer.deliveryZone
                          ? "SELECT DELIVERY AREA FIRST"
                          : "SELECT DISTRICT"}
                      </option>

                      {availableDistricts.map(
                        (district) => (
                          <option
                            key={district}
                            value={district}
                          >
                            {district}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label className="field">
                    <span className="field-label">
                      THANA / AREA *
                    </span>

                    <select
                      className="field-select"
                      value={customer.thana}
                      onChange={(e) =>
                        updateCustomer(
                          "thana",
                          e.target.value
                        )
                      }
                      required
                      disabled={
                        !customer.district
                      }
                    >
                      <option value="">
                        {!customer.district
                          ? "SELECT DISTRICT FIRST"
                          : "SELECT THANA / AREA"}
                      </option>

                      {availableThanas.map(
                        (thana) => (
                          <option
                            key={thana}
                            value={thana}
                          >
                            {thana}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label className="field full">
                    <span className="field-label">
                      FULL ADDRESS *
                    </span>

                    <textarea
                      className="field-textarea"
                      placeholder="House / Road / Block / Street / Landmark"
                      value={customer.address}
                      onChange={(e) =>
                        updateCustomer(
                          "address",
                          e.target.value
                        )
                      }
                      required
                    />
                  </label>
                </div>
              </div>

              {/* PAYMENT */}
              <div className="payment-section">
                <div className="section-label">
                  <span className="section-label-number">
                    03
                  </span>

                  <span className="section-label-text">
                    PAYMENT METHOD
                  </span>

                  <span className="section-label-line" />
                </div>

                <div className="payment-card">
                  <span className="payment-radio" />

                  <div className="payment-info">
                    <span className="payment-title">
                      CASH ON DELIVERY
                    </span>

                    <span className="payment-description">
                      Pay when your order arrives at
                      your delivery address.
                    </span>
                  </div>

                  <span className="payment-tag">
                    COD
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="place-order-button"
                disabled={placingOrder}
              >
                <span>
                  {placingOrder
                    ? "PROCESSING ORDER..."
                    : "PLACE ORDER"}
                </span>

                <span className="place-order-arrow">
                  {placingOrder ? "..." : "→"}
                </span>
              </button>
            </div>
          </form>

          {/* ORDER SUMMARY */}
          <aside className="summary-card">
            <div className="summary-top-line" />

            <div className="summary-heading">
              <span>ORDER SUMMARY</span>

              <span className="summary-status">
                {totalItems} ITEMS
              </span>
            </div>

            <div className="summary-content">
              <div className="summary-items">
                {cart.map((item, index) => (
                  <div
                    className="summary-item"
                    key={`${item.id}-${index}`}
                  >
                    <div className="summary-image">
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    </div>

                    <div className="summary-item-info">
                      <span className="summary-item-name">
                        {item.name}
                      </span>

                      <span className="summary-item-meta">
                        QTY / {item.quantity}
                        {item.size
                          ? `  •  SIZE / ${item.size}`
                          : ""}
                      </span>
                    </div>

                    <span className="summary-item-price">
                      ৳
                      {(
                        Number(item.price) *
                        Number(item.quantity)
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              <div className="summary-row">
                <span>ITEMS</span>
                <span>{totalItems}</span>
              </div>

              <div className="summary-row">
                <span>SUBTOTAL</span>
                <span>
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>

              <div className="summary-row">
                <span>DELIVERY</span>

                <span
                  className={
                    deliveryCharge === 0
                      ? "summary-pending"
                      : ""
                  }
                >
                  {deliveryCharge === 0
                    ? "SELECT AREA"
                    : `৳${deliveryCharge.toLocaleString()}`}
                </span>
              </div>

              {customer.deliveryZone && (
                <div className="summary-delivery-info">
                  <span>
                    {customer.deliveryZone ===
                    "inside-dhaka"
                      ? "INSIDE DHAKA"
                      : customer.deliveryZone ===
                        "sub-urban"
                      ? "SUB-URBAN"
                      : "OUTSIDE DHAKA"}
                  </span>

                  {customer.district && (
                    <span>
                      {customer.district}
                    </span>
                  )}
                </div>
              )}

              <div className="summary-divider" />

              <div className="summary-total">
                <span>TOTAL</span>

                <strong>
                  ৳{total.toLocaleString()}
                </strong>
              </div>

              <p className="summary-note">
                Cash on delivery selected. Delivery
                charge is calculated according to your
                selected delivery area.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <footer className="checkout-footer">
        <div>STOKED BD</div>
        <div>© {new Date().getFullYear()} STOKED</div>
        <div>BUILT FOR THE STREETS</div>
      </footer>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .checkout-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(120, 0, 0, 0.18),
              transparent 32%
            ),
            #070202;
          color: #f5f5f3;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
        }

        .background-grid {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.13;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.025) 1px,
              transparent 1px
            );
          background-size: 70px 70px;
          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 92%
            );
        }

        .background-glow {
          position: fixed;
          z-index: 0;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(90px);
        }

        .glow-one {
          width: 420px;
          height: 420px;
          top: -190px;
          left: 25%;
          background: rgba(180, 0, 0, 0.1);
        }

        .glow-two {
          width: 320px;
          height: 320px;
          right: -100px;
          top: 48%;
          background: rgba(180, 0, 0, 0.07);
        }

        .red-vignette {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          box-shadow:
            inset 0 0 180px rgba(0, 0, 0, 0.85),
            inset 0 0 45px rgba(120, 0, 0, 0.1);
        }

        .ambient-web {
          position: fixed;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          z-index: 1;
          pointer-events: none;
          opacity: 0.07;
          background:
            repeating-radial-gradient(
              circle,
              transparent 0,
              transparent 18px,
              rgba(255, 60, 60, 0.7) 19px,
              transparent 20px
            );
          animation:
            webPulse 7s ease-in-out infinite;
        }

        .web-one {
          top: 90px;
          left: -70px;
        }

        .web-two {
          top: 35%;
          right: -80px;
          animation-delay: 1.5s;
        }

        .web-three {
          bottom: 8%;
          left: -70px;
          animation-delay: 3s;
        }

        .web-four {
          bottom: -60px;
          right: -40px;
          animation-delay: 4.5s;
        }

        @keyframes webPulse {
          0%,
          100% {
            opacity: 0.035;
            transform: scale(0.95);
          }

          50% {
            opacity: 0.09;
            transform: scale(1.05);
          }
        }

        .spider {
          position: fixed;
          z-index: 2;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          animation:
            spiderAppear 1.2s ease-out forwards,
            spiderFloat 6s ease-in-out infinite;
        }

        .spider-thread {
          width: 1px;
          height: 80px;
          background:
            linear-gradient(
              to bottom,
              transparent,
              rgba(255, 255, 255, 0.25),
              rgba(255, 40, 40, 0.55)
            );
        }

        .spider-body {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          filter:
            drop-shadow(
              0 0 12px rgba(255, 0, 0, 0.4)
            );
        }

        .spider-body img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
        }

        .spider-one {
          top: 125px;
          left: 7%;
          animation-delay:
            0.2s,
            0.2s;
        }

        .spider-two {
          top: 255px;
          right: 8%;
          transform: scale(0.72);
          animation-delay:
            0.4s,
            1s;
        }

        .spider-three {
          top: 56%;
          left: 4%;
          transform: scale(0.6);
          animation-delay:
            0.6s,
            2s;
        }

        .spider-four {
          top: 67%;
          right: 5%;
          transform: scale(0.8);
          animation-delay:
            0.8s,
            3s;
        }

        @keyframes spiderAppear {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }

          to {
            opacity: 0.48;
          }
        }

        @keyframes spiderFloat {
          0%,
          100% {
            margin-top: 0;
          }

          50% {
            margin-top: 18px;
          }
        }

        /* HEADER */

        .site-header {
          position: relative;
          z-index: 10;
          width: 100%;
          height: 82px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding:
            0 clamp(22px, 5vw, 70px);
          border-bottom:
            1px solid rgba(255, 255, 255, 0.06);
          background:
            rgba(7, 2, 2, 0.48);
          backdrop-filter: blur(18px);
        }

        .home-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 78px;
          height: 36px;
          padding: 0 14px;
          overflow: hidden;
          isolation: isolate;
          color: #eeeeeb;
          text-decoration: none;
          background:
            linear-gradient(
              145deg,
              rgba(105, 7, 7, 0.96),
              rgba(28, 3, 3, 0.99)
            );
          border:
            1px solid rgba(190, 30, 30, 0.7);
          box-shadow:
            inset 0 0 20px rgba(140, 0, 0, 0.2),
            0 0 16px rgba(110, 0, 0, 0.18);
          backdrop-filter: blur(14px);
          transition:
            transform 0.3s ease,
            border-color 0.3s ease,
            background 0.3s ease,
            box-shadow 0.3s ease;
        }

        .home-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              circle at 15% 100%,
              rgba(190, 0, 0, 0.35),
              transparent 38%
            ),
            radial-gradient(
              circle at 90% 0%,
              rgba(130, 0, 0, 0.28),
              transparent 40%
            );
          pointer-events: none;
          z-index: 0;
        }

        .home-blood {
          position: absolute;
          bottom: -1px;
          width: 3px;
          background:
            linear-gradient(
              to bottom,
              #a30a0a,
              #4c0101
            );
          border-radius: 0 0 50% 50%;
          opacity: 0.8;
          z-index: 2;
          pointer-events: none;
          filter:
            drop-shadow(
              0 0 4px rgba(150, 0, 0, 0.6)
            );
        }

        .home-blood-1 {
          left: 18%;
          height: 8px;
          box-shadow:
            13px 1px 0 rgba(90, 2, 2, 0.9),
            31px -1px 0 rgba(125, 4, 4, 0.75);
        }

        .home-blood-2 {
          right: 17%;
          height: 5px;
          box-shadow:
            -12px 1px 0 rgba(85, 2, 2, 0.8),
            -27px 0 0 rgba(120, 3, 3, 0.65);
        }

        .home-web {
          position: absolute;
          width: 34px;
          height: 34px;
          top: -16px;
          right: -12px;
          opacity: 0.28;
          pointer-events: none;
          background:
            repeating-conic-gradient(
              from 0deg,
              transparent 0deg 12deg,
              rgba(255, 255, 255, 0.4) 12.5deg 13.2deg,
              transparent 13.7deg 25deg
            );
          border-radius: 50%;
          mask-image:
            radial-gradient(
              circle,
              transparent 0 6px,
              #000 6.5px 7px,
              transparent 7.5px 12px,
              #000 12.5px 13px,
              transparent 13.5px 18px,
              #000 18.5px 19px,
              transparent 19.5px
            );
          -webkit-mask-image:
            radial-gradient(
              circle,
              transparent 0 6px,
              #000 6.5px 7px,
              transparent 7.5px 12px,
              #000 12.5px 13px,
              transparent 13.5px 18px,
              #000 18.5px 19px,
              transparent 19.5px
            );
          z-index: 1;
        }

        .home-text {
          position: relative;
          z-index: 5;
          color: rgba(235, 235, 232, 0.88);
          font-family:
            "Space Grotesk",
            Inter,
            Arial,
            sans-serif;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.24em;
        }

        .home-arrow {
          position: relative;
          z-index: 5;
          color: rgba(235, 235, 235, 0.65);
          font-family: Arial, sans-serif;
          font-size: 13px;
          font-weight: 300;
        }

        .home-button:hover {
          transform: translateY(-2px);
          border-color:
            rgba(225, 40, 40, 0.95);
          background:
            linear-gradient(
              145deg,
              rgba(125, 8, 8, 0.98),
              rgba(30, 3, 3, 1)
            );
          box-shadow:
            inset 0 0 25px rgba(170, 0, 0, 0.25),
            0 0 20px rgba(145, 0, 0, 0.3),
            0 0 35px rgba(100, 0, 0, 0.14);
        }

        .home-button:hover .home-text {
          color: #f4f4f1;
          letter-spacing: 0.27em;
        }

        .home-button:hover .home-arrow {
          color: #ffffff;
          transform: translate(2px, -2px);
        }

        .home-button:hover .home-web {
          opacity: 0.5;
        }

        /* CHECKOUT */

        .checkout-container {
          position: relative;
          z-index: 5;
          width:
            min(
              1380px,
              calc(100% - 44px)
            );
          margin: 0 auto;
          padding:
            clamp(65px, 8vw, 110px)
            0
            100px;
        }

        .checkout-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          padding-bottom: 34px;
          border-bottom:
            1px solid rgba(255, 255, 255, 0.09);
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 18px;
          color: rgba(245, 245, 243, 0.4);
          font-size: 8px;
          letter-spacing: 0.24em;
        }

        .eyebrow-line {
          width: 28px;
          height: 1px;
          background: #ff2020;
          box-shadow:
            0 0 9px rgba(255, 30, 30, 0.7);
        }

        .title-wrap {
          position: relative;
          display: inline-block;
        }

        .checkout-title {
          margin: 0;
          font-family:
            "Space Grotesk",
            Inter,
            sans-serif;
          font-size:
            clamp(40px, 5.2vw, 68px);
          line-height: 0.94;
          font-weight: 500;
          letter-spacing: -0.05em;
          color: #f5f5f3;
          animation:
            titleReveal 0.9s
            cubic-bezier(0.2, 0.7, 0.2, 1)
            both;
        }

        .title-number {
          position: absolute;
          top: -7px;
          right: -27px;
          color: rgba(255, 45, 45, 0.6);
          font-size: 7px;
          letter-spacing: 0.2em;
        }

        .title-line {
          width: 45px;
          height: 1px;
          margin-top: 17px;
          background:
            linear-gradient(
              90deg,
              #ff2020,
              transparent
            );
          box-shadow:
            0 0 10px rgba(255, 20, 20, 0.7);
        }

        .hero-label {
          color: rgba(245, 245, 243, 0.35);
          font-size: 8px;
          letter-spacing: 0.2em;
        }

        @keyframes titleReveal {
          from {
            opacity: 0;
            transform: translateY(14px);
            filter: blur(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .checkout-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(320px, 380px);
          gap:
            clamp(35px, 6vw, 90px);
          align-items: start;
          margin-top: 42px;
        }

        .form-card {
          position: relative;
          overflow: hidden;
          border:
            1px solid rgba(255, 255, 255, 0.08);
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.028),
              rgba(255, 0, 0, 0.018)
            );
          box-shadow:
            0 25px 80px rgba(0, 0, 0, 0.25);
        }

        .form-top-line {
          width: 100%;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              #ff2020,
              rgba(255, 32, 32, 0.15),
              transparent
            );
          box-shadow:
            0 0 15px rgba(255, 20, 20, 0.4);
        }

        .form-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 24px 18px;
          border-bottom:
            1px solid rgba(255, 255, 255, 0.07);
        }

        .form-heading span:first-child {
          color: #f5f5f3;
          font-size: 8px;
          letter-spacing: 0.2em;
        }

        .form-heading span:last-child {
          color: rgba(255, 60, 60, 0.7);
          font-size: 7px;
          letter-spacing: 0.15em;
        }

        .form-content {
          padding: 28px 24px;
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .section-label-number {
          color: rgba(255, 45, 45, 0.65);
          font-size: 7px;
          letter-spacing: 0.15em;
        }

        .section-label-text {
          color: rgba(245, 245, 243, 0.55);
          font-size: 8px;
          letter-spacing: 0.2em;
        }

        .section-label-line {
          flex: 1;
          height: 1px;
          background:
            rgba(255, 255, 255, 0.06);
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field-label {
          color: rgba(245, 245, 243, 0.32);
          font-size: 7px;
          letter-spacing: 0.18em;
        }

        .field-input,
        .field-textarea,
        .field-select {
          width: 100%;
          border:
            1px solid rgba(255, 255, 255, 0.09);
          outline: none;
          background:
            rgba(255, 255, 255, 0.018);
          color: #f5f5f3;
          font-family:
            Inter,
            Arial,
            sans-serif;
          font-size: 10px;
          letter-spacing: 0.04em;
          transition:
            border-color 0.25s ease,
            background 0.25s ease,
            box-shadow 0.25s ease;
        }

        .field-input,
        .field-select {
          height: 46px;
          padding: 0 13px;
        }

        .field-textarea {
          min-height: 100px;
          padding: 13px;
          resize: vertical;
        }

        .field-input::placeholder,
        .field-textarea::placeholder {
          color:
            rgba(245, 245, 243, 0.18);
        }

        .field-input:focus,
        .field-textarea:focus,
        .field-select:focus {
          border-color:
            rgba(255, 40, 40, 0.42);
          background:
            rgba(255, 0, 0, 0.025);
          box-shadow:
            0 0 20px rgba(255, 0, 0, 0.04);
        }

        .field-input:disabled,
        .field-select:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }

        .field-select option {
          background: #100404;
          color: #fff;
        }

        .address-section {
          margin-top: 35px;
        }

        /* DELIVERY ZONES */

        .delivery-zone-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin:
            0 0 12px;
          color:
            rgba(245, 245, 243, 0.32);
          font-size: 7px;
          letter-spacing: 0.18em;
        }

        .delivery-zone-current {
          color:
            rgba(255, 60, 60, 0.75);
          font-size: 7px;
          letter-spacing: 0.14em;
        }

        .delivery-zones {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }

        .delivery-zone-card {
          position: relative;
          min-height: 88px;
          padding: 13px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          text-align: left;
          border:
            1px solid rgba(255, 255, 255, 0.08);
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.025),
              rgba(255, 0, 0, 0.012)
            );
          color: #f5f5f3;
          cursor: pointer;
          overflow: hidden;
          transition:
            border-color 0.25s ease,
            background 0.25s ease,
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .delivery-zone-card::before {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255, 40, 40, 0.4),
              transparent
            );
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .delivery-zone-card:hover {
          transform: translateY(-2px);
          border-color:
            rgba(255, 40, 40, 0.3);
          background:
            linear-gradient(
              145deg,
              rgba(110, 0, 0, 0.1),
              rgba(255, 255, 255, 0.025)
            );
        }

        .delivery-zone-card.active {
          border-color:
            rgba(255, 40, 40, 0.65);
          background:
            linear-gradient(
              145deg,
              rgba(125, 0, 0, 0.16),
              rgba(255, 255, 255, 0.025)
            );
          box-shadow:
            inset 0 0 25px rgba(180, 0, 0, 0.08),
            0 0 22px rgba(180, 0, 0, 0.08);
        }

        .delivery-zone-card.active::before {
          opacity: 1;
        }

        .zone-number {
          color:
            rgba(255, 55, 55, 0.65);
          font-size: 6px;
          letter-spacing: 0.16em;
        }

        .zone-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .zone-info strong {
          color:
            rgba(245, 245, 243, 0.82);
          font-family:
            "Space Grotesk",
            Inter,
            sans-serif;
          font-size: 8px;
          font-weight: 500;
          letter-spacing: 0.12em;
        }

        .zone-info small {
          color:
            rgba(245, 245, 243, 0.25);
          font-size: 6px;
          letter-spacing: 0.1em;
        }

        .zone-price {
          position: absolute;
          top: 13px;
          right: 13px;
          color:
            rgba(255, 70, 70, 0.8);
          font-family:
            "Space Grotesk",
            Inter,
            sans-serif;
          font-size: 9px;
          letter-spacing: 0.02em;
        }

        .address-fields {
          margin-top: 5px;
        }

        .payment-section {
          margin-top: 35px;
        }

        .payment-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          min-height: 72px;
          padding: 15px;
          border:
            1px solid rgba(255, 40, 40, 0.35);
          background:
            linear-gradient(
              120deg,
              rgba(130, 0, 0, 0.11),
              rgba(255, 255, 255, 0.018)
            );
        }

        .payment-radio {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
          border-radius: 50%;
          border:
            1px solid rgba(255, 50, 50, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .payment-radio::after {
          content: "";
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ff2020;
          box-shadow:
            0 0 10px rgba(255, 20, 20, 0.8);
        }

        .payment-info {
          flex: 1;
        }

        .payment-title {
          display: block;
          margin-bottom: 5px;
          color: #f5f5f3;
          font-size: 8px;
          letter-spacing: 0.17em;
        }

        .payment-description {
          display: block;
          color: rgba(245, 245, 243, 0.3);
          font-size: 7px;
          line-height: 1.6;
          letter-spacing: 0.04em;
        }

        .payment-tag {
          color: rgba(255, 60, 60, 0.7);
          font-size: 6px;
          letter-spacing: 0.15em;
        }

        .place-order-button {
          position: relative;
          width: 100%;
          height: 54px;
          margin-top: 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          border:
            1px solid rgba(255, 40, 40, 0.45);
          background:
            linear-gradient(
              100deg,
              #9d0000,
              #e31b1b
            );
          color: #fff;
          font-family: inherit;
          font-size: 8px;
          letter-spacing: 0.16em;
          cursor: pointer;
          overflow: hidden;
          box-shadow:
            0 0 30px rgba(255, 0, 0, 0.08);
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .place-order-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              110deg,
              transparent 30%,
              rgba(255, 255, 255, 0.18),
              transparent 70%
            );
          transform: translateX(-120%);
          transition:
            transform 0.6s ease;
        }

        .place-order-button:hover {
          transform: translateY(-2px);
          box-shadow:
            0 12px 35px rgba(255, 0, 0, 0.18);
        }

        .place-order-button:hover::before {
          transform: translateX(120%);
        }

        .place-order-button span {
          position: relative;
          z-index: 1;
        }

        .place-order-arrow {
          font-size: 15px;
        }

        .place-order-button:disabled {
          opacity: 0.65;
          cursor: wait;
          transform: none;
        }

        /* SUMMARY */

        .summary-card {
          position: sticky;
          top: 28px;
          overflow: hidden;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.035),
              rgba(255, 0, 0, 0.025)
            );
          border:
            1px solid rgba(255, 255, 255, 0.09);
          box-shadow:
            0 25px 80px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(20px);
        }

        .summary-top-line {
          width: 100%;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              #ff2020,
              rgba(255, 32, 32, 0.15),
              transparent
            );
          box-shadow:
            0 0 15px rgba(255, 20, 20, 0.4);
        }

        .summary-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 24px 18px;
          border-bottom:
            1px solid rgba(255, 255, 255, 0.07);
          color: #f5f5f3;
          font-size: 8px;
          letter-spacing: 0.2em;
        }

        .summary-status {
          color:
            rgba(255, 60, 60, 0.7);
          font-size: 7px;
        }

        .summary-content {
          padding: 24px;
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 23px;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .summary-image {
          position: relative;
          width: 54px;
          height: 62px;
          flex: 0 0 54px;
          overflow: hidden;
          border:
            1px solid rgba(255, 255, 255, 0.08);
          background:
            rgba(255, 255, 255, 0.02);
        }

        .summary-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .summary-item-info {
          min-width: 0;
          flex: 1;
        }

        .summary-item-name {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color:
            rgba(245, 245, 243, 0.8);
          font-family:
            "Space Grotesk",
            Inter,
            sans-serif;
          font-size: 9px;
          letter-spacing: 0.01em;
        }

        .summary-item-meta {
          display: block;
          margin-top: 6px;
          color:
            rgba(245, 245, 243, 0.28);
          font-size: 6px;
          letter-spacing: 0.12em;
        }

        .summary-item-price {
          color:
            rgba(245, 245, 243, 0.7);
          font-size: 8px;
          white-space: nowrap;
        }

        .summary-divider {
          height: 1px;
          margin: 23px 0;
          background:
            rgba(255, 255, 255, 0.07);
        }

        .summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          color:
            rgba(245, 245, 243, 0.42);
          font-size: 8px;
          letter-spacing: 0.16em;
        }

        .summary-row span:last-child {
          color:
            rgba(245, 245, 243, 0.75);
        }

        .summary-pending {
          color:
            rgba(255, 60, 60, 0.75) !important;
        }

        .summary-delivery-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: -5px;
          margin-bottom: 4px;
          color:
            rgba(255, 60, 60, 0.48);
          font-size: 6px;
          letter-spacing: 0.12em;
        }

        .summary-total {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: 23px;
          margin-bottom: 8px;
        }

        .summary-total span {
          color:
            rgba(245, 245, 243, 0.4);
          font-size: 8px;
          letter-spacing: 0.18em;
        }

        .summary-total strong {
          color: #f5f5f3;
          font-family:
            "Space Grotesk",
            Inter,
            sans-serif;
          font-size: 25px;
          font-weight: 500;
          letter-spacing: -0.03em;
        }

        .summary-note {
          margin: 0;
          color:
            rgba(245, 245, 243, 0.23);
          font-size: 6px;
          line-height: 1.7;
          letter-spacing: 0.08em;
        }

        /* FOOTER */

        .checkout-footer {
          position: relative;
          z-index: 5;
          width:
            min(
              1380px,
              calc(100% - 44px)
            );
          margin: 0 auto;
          min-height: 85px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          border-top:
            1px solid rgba(255, 255, 255, 0.06);
          color:
            rgba(245, 245, 243, 0.25);
          font-size: 7px;
          letter-spacing: 0.18em;
        }

        .checkout-footer div:nth-child(2) {
          text-align: center;
        }

        .checkout-footer div:nth-child(3) {
          text-align: right;
        }

        /* RESPONSIVE */

        @media (max-width: 900px) {
          .checkout-layout {
            grid-template-columns:
              minmax(0, 1fr)
              330px;
            gap: 35px;
          }

          .delivery-zones {
            grid-template-columns: 1fr;
          }

          .delivery-zone-card {
            min-height: 72px;
          }
        }

        @media (max-width: 800px) {
          .site-header {
            height: 70px;
            padding: 0 20px;
          }

          .checkout-container {
            width:
              calc(100% - 32px);
            padding:
              55px 0 70px;
          }

          .checkout-hero {
            align-items: flex-start;
            flex-direction: column;
            gap: 20px;
          }

          .checkout-layout {
  grid-template-columns: 1fr;
  gap: 35px;
  margin-top: 30px;
}

.summary-card {
  order: -1;
}

.form-card {
  order: 1;
}

          .summary-card {
            position: relative;
            top: auto;
          }

          .spider-one {
            left: 1%;
          }

          .spider-two {
            right: 1%;
          }

          .spider-three {
            left: -2%;
          }

          .spider-four {
            right: -2%;
          }
        }

        @media (max-width: 600px) {
          .checkout-page {
            width: 100%;
            overflow-x: hidden;
          }

          .site-header {
            height: 66px;
            padding: 0 16px;
          }

          .home-button {
            min-width: 70px;
            height: 33px;
            padding: 0 11px;
            gap: 7px;
          }

          .home-text {
            font-size: 7px;
            letter-spacing: 0.2em;
          }

          .home-arrow {
            font-size: 12px;
          }

          .checkout-container {
            width:
              calc(100% - 28px);
            padding:
              45px 0 55px;
          }

          .eyebrow {
            margin-bottom: 14px;
            font-size: 7px;
          }

          .checkout-title {
            font-size: 38px;
            letter-spacing: -0.045em;
          }

          .title-number {
            top: -5px;
            right: -23px;
          }

          .title-line {
            width: 34px;
            margin-top: 14px;
          }

          .hero-label {
            font-size: 7px;
          }

          .form-heading {
            padding:
              19px 18px 16px;
          }

          .form-content {
            padding:
              22px 18px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .field.full {
            grid-column: auto;
          }

          .address-section,
          .payment-section {
            margin-top: 30px;
          }

          .field-input,
          .field-select {
            height: 44px;
          }

          .field-textarea {
            min-height: 95px;
          }

          .delivery-zone-label {
            margin-bottom: 10px;
          }

          .delivery-zones {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .delivery-zone-card {
            min-height: 70px;
            padding: 12px;
          }

          .zone-price {
            top: 12px;
            right: 12px;
          }

          .payment-card {
            min-height: 78px;
            padding: 13px;
          }

          .summary-heading {
            padding:
              19px 18px 16px;
          }

          .summary-content {
            padding:
              20px 18px 18px;
          }

          .summary-total strong {
            font-size: 23px;
          }

          .checkout-footer {
            width:
              calc(100% - 28px);
            min-height: 100px;
            grid-template-columns: 1fr 1fr;
            row-gap: 12px;
            padding:
              20px 0;
            font-size: 6px;
          }

          .checkout-footer div:nth-child(2) {
            text-align: right;
          }

          .checkout-footer div:nth-child(3) {
            grid-column:
              1 / -1;
            text-align: left;
          }

          .spider-body {
            width: 28px;
            height: 28px;
          }

          .spider-thread {
            height: 52px;
          }

          .spider-one {
            top: 105px;
          }

          .spider-two {
            top: 215px;
          }

          .spider-three {
            top: 58%;
          }

          .spider-four {
            top: 73%;
          }

          .ambient-web {
            opacity: 0.045;
          }
        }

        @media (max-width: 380px) {
          .checkout-container {
            width:
              calc(100% - 22px);
          }

          .checkout-title {
            font-size: 34px;
          }

          .home-button {
            min-width: 66px;
            height: 32px;
            padding: 0 9px;
            gap: 6px;
          }

          .home-text {
            font-size: 6.5px;
            letter-spacing: 0.18em;
          }

          .home-arrow {
            font-size: 11px;
          }

          .form-content {
            padding:
              20px 15px;
          }

          .summary-content {
            padding:
              18px 15px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration:
              0.01ms !important;

            animation-iteration-count:
              1 !important;

            transition-duration:
              0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}