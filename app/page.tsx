"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useOrders, OrderItem } from "@/context/OrderContext";
import { supabase } from "@/lib/supabaseClient";
import { 
  ShoppingBag, 
  MapPin, 
  Store, 
  Plus, 
  Minus, 
  X, 
  Sparkles, 
  Bike,
  MessageSquare,
  Phone,
  ChevronLeft,
  ChevronRight,
  Shield,
  UtensilsCrossed,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Search
} from "lucide-react";

// Catalog and Carousel Interfaces
interface MenuItem {
  id: string;
  name: string;
  category: "specials" | "chaap" | "salad" | "starters" | "main" | "breads" | "snack" | "rolls" | "accompaniments";
  price: number;
  description: string;
  veg: boolean;
  popular: boolean;
  icon: string;
  image: string;
  stats: {
    spice: string;
    prep: string;
    serves: string;
  };
}

// B-Tech Soya Chaap Zomato Catalog Menu Data (65 Items with 100% Verified Active Images)
export const MENU_ITEMS: MenuItem[] = [
  // BCW Specials (7)
  {
    id: "sp-afghani-momos",
    name: "Afghani Momos",
    category: "specials",
    price: 140,
    description: "Juicy dumplings tossed in creamy cashew malai sauce and baked in charcoal oven.",
    veg: true,
    popular: true,
    icon: "🥟",
    image: "/afghani_momos.png",
    stats: { spice: "2/10", prep: "12m", serves: "1-2" }
  },
  {
    id: "sp-fried-momos",
    name: "Fried Momos",
    category: "specials",
    price: 100,
    description: "Crispy deep fried veg dumplings served with spicy garlic chili paste.",
    veg: true,
    popular: false,
    icon: "🥟",
    image: "/fried_momos.png",
    stats: { spice: "4/10", prep: "10m", serves: "1-2" }
  },
  {
    id: "sp-tandoori-momos",
    name: "BCW Special Tandoori Momos",
    category: "specials",
    price: 150,
    description: "Our signature clay-oven grilled momos marinated in spicy tikka yogurt.",
    veg: true,
    popular: true,
    icon: "🥟",
    image: "/tandoori_momos.png",
    stats: { spice: "8/10", prep: "12m", serves: "1-2" }
  },
  {
    id: "sp-kurkure-momos",
    name: "BCW Special Kurkure Momos",
    category: "specials",
    price: 160,
    description: "Crunchy double-fried momos coated in seasoned oats and corn flakes batter.",
    veg: true,
    popular: true,
    icon: "🥟",
    image: "/kurkure_momos.png",
    stats: { spice: "5/10", prep: "12m", serves: "1-2" }
  },
  {
    id: "sp-fried-chaap",
    name: "BCW Special Golden Fried Chaap",
    category: "specials",
    price: 150,
    description: "Super crunchy outer coating with soft tender soya chunks inside, tossed in spice mix.",
    veg: true,
    popular: false,
    icon: "🍟",
    image: "/kurkure_momos.png",
    stats: { spice: "5/10", prep: "10m", serves: "1-2" }
  },
  {
    id: "sp-lollipop",
    name: "BCW Special Veg Lollipop",
    category: "specials",
    price: 170,
    description: "Skewered veg mock lollipops spiced with fresh ginger, garlic, and Chinese greens.",
    veg: true,
    popular: false,
    icon: "🍭",
    image: "/kurkure_momos.png",
    stats: { spice: "7/10", prep: "15m", serves: "2" }
  },
  {
    id: "sp-wings",
    name: "BCW Special Veg Wings",
    category: "specials",
    price: 180,
    description: "Crispy tandoori style wings glazed in sweet-spicy soy and crushed pepper dust.",
    veg: true,
    popular: false,
    icon: "🍗",
    image: "/kurkure_momos.png",
    stats: { spice: "8/10", prep: "15m", serves: "2" }
  },

  // Chaap (17)
  {
    id: "ch-malai",
    name: "Malai Soya Chaap",
    category: "chaap",
    price: 160,
    description: "Creamy tandoori soya chunks cooked in heavy fresh cream, cashews, and butter sauce.",
    veg: true,
    popular: true,
    icon: "🥛",
    image: "/malai_chaap.png",
    stats: { spice: "2/10", prep: "12m", serves: "1-2" }
  },
  {
    id: "ch-afghani",
    name: "Afghani Soya Chaap",
    category: "chaap",
    price: 160,
    description: "Gently spiced soya chunks marinated in cheese, yogurt, cashew paste, and grilled.",
    veg: true,
    popular: true,
    icon: "🧀",
    image: "/afghani_chaap.png",
    stats: { spice: "3/10", prep: "12m", serves: "1-2" }
  },
  {
    id: "ch-stuffed",
    name: "Stuffed Soya Chaap",
    category: "chaap",
    price: 180,
    description: "Soya chaap logs stuffed with paneer crumble, raisins, and mild spices, charcoal-baked.",
    veg: true,
    popular: false,
    icon: "🍢",
    image: "/stuffed_chaap.png",
    stats: { spice: "5/10", prep: "15m", serves: "2" }
  },
  {
    id: "ch-sufi",
    name: "Veg Sufi Chaap",
    category: "chaap",
    price: 170,
    description: "Saffron and white-spiced cream marinated soya chunks cooked in slow clay oven.",
    veg: true,
    popular: false,
    icon: "🍢",
    image: "/sufi_chaap.png",
    stats: { spice: "3/10", prep: "15m", serves: "1-2" }
  },
  {
    id: "ch-pudina",
    name: "Pudina Soya Chaap",
    category: "chaap",
    price: 150,
    description: "Grilled soya logs flavored with fresh mint leaves, coriander paste, and raw spices.",
    veg: true,
    popular: false,
    icon: "🍃",
    image: "/pudina_chaap.png",
    stats: { spice: "6/10", prep: "10m", serves: "1-2" }
  },
  {
    id: "ch-achari",
    name: "Achari Soya Chaap",
    category: "chaap",
    price: 150,
    description: "Flame grilled soya chaap seasoned with tangy pickly raw mango spice masalas.",
    veg: true,
    popular: false,
    icon: "🍢",
    image: "/achari_chaap.png",
    stats: { spice: "7/10", prep: "10m", serves: "1-2" }
  },
  {
    id: "ch-lemon",
    name: "Lemon Soya Chaap",
    category: "chaap",
    price: 150,
    description: "Zesty lemon flavor soya chunks tossed in lemon juice, butter, and black pepper.",
    veg: true,
    popular: false,
    icon: "🍋",
    image: "/lemon_chaap.png",
    stats: { spice: "5/10", prep: "10m", serves: "1-2" }
  },
  {
    id: "ch-masala",
    name: "Masala Soya Chaap",
    category: "chaap",
    price: 150,
    description: "Robust tandoori grilled chunks tossed in spicy dry clay-oven gravy paste.",
    veg: true,
    popular: true,
    icon: "🍢",
    image: "/masala_chaap.png",
    stats: { spice: "8/10", prep: "10m", serves: "1-2" }
  },
  {
    id: "ch-chatpata",
    name: "Chatpata Soya Chaap",
    category: "chaap",
    price: 150,
    description: "Tandoori chaap chunks loaded with extra hot spices, chat masala, and lime juice.",
    veg: true,
    popular: false,
    icon: "🍢",
    image: "/chatpata_chaap.png",
    stats: { spice: "9/10", prep: "10m", serves: "1-2" }
  },
  {
    id: "ch-diet",
    name: "Diet Soya Chaap",
    category: "chaap",
    price: 160,
    description: "Low fat grilled chaap chunks prepared with minimal olive oil and light seasoning.",
    veg: true,
    popular: false,
    icon: "🍢",
    image: "/diet_chaap.png",
    stats: { spice: "4/10", prep: "12m", serves: "1-2" }
  },
  {
    id: "ch-shahi",
    name: "Shahi Soya Chaap",
    category: "chaap",
    price: 160,
    description: "Rich, mildly sweet tandoori chaap coated in cashew, cardamom, and thick curd glaze.",
    veg: true,
    popular: false,
    icon: "🍢",
    image: "/shahi_chaap.png",
    stats: { spice: "2/10", prep: "12m", serves: "1-2" }
  },
  {
    id: "ch-soya-plain",
    name: "Plain Soya Chaap",
    category: "chaap",
    price: 140,
    description: "Simply skewered and roasted soya chaap chunks without heavy spice spreads.",
    veg: true,
    popular: false,
    icon: "🍢",
    image: "/plain_chaap.png",
    stats: { spice: "5/10", prep: "10m", serves: "1-2" }
  },
  {
    id: "ch-tawa",
    name: "Tawa Soya Chaap",
    category: "chaap",
    price: 170,
    description: "Griddle pan roasted soya chunks tossed with basic spices and green bell peppers.",
    veg: true,
    popular: false,
    icon: "🥘",
    image: "/tawa_chaap.png",
    stats: { spice: "7/10", prep: "12m", serves: "1-2" }
  },
  {
    id: "ch-tawa-masala",
    name: "Tawa Chaap Masala",
    category: "chaap",
    price: 180,
    description: "Thick semi-dry gravy version of soya chaap griddle-cooked with onion, tomato, and peppers.",
    veg: true,
    popular: false,
    icon: "🥘",
    image: "/tawa_chaap_masala.png",
    stats: { spice: "8/10", prep: "15m", serves: "2" }
  },
  {
    id: "ch-kadhai",
    name: "Kadhai Soya Chaap",
    category: "chaap",
    price: 185,
    description: "Tender soya chunks wok-cooked in freshly ground kadhai masala sauce.",
    veg: true,
    popular: false,
    icon: "🥘",
    image: "/kadhai_chaap.png",
    stats: { spice: "8/10", prep: "15m", serves: "2" }
  },
  {
    id: "ch-keema",
    name: "Keema Soya Chaap",
    category: "chaap",
    price: 190,
    description: "Minced soya granules and chaap segments cooked together in spices.",
    veg: true,
    popular: false,
    icon: "🥘",
    image: "/keema_chaap.png",
    stats: { spice: "8/10", prep: "15m", serves: "2" }
  },
  {
    id: "ch-chilli",
    name: "Chilli Soya Chaap",
    category: "chaap",
    price: 170,
    description: "Soya pieces tossed in hot soy pepper garlic sauce, Chinese style.",
    veg: true,
    popular: false,
    icon: "🌶️",
    image: "/chilli_chaap.png",
    stats: { spice: "8/10", prep: "12m", serves: "2" }
  },

  // Salad (1)
  {
    id: "sl-green",
    name: "Green Salad",
    category: "salad",
    price: 50,
    description: "Fresh sliced cucumbers, carrots, onions, and green chilies with a slice of lemon.",
    veg: true,
    popular: false,
    icon: "🥗",
    image: "/chutney_salad.png",
    stats: { spice: "0/10", prep: "5m", serves: "1-2" }
  },

  // Starters (10)
  {
    id: "st-chilli-potato",
    name: "Chilli Potato",
    category: "starters",
    price: 120,
    description: "Crispy fried potatoes stir-fried in hot soy and green chili sauce with capsicums.",
    veg: true,
    popular: false,
    icon: "🍟",
    image: "/chilli_potato.png",
    stats: { spice: "7/10", prep: "10m", serves: "1-2" }
  },
  {
    id: "st-honey-chilli",
    name: "Honey Chilli Potato",
    category: "starters",
    price: 140,
    description: "Crispy fried potatoes glazed in honey and sweet chili soy sauce, sesame seeds garnish.",
    veg: true,
    popular: true,
    icon: "🍯",
    image: "/honey_chilli_potato.png",
    stats: { spice: "5/10", prep: "12m", serves: "1-2" }
  },
  {
    id: "st-chilli-mushroom",
    name: "Chilli Mushroom",
    category: "starters",
    price: 160,
    description: "Battered crispy mushrooms tossed in spicy soy-chili sauce, onions, and spring onion greens.",
    veg: true,
    popular: false,
    icon: "🍄",
    image: "/chilli_mushroom.png",
    stats: { spice: "7/10", prep: "12m", serves: "2" }
  },
  {
    id: "st-paneer-malai",
    name: "Paneer Malai Tikka",
    category: "starters",
    price: 200,
    description: "Paneer chunks soaked in cashew nuts paste, cardamom cream, and tandoor baked.",
    veg: true,
    popular: false,
    icon: "🥛",
    image: "/paneer_malai_tikka.png",
    stats: { spice: "2/10", prep: "15m", serves: "2" }
  },
  {
    id: "st-paneer-pudina",
    name: "Paneer Pudina Tikka",
    category: "starters",
    price: 190,
    description: "Cottage cheese pieces flavored with green mint paste and traditional roasted spices.",
    veg: true,
    popular: false,
    icon: "🍃",
    image: "/paneer_pudina_tikka.png",
    stats: { spice: "6/10", prep: "15m", serves: "2" }
  },
  {
    id: "st-paneer-achari",
    name: "Paneer Achari Tikka",
    category: "starters",
    price: 190,
    description: "Paneer tikka skewers seasoned with spicy sour pickling raw mango powders.",
    veg: true,
    popular: false,
    icon: "🍢",
    image: "/paneer_achari_tikka.png",
    stats: { spice: "6/10", prep: "15m", serves: "2" }
  },
  {
    id: "st-paneer-tikka",
    name: "Tandoori Paneer Tikka",
    category: "starters",
    price: 190,
    description: "Soft cottage cheese cubes marinated in rich tandoori tikka spices and charcoal baked.",
    veg: true,
    popular: true,
    icon: "🍢",
    image: "/paneer_tikka.png",
    stats: { spice: "6/10", prep: "15m", serves: "2" }
  },
  {
    id: "st-afghani-mushroom",
    name: "Afghani Mushroom",
    category: "starters",
    price: 170,
    description: "Fresh whole button mushrooms marinated in rich cashew cream and cheese sauce.",
    veg: true,
    popular: false,
    icon: "🍄",
    image: "/afghani_mushroom.png",
    stats: { spice: "3/10", prep: "12m", serves: "2" }
  },
  {
    id: "st-mushroom-tikka",
    name: "Mushroom Tikka",
    category: "starters",
    price: 170,
    description: "Skewered whole mushrooms roasted in clay oven with spiced red yogurt marinate.",
    veg: true,
    popular: false,
    icon: "🍄",
    image: "/mushroom_tikka.png",
    stats: { spice: "7/10", prep: "12m", serves: "2" }
  },
  {
    id: "st-chilli-paneer",
    name: "Chilli Paneer",
    category: "starters",
    price: 180,
    description: "Wok fried paneer cubes in hot pepper dark soy sauce with spring onions.",
    veg: true,
    popular: true,
    icon: "🌶️",
    image: "/chilli_paneer.png",
    stats: { spice: "8/10", prep: "12m", serves: "2" }
  },

  // Main Course (8)
  {
    id: "mc-kadhai-paneer",
    name: "Kadhai Paneer",
    category: "main",
    price: 200,
    description: "Cottage cheese pieces cooked with fresh bell peppers in a spicy kadhai gravy.",
    veg: true,
    popular: true,
    icon: "🥘",
    image: "/kadhai_paneer.png",
    stats: { spice: "8/10", prep: "18m", serves: "2" }
  },
  {
    id: "mc-veg-korma",
    name: "Veg Korma",
    category: "main",
    price: 180,
    description: "Assorted vegetables cooked in traditional mildly-sweet cashew nut gravy.",
    veg: true,
    popular: false,
    icon: "🥘",
    image: "/veg_korma.png",
    stats: { spice: "4/10", prep: "15m", serves: "2" }
  },
  {
    id: "mc-tawa-paneer",
    name: "Tawa Paneer Masala",
    category: "main",
    price: 200,
    description: "Diced cottage cheese griddle-cooked with thick local spice tomato onion sauce.",
    veg: true,
    popular: false,
    icon: "🥘",
    image: "/tawa_paneer.png",
    stats: { spice: "8/10", prep: "15m", serves: "2" }
  },
  {
    id: "mc-paneer-takatak",
    name: "Paneer Taka Tak",
    category: "main",
    price: 210,
    description: "Very spicy cottage cheese preparation flavored with red chili flakes and fresh peppers.",
    veg: true,
    popular: false,
    icon: "🥘",
    image: "/paneer_takatak.png",
    stats: { spice: "9/10", prep: "15m", serves: "2" }
  },
  {
    id: "mc-tawa-tikka",
    name: "Tawa Tikka Masala",
    category: "main",
    price: 200,
    description: "Paneer tikka cooked on iron griddle with rich tomato butter sauce and coriander.",
    veg: true,
    popular: false,
    icon: "🥘",
    image: "/tawa_tikka.png",
    stats: { spice: "8/10", prep: "15m", serves: "2" }
  },
  {
    id: "mc-shahi-paneer",
    name: "Shahi Paneer",
    category: "main",
    price: 210,
    description: "Soft paneer cubes cooked in a sweet, rich cashew, nut and tomato cream gravy.",
    veg: true,
    popular: true,
    icon: "🍯",
    image: "/shahi_paneer.png",
    stats: { spice: "2/10", prep: "15m", serves: "2" }
  },
  {
    id: "mc-matar-paneer",
    name: "Matar Paneer",
    category: "main",
    price: 190,
    description: "Traditional green peas and cottage cheese curry cooked in onion tomato base.",
    veg: true,
    popular: false,
    icon: "🥘",
    image: "/matar_paneer.png",
    stats: { spice: "6/10", prep: "15m", serves: "2" }
  },
  {
    id: "mc-masala-malai",
    name: "Masala Malai Soya",
    category: "main",
    price: 190,
    description: "Creamy tandoori soya pieces cooked in rich masala gravy with cashew cream toppings.",
    veg: true,
    popular: false,
    icon: "🥘",
    image: "/tawa_chaap.png",
    stats: { spice: "6/10", prep: "15m", serves: "2" }
  },

  // Breads (8)
  {
    id: "br-rumali",
    name: "Rumali Roti",
    category: "breads",
    price: 15,
    description: "Traditional soft paper-thin flour bread cooked over a heated inverted dome grid.",
    veg: true,
    popular: false,
    icon: "🫓",
    image: "/rumali_roti.png",
    stats: { spice: "0/10", prep: "5m", serves: "1" }
  },
  {
    id: "br-tandoori",
    name: "Tandoori Roti",
    category: "breads",
    price: 12,
    description: "Whole wheat clay oven baked traditional flatbread.",
    veg: true,
    popular: false,
    icon: "🫓",
    image: "/tandoori_roti.png",
    stats: { spice: "0/10", prep: "5m", serves: "1" }
  },
  {
    id: "br-missi",
    name: "Missi Roti",
    category: "breads",
    price: 20,
    description: "Gram flour (besan) flatbread flavored with chopped onions, green chilies, and dry spices.",
    veg: true,
    popular: false,
    icon: "🫓",
    image: "/missi_roti.png",
    stats: { spice: "1/10", prep: "5m", serves: "1" }
  },
  {
    id: "br-butter-roti",
    name: "Butter Tandoori Roti",
    category: "breads",
    price: 15,
    description: "Clay oven flatbread glazed with melted salted butter.",
    veg: true,
    popular: false,
    icon: "🫓",
    image: "/butter_roti.png",
    stats: { spice: "0/10", prep: "5m", serves: "1" }
  },
  {
    id: "br-naan",
    name: "Plain Naan",
    category: "breads",
    price: 30,
    description: "Fluffy leavened clay oven bread made of fine refined flour.",
    veg: true,
    popular: false,
    icon: "🫓",
    image: "/plain_naan.png",
    stats: { spice: "0/10", prep: "6m", serves: "1" }
  },
  {
    id: "br-naan-butter",
    name: "Butter Naan",
    category: "breads",
    price: 40,
    description: "Leavened oven flatbread with multiple rich layers of melted yellow butter.",
    veg: true,
    popular: false,
    icon: "🫓",
    image: "/butter_naan.png",
    stats: { spice: "0/10", prep: "6m", serves: "1" }
  },
  {
    id: "br-naan-garlic",
    name: "Garlic Naan",
    category: "breads",
    price: 50,
    description: "Clay oven flatbread stuffed and seasoned with crushed fresh garlic and coriander leaves.",
    veg: true,
    popular: false,
    icon: "🫓",
    image: "/garlic_naan.png",
    stats: { spice: "1/10", prep: "6m", serves: "1" }
  },
  {
    id: "br-lachha",
    name: "Lachha Paratha",
    category: "breads",
    price: 40,
    description: "Multi-layered crispy wheat flatbread baked inside tandoor with dry oil folds.",
    veg: true,
    popular: false,
    icon: "🫓",
    image: "/lachha_paratha.png",
    stats: { spice: "0/10", prep: "6m", serves: "1" }
  },

  // Snack (2)
  {
    id: "sn-spring-roll",
    name: "Veg Spring Roll",
    category: "snack",
    price: 100,
    description: "Crispy fried thin wrappers stuffed with sauteed cabbage, carrots, onion, soy sauce.",
    veg: true,
    popular: false,
    icon: "🍥",
    image: "/veg_spring_roll.jpg",
    stats: { spice: "4/10", prep: "10m", serves: "1-2" }
  },
  {
    id: "sn-finger-chips",
    name: "Crispy Finger Chips",
    category: "snack",
    price: 80,
    description: "Classic salted potato finger chips fried until golden brown and crispy, served with tomato ketchup.",
    veg: true,
    popular: true,
    icon: "🍟",
    image: "/finger_chips.png",
    stats: { spice: "0/10", prep: "8m", serves: "1-2" }
  },

  // Rolls (10)
  {
    id: "rl-malai",
    name: "Malai Soya Roll",
    category: "rolls",
    price: 140,
    description: "Melt-in-mouth creamed malai chaap wrapped in a roomali roti with butter glaze.",
    veg: true,
    popular: true,
    icon: "🌯",
    image: "/roll_malai.png",
    stats: { spice: "2/10", prep: "10m", serves: "1" }
  },
  {
    id: "rl-afghani",
    name: "Afghani Soya Roll",
    category: "rolls",
    price: 140,
    description: "Gently spiced Afghani chaap skewered chunks rolled in roomali bread with garlic sauce.",
    veg: true,
    popular: false,
    icon: "🌯",
    image: "/roll_afghani.png",
    stats: { spice: "3/10", prep: "10m", serves: "1" }
  },
  {
    id: "rl-stuffed",
    name: "Stuffed Soya Roll",
    category: "rolls",
    price: 150,
    description: "Special paneer-stuffed soya pieces wrapped in flat bread with mint spread.",
    veg: true,
    popular: false,
    icon: "🌯",
    image: "/roll_stuffed.png",
    stats: { spice: "5/10", prep: "10m", serves: "1" }
  },
  {
    id: "rl-pudina",
    name: "Pudina Soya Roll",
    category: "rolls",
    price: 130,
    description: "Refreshing pudina chaap chunks rolled with green mint leaf pastes.",
    veg: true,
    popular: false,
    icon: "🌯",
    image: "/roll_pudina.png",
    stats: { spice: "6/10", prep: "10m", serves: "1" }
  },
  {
    id: "rl-achari",
    name: "Achari Soya Roll",
    category: "rolls",
    price: 130,
    description: "Pickly spicy chaap chunks tossed with lime juice and raw red onions, in a roll.",
    veg: true,
    popular: false,
    icon: "🌯",
    image: "/roll_achari.png",
    stats: { spice: "7/10", prep: "10m", serves: "1" }
  },
  {
    id: "rl-lemon",
    name: "Lemon Soya Roll",
    category: "rolls",
    price: 130,
    description: "Tandoori chaap tossed in heavy butter lime glaze and packed inside rumali wrap.",
    veg: true,
    popular: false,
    icon: "🌯",
    image: "/roll_lemon.jpg",
    stats: { spice: "5/10", prep: "10m", serves: "1" }
  },
  {
    id: "rl-masala",
    name: "Masala Soya Roll",
    category: "rolls",
    price: 130,
    description: "Tandoori masala dry chaap chunks wrapped with fresh raw onion rings.",
    veg: true,
    popular: false,
    icon: "🌯",
    image: "/roll_masala.jpg",
    stats: { spice: "8/10", prep: "10m", serves: "1" }
  },
  {
    id: "rl-paneer",
    name: "Paneer Tikka Roll",
    category: "rolls",
    price: 150,
    description: "Soft paneer tikka chunks mixed with spicy coriander chutney, rolled in thin bread.",
    veg: true,
    popular: false,
    icon: "🌯",
    image: "/soya_roll.png",
    stats: { spice: "5/10", prep: "10m", serves: "1" }
  },
  {
    id: "rl-chilli-paneer",
    name: "Chilli Paneer Roll",
    category: "rolls",
    price: 160,
    description: "Wok cooked sweet chili soy paneer chunks wrapped in thin rumali bread.",
    veg: true,
    popular: false,
    icon: "🌯",
    image: "/roll_chilli_paneer.jpg",
    stats: { spice: "8/10", prep: "10m", serves: "1" }
  },
  {
    id: "rl-keema",
    name: "Keema Soya Roll",
    category: "rolls",
    price: 150,
    description: "Spicy dry minced soya granules wrapped in soft flour flatbread with fresh herbs.",
    veg: true,
    popular: false,
    icon: "🌯",
    image: "/roll_keema.jpg",
    stats: { spice: "8/10", prep: "10m", serves: "1" }
  },

  // Accompaniments (6)
  {
    id: "ac-chutney",
    name: "Green Mint Chutney",
    category: "accompaniments",
    price: 20,
    description: "Tangy green mint yogurt sauce served in a dynamic plastic box container.",
    veg: true,
    popular: false,
    icon: "🍃",
    image: "/chutney_salad.png",
    stats: { spice: "5/10", prep: "2m", serves: "1-2" }
  },
  {
    id: "ac-onion",
    name: "Spiced Onion Salad",
    category: "accompaniments",
    price: 20,
    description: "Sliced raw onion rings tossed in chat masala and lime juices.",
    veg: true,
    popular: false,
    icon: "🧅",
    image: "/chutney_salad.png",
    stats: { spice: "2/10", prep: "2m", serves: "1-2" }
  },
  {
    id: "ac-curd",
    name: "Plain Fresh Curd",
    category: "accompaniments",
    price: 30,
    description: "Freshly prepared cold plain yogurt cup.",
    veg: true,
    popular: false,
    icon: "🥛",
    image: "/chutney_salad.png",
    stats: { spice: "0/10", prep: "2m", serves: "1" }
  },
  {
    id: "ac-cucumber-raita",
    name: "Cucumber Raita",
    category: "accompaniments",
    price: 50,
    description: "Cold grated cucumber stirred in seasoned salted cream yogurt.",
    veg: true,
    popular: false,
    icon: "🥒",
    image: "/cucumber_raita.png",
    stats: { spice: "1/10", prep: "3m", serves: "1-2" }
  },
  {
    id: "ac-mix-raita",
    name: "Mix Veg Raita",
    category: "accompaniments",
    price: 60,
    description: "Yogurt mixed with chopped onions, tomatoes, cucumbers, and roasted cumin spices.",
    veg: true,
    popular: true,
    icon: "🥣",
    image: "/mix_raita.png",
    stats: { spice: "1/10", prep: "3m", serves: "1-2" }
  },
  {
    id: "ac-boondi-raita",
    name: "Boondi Raita",
    category: "accompaniments",
    price: 50,
    description: "Yogurt mixed with tiny fried chickpea flour balls (boondi) and spices.",
    veg: true,
    popular: false,
    icon: "🥣",
    image: "/boondi_raita.png",
    stats: { spice: "1/10", prep: "3m", serves: "1-2" }
  }
];

// Limit to top 5 signature items to optimize Vercel free plan usage and increase load speed
const CAROUSEL_ITEMS = MENU_ITEMS.filter(item => item.popular).slice(0, 5);
const WHATSAPP_NUMBER = "919053160031";
const DELIVERY_CHARGE = 30;

// Restaurant location coordinates (Bhagat Singh Chowk, Jhajjar)
const RESTAURANT_LAT = 28.6101883;
const RESTAURANT_LON = 76.6452249;

// Haversine Distance Formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default function Home() {
  const { 
    orders,
    addOrder,
    isRestaurantOpen,
    openingTime,
    closingTime,
    menuOverrides
  } = useOrders();

  // Dynamically merge static catalog items with overrides
  const activeMenuItems = MENU_ITEMS.map(item => {
    const override = menuOverrides?.[item.id];
    if (override) {
      return {
        ...item,
        price: override.price !== undefined ? override.price : item.price,
        image: override.image !== undefined ? override.image : item.image,
      };
    }
    return item;
  });

  // Limit to top 5 signature items dynamically based on active items
  const carouselItems = activeMenuItems.filter(item => item.popular).slice(0, 5);
  
  // States
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [orderType, setOrderType] = useState<"Pickup" | "Delivery">("Pickup");
  const [category, setCategory] = useState<"all" | "specials" | "chaap" | "salad" | "starters" | "main" | "breads" | "snack" | "rolls" | "accompaniments">("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");
  const [lastOrderItems, setLastOrderItems] = useState<{name: string; qty: number; price: number}[]>([]);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [isTrackSearchOpen, setIsTrackSearchOpen] = useState(false);
  const [trackSearchQuery, setTrackSearchQuery] = useState("");
  const [trackSearchResults, setTrackSearchResults] = useState<Order[]>([]);
  const [trackSearchError, setTrackSearchError] = useState("");
  const [menuSearchQuery, setMenuSearchQuery] = useState("");

  useEffect(() => {
    setIsMounted(true);
    // Parse ?track=BTW-xxx query parameter
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const trackId = params.get("track");
      if (trackId) {
        setTrackingOrderId(trackId.trim().toUpperCase());
      }
    }
  }, []);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Location detection states
  const [detectedDistance, setDetectedDistance] = useState<number | null>(null);
  const [detectedCoords, setDetectedCoords] = useState<{lat: number, lon: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Operational timings check
  const checkIsStoreClosed = () => {
    if (!isRestaurantOpen) return true;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentVal = currentHour * 60 + currentMin;

    const [openH, openM] = openingTime.split(":").map(Number);
    const [closeH, closeM] = closingTime.split(":").map(Number);

    const openVal = openH * 60 + openM;
    const closeVal = closeH * 60 + closeM;

    if (closeVal > openVal) {
      // Standard same-day timings: 11:00 to 23:00
      return currentVal < openVal || currentVal > closeVal;
    } else {
      // Overnight timings: e.g. 18:00 to 02:00
      return currentVal < openVal && currentVal > closeVal;
    }
  };

  const isStoreClosed = checkIsStoreClosed();

  // Auto Hero Slider
  useEffect(() => {
    if (carouselItems.length === 0) return;
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % carouselItems.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  // Cart operations
  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: 1 }));
  };

  const updateQty = (id: string, change: number) => {
    setCart(prev => {
      const newQty = (prev[id] || 0) + change;
      const updated = { ...prev };
      if (newQty <= 0) {
        delete updated[id];
      } else {
        updated[id] = newQty;
      }
      return updated;
    });
  };

  // Geolocation trigger
  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);
    setLocationError(null);
    setDetectedDistance(null);
    setDetectedCoords(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const dist = getDistance(latitude, longitude, RESTAURANT_LAT, RESTAURANT_LON);
        
        setDetectedDistance(dist);
        setDetectedCoords({ lat: latitude, lon: longitude });
        setDetectingLocation(false);

        // Autofill detected coordinates details into text box
        if (dist <= 5) {
          setAddress(prev => {
            const base = prev.replace(/\[📍 GPS:.*?\]/g, "").trim();
            return `${base} [📍 GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (~${dist.toFixed(2)} km from chowk)]`.trim();
          });
        }
      },
      (error) => {
        setDetectingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please allow GPS access.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location check timed out.");
            break;
          default:
            setLocationError("An error occurred while checking location.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Calculations
  const cartItemCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = activeMenuItems.find(i => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const deliveryFee = orderType === "Delivery" ? DELIVERY_CHARGE : 0;
  const total = subtotal + deliveryFee;

  const filteredItems = activeMenuItems.filter(item => {
    // Filter by category
    if (category !== "all" && item.category !== category) return false;
    // Filter by search query
    if (menuSearchQuery.trim() !== "") {
      const search = menuSearchQuery.toLowerCase().trim();
      return item.name.toLowerCase().includes(search) || item.description.toLowerCase().includes(search);
    }
    return true;
  });

  // Dual dispatch handler
  const handleOrderSubmit = async () => {
    if (isStoreClosed) {
      alert("We are currently closed and not accepting online orders at this time.");
      return;
    }
    if (Object.keys(cart).length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please enter your name and phone number.");
      return;
    }
    if (orderType === "Delivery" && !address.trim()) {
      alert("Please enter your delivery address.");
      return;
    }
    if (orderType === "Delivery" && detectedDistance !== null && detectedDistance > 5) {
      alert(`Sorry, we only deliver within 5km of Bhagat Singh Chowk, Jhajjar. Your detected distance is ${detectedDistance.toFixed(2)} km away. Please switch to Self-Pickup to complete your order.`);
      return;
    }

    const orderItems: OrderItem[] = Object.entries(cart).map(([id, qty]) => {
      const item = activeMenuItems.find(i => i.id === id)!;
      return { id, name: item.name, price: item.price, qty };
    });

    setIsSubmitting(true);
    try {
      const orderId = await addOrder({
        customerName,
        customerPhone,
        customerAddress: orderType === "Delivery" ? address : undefined,
        customerCoords: orderType === "Delivery" && detectedCoords ? detectedCoords : undefined,
        type: orderType,
        items: orderItems,
        subtotal,
        deliveryFee,
        total,
        notes: notes.trim() || undefined,
      });

      // Save order summary for the Thank You screen
      setLastOrderId(orderId);
      setLastOrderItems(orderItems.map(i => ({ name: i.name, qty: i.qty, price: i.price })));
      setLastOrderTotal(total);

      // Reset cart & form
      setCart({});
      setNotes("");
      setIsCartOpen(false);
      setOrderSuccess(true);
    } catch (err) {
      console.error("Order submission error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackSearchError("");
    setTrackSearchResults([]);
    
    const query = trackSearchQuery.trim();
    if (!query) {
      setTrackSearchError("Please enter an Order ID or 4-digit mobile number.");
      return;
    }

    let found: any[] = [];
    const isSupabaseConnected = supabase !== null;

    // Case A: Query is digits and length is 4 (mobile suffix search)
    if (/^\d{4}$/.test(query)) {
      found = orders.filter(o => o.customerPhone.replace(/\s+/g, "").endsWith(query));
      
      if (found.length === 0 && isSupabaseConnected) {
        const { data, error } = await supabase!
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          const fetchedOrders = data.map((row: any) => ({
            id: row.id,
            customerName: row.customer_name,
            customerPhone: row.customer_phone,
            customerAddress: row.customer_address ?? undefined,
            customerCoords: row.customer_coords ?? undefined,
            type: row.type,
            items: row.items,
            subtotal: row.subtotal,
            deliveryFee: row.delivery_fee,
            total: row.total,
            status: row.status,
            timestamp: row.timestamp,
            notes: row.notes ?? undefined,
            isRead: row.is_read,
          }));
          found = fetchedOrders.filter(o => o.customerPhone.replace(/\s+/g, "").endsWith(query));
        }
      }
    } 
    // Case B: Query is full mobile number
    else if (/^\d{10}$/.test(query) || /^\+?\d{10,12}$/.test(query)) {
      const cleanQuery = query.replace(/\D/g, "");
      found = orders.filter(o => o.customerPhone.replace(/\D/g, "").includes(cleanQuery));
    }
    // Case C: Query is Order ID
    else {
      let searchId = query.toUpperCase();
      if (!searchId.startsWith("BTW-") && /^\d+$/.test(searchId)) {
        searchId = `BTW-${searchId.padStart(3, "0")}`;
      }
      
      const matched = orders.find(o => o.id.toUpperCase() === searchId);
      if (matched) {
        found = [matched];
      } else if (isSupabaseConnected) {
        const { data, error } = await supabase!
          .from("orders")
          .select("*")
          .eq("id", searchId)
          .single();
        if (!error && data) {
          const mapped = {
            id: data.id,
            customerName: data.customer_name,
            customerPhone: data.customer_phone,
            customerAddress: data.customer_address ?? undefined,
            customerCoords: data.customer_coords ?? undefined,
            type: data.type,
            items: data.items,
            subtotal: data.subtotal,
            deliveryFee: data.delivery_fee,
            total: data.total,
            status: data.status,
            timestamp: data.timestamp,
            notes: data.notes ?? undefined,
            isRead: data.is_read,
          };
          found = [mapped];
        }
      }
    }

    if (found.length === 0) {
      setTrackSearchError("No orders found matching this query.");
    } else if (found.length === 1) {
      setTrackingOrderId(found[0].id);
      setIsTrackSearchOpen(false);
    } else {
      setTrackSearchResults(found);
    }
  };

  const nextSlide = () => {
    if (carouselItems.length === 0) return;
    setHeroIndex(prev => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    if (carouselItems.length === 0) return;
    setHeroIndex(prev => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  return (
    <div className="min-h-screen bg-brand-black flex flex-col relative text-brand-text">
      
      {/* Thank You / Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-brand-surface border border-white/10 rounded-[2rem] p-6 md:p-8 max-w-md w-full text-center relative overflow-hidden shadow-glow">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(132,204,22,0.15),transparent_70%)]"></div>
            
            <div className="relative z-10 space-y-6">
              {/* Checkmark icon animation */}
              <div className="w-20 h-20 bg-brand-lime/10 border border-brand-lime/25 rounded-full flex items-center justify-center mx-auto shadow-lime-glow animate-bounce">
                <CheckCircle2 className="text-brand-lime w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black font-heading text-white">ORDER PLACED! 🎉</h2>
                <p className="text-xs text-brand-text-muted">
                  Thank you for ordering from B-Tech Soya Chaap. Your order is logged in our live queue!
                </p>
              </div>

              {/* Order summary card */}
              <div className="bg-brand-black/50 border border-white/5 rounded-2xl p-4 text-left space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] uppercase tracking-wider text-brand-text-muted">Order ID</span>
                  <span className="font-mono font-bold text-brand-orange text-sm drop-shadow-orange-glow">{lastOrderId}</span>
                </div>
                
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {lastOrderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-white font-medium">{item.qty} x {item.name}</span>
                      <span className="text-brand-text-muted">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-2 font-bold text-sm">
                  <span className="text-white">Amount (Pay on COD/Pickup)</span>
                  <span className="text-brand-orange">₹{lastOrderTotal}</span>
                </div>
              </div>

              <div className="bg-brand-orange/5 border border-brand-orange/10 rounded-xl p-3 text-xs text-brand-orange/90 flex items-center gap-2">
                <Clock size={14} className="shrink-0 animate-pulse" />
                <span>Our kitchen staff is preparing your order. Track queue updates in the shop or call us if needed!</span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    setTrackingOrderId(lastOrderId);
                    setOrderSuccess(false);
                    setLastOrderId("");
                    setLastOrderItems([]);
                    setLastOrderTotal(0);
                  }}
                  className="w-full bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold py-3.5 rounded-full transition-all duration-300 shadow-orange-glow flex items-center justify-center gap-2"
                >
                  <Navigation size={14} className="animate-pulse" />
                  <span>Track Live Status</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setOrderSuccess(false);
                      setLastOrderId("");
                      setLastOrderItems([]);
                      setLastOrderTotal(0);
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 text-white font-extrabold py-3.5 rounded-full border border-white/10 transition-all duration-300 text-xs"
                  >
                    Order More Food
                  </button>
                  <a
                    href="tel:+919053160031"
                    className="w-full bg-white/5 hover:bg-white/10 text-white font-extrabold py-3.5 rounded-full border border-white/10 transition-all duration-300 inline-flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <Phone size={13} />
                    Call Kitchen
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Live Order Tracker Modal */}
      {trackingOrderId && (() => {
        // Find the tracked order in the live context list
        const order = orders.find(o => o.id === trackingOrderId);

        // Helper to parse dates formatted as "DD-MM-YYYY HH:MM AM/PM"
        const parseDate = (str: string) => {
          try {
            const parts = str.split(" ");
            const dateParts = parts[0].split("-");
            const timeParts = parts[1].split(":");
            let hour = parseInt(timeParts[0]);
            const min = parseInt(timeParts[1]);
            if (parts[2] === "PM" && hour < 12) hour += 12;
            if (parts[2] === "AM" && hour === 12) hour = 0;
            return new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]), hour, min).getTime();
          } catch {
            return 0;
          }
        };

        // Helper to get active queue info
        const activeOrders = orders.filter(o => o.status !== "Completed" && o.status !== "Cancelled");
        // Sort active orders newest-first
        const sortedActive = [...activeOrders].sort((a, b) => {
          return parseDate(b.timestamp) - parseDate(a.timestamp);
        });
        const queuePos = sortedActive.findIndex(o => o.id === trackingOrderId);
        const ordersAhead = queuePos >= 0 ? (sortedActive.length - 1 - queuePos) : 0;

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-brand-surface border border-white/10 rounded-[2rem] p-6 md:p-8 max-w-md w-full relative overflow-hidden shadow-glow">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.1),transparent_60%)]"></div>
              
              <button 
                onClick={() => setTrackingOrderId(null)}
                className="absolute top-5 right-5 text-brand-text-muted hover:text-white transition-colors cursor-pointer"
                aria-label="Close Tracker"
              >
                <X size={20} />
              </button>

              <div className="relative z-10 space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold text-brand-orange uppercase tracking-widest bg-brand-orange/10 px-3 py-1 rounded-full">
                    Live Order Tracker
                  </span>
                  <h2 className="text-2xl font-black text-white mt-2">Order {trackingOrderId}</h2>
                  {order && (
                    <p className="text-[10px] text-brand-text-muted">
                      Placed on {order.timestamp}
                    </p>
                  )}
                </div>

                {!order ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-orange mx-auto"></div>
                    <p className="text-xs text-brand-text-muted">
                      Connecting to kitchen database & fetching your order details...
                    </p>
                    <p className="text-[10px] text-yellow-500/80 italic">
                      Note: If your order is older than 7 days, it may have been auto-deleted.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Queue position check */}
                    {order.status !== "Completed" && order.status !== "Cancelled" && (
                      <div className="bg-brand-orange/5 border border-brand-orange/10 rounded-2xl p-4 flex items-center gap-3">
                        <UtensilsCrossed size={18} className="text-brand-orange animate-pulse shrink-0" />
                        <div className="text-xs text-left">
                          <span className="font-bold text-white block">
                            {ordersAhead === 0 ? "You are next in queue!" : `${ordersAhead} orders ahead of yours`}
                          </span>
                          <span className="text-[10px] text-brand-text-muted">
                            Our chefs prepare everything fresh in sequence.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Timeline status list */}
                    <div className="relative pl-6 space-y-6 border-l border-white/10 ml-3 py-1 text-left">
                      {/* Timeline Dot 1: Received */}
                      <div className="relative">
                        <div className={`absolute -left-[30px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                          order.status === "Cancelled" 
                            ? "bg-red-500/20 border-red-500 text-red-500"
                            : "bg-brand-lime/20 border-brand-lime text-brand-lime"
                        }`}>
                          ✓
                        </div>
                        <div className="text-xs">
                          <h4 className="font-bold text-white">Order Received</h4>
                          <p className="text-[10px] text-brand-text-muted">
                            {order.status === "Cancelled" ? "This order was cancelled." : "Successfully sent to the restaurant dashboard."}
                          </p>
                        </div>
                      </div>

                      {/* Timeline Dot 2: Preparing */}
                      {order.status !== "Cancelled" && (
                        <div className="relative">
                          <div className={`absolute -left-[30px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                            order.status === "Preparing" || order.status === "Out for Delivery" || order.status === "Completed"
                              ? "bg-brand-lime/20 border-brand-lime text-brand-lime"
                              : "bg-brand-black border-white/20 text-brand-text-muted"
                          }`}>
                            {order.status === "Preparing" ? "🍳" : "✓"}
                          </div>
                          <div className="text-xs">
                            <h4 className={`font-bold ${
                              order.status === "Preparing" || order.status === "Out for Delivery" || order.status === "Completed"
                                ? "text-white"
                                : "text-brand-text-muted"
                            }`}>
                              Preparing in Kitchen
                            </h4>
                            <p className="text-[10px] text-brand-text-muted">
                              {order.status === "Preparing" 
                                ? "Our chefs are cooking your delicious chaap right now!" 
                                : order.status === "Out for Delivery" || order.status === "Completed"
                                ? "Preparation completed."
                                : "Waiting for kitchen sequence..."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Timeline Dot 3: Out for Delivery or Ready for Pickup */}
                      {order.status !== "Cancelled" && (
                        <div className="relative">
                          <div className={`absolute -left-[30px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                            order.status === "Out for Delivery" || order.status === "Completed"
                              ? "bg-brand-lime/20 border-brand-lime text-brand-lime"
                              : "bg-brand-black border-white/20 text-brand-text-muted"
                          }`}>
                            {order.status === "Out for Delivery" ? "🛵" : "✓"}
                          </div>
                          <div className="text-xs">
                            <h4 className={`font-bold ${
                              order.status === "Out for Delivery" || order.status === "Completed"
                                ? "text-white"
                                : "text-brand-text-muted"
                            }`}>
                              {order.type === "Delivery" ? "Out for Delivery" : "Ready for Pickup"}
                            </h4>
                            <p className="text-[10px] text-brand-text-muted">
                              {order.status === "Out for Delivery" 
                                ? (order.type === "Delivery" ? "Delivery boy is on the way to your address!" : "Your order is ready to collect at the counter!")
                                : order.status === "Completed"
                                ? (order.type === "Delivery" ? "Delivered successfully." : "Picked up successfully.")
                                : "Awaiting dispatch/preparation."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Timeline Dot 4: Completed */}
                      {order.status !== "Cancelled" && (
                        <div className="relative">
                          <div className={`absolute -left-[30px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                            order.status === "Completed"
                              ? "bg-brand-lime/20 border-brand-lime text-brand-lime"
                              : "bg-brand-black border-white/20 text-brand-text-muted"
                          }`}>
                            ✓
                          </div>
                          <div className="text-xs">
                            <h4 className={`font-bold ${order.status === "Completed" ? "text-white" : "text-brand-text-muted"}`}>
                              Order Completed
                            </h4>
                            <p className="text-[10px] text-brand-text-muted">
                              {order.status === "Completed" ? "Enjoy your delicious warm meal! Thank you!" : "Waiting to complete."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Short summary */}
                    <div className="border-t border-white/5 pt-4 space-y-2 text-left">
                      <div className="flex justify-between text-[11px] text-brand-text-muted">
                        <span>Items: {order.items.reduce((s, i) => s + i.qty, 0)}</span>
                        <span>Total: ₹{order.total} ({order.type})</span>
                      </div>
                      <div className="bg-brand-black/35 rounded-xl p-2.5 text-[10px] text-brand-text-muted">
                        <span className="font-bold text-white block mb-0.5">Details:</span>
                        <span>Name: {order.customerName} | Phone: {order.customerPhone}</span>
                        {order.type === "Delivery" && order.customerAddress && (
                          <span className="block mt-1 truncate">Address: {order.customerAddress}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <a
                    href="tel:+919053160031"
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-extrabold py-3.5 rounded-full border border-white/10 transition-all duration-300 inline-flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <Phone size={13} />
                    Call Kitchen
                  </a>
                  <button
                    onClick={() => setTrackingOrderId(null)}
                    className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold py-3.5 rounded-full transition-all duration-300 shadow-orange-glow text-xs"
                  >
                    Back to Menu
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Track Search Modal */}
      {isTrackSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-brand-surface border border-white/10 rounded-[2rem] p-6 md:p-8 max-w-md w-full relative overflow-hidden shadow-glow">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.1),transparent_60%)]"></div>
            
            <button 
              onClick={() => setIsTrackSearchOpen(false)}
              className="absolute top-5 right-5 text-brand-text-muted hover:text-white transition-colors cursor-pointer"
              aria-label="Close Search"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 space-y-5">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold text-brand-orange uppercase tracking-widest bg-brand-orange/10 px-3 py-1 rounded-full">
                  Live Status Tracking
                </span>
                <h2 className="text-xl font-black text-white mt-2">Track Your Order</h2>
                <p className="text-xs text-brand-text-muted">
                  Enter your Order ID or the last 4 digits of your phone number.
                </p>
              </div>

              <form onSubmit={handleTrackSearch} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. BTW-012 or last 4 digits (e.g. 5678)"
                    value={trackSearchQuery}
                    onChange={(e) => setTrackSearchQuery(e.target.value)}
                    className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-brand-text-muted focus:border-brand-orange focus:outline-none transition-colors"
                  />
                </div>

                {trackSearchError && (
                  <p className="text-xs text-red-400 font-medium">{trackSearchError}</p>
                )}

                <button
                  type="submit"
                  className="w-full bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold py-3 rounded-full transition-all duration-300 shadow-orange-glow text-sm cursor-pointer"
                >
                  Search Live Order
                </button>
              </form>

              {/* Multiple Search Results list */}
              {trackSearchResults.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">
                    Recent Orders Found:
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {trackSearchResults.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => {
                          setTrackingOrderId(order.id);
                          setIsTrackSearchOpen(false);
                        }}
                        className="w-full bg-brand-black/40 border border-white/5 rounded-xl p-3 text-left hover:border-brand-orange/45 hover:bg-brand-black/60 transition-all flex justify-between items-center cursor-pointer group"
                      >
                        <div className="text-xs space-y-0.5">
                          <span className="font-bold text-white group-hover:text-brand-orange transition-colors">
                            {order.id}
                          </span>
                          <span className="text-[10px] text-brand-text-muted block">
                            {order.timestamp} ({order.type})
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-brand-orange block">
                            ₹{order.total}
                          </span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                            order.status === "Completed" 
                              ? "bg-brand-lime/10 text-brand-lime"
                              : order.status === "Cancelled"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-yellow-500/10 text-yellow-400 animate-pulse"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Premium Glass Fixed Header */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 rounded-b-[1.5rem] px-4 py-3 sm:px-6 sm:py-4 shadow-glow">
        <div className="w-full px-4 md:px-8 lg:px-12 mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <Link href="/">
              <h1 className="text-xl md:text-2xl font-semibold tracking-wide-brand font-heading hover:text-brand-orange transition-colors cursor-pointer">
                BTECH <span className="text-brand-orange drop-shadow-orange-glow">CHAAP WALA</span>
              </h1>
            </Link>
            <div className="text-[9px] tracking-sub-brand uppercase text-brand-text-muted flex flex-wrap items-center gap-x-3 gap-y-0.5 font-bold mt-1">
              {/* Direct Google Maps Navigation */}
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=28.6101883000,76.6452249000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-brand-orange transition-colors"
              >
                <MapPin size={10} className="text-brand-orange animate-pulse" />
                <span className="hidden sm:inline">Bhagat Singh Chowk, </span>Jhajjar
              </a>
              <a 
                href="tel:+919053160031" 
                className="flex items-center gap-1 hover:text-brand-orange transition-colors cursor-pointer"
              >
                <Phone size={10} className="text-brand-orange" />
                +91 90531 60031
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setTrackSearchQuery("");
                setTrackSearchResults([]);
                setTrackSearchError("");
                setIsTrackSearchOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-brand-orange/25 text-brand-orange hover:bg-brand-orange/10 text-xs font-bold transition-all duration-300 cursor-pointer"
            >
              <Navigation size={12} className="animate-pulse" />
              <span>Track Order</span>
            </button>

            <Link 
              href="/admin" 
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-brand-lime/25 text-brand-lime hover:bg-brand-lime/10 text-xs font-bold transition-all duration-300"
            >
              <Shield size={12} />
              <span className="hidden sm:inline">Admin Panel</span>
            </Link>

            <button 
              onClick={() => cartItemCount > 0 && setIsCartOpen(true)}
              className="glass glass-hover flex items-center gap-2.5 px-4 py-2.5 rounded-full"
              aria-label="Open Cart"
            >
              <div className="relative">
                <ShoppingBag size={15} className="text-white" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-3 -right-3 bg-brand-orange text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-orange-glow">
                    {cartItemCount}
                  </span>
                )}
              </div>
              {cartItemCount > 0 && (
                <span className="text-xs font-semibold text-brand-orange">
                  ₹{total}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main content wrapper */}
      <div className="pt-28 sm:pt-28 flex flex-col w-full">
        
        {isMounted && isStoreClosed && !isBannerDismissed && (
          <div className="w-full px-4 md:px-8 lg:px-12 mx-auto mb-2 mt-4">
            <div className="relative overflow-hidden bg-gradient-to-r from-red-950/80 via-red-900/60 to-red-950/80 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between shadow-glow gap-4">
              <div className="flex items-center gap-3">
                <Clock className="text-red-500 animate-pulse flex-shrink-0" size={20} />
                <div className="text-left">
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    🏪 WE ARE CURRENTLY CLOSED
                  </h4>
                  <p className="text-[10px] sm:text-xs text-brand-text-muted leading-relaxed">
                    We are not accepting online orders right now. Daily timings: {openingTime} to {closingTime}. Call +91 90531 60031 for inquiries.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsBannerDismissed(true)}
                className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-brand-text-muted hover:text-white transition-colors border border-white/5 flex-shrink-0"
                aria-label="Dismiss banner"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Hero Carousel Section */}
        {carouselItems.length > 0 && (
              <section className="w-full px-4 md:px-8 lg:px-12 mx-auto mt-10 md:mt-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-brand-orange/10 to-brand-black border border-brand-orange/15 rounded-[2rem] p-4 sm:p-8 md:px-12 md:py-8 shadow-glow min-h-[180px] sm:min-h-[260px] md:min-h-[384px] flex flex-col justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent z-0"></div>
                  
                  {/* Slide item */}
                  <div className="relative z-10 flex flex-row justify-between items-center gap-4 md:gap-8 h-full">
                    <div className="w-1/2 space-y-2 md:space-y-4">
                      <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/15 px-4 py-1.5 text-xs text-brand-orange font-bold uppercase tracking-sub-brand">
                        <Sparkles size={13} />
                        <span>Signature Recipe</span>
                      </div>
                      <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] md:leading-[1.0] text-white">
                        {carouselItems[heroIndex].name}
                      </h2>
                      <p className="hidden md:block max-w-xl text-base text-brand-text-muted leading-relaxed">
                        {carouselItems[heroIndex].description}
                      </p>
                      
                      <div className="hidden md:flex gap-3 pt-2">
                        <div className="bg-brand-black/60 border border-white/5 px-4 py-2 rounded-xl flex flex-col text-center min-w-[85px]">
                          <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Spice</span>
                          <span className="text-sm font-black text-brand-orange">{carouselItems[heroIndex].stats.spice}</span>
                        </div>
                        <div className="bg-brand-black/60 border border-white/5 px-4 py-2 rounded-xl flex flex-col text-center min-w-[85px]">
                          <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Prep</span>
                          <span className="text-sm font-black text-brand-orange">{carouselItems[heroIndex].stats.prep}</span>
                        </div>
                        <div className="bg-brand-black/60 border border-white/5 px-4 py-2 rounded-xl flex flex-col text-center min-w-[85px]">
                          <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Serves</span>
                          <span className="text-sm font-black text-brand-orange">{carouselItems[heroIndex].stats.serves}</span>
                        </div>
                      </div>
                    </div>
 
                    <div className="w-1/2 bg-brand-black/50 border border-white/10 rounded-2xl md:rounded-[1.75rem] h-32 sm:h-52 md:h-80 flex-shrink-0 overflow-hidden shadow-orange-glow">
                      <img 
                        src={carouselItems[heroIndex].image} 
                        alt={carouselItems[heroIndex].name} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/soya_roll.png";
                        }}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Carousel controls (Outside the box) */}
                <div className="relative z-10 flex justify-between items-center mt-4 px-2">
                  <div className="flex gap-1.5">
                    {carouselItems.map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setHeroIndex(i)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${heroIndex === i ? "w-6 bg-brand-orange" : "w-2.5 bg-white/20 hover:bg-white/40"}`}
                        aria-label={`Slide ${i + 1}`}
                      ></button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={prevSlide}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-900/60 border border-white/10 flex items-center justify-center text-white hover:border-brand-orange transition-colors"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button 
                      onClick={nextSlide}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-900/60 border border-white/10 flex items-center justify-center text-white hover:border-brand-orange transition-colors"
                      aria-label="Next slide"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Sticky selector controls */}
            <section className="w-full px-4 md:px-8 lg:px-12 mx-auto mt-8 sticky top-[68px] sm:top-[74px] z-30 bg-brand-black/95 py-4 border-b border-white/5">
              <div className="flex flex-col gap-4">
                
                {/* Delivery Toggle */}
                <div className="bg-zinc-900/60 border border-white/10 rounded-full p-1.5 flex relative w-full">
                  <div 
                    className="absolute top-1.5 bottom-1.5 rounded-full bg-brand-orange shadow-orange-glow transition-all duration-300 ease-out"
                    style={{
                      left: orderType === "Pickup" ? "6px" : "50%",
                      width: "calc(50% - 6px)"
                    }}
                  ></div>
                  <button 
                    onClick={() => setOrderType("Pickup")}
                    className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 rounded-full z-10 transition-all duration-200 ${orderType === "Pickup" ? "text-white" : "text-brand-text-muted hover:text-white"}`}
                  >
                    <Store size={16} />
                    <span>Self-Pickup at Chowk</span>
                  </button>
                  <button 
                    onClick={() => setOrderType("Delivery")}
                    className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 rounded-full z-10 transition-all duration-200 ${orderType === "Delivery" ? "text-white" : "text-brand-text-muted hover:text-white"}`}
                  >
                    <Bike size={16} />
                    <span>Home Delivery in Jhajjar</span>
                  </button>
                </div>

                {/* Filter Tabs matching Zomato Categories - ONLY VISIBLE IF MENU IS SHOWN */}
                {(orderType === "Pickup" || (orderType === "Delivery" && detectedDistance !== null && detectedDistance <= 5)) && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {[
                      { id: "all", label: "All Items" },
                      { id: "specials", label: `BCW Specials (${activeMenuItems.filter(i => i.category === "specials").length})` },
                      { id: "chaap", label: `Chaap (${activeMenuItems.filter(i => i.category === "chaap").length})` },
                      { id: "salad", label: `Salad (${activeMenuItems.filter(i => i.category === "salad").length})` },
                      { id: "starters", label: `Starters (${activeMenuItems.filter(i => i.category === "starters").length})` },
                      { id: "main", label: `Main Course (${activeMenuItems.filter(i => i.category === "main").length})` },
                      { id: "breads", label: `Breads (${activeMenuItems.filter(i => i.category === "breads").length})` },
                      { id: "snack", label: `Snack (${activeMenuItems.filter(i => i.category === "snack").length})` },
                      { id: "rolls", label: `Rolls (${activeMenuItems.filter(i => i.category === "rolls").length})` },
                      { id: "accompaniments", label: `Accompaniments (${activeMenuItems.filter(i => i.category === "accompaniments").length})` }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setCategory(tab.id as any)}
                        className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 ${category === tab.id ? "bg-brand-surface border-brand-lime text-brand-lime shadow-lime-glow" : "glass text-brand-text-muted border-white/5 hover:border-white/15"}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Menu Catalog grid / Delivery Gates */}
            <main className="w-full px-4 md:px-8 lg:px-12 mx-auto mt-8 flex-1 mb-28">
              
              {/* DELIVERY GATES */}
              {orderType === "Delivery" && detectedDistance === null && (
                /* Gate 1: Check Location Needed */
                <div className="glass rounded-[2rem] p-8 text-center border border-white/5 space-y-4 max-w-2xl mx-auto my-12 shadow-glow">
                  <MapPin size={42} className="mx-auto text-brand-orange animate-bounce" />
                  <h3 className="text-xl font-bold text-white font-heading">Location Check Required</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed">
                    To ensure your food arrives fresh and hot, we only deliver within a 5km radius of Bhagat Singh Chowk, Jhajjar. 
                    Please auto-detect your location to unlock the menu.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button 
                      onClick={detectUserLocation}
                      className="bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold px-6 py-3 rounded-full text-xs shadow-orange-glow transition-all duration-200"
                    >
                      {detectingLocation ? "Checking GPS..." : "📍 Verify My Location"}
                    </button>
                    <button 
                      onClick={() => setOrderType("Pickup")}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-3 rounded-full text-xs transition-colors"
                    >
                      🏪 Order via Self-Pickup
                    </button>
                  </div>
                  {locationError && <p className="text-xs text-yellow-400 font-semibold mt-2">⚠️ {locationError}</p>}
                </div>
              )}

              {orderType === "Delivery" && detectedDistance !== null && detectedDistance > 5 && (
                /* Gate 2: Outside Delivery Range (Menu Hidden) */
                <div className="glass rounded-[2rem] p-8 text-center border border-red-500/25 space-y-4 max-w-2xl mx-auto my-12 bg-red-500/[0.02] shadow-glow">
                  <AlertTriangle size={42} className="mx-auto text-red-500 animate-pulse" />
                  <h3 className="text-xl font-bold text-white font-heading">Outside Delivery Zone</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed">
                    Your detected location is <span className="text-red-400 font-bold">{detectedDistance.toFixed(2)} km</span> away, which exceeds our 5km boundary. We cannot deliver to this address.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button 
                      onClick={() => {
                        setOrderType("Pickup");
                        setDetectedDistance(null);
                      }}
                      className="bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold px-6 py-3 rounded-full text-xs shadow-orange-glow transition-all duration-200"
                    >
                      🏪 Switch to Self-Pickup (Unlock Menu)
                    </button>
                    <button 
                      onClick={detectUserLocation}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-3 rounded-full text-xs transition-colors"
                    >
                      🔄 Retry GPS Check
                    </button>
                  </div>
                </div>
              )}

              {/* Grid Catalog - Shown when orderType is Pickup OR when Delivery is within 5km */}
              {(orderType === "Pickup" || (orderType === "Delivery" && detectedDistance !== null && detectedDistance <= 5)) && (
                <>
                  {/* Delivery Range success badge */}
                  {orderType === "Delivery" && detectedDistance !== null && (
                    <div className="max-w-2xl mx-auto mb-6 bg-brand-lime/10 border border-brand-lime/30 rounded-xl p-3.5 text-center flex items-center justify-center gap-2 text-brand-lime text-xs font-bold shadow-lime-glow">
                      <CheckCircle2 size={15} />
                      <span>Verified: You are {detectedDistance.toFixed(2)} km away. Delivery is available!</span>
                    </div>
                  )}

                  {/* Menu Search Bar */}
                  <div className="relative w-full max-w-md mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-brand-text-muted" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search delicious dishes (e.g. chaap, momos, roll)..."
                      value={menuSearchQuery}
                      onChange={(e) => setMenuSearchQuery(e.target.value)}
                      className="w-full bg-brand-surface border border-white/10 rounded-full pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder-brand-text-muted focus:border-brand-orange focus:outline-none transition-all shadow-glow"
                    />
                    {menuSearchQuery && (
                      <button
                        onClick={() => setMenuSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-text-muted hover:text-white transition-colors cursor-pointer"
                        title="Clear Search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Selected Category Header */}
                  <div className="mb-6 border-b border-white/5 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white/[0.01] p-5 rounded-2xl border border-white/5 font-sans">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2 capitalize">
                        {category === "all" ? "🔥 Our Full Menu" : 
                         category === "specials" ? "✨ BCW Specials" :
                         category === "chaap" ? "🍢 Soya Chaap Specialties" :
                         category === "salad" ? "🥗 Healthy Salads" :
                         category === "starters" ? "🍟 Sizzling Starters" :
                         category === "main" ? "🥘 Main Course Curries" :
                         category === "breads" ? "🫓 Tandoori Breads" :
                         category === "snack" ? "🍥 Quick Snacks" :
                         category === "rolls" ? "🌯 Kathi Rolls Wrap" :
                         category === "accompaniments" ? "🍃 Accompaniments" : "Menu Selection"}
                      </h2>
                      <p className="text-xs text-brand-text-muted">
                        Browse our freshly prepared items. All items are 100% vegetarian.
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-3.5 py-1.5 rounded-full shadow-orange-glow self-start sm:self-center">
                      {filteredItems.length} Available Item{filteredItems.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => {
                      const qty = cart[item.id] || 0;
                      const hasItem = qty > 0;
                      
                      return (
                        <div 
                          key={item.id}
                          className="glass glass-hover rounded-[1.5rem] p-5 flex flex-col justify-between shadow-glow relative group"
                        >
                          <div>
                            {/* Food Cover Image */}
                            <div className="relative w-full h-48 md:h-56 rounded-[1rem] overflow-hidden mb-4 bg-brand-black/60 border border-white/5">
                              <Image 
                                src={item.image} 
                                alt={item.name} 
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                quality={85}
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {item.popular && (
                                <span className="absolute top-3 right-3 bg-brand-orange text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-orange-glow">
                                  Best Seller
                                </span>
                              )}
                            </div>

                            <div className="flex justify-between items-start mb-2.5">
                              <div className="flex items-center gap-2">
                                <div className="border border-brand-lime p-0.5 rounded" aria-label="Pure Veg">
                                  <div className="w-1.5 h-1.5 bg-brand-lime rounded-full shadow-lime-glow"></div>
                                </div>
                                <span className="text-[10px] text-brand-lime font-bold uppercase tracking-sub-brand">Pure Veg</span>
                              </div>
                              <span className="text-xl">{item.icon}</span>
                            </div>

                            <h3 className="text-lg font-semibold tracking-tight text-white mb-1.5 group-hover:text-brand-orange transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-xs text-brand-text-muted leading-relaxed mb-4 min-h-[38px]">
                              {item.description}
                            </p>

                            {/* Stats list */}
                            <div className="flex flex-wrap gap-1.5 mb-5">
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-black/40 border border-white/5 px-2 py-1 rounded-md text-brand-text-muted">🌶️ Spice: {item.stats.spice}</span>
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-black/40 border border-white/5 px-2 py-1 rounded-md text-brand-text-muted">⏱️ {item.stats.prep}</span>
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-black/40 border border-white/5 px-2 py-1 rounded-md text-brand-text-muted">👥 Serves {item.stats.serves}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-auto">
                            <span className="text-xl text-brand-orange crisp-price">
                              ₹{item.price}
                            </span>

                            <div className="w-[100px] h-[36px] relative">
                              {!hasItem ? (
                                <button
                                  onClick={() => addToCart(item.id)}
                                  className="absolute inset-0 bg-brand-orange text-black hover:bg-brand-orange-hover font-bold text-xs rounded-full flex items-center justify-center gap-1 shadow-orange-glow transition-all duration-200"
                                >
                                  <Plus size={14} />
                                  <span>Add</span>
                                </button>
                              ) : (
                                <div className="absolute inset-0 bg-brand-surface border border-brand-orange rounded-full flex items-center justify-between px-2 text-white">
                                  <button 
                                    onClick={() => updateQty(item.id, -1)}
                                    className="text-brand-orange hover:bg-brand-orange/15 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="text-xs font-black">{qty}</span>
                                  <button 
                                    onClick={() => updateQty(item.id, 1)}
                                    className="text-brand-orange hover:bg-brand-orange/15 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </main>

        {/* Floating Bottom sheet toggle */}
        <div className={`fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/80 backdrop-blur-md border-t border-white/5 px-4 py-3 transform transition-transform duration-300 ease-out ${cartItemCount > 0 ? "translate-y-0" : "translate-y-full"}`}>
          <div className="w-full px-4 md:px-8 lg:px-12 mx-auto flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-sub-brand">
                Basket: {cartItemCount} item{cartItemCount > 1 ? 's' : ''}
              </span>
              <span className="text-lg font-black text-brand-orange">
                ₹{total} {orderType === "Delivery" && <span className="text-[10px] font-normal text-brand-text-muted">(Inc. ₹{DELIVERY_CHARGE} Delivery)</span>}
              </span>
            </div>

            <button
              onClick={() => {
                if (isStoreClosed) {
                  alert("We are currently closed and not accepting online orders at this time. Daily timings: " + openingTime + " to " + closingTime + ". Feel free to browse our menu!");
                } else {
                  setIsCartOpen(true);
                }
              }}
              className={`${isStoreClosed ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" : "bg-brand-orange text-black hover:bg-brand-orange-hover shadow-orange-glow"} font-bold text-sm px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-200`}
            >
              <span>{isStoreClosed ? "Store Closed" : "Checkout Basket"}</span>
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Checkout Sidebar/Modal */}
      <div className={`fixed inset-0 z-50 bg-black/85 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-y-0 right-0 w-full max-w-md bg-brand-surface-elevated border-l border-white/10 p-6 flex flex-col h-full transform transition-transform duration-300 ease-out translate-x-0 shadow-lg">
          
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 font-heading text-white">
              <ShoppingBag className="text-brand-orange" />
              <span>Checkout Order</span>
            </h3>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-brand-surface flex items-center justify-center text-brand-text-muted hover:text-white transition-colors border border-white/5"
            >
              <X size={15} />
            </button>
          </div>

          {/* Items lists */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
            {Object.keys(cart).length === 0 ? (
              <div className="text-center py-10 text-brand-text-muted">
                <p>Basket is empty.</p>
              </div>
            ) : (
              Object.entries(cart).map(([id, qty]) => {
                const item = activeMenuItems.find(i => i.id === id);
                if (!item) return null;
                
                return (
                  <div key={id} className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-3 max-w-[60%]">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-brand-black border border-white/5 flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate text-white block">{item.name}</span>
                        <span className="text-[10px] text-brand-text-muted">₹{item.price} each</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-brand-surface border border-white/5 rounded-full flex items-center gap-2 p-1">
                        <button 
                          onClick={() => updateQty(id, -1)}
                          className="text-brand-orange hover:bg-brand-orange/15 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{qty}</span>
                        <button 
                          onClick={() => updateQty(id, 1)}
                          className="text-brand-orange hover:bg-brand-orange/15 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <span className="text-xs font-black text-brand-orange min-w-[45px] text-right">
                        ₹{item.price * qty}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* User Parameters */}
          <div className="space-y-4 mb-4 border-t border-white/5 pt-4">
            <h4 className="text-[10px] font-bold uppercase tracking-sub-brand text-brand-lime flex items-center gap-1.5">
              <UtensilsCrossed size={12} />
              <span>Contact Details</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="Your Name"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="text-xs bg-brand-surface border border-white/5 rounded-xl p-3 outline-none focus:border-brand-orange transition-all text-white"
              />
              <input 
                type="text" 
                placeholder="Phone No"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="text-xs bg-brand-surface border border-white/5 rounded-xl p-3 outline-none focus:border-brand-orange transition-all text-white"
              />
            </div>

            {/* Address Input & Location Detect */}
            {orderType === "Delivery" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider">Delivery Address (Jhajjar Local)</label>
                  <button
                    type="button"
                    onClick={detectUserLocation}
                    className="text-[9px] text-brand-orange hover:underline font-bold flex items-center gap-1 bg-brand-surface border border-white/10 px-2 py-0.5 rounded-full"
                  >
                    {detectingLocation ? "Detecting..." : "📍 Detect Location"}
                  </button>
                </div>
                <textarea 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={2}
                  placeholder="Street name, flat, sector, landmark near Bhagat Singh Chowk"
                  className="w-full text-xs bg-brand-surface border border-white/5 rounded-xl p-3 outline-none focus:border-brand-orange transition-all text-white"
                />
                
                {/* Visual Location distance ranges feedback */}
                {detectedDistance !== null && (
                  <p className={`text-[10px] font-bold ${detectedDistance <= 5 ? "text-brand-lime" : "text-brand-orange animate-pulse"}`}>
                    {detectedDistance <= 5 
                      ? `✅ Range Check: You are ${detectedDistance.toFixed(2)} km away (within 5km limit).`
                      : `❌ Range Check: You are ${detectedDistance.toFixed(2)} km away. (We only deliver within 5km).`
                    }
                  </p>
                )}
                {locationError && (
                  <p className="text-[10px] text-yellow-400 font-semibold">
                    ⚠️ {locationError}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider">Cooking Notes / Spiciness</label>
              <input 
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Less spicy, make it extra buttery"
                className="w-full text-xs bg-brand-surface border border-white/5 rounded-xl p-3 outline-none focus:border-brand-orange transition-all text-white"
              />
            </div>
          </div>

          {/* Pricing summary */}
          <div className="bg-brand-surface border border-white/5 rounded-2xl p-4 space-y-2 mb-4">
            <div className="flex justify-between text-xs text-brand-text-muted">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {orderType === "Delivery" && (
              <div className="flex justify-between text-xs text-brand-text-muted">
                <span>Delivery Charge</span>
                <span>₹{DELIVERY_CHARGE}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black border-t border-white/5 pt-2">
              <span>Grand Total</span>
              <span className="text-brand-orange text-base font-heading">₹{total}</span>
            </div>
          </div>

          {/* Checkout triggers */}
          <button
            onClick={handleOrderSubmit}
            disabled={cartItemCount === 0}
            className="w-full bg-brand-orange text-black hover:bg-brand-orange-hover disabled:opacity-50 text-black font-extrabold py-4 rounded-full flex items-center justify-center gap-2 shadow-orange-glow transition-all duration-300"
          >
            <MessageSquare size={16} />
            <span>Confirm Order via WhatsApp</span>
          </button>

          {/* Cancellation Policy Notice */}
          <div className="flex items-start gap-2 mt-3 bg-red-500/5 border border-red-500/15 rounded-xl px-3 py-2.5">
            <AlertTriangle size={13} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-red-300/80 leading-relaxed">
              <span className="font-bold text-red-400">No Cancellation Policy:</span> Orders cannot be cancelled or refunded once confirmed. Please review your cart carefully before submitting.
            </p>
          </div>
        </div>
      </div>

      {/* Footer info links */}
      <footer className="bg-brand-surface border-t border-white/5 px-4 py-8 text-center text-xs text-brand-text-muted mt-auto mb-20 md:mb-0">
        <div className="w-full px-4 md:px-8 lg:px-12 mx-auto space-y-2">
          <p className="font-extrabold text-white">BTECH CHAAP WALA &copy; 2026</p>
          {/* Direct Google Maps Navigation */}
          <p>
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=28.6101883000,76.6452249000"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-orange transition-colors underline inline-flex items-center gap-1"
            >
              <MapPin size={11} className="text-brand-orange" />
              Bhagat Singh Chowk, Near Jhajjar Bus Stand, Jhajjar, Haryana 124103
            </a>
          </p>

        </div>
      </footer>
    </div>
  );
}
