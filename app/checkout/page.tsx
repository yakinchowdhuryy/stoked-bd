"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
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
  "https://www.pngall.com/wp-content/uploads/13/Spiderman-Logo-No-Background.png";

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
    "Adabor", "Airport", "Badda", "Bangshal", "Cantonment", "Chak Bazar",
    "Darus Salam", "Demra", "Dhanmondi", "Gandaria", "Gulshan", "Hazaribagh",
    "Jatrabari", "Kadamtali", "Kafrul", "Kalabagan", "Kamrangirchar",
    "Khilgaon", "Khilkhet", "Kotwali", "Lalbagh", "Mirpur", "Mohammadpur",
    "Motijheel", "Mugda", "New Market", "Pallabi", "Paltan", "Ramna",
    "Rampura", "Sabujbagh", "Shah Ali", "Shahbagh", "Shahjahanpur",
    "Sher-e-Bangla Nagar", "Shyampur", "Sutrapur", "Tejgaon",
    "Tejgaon Industrial Area", "Turag", "Uttara East", "Uttara West",
    "Uttarkhan", "Vatara", "Wari",
  ],

  Gazipur: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"],

  Narayanganj: [
    "Narayanganj Sadar", "Bandar", "Rupganj", "Sonargaon", "Araihazar",
  ],

  Narsingdi: [
    "Narsingdi Sadar", "Belabo", "Monohardi", "Palash", "Raipura", "Shibpur",
  ],

  Manikganj: [
    "Manikganj Sadar", "Daulatpur", "Ghior", "Harirampur", "Saturia",
    "Shibalaya", "Singair",
  ],

  Munshiganj: [
    "Munshiganj Sadar", "Gazaria", "Lohajang", "Sirajdikhan", "Sreenagar",
    "Tongibari",
  ],

  Bagerhat: [
    "Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat",
    "Mongla", "Morrelganj", "Rampal", "Sharankhola",
  ],

  Bandarban: [
    "Bandarban Sadar", "Alikadam", "Lama", "Naikhongchhari", "Rowangchhari",
    "Ruma", "Thanchi",
  ],

  Barguna: [
    "Barguna Sadar", "Amtali", "Bamna", "Betagi", "Patharghata", "Taltali",
  ],

  Barishal: [
    "Barishal Sadar", "Agailjhara", "Babuganj", "Bakerganj", "Banaripara",
    "Gaurnadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur",
  ],

  Bhola: [
    "Bhola Sadar", "Borhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan",
    "Manpura", "Tazumuddin",
  ],

  Bogura: [
    "Bogura Sadar", "Adamdighi", "Dhunat", "Dupchanchia", "Gabtali",
    "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur",
    "Shibganj", "Sonatala",
  ],

  Brahmanbaria: [
    "Brahmanbaria Sadar", "Akhaura", "Ashuganj", "Bancharampur", "Bijoynagar",
    "Kasba", "Nabinagar", "Nasirnagar", "Sarail",
  ],

  Chandpur: [
    "Chandpur Sadar", "Faridganj", "Haimchar", "Hajiganj", "Kachua",
    "Matlab Dakshin", "Matlab Uttar", "Shahrasti",
  ],

  Chattogram: [
    "Chattogram Sadar", "Anwara", "Banshkhali", "Boalkhali", "Chandanaish",
    "Fatikchhari", "Hathazari", "Lohagara", "Mirsharai", "Patiya",
    "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda", "Karnaphuli",
  ],

  Chuadanga: ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"],

  "Cox's Bazar": [
    "Cox's Bazar Sadar", "Chakaria", "Eidgaon", "Kutubdia", "Maheshkhali",
    "Pekua", "Ramu", "Teknaf", "Ukhiya",
  ],

  Cumilla: [
    "Cumilla Sadar", "Barura", "Brahmanpara", "Burichang", "Chandina",
    "Chauddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Lalmai",
    "Meghna", "Monoharganj", "Muradnagar", "Nangalkot", "Titas",
  ],

  Dinajpur: [
    "Dinajpur Sadar", "Birampur", "Birganj", "Biral", "Bochaganj",
    "Chirirbandar", "Fulbari", "Ghoraghat", "Hakimpur", "Kaharole",
    "Khansama", "Nawabganj", "Parbatipur",
  ],

  Faridpur: [
    "Faridpur Sadar", "Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan",
    "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha",
  ],

  Feni: [
    "Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Fulgazi", "Parshuram",
    "Sonagazi",
  ],

  Gaibandha: [
    "Gaibandha Sadar", "Fulchhari", "Gobindaganj", "Palashbari",
    "Sadullapur", "Saghata", "Sundarganj",
  ],

  Gopalganj: [
    "Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara",
  ],

  Habiganj: [
    "Habiganj Sadar", "Ajmiriganj", "Bahubal", "Baniachong", "Chunarughat",
    "Lakhai", "Madhabpur", "Nabiganj", "Shayestaganj",
  ],

  Jamalpur: [
    "Jamalpur Sadar", "Bakshiganj", "Dewanganj", "Islampur", "Madarganj",
    "Melandaha", "Sarishabari",
  ],

  Jashore: [
    "Jashore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha",
    "Keshabpur", "Manirampur", "Sharsha",
  ],

  Jhalokathi: ["Jhalokathi Sadar", "Kathalia", "Nalchity", "Rajapur"],

  Jhenaidah: [
    "Jhenaidah Sadar", "Harinakunda", "Kaliganj", "Kotchandpur", "Maheshpur",
    "Shailkupa",
  ],

  Joypurhat: [
    "Joypurhat Sadar", "Akkelpur", "Kalai", "Khetlal", "Panchbibi",
  ],

  Khagrachhari: [
    "Khagrachhari Sadar", "Dighinala", "Guimara", "Lakshmichhari",
    "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh",
  ],

  Khulna: [
    "Khulna Sadar", "Batiaghata", "Dakop", "Dumuria", "Dighalia", "Dacope",
    "Koyra", "Paikgachha", "Phultala", "Rupsa", "Terokhada",
  ],

  Kishoreganj: [
    "Kishoreganj Sadar", "Austagram", "Bajitpur", "Bhairab", "Hossainpur",
    "Itna", "Karimganj", "Katiadi", "Kuliarchar", "Mithamain", "Nikli",
    "Pakundia", "Tarail",
  ],

  Kurigram: [
    "Kurigram Sadar", "Bhurungamari", "Char Rajibpur", "Chilmari",
    "Phulbari", "Nageshwari", "Rajarhat", "Raomari", "Ulipur",
  ],

  Kushtia: [
    "Kushtia Sadar", "Bheramara", "Daulatpur", "Khoksa", "Kumarkhali",
    "Mirpur",
  ],

  Lakshmipur: [
    "Lakshmipur Sadar", "Kamalnagar", "Raipur", "Ramganj", "Ramgati",
    "Chandraganj",
  ],

  Lalmonirhat: [
    "Lalmonirhat Sadar", "Aditmari", "Hatibandha", "Kaliganj", "Patgram",
  ],

  Madaripur: [
    "Madaripur Sadar", "Kalkini", "Rajoir", "Shibchar", "Dasar",
  ],

  Magura: ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"],

  Meherpur: ["Meherpur Sadar", "Gangni", "Mujibnagar"],

  Moulvibazar: [
    "Moulvibazar Sadar", "Barlekha", "Juri", "Kamalganj", "Kulaura",
    "Rajnagar", "Sreemangal",
  ],

  Mymensingh: [
    "Mymensingh Sadar", "Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon",
    "Gauripur", "Haluaghat", "Ishwarganj", "Muktagachha", "Nandail",
    "Phulpur", "Tarakanda", "Trishal",
  ],

  Naogaon: [
    "Naogaon Sadar", "Atrai", "Badalgachhi", "Dhamoirhat", "Manda",
    "Mahadebpur", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar",
  ],

  Narail: ["Narail Sadar", "Kalia", "Lohagara"],

  Natore: [
    "Natore Sadar", "Bagatipara", "Baraigram", "Gurudaspur", "Lalpur",
    "Naldanga", "Singra",
  ],

  Netrokona: [
    "Netrokona Sadar", "Atpara", "Barhatta", "Durgapur", "Khaliajuri",
    "Kalmakanda", "Kendua", "Madan", "Mohanganj", "Purbadhala",
  ],

  Nilphamari: [
    "Nilphamari Sadar", "Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Saidpur",
  ],

  Noakhali: [
    "Noakhali Sadar", "Begumganj", "Chatkhil", "Companiganj", "Hatiya",
    "Kabirhat", "Senbagh", "Sonaimuri", "Subarnachar",
  ],

  Pabna: [
    "Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur",
    "Ishwardi", "Santhia", "Sujanagar",
  ],

  Panchagarh: ["Panchagarh Sadar", "Atwari", "Boda", "Debiganj", "Tetulia"],

  Patuakhali: [
    "Patuakhali Sadar", "Bauphal", "Dashmina", "Dumki", "Galachipa",
    "Kalapara", "Mirzaganj", "Rangabali",
  ],

  Pirojpur: [
    "Pirojpur Sadar", "Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur",
    "Nesarabad", "Indurkani",
  ],

  Rajbari: [
    "Rajbari Sadar", "Baliakandi", "Goalanda", "Kalukhali", "Pangsha",
  ],

  Rajshahi: [
    "Rajshahi Sadar", "Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari",
    "Mohanpur", "Paba", "Puthia", "Tanore",
  ],

  Rangamati: [
    "Rangamati Sadar", "Baghaichhari", "Barkal", "Belaichhari", "Juraichhari",
    "Kaptai", "Kawkhali", "Langadu", "Naniarchar", "Rajasthali",
  ],

  Rangpur: [
    "Rangpur Sadar", "Badarganj", "Gangachara", "Kaunia", "Mithapukur",
    "Pirganj", "Pirgachha", "Taraganj",
  ],

  Satkhira: [
    "Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Kaliganj",
    "Shyamnagar", "Tala",
  ],

  Shariatpur: [
    "Shariatpur Sadar", "Bhedarganj", "Damudya", "Gosairhat", "Naria",
    "Zajira",
  ],

  Sherpur: [
    "Sherpur Sadar", "Jhenaigati", "Nakla", "Nalitabari", "Sreebardi",
  ],

  Sirajganj: [
    "Sirajganj Sadar", "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur",
    "Raiganj", "Shahjadpur", "Tarash", "Ullapara",
  ],

  Sunamganj: [
    "Sunamganj Sadar", "Bishwambharpur", "Chhatak", "Derai", "Dharampasha",
    "Dowarabazar", "Jagannathpur", "Jamalganj", "Madhyanagar", "Shalla",
    "Shantiganj", "Tahirpur",
  ],

  Sylhet: [
    "Sylhet Sadar", "Balaganj", "Beanibazar", "Bishwanath", "Companiganj",
    "Dakshin Surma", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur",
    "Kanaighat", "Osmani Nagar", "Zakiganj",
  ],

  Tangail: [
    "Tangail Sadar", "Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail",
    "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur",
  ],

  Thakurgaon: [
    "Thakurgaon Sadar", "Baliadangi", "Haripur", "Pirganj", "Ranishankail",
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
    (total, item) => total + Number(item.quantity),
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

    /*
     * STOCK CHECK
     * Order dewar age database theke abar check kori,
     * kono product STOCKED OUT hoye gele order hobe na.
     */
    try {
      const stockIds = Array.from(new Set(cart.map((item) => item.id)));

      const { data: statusRows, error: statusError } = await supabase
        .from("products")
        .select("id, status")
        .in("id", stockIds);

      if (statusError) {
        alert("Could not verify product availability. Please try again.");
        setPlacingOrder(false);
        return;
      }

      const blockedItems = cart.filter((item) => {
        const row = (statusRows || []).find((r: any) => r.id === item.id);
        return !row || row.status !== "AVAILABLE";
      });

      if (blockedItems.length > 0) {
        alert(
          `Sorry, these items are stocked out:\n\n${blockedItems
            .map((item) => item.name)
            .join("\n")}\n\nPlease remove them from your bag.`
        );
        setPlacingOrder(false);
        router.push("/cart");
        return;
      }
    } catch (stockCheckError) {
      console.error("STOCK CHECK ERROR:", stockCheckError);
      alert("Could not verify product availability. Please try again.");
      setPlacingOrder(false);
      return;
    }

    const generatedOrderNumber = `STK-${Date.now()
      .toString()
      .slice(-8)}`;

    setOrderNumber(generatedOrderNumber);

    try {
      /*
       * 1. CREATE ORDER
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
       * 2. CREATE ORDER ITEMS
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
       * 3. KEEP LAST ORDER LOCALLY
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
       * 4. CLEAR CART
       */
      localStorage.removeItem(CART_KEY);

      window.dispatchEvent(new Event("cart-updated"));

      /*
       * 5. SHOW SUCCESS SCREEN
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

  /* =====================================================
     ORDER SUCCESS
  ===================================================== */

  if (orderPlaced) {
    return (
      <main className="checkout-page">
        <SiteChrome totalItems={0} />

        <section className="success-container">
          <div className="success-card">
            <div className="success-top-line" />

            <div className="success-kicker">
              <span />
              STOKED BD / ORDER CONFIRMED
              <span />
            </div>

            <div className="success-icon">✓</div>

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
                <strong>৳{total.toLocaleString()}</strong>
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
            font-family: Inter, Arial, Helvetica, sans-serif;
          }

          .success-container {
            position: relative;
            z-index: 5;
            width: min(1380px, calc(100% - 44px));
            min-height: calc(100vh - 85px);
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 110px 0 70px;
          }

          .success-card {
            position: relative;
            width: min(650px, 100%);
            overflow: hidden;
            text-align: center;
            padding: 65px 45px;
            border: 1px solid rgba(255, 255, 255, 0.09);
            background:
              linear-gradient(
                145deg,
                rgba(255, 255, 255, 0.035),
                rgba(100, 0, 0, 0.045)
              );
            box-shadow: 0 30px 100px rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(20px);
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
            border: 1px solid rgba(255, 45, 45, 0.6);
            border-radius: 50%;
            color: #ff3030;
            font-size: 22px;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.12);
          }

          .success-card h1 {
            position: relative;
            margin: 0;
            font-family: "Space Grotesk", Inter, sans-serif;
            font-size: clamp(42px, 7vw, 70px);
            line-height: 0.92;
            font-weight: 500;
            letter-spacing: -0.055em;
          }

          .success-card h1 span {
            color: transparent;
            -webkit-text-stroke: 1px rgba(245, 245, 243, 0.45);
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
            border: 1px solid rgba(255, 255, 255, 0.07);
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
            font-family: "Space Grotesk", Inter, sans-serif;
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
            border: 1px solid rgba(255, 255, 255, 0.06);
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
            border: 1px solid rgba(255, 40, 40, 0.45);
            background: linear-gradient(100deg, #9d0000, #e31b1b);
          }

          .success-button.secondary {
            color: rgba(245, 245, 243, 0.65);
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.025);
          }

          .checkout-footer {
            position: relative;
            z-index: 5;
            width: min(1380px, calc(100% - 44px));
            margin: 0 auto;
            min-height: 85px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            align-items: center;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
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
              width: calc(100% - 28px);
              min-height: calc(100vh - 100px);
              padding: 90px 0 45px;
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
              width: calc(100% - 28px);
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

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <SiteChrome totalItems={0} />

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

            <Link href="/shop" className="empty-button">
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
            font-family: Inter, Arial, Helvetica, sans-serif;
          }

          .empty-checkout {
            position: relative;
            z-index: 5;
            width: min(1380px, calc(100% - 44px));
            min-height: 70vh;
            margin: 0 auto;
            padding: 130px 0 100px;
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
            font-family: "Space Grotesk", Inter, sans-serif;
            font-size: clamp(38px, 6vw, 65px);
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
            border: 1px solid rgba(180, 25, 25, 0.65);
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
            width: min(1380px, calc(100% - 44px));
            margin: 0 auto;
            min-height: 85px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            align-items: center;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
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
              width: calc(100% - 28px);
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

  /* =====================================================
     CHECKOUT FORM
  ===================================================== */

  return (
    <main className="checkout-page">
      <SiteChrome totalItems={totalItems} />

      <section className="checkout-container">
        <div className="checkout-hero">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" />
              <span>STOKED BD / CHECKOUT</span>
            </div>

            <div className="title-wrap">
              <h1 className="checkout-title">CHECKOUT</h1>
              <span className="title-number">02</span>
            </div>

            <div className="title-line" />
          </div>

          <span className="hero-label">
            {totalItems} {totalItems === 1 ? "ITEM" : "ITEMS"} / READY
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
                <span className="section-label-number">01</span>
                <span className="section-label-text">
                  PERSONAL DETAILS
                </span>
                <span className="section-label-line" />
              </div>

              <div className="form-grid">
                <label className="field">
                  <span className="field-label">FULL NAME *</span>

                  <input
                    className="field-input"
                    type="text"
                    placeholder="Your full name"
                    value={customer.name}
                    onChange={(e) =>
                      updateCustomer("name", e.target.value)
                    }
                    required
                  />
                </label>

                <label className="field">
                  <span className="field-label">PHONE NUMBER *</span>

                  <input
                    className="field-input"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={customer.phone}
                    onChange={(e) =>
                      updateCustomer("phone", e.target.value)
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
                      updateCustomer("email", e.target.value)
                    }
                  />
                </label>
              </div>

              {/* DELIVERY ADDRESS */}
              <div className="address-section">
                <div className="section-label">
                  <span className="section-label-number">02</span>
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
                      ? customer.deliveryZone === "inside-dhaka"
                        ? "৳80"
                        : customer.deliveryZone === "sub-urban"
                        ? "৳110"
                        : "৳150"
                      : "REQUIRED"}
                  </span>
                </div>

                <div className="delivery-zones">
                  <button
                    type="button"
                    className={`delivery-zone-card ${
                      customer.deliveryZone === "inside-dhaka"
                        ? "active"
                        : ""
                    }`}
                    onClick={() => selectDeliveryZone("inside-dhaka")}
                  >
                    <span className="zone-number">01</span>

                    <span className="zone-info">
                      <strong>INSIDE DHAKA</strong>
                      <small>DHAKA CITY</small>
                    </span>

                    <span className="zone-price">৳80</span>
                  </button>

                  <button
                    type="button"
                    className={`delivery-zone-card ${
                      customer.deliveryZone === "sub-urban"
                        ? "active"
                        : ""
                    }`}
                    onClick={() => selectDeliveryZone("sub-urban")}
                  >
                    <span className="zone-number">02</span>

                    <span className="zone-info">
                      <strong>SUB-URBAN</strong>
                      <small>NEAR DHAKA</small>
                    </span>

                    <span className="zone-price">৳110</span>
                  </button>

                  <button
                    type="button"
                    className={`delivery-zone-card ${
                      customer.deliveryZone === "outside-dhaka"
                        ? "active"
                        : ""
                    }`}
                    onClick={() => selectDeliveryZone("outside-dhaka")}
                  >
                    <span className="zone-number">03</span>

                    <span className="zone-info">
                      <strong>OUTSIDE DHAKA</strong>
                      <small>OTHER DISTRICTS</small>
                    </span>

                    <span className="zone-price">৳150</span>
                  </button>
                </div>

                <div className="form-grid address-fields">
                  <label className="field">
                    <span className="field-label">DISTRICT *</span>

                    <select
                      className="field-select"
                      value={customer.district}
                      onChange={(e) => selectDistrict(e.target.value)}
                      required
                      disabled={!customer.deliveryZone}
                    >
                      <option value="">
                        {!customer.deliveryZone
                          ? "SELECT DELIVERY AREA FIRST"
                          : "SELECT DISTRICT"}
                      </option>

                      {availableDistricts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span className="field-label">THANA / AREA *</span>

                    <select
                      className="field-select"
                      value={customer.thana}
                      onChange={(e) =>
                        updateCustomer("thana", e.target.value)
                      }
                      required
                      disabled={!customer.district}
                    >
                      <option value="">
                        {!customer.district
                          ? "SELECT DISTRICT FIRST"
                          : "SELECT THANA / AREA"}
                      </option>

                      {availableThanas.map((thana) => (
                        <option key={thana} value={thana}>
                          {thana}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field full">
                    <span className="field-label">FULL ADDRESS *</span>

                    <textarea
                      className="field-textarea"
                      placeholder="House / Road / Block / Street / Landmark"
                      value={customer.address}
                      onChange={(e) =>
                        updateCustomer("address", e.target.value)
                      }
                      required
                    />
                  </label>
                </div>
              </div>

              {/* PAYMENT */}
              <div className="payment-section">
                <div className="section-label">
                  <span className="section-label-number">03</span>
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
                      Pay when your order arrives at your delivery
                      address.
                    </span>
                  </div>

                  <span className="payment-tag">COD</span>
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
                      <img src={item.image} alt={item.name} />
                    </div>

                    <div className="summary-item-info">
                      <span className="summary-item-name">
                        {item.name}
                      </span>

                      <span className="summary-item-meta">
                        QTY / {item.quantity}
                        {item.size ? `  •  SIZE / ${item.size}` : ""}
                      </span>
                    </div>

                    <span className="summary-item-price">
                      ৳
                      {(
                        Number(item.price) * Number(item.quantity)
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
                <span>৳{subtotal.toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>DELIVERY</span>

                <span
                  className={
                    deliveryCharge === 0 ? "summary-pending" : ""
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
                    {customer.deliveryZone === "inside-dhaka"
                      ? "INSIDE DHAKA"
                      : customer.deliveryZone === "sub-urban"
                      ? "SUB-URBAN"
                      : "OUTSIDE DHAKA"}
                  </span>

                  {customer.district && (
                    <span>{customer.district}</span>
                  )}
                </div>
              )}

              <div className="summary-divider" />

              <div className="summary-total">
                <span>TOTAL</span>
                <strong>৳{total.toLocaleString()}</strong>
              </div>

              <p className="summary-note">
                Cash on delivery selected. Delivery charge is
                calculated according to your selected delivery area.
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
          font-family: Inter, Arial, Helvetica, sans-serif;
        }

        /* CHECKOUT */

        .checkout-container {
          position: relative;
          z-index: 5;
          width: min(1380px, calc(100% - 44px));
          margin: 0 auto;
          padding: clamp(105px, 11vw, 150px) 0 100px;
        }

        .checkout-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          padding-bottom: 34px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.09);
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
          box-shadow: 0 0 9px rgba(255, 30, 30, 0.7);
        }

        .title-wrap {
          position: relative;
          display: inline-block;
        }

        .checkout-title {
          margin: 0;
          font-family: "Space Grotesk", Inter, sans-serif;
          font-size: clamp(40px, 5.2vw, 68px);
          line-height: 0.94;
          font-weight: 500;
          letter-spacing: -0.05em;
          color: #f5f5f3;
          animation: titleReveal 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both;
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
          background: linear-gradient(90deg, #ff2020, transparent);
          box-shadow: 0 0 10px rgba(255, 20, 20, 0.7);
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
          grid-template-columns: minmax(0, 1fr) minmax(320px, 380px);
          gap: clamp(35px, 6vw, 90px);
          align-items: start;
          margin-top: 42px;
        }

        .form-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.028),
              rgba(255, 0, 0, 0.018)
            );
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
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
          box-shadow: 0 0 15px rgba(255, 20, 20, 0.4);
        }

        .form-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 24px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
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
          background: rgba(255, 255, 255, 0.06);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
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
          border: 1px solid rgba(255, 255, 255, 0.09);
          outline: none;
          background: rgba(255, 255, 255, 0.018);
          color: #f5f5f3;
          font-family: Inter, Arial, sans-serif;
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
          color: rgba(245, 245, 243, 0.18);
        }

        .field-input:focus,
        .field-textarea:focus,
        .field-select:focus {
          border-color: rgba(255, 40, 40, 0.42);
          background: rgba(255, 0, 0, 0.025);
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.04);
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
          margin: 0 0 12px;
          color: rgba(245, 245, 243, 0.32);
          font-size: 7px;
          letter-spacing: 0.18em;
        }

        .delivery-zone-current {
          color: rgba(255, 60, 60, 0.75);
          font-size: 7px;
          letter-spacing: 0.14em;
        }

        .delivery-zones {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
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
          border: 1px solid rgba(255, 255, 255, 0.08);
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
          border-color: rgba(255, 40, 40, 0.3);
          background:
            linear-gradient(
              145deg,
              rgba(110, 0, 0, 0.1),
              rgba(255, 255, 255, 0.025)
            );
        }

        .delivery-zone-card.active {
          border-color: rgba(255, 40, 40, 0.65);
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
          color: rgba(255, 55, 55, 0.65);
          font-size: 6px;
          letter-spacing: 0.16em;
        }

        .zone-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .zone-info strong {
          color: rgba(245, 245, 243, 0.82);
          font-family: "Space Grotesk", Inter, sans-serif;
          font-size: 8px;
          font-weight: 500;
          letter-spacing: 0.12em;
        }

        .zone-info small {
          color: rgba(245, 245, 243, 0.25);
          font-size: 6px;
          letter-spacing: 0.1em;
        }

        .zone-price {
          position: absolute;
          top: 13px;
          right: 13px;
          color: rgba(255, 70, 70, 0.8);
          font-family: "Space Grotesk", Inter, sans-serif;
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
          border: 1px solid rgba(255, 40, 40, 0.35);
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
          border: 1px solid rgba(255, 50, 50, 0.8);
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
          box-shadow: 0 0 10px rgba(255, 20, 20, 0.8);
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
          border: 1px solid rgba(255, 40, 40, 0.45);
          background: linear-gradient(100deg, #9d0000, #e31b1b);
          color: #fff;
          font-family: inherit;
          font-size: 8px;
          letter-spacing: 0.16em;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 0 30px rgba(255, 0, 0, 0.08);
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
          transition: transform 0.6s ease;
        }

        .place-order-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 0, 0, 0.18);
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
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35);
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
          box-shadow: 0 0 15px rgba(255, 20, 20, 0.4);
        }

        .summary-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 24px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          color: #f5f5f3;
          font-size: 8px;
          letter-spacing: 0.2em;
        }

        .summary-status {
          color: rgba(255, 60, 60, 0.7);
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
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
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
          color: rgba(245, 245, 243, 0.8);
          font-family: "Space Grotesk", Inter, sans-serif;
          font-size: 9px;
          letter-spacing: 0.01em;
        }

        .summary-item-meta {
          display: block;
          margin-top: 6px;
          color: rgba(245, 245, 243, 0.28);
          font-size: 6px;
          letter-spacing: 0.12em;
        }

        .summary-item-price {
          color: rgba(245, 245, 243, 0.7);
          font-size: 8px;
          white-space: nowrap;
        }

        .summary-divider {
          height: 1px;
          margin: 23px 0;
          background: rgba(255, 255, 255, 0.07);
        }

        .summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          color: rgba(245, 245, 243, 0.42);
          font-size: 8px;
          letter-spacing: 0.16em;
        }

        .summary-row span:last-child {
          color: rgba(245, 245, 243, 0.75);
        }

        .summary-pending {
          color: rgba(255, 60, 60, 0.75) !important;
        }

        .summary-delivery-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: -5px;
          margin-bottom: 4px;
          color: rgba(255, 60, 60, 0.48);
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
          color: rgba(245, 245, 243, 0.4);
          font-size: 8px;
          letter-spacing: 0.18em;
        }

        .summary-total strong {
          color: #f5f5f3;
          font-family: "Space Grotesk", Inter, sans-serif;
          font-size: 25px;
          font-weight: 500;
          letter-spacing: -0.03em;
        }

        .summary-note {
          margin: 0;
          color: rgba(245, 245, 243, 0.23);
          font-size: 6px;
          line-height: 1.7;
          letter-spacing: 0.08em;
        }

        /* FOOTER */

        .checkout-footer {
          position: relative;
          z-index: 5;
          width: min(1380px, calc(100% - 44px));
          margin: 0 auto;
          min-height: 85px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
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

        /* RESPONSIVE */

        @media (max-width: 900px) {
          .checkout-layout {
            grid-template-columns: minmax(0, 1fr) 330px;
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
          .checkout-container {
            width: calc(100% - 32px);
            padding: 95px 0 70px;
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
            position: relative;
            top: auto;
          }

          .form-card {
            order: 1;
          }
        }

        @media (max-width: 600px) {
          .checkout-page {
            width: 100%;
            overflow-x: hidden;
          }

          .checkout-container {
            width: calc(100% - 28px);
            padding: 90px 0 55px;
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
            padding: 19px 18px 16px;
          }

          .form-content {
            padding: 22px 18px;
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
            padding: 19px 18px 16px;
          }

          .summary-content {
            padding: 20px 18px 18px;
          }

          .summary-total strong {
            font-size: 23px;
          }

          .checkout-footer {
            width: calc(100% - 28px);
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

        @media (max-width: 380px) {
          .checkout-container {
            width: calc(100% - 22px);
          }

          .checkout-title {
            font-size: 34px;
          }

          .form-content {
            padding: 20px 15px;
          }

          .summary-content {
            padding: 18px 15px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .checkout-title {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   SITE CHROME
   Shop-page navbar + side menu + About/Contact popups
   + animated spider background (shared by every checkout state)
========================================================= */

function SiteChrome({ totalItems }: { totalItems: number }) {
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const updateMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    updateMobile();

    window.addEventListener("resize", updateMobile);

    return () => {
      window.removeEventListener("resize", updateMobile);
    };
  }, []);

  function openMenu(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setAboutOpen(false);
    setContactOpen(false);
    setMenuOpen(true);
  }

  function closeMenu(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
  }

  function goHome(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(false);

    router.push("/");
  }

  function goToShop(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(false);

    router.push("/shop");
  }

  function goToAccount(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(false);

    router.push("/account");
  }

  function openAbout(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setContactOpen(false);
    setAboutOpen(true);
  }

  function closeAbout(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setAboutOpen(false);
    setMenuOpen(false);
  }

  function openContact(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setMenuOpen(false);
    setAboutOpen(false);
    setContactOpen(true);
  }

  function closeContact(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    setContactOpen(false);
    setMenuOpen(false);
  }

  function isMobileDevice() {
    if (typeof window === "undefined") return false;

    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function openSocial(url: string, e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    if (isMobileDevice()) {
      window.location.href = url;
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      {/* BACKGROUND (same as shop page) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(circle at 48% 42%, rgba(110,0,0,.30) 0%, rgba(30,0,0,.20) 38%, rgba(8,3,3,0) 78%), #080303",
        }}
      >
        <div className="sc-grain" />

        <div className="sc-web">
          <span className="sc-line sc-line-1" />
          <span className="sc-line sc-line-2" />
          <span className="sc-line sc-line-3" />
          <span className="sc-line sc-line-4" />
          <span className="sc-line sc-line-5" />

          <span className="sc-ring sc-ring-1" />
          <span className="sc-ring sc-ring-2" />
          <span className="sc-ring sc-ring-3" />
          <span className="sc-ring sc-ring-4" />
          <span className="sc-ring sc-ring-5" />
        </div>

        <div className="sc-spider-field">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={`sc-spider sc-spider-${n}`}>
              <img src={SPIDER_IMAGE} alt="" draggable={false} />
            </div>
          ))}
        </div>
      </div>

      {/* HEADER (same as shop page) */}
      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: isMobile ? "16px 6vw" : "22px 6vw",
          minHeight: isMobile ? "64px" : "70px",
          zIndex: 2147483640,
          pointerEvents: "none",
        }}
      >
        <Link
          href="/"
          className="mini-logo"
          style={{
            textDecoration: "none",
            pointerEvents: "auto",
            display: "block",
            flexShrink: 0,
          }}
        >
          STOKED
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            marginLeft: "auto",
            padding: "3px",
            border: "1px solid rgba(255,255,255,.11)",
            borderRadius: "14px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,.065), rgba(255,255,255,.018))",
            boxShadow:
              "0 12px 35px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            pointerEvents: "auto",
          }}
        >
          <Link
            href="/account"
            style={{
              minHeight: "40px",
              padding: "0 9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,.72)",
              textDecoration: "none",
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: "8px",
              fontWeight: 600,
              letterSpacing: ".11em",
              borderRadius: "9px",
              background: "rgba(255,255,255,.045)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            MY ACCOUNT
          </Link>

          <span
            style={{
              width: "1px",
              height: "18px",
              background: "rgba(255,255,255,.07)",
            }}
          />

          <Link
            href="/cart"
            style={{
              minHeight: "40px",
              padding: "0 9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              border: 0,
              borderRadius: "9px",
              background: "transparent",
              color: "rgba(255,255,255,.65)",
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: "8px",
              fontWeight: 500,
              letterSpacing: ".13em",
              cursor: "pointer",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            BAG

            <span
              style={{
                minWidth: "17px",
                height: "17px",
                padding: "0 4px",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "6px",
                fontWeight: 600,
                color: "#fff",
                background: "rgba(169,21,37,.8)",
              }}
            >
              {String(totalItems).padStart(2, "0")}
            </span>
          </Link>

          <span
            style={{
              width: "1px",
              height: "18px",
              background: "rgba(255,255,255,.07)",
            }}
          />

          <button
            type="button"
            onPointerUp={openMenu}
            aria-label="Open menu"
            style={{
              minHeight: "40px",
              padding: "0 9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,.72)",
              background: "rgba(255,255,255,.045)",
              border: 0,
              borderRadius: "9px",
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: "8px",
              fontWeight: 600,
              letterSpacing: ".13em",
              cursor: "pointer",
              whiteSpace: "nowrap",
              touchAction: "manipulation",
            }}
          >
            MENU
          </button>
        </div>
      </header>

      {/* ABOUT */}
      {aboutOpen && (
        <div className="info-overlay" onClick={closeAbout}>
          <div
            className="info-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="overlay-close"
              onClick={closeAbout}
            >
              CLOSE <span>×</span>
            </button>

            <span className="overlay-kicker">STOKED BD / 2026</span>

            <h2>
              ABOUT
              <br />
              <span>STOKED</span>
            </h2>

            <div className="overlay-line" />

            <p>
              STOKED BD is a Bangladesh-based streetwear label built
              around attitude, movement and a raw visual identity.
              Every piece is designed to feel like part of the
              culture — not just another product.
            </p>

            <span className="overlay-footer">
              EST. 2026 / SPIDER COLLECTION
            </span>
          </div>
        </div>
      )}

      {/* CONTACT */}
      {contactOpen && (
        <div className="info-overlay" onClick={closeContact}>
          <div
            className="info-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="overlay-close"
              onClick={closeContact}
            >
              CLOSE <span>×</span>
            </button>

            <span className="overlay-kicker">
              STOKED BD / CONNECT
            </span>

            <h2>CONTACT</h2>

            <div className="overlay-line" />

            <div className="social-list">
              <button
                type="button"
                onClick={(e) =>
                  openSocial("https://www.instagram.com/stoked.bd/", e)
                }
              >
                INSTAGRAM
              </button>

              <button
                type="button"
                onClick={(e) =>
                  openSocial(
                    "https://www.facebook.com/share/1ba7vRfxAB/?mibextid=wwXIfr",
                    e
                  )
                }
              >
                FACEBOOK
              </button>

              <button
                type="button"
                onClick={(e) =>
                  openSocial("https://www.tiktok.com/@stoked.bd", e)
                }
              >
                TIKTOK
              </button>
            </div>

            <span className="overlay-footer">
              STOKED BD / SOCIAL
            </span>
          </div>
        </div>
      )}

      {/* SIDE MENU */}
      <div
        className={`stoked-menu ${
          menuOpen ? "stoked-menu-visible" : ""
        }`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="stoked-menu-backdrop"
          onClick={closeMenu}
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
        />

        <aside
          className="stoked-menu-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="stoked-menu-top">
            <div className="stoked-menu-logo">STOKED</div>

            <button
              type="button"
              className="stoked-menu-close"
              onClick={closeMenu}
            >
              CLOSE <span>×</span>
            </button>
          </div>

          <nav className="stoked-menu-links">
            <button type="button" onClick={goHome}>
              HOME
            </button>

            <button type="button" onClick={goToShop}>
              SHOP
            </button>

            <button type="button" onClick={goToAccount}>
              MY ACCOUNT
            </button>

            <button type="button" onClick={openAbout}>
              ABOUT
            </button>

            <button type="button" onClick={openContact}>
              CONTACT
            </button>
          </nav>

          <div className="stoked-menu-footer">
            <span>© 2026 STOKED BD</span>
            <span>EST. 2026</span>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        /* ---------- BACKGROUND: GRAIN + WEB + SPIDERS ---------- */

        .sc-grain {
          position: absolute;
          inset: 0;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
        }

        .sc-web {
          position: absolute;
          width: 620px;
          height: 620px;
          right: -260px;
          top: -150px;
          border-radius: 50%;
          opacity: 0.14;
        }

        .sc-line {
          position: absolute;
          width: 1px;
          height: 100%;
          left: 50%;
          top: 0;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          transform-origin: center;
        }

        .sc-line-1 { transform: rotate(0deg); }
        .sc-line-2 { transform: rotate(36deg); }
        .sc-line-3 { transform: rotate(72deg); }
        .sc-line-4 { transform: rotate(108deg); }
        .sc-line-5 { transform: rotate(144deg); }

        .sc-ring {
          position: absolute;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 50%;
        }

        .sc-ring-1 { inset: 5%; }
        .sc-ring-2 { inset: 18%; }
        .sc-ring-3 { inset: 31%; }
        .sc-ring-4 { inset: 43%; }
        .sc-ring-5 { inset: 55%; }

        .sc-spider-field {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .sc-spider {
          position: absolute;
          opacity: 0.075;
          filter: grayscale(1) drop-shadow(0 0 22px rgba(255, 0, 0, 0.2));
          animation: scSpiderFloat 8s ease-in-out infinite;
          will-change: transform;
        }

        .sc-spider img {
          display: block;
          width: 100%;
          height: auto;
          object-fit: contain;
          user-select: none;
        }

        .sc-spider-1 { width: 125px; left: 3%; top: 9%; }
        .sc-spider-2 { width: 90px; right: 6%; top: 17%; opacity: 0.06; animation-delay: -2s; }
        .sc-spider-3 { width: 65px; left: 7%; top: 58%; opacity: 0.045; animation-delay: -4s; }
        .sc-spider-4 { width: 105px; right: 3%; top: 54%; opacity: 0.065; animation-delay: -1s; }
        .sc-spider-5 { width: 75px; left: 43%; bottom: 4%; opacity: 0.045; animation-delay: -5s; }

        @keyframes scSpiderFloat {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-2deg); }
          25% { transform: translate3d(8px, 18px, 0) rotate(3deg); }
          50% { transform: translate3d(-8px, -5px, 0) rotate(-4deg); }
          75% { transform: translate3d(5px, 13px, 0) rotate(2deg); }
        }

        @media (max-width: 600px) {
          .sc-web { width: 380px; height: 380px; right: -200px; top: -90px; }
          .sc-spider-1 { width: 72px; left: -5%; top: 10%; }
          .sc-spider-2 { width: 58px; right: -3%; top: 17%; }
          .sc-spider-3 { width: 45px; left: -2%; top: 48%; }
          .sc-spider-4 { width: 62px; right: -4%; top: 55%; }
          .sc-spider-5 { width: 48px; left: 38%; bottom: 3%; }
        }

        /* ---------- ABOUT + CONTACT OVERLAY ---------- */

        .info-overlay {
          position: fixed;
          inset: 0;
          z-index: 2147483646;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .info-panel {
          position: relative;
          width: min(620px, 100%);
          min-height: 420px;
          padding: 75px 55px 45px;
          overflow: hidden;
          background: linear-gradient(
            145deg,
            rgba(35, 5, 5, 0.98),
            rgba(7, 2, 2, 0.99)
          );
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.6);
        }

        .info-panel::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            #ff2020,
            rgba(255, 32, 32, 0.15),
            transparent
          );
        }

        .overlay-close {
          position: absolute;
          top: 25px;
          right: 25px;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.45);
          font-family: Inter, sans-serif;
          font-size: 7px;
          letter-spacing: 0.16em;
          cursor: pointer;
        }

        .overlay-close span {
          color: rgba(255, 255, 255, 0.7);
          font-size: 18px;
          line-height: 1;
        }

        .overlay-kicker {
          color: rgba(255, 50, 50, 0.65);
          font-size: 7px;
          letter-spacing: 0.22em;
        }

        .info-panel h2 {
          margin: 18px 0 20px;
          color: #f5f5f3;
          font-family: "Space Grotesk", Inter, sans-serif;
          font-size: clamp(42px, 6vw, 64px);
          line-height: 0.9;
          font-weight: 500;
          letter-spacing: -0.05em;
        }

        .info-panel h2 span {
          color: transparent;
          -webkit-text-stroke: 1px rgba(245, 245, 243, 0.45);
        }

        .overlay-line {
          width: 55px;
          height: 1px;
          margin-bottom: 25px;
          background: linear-gradient(90deg, #ff2020, transparent);
        }

        .info-panel p {
          max-width: 500px;
          margin: 0;
          color: rgba(245, 245, 243, 0.48);
          font-size: 10px;
          line-height: 1.9;
          letter-spacing: 0.04em;
        }

        .overlay-footer {
          position: absolute;
          left: 55px;
          bottom: 28px;
          color: rgba(255, 255, 255, 0.2);
          font-size: 6px;
          letter-spacing: 0.18em;
        }

        .social-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .social-list button {
          position: relative;
          width: 100%;
          min-height: 55px;
          padding: 0 17px;
          display: flex;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(255, 255, 255, 0.018);
          color: rgba(255, 255, 255, 0.58);
          font-family: "Space Grotesk", Inter, sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.13em;
          cursor: pointer;
          text-align: left;
          transition:
            color 0.3s ease,
            background 0.3s ease,
            border-color 0.3s ease,
            padding-left 0.3s ease;
        }

        .social-list button:hover {
          color: #fff;
          padding-left: 24px;
          background: linear-gradient(
            90deg,
            rgba(130, 0, 0, 0.2),
            rgba(255, 255, 255, 0.025)
          );
          border-color: rgba(150, 0, 0, 0.35);
        }

        /* ---------- SIDE MENU ---------- */

        .stoked-menu {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100dvh !important;
          z-index: 2147483647 !important;
          display: block !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transform: none !important;
          overflow: hidden !important;
          transition:
            opacity 0.35s ease,
            visibility 0.35s ease !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -webkit-touch-callout: none !important;
        }

        .stoked-menu.stoked-menu-visible {
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }

        .stoked-menu-backdrop {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          background: rgba(0, 0, 0, 0.45) !important;
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          cursor: pointer !important;
          pointer-events: auto !important;
          -webkit-tap-highlight-color: transparent !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }

        .stoked-menu-panel {
          position: absolute !important;
          top: 0 !important;
          right: 0 !important;
          width: 330px !important;
          max-width: 86vw !important;
          height: 100dvh !important;
          background: linear-gradient(
            135deg,
            rgba(35, 5, 5, 0.98),
            rgba(7, 2, 2, 0.99)
          ) !important;
          border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
          transform: translateX(105%) !important;
          transition: transform 0.65s cubic-bezier(0.76, 0, 0.24, 1) !important;
          overflow: hidden !important;
          z-index: 2 !important;
          pointer-events: auto !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -webkit-touch-callout: none !important;
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .stoked-menu.stoked-menu-visible .stoked-menu-panel {
          transform: translateX(0) !important;
        }

        .stoked-menu-top {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          padding: 27px 25px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          z-index: 10 !important;
        }

        .stoked-menu-logo {
          font-family: "Space Grotesk", sans-serif !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          letter-spacing: 0.25em !important;
          color: white !important;
          opacity: 0.9 !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }

        .stoked-menu-close {
          border: 0 !important;
          outline: none !important;
          background: transparent !important;
          color: rgba(255, 255, 255, 0.45) !important;
          font-family: "Inter", sans-serif !important;
          font-size: 7px !important;
          font-weight: 500 !important;
          letter-spacing: 0.16em !important;
          padding: 8px !important;
          display: flex !important;
          align-items: center !important;
          gap: 5px !important;
          cursor: pointer !important;
          pointer-events: auto !important;
          -webkit-tap-highlight-color: transparent !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          touch-action: manipulation !important;
          transition:
            opacity 0.25s ease,
            transform 0.25s ease !important;
        }

        .stoked-menu-close:hover {
          opacity: 0.65 !important;
          transform: translateX(-3px);
        }

        .stoked-menu-close span {
          font-size: 19px !important;
          line-height: 1 !important;
          color: rgba(255, 255, 255, 0.65) !important;
        }

        .stoked-menu-links {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          padding: 0 25px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          justify-content: center !important;
          gap: 7px !important;
          z-index: 5 !important;
          pointer-events: auto !important;
        }

        .stoked-menu-links button {
          position: relative !important;
          width: 100% !important;
          height: 55px !important;
          padding: 0 16px !important;
          display: flex !important;
          align-items: center !important;
          border: 1px solid rgba(255, 255, 255, 0.055) !important;
          border-radius: 2px !important;
          background: rgba(255, 255, 255, 0.018) !important;
          color: rgba(255, 255, 255, 0.58) !important;
          font-family: "Space Grotesk", sans-serif !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          letter-spacing: 0.08em !important;
          line-height: 1 !important;
          cursor: pointer !important;
          pointer-events: auto !important;
          outline: none !important;
          -webkit-tap-highlight-color: transparent !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -webkit-touch-callout: none !important;
          touch-action: manipulation !important;
          transform: none !important;
          transition:
            background 0.35s ease,
            border-color 0.35s ease,
            color 0.35s ease,
            padding-left 0.35s ease,
            box-shadow 0.35s ease !important;
        }

        .stoked-menu-links button::before {
          content: "01" !important;
          width: 25px !important;
          flex-shrink: 0 !important;
          font-family: "Inter", sans-serif !important;
          font-size: 7px !important;
          font-weight: 500 !important;
          letter-spacing: 0.1em !important;
          color: rgba(255, 255, 255, 0.2) !important;
          transition: color 0.35s ease !important;
        }

        .stoked-menu-links button:nth-child(2)::before { content: "02" !important; }
        .stoked-menu-links button:nth-child(3)::before { content: "03" !important; }
        .stoked-menu-links button:nth-child(4)::before { content: "04" !important; }
        .stoked-menu-links button:nth-child(5)::before { content: "05" !important; }

        .stoked-menu-links button:hover {
          color: white !important;
          padding-left: 22px !important;
          background: linear-gradient(
            90deg,
            rgba(130, 0, 0, 0.18),
            rgba(255, 255, 255, 0.025)
          ) !important;
          border-color: rgba(150, 0, 0, 0.3) !important;
          box-shadow:
            inset 2px 0 0 rgba(150, 0, 0, 0.85),
            0 8px 30px rgba(0, 0, 0, 0.18) !important;
        }

        .stoked-menu-links button:hover::before {
          color: rgba(180, 0, 0, 0.9) !important;
        }

        .stoked-menu-footer {
          position: absolute !important;
          bottom: 28px !important;
          left: 0 !important;
          width: 100% !important;
          padding: 0 25px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          color: rgba(255, 255, 255, 0.22) !important;
          font-family: "Inter", sans-serif !important;
          font-size: 6px !important;
          letter-spacing: 0.18em !important;
          z-index: 10 !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }

        @media (max-width: 700px) {
          .stoked-menu-panel {
            width: 285px !important;
            max-width: 86vw !important;
          }

          .stoked-menu-top {
            padding: 24px 20px !important;
          }

          .stoked-menu-links {
            padding: 0 18px !important;
            gap: 6px !important;
          }

          .stoked-menu-links button {
            height: 50px !important;
            font-size: 12px !important;
            padding: 0 13px !important;
          }

          .stoked-menu-links button:hover {
            padding-left: 19px !important;
          }

          .stoked-menu-footer {
            bottom: 20px !important;
            padding: 0 20px !important;
          }

          .info-panel {
            padding: 65px 25px 35px;
          }

          .overlay-footer {
            left: 25px;
          }
        }
      `}</style>
    </>
  );
}