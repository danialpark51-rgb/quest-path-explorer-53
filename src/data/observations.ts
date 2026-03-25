export type ObservationImage = {
  id: string;
  title: string;
  imageUrl: string;
  items: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  xpReward: number;
  description: string;
  emotions: string[];
  jobs: string[];
  movements: string[];
};

export const observationImages: ObservationImage[] = [
  {
    id: "obs1", title: "Living Room Scene",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
    items: ["sofa", "cushion", "lamp", "table", "book", "plant", "rug", "window", "curtain", "remote"],
    difficulty: "Easy", xpReward: 15,
    description: "A cozy, well-decorated living room with warm lighting. A large comfortable sofa sits in the center with colorful cushions. A side table holds a lamp casting soft light across the room. Books are placed nearby, and a lush green plant adds freshness. A patterned rug covers the floor beneath.",
    emotions: ["Comfort", "Warmth", "Relaxation", "Peacefulness", "Coziness"],
    jobs: ["Interior Designer", "Furniture Maker", "Home Decorator", "Real Estate Agent", "Architect"],
    movements: ["Sitting on the sofa", "Reading a book", "Turning on the lamp", "Opening curtains", "Placing cushions"]
  },
  {
    id: "obs2", title: "Kitchen Counter",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    items: ["knife", "cutting board", "fruit", "bowl", "jar", "stove", "pot", "towel", "spoon", "plate"],
    difficulty: "Easy", xpReward: 15,
    description: "A busy kitchen counter with various cooking utensils and fresh ingredients. A wooden cutting board holds sliced fruits, while pots and pans sit ready on the stove. Jars of spices line the back, and a clean towel hangs nearby.",
    emotions: ["Hunger", "Anticipation", "Creativity", "Warmth", "Nourishment"],
    jobs: ["Chef", "Baker", "Food Stylist", "Kitchen Designer", "Nutritionist"],
    movements: ["Chopping vegetables", "Stirring a pot", "Pouring liquid", "Wiping the counter", "Arranging plates"]
  },
  {
    id: "obs3", title: "Classroom",
    imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800",
    items: ["desk", "chair", "blackboard", "chalk", "book", "bag", "clock", "window", "light", "pen"],
    difficulty: "Easy", xpReward: 15,
    description: "A traditional classroom with rows of wooden desks and chairs. A large blackboard dominates the front wall with chalk writings. Student bags rest beside desks. A clock ticks on the wall, and sunlight streams through the windows.",
    emotions: ["Curiosity", "Discipline", "Focus", "Nostalgia", "Eagerness to learn"],
    jobs: ["Teacher", "Student", "School Principal", "Education Counselor", "Janitor"],
    movements: ["Writing on the blackboard", "Raising a hand", "Reading from a textbook", "Taking notes", "Opening a bag"]
  },
  {
    id: "obs4", title: "Park Scene",
    imageUrl: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800",
    items: ["tree", "bench", "grass", "path", "dog", "flower", "fence", "sky", "cloud", "lamp post"],
    difficulty: "Easy", xpReward: 15,
    description: "A peaceful park on a sunny day. Tall trees provide shade over a winding path. A wooden bench invites visitors to rest. Colorful flowers bloom along the edges, while dogs play freely on the green grass.",
    emotions: ["Joy", "Freedom", "Peace", "Happiness", "Serenity"],
    jobs: ["Gardener", "Park Ranger", "Dog Walker", "Landscaper", "Photographer"],
    movements: ["Walking on the path", "Sitting on the bench", "Dog running", "Flowers swaying in wind", "Children playing"]
  },
  {
    id: "obs5", title: "Office Desk",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    items: ["laptop", "mouse", "keyboard", "monitor", "coffee cup", "pen", "notebook", "phone", "cable", "headphone"],
    difficulty: "Medium", xpReward: 20,
    description: "A modern workspace with a laptop and external monitor displaying code. A coffee cup sits nearby with steam rising. Notebooks and pens are scattered for quick notes. Headphones rest beside the keyboard, ready for focused work.",
    emotions: ["Focus", "Productivity", "Determination", "Stress", "Ambition"],
    jobs: ["Software Developer", "Web Designer", "Content Writer", "Data Analyst", "Project Manager"],
    movements: ["Typing on keyboard", "Clicking mouse", "Sipping coffee", "Writing notes", "Plugging in headphones"]
  },
  {
    id: "obs6", title: "Library",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800",
    items: ["bookshelf", "books", "lamp", "table", "chair", "ladder", "globe", "clock", "window", "magazine", "pen", "card"],
    difficulty: "Medium", xpReward: 20,
    description: "A grand library with towering bookshelves filled with thousands of volumes. A reading table sits under a warm lamp. A vintage globe and an old clock add character. Ladders lean against shelves for reaching higher rows.",
    emotions: ["Wonder", "Knowledge", "Quietness", "Curiosity", "Respect"],
    jobs: ["Librarian", "Author", "Researcher", "Archivist", "Publisher"],
    movements: ["Flipping pages", "Climbing the ladder", "Searching the catalog", "Reading quietly", "Replacing books on shelves"]
  },
  {
    id: "obs7", title: "Market Street",
    imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800",
    items: ["shop", "sign", "vegetable", "basket", "umbrella", "person", "bicycle", "bag", "fruit", "cart", "light", "banner"],
    difficulty: "Medium", xpReward: 20,
    description: "A vibrant market street bustling with activity. Colorful shops display their goods with bright signs and banners. Vendors sell fresh fruits and vegetables from carts and baskets. People walk with bags, and bicycles navigate the narrow lanes.",
    emotions: ["Excitement", "Energy", "Liveliness", "Bargaining thrill", "Community"],
    jobs: ["Shopkeeper", "Vendor", "Delivery Person", "Market Inspector", "Street Food Cook"],
    movements: ["Pushing a cart", "Weighing vegetables", "Haggling prices", "Carrying bags", "Cycling through the market"]
  },
  {
    id: "obs8", title: "Workshop",
    imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800",
    items: ["hammer", "nail", "wood", "saw", "drill", "screw", "ruler", "pencil", "glove", "table", "shelf", "light"],
    difficulty: "Medium", xpReward: 20,
    description: "A carpenter's workshop filled with tools and sawdust. Hammers, saws, and drills hang on the wall. Pieces of wood in various sizes rest on a workbench. Safety gloves and a ruler sit ready for the next project.",
    emotions: ["Craftsmanship", "Patience", "Pride", "Hard work", "Satisfaction"],
    jobs: ["Carpenter", "Woodworker", "Furniture Maker", "Construction Worker", "Industrial Designer"],
    movements: ["Hammering nails", "Sawing wood", "Measuring with ruler", "Drilling holes", "Sanding surfaces"]
  },
  {
    id: "obs9", title: "Beach Sunset",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    items: ["sand", "wave", "sun", "cloud", "rock", "shell", "seaweed", "bird", "boat", "umbrella", "footprint", "horizon"],
    difficulty: "Medium", xpReward: 20,
    description: "A breathtaking beach scene at sunset. Golden sunlight paints the sky orange and pink. Gentle waves lap at the shore where footprints trail through the sand. Seashells and seaweed dot the beach. A distant boat silhouettes against the horizon.",
    emotions: ["Awe", "Romance", "Tranquility", "Freedom", "Melancholy"],
    jobs: ["Lifeguard", "Marine Biologist", "Fisherman", "Travel Photographer", "Surfing Instructor"],
    movements: ["Waves crashing", "Sun setting", "Birds flying", "Walking barefoot", "Boat sailing"]
  },
  {
    id: "obs10", title: "City Traffic",
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    items: ["car", "bus", "traffic light", "road", "building", "sign", "pedestrian", "motorcycle", "tree", "lane", "sky", "window", "pole"],
    difficulty: "Hard", xpReward: 30,
    description: "A busy city intersection at rush hour. Cars, buses, and motorcycles jostle for position. Traffic lights control the flow. Tall buildings tower on either side. Pedestrians wait at crosswalks, and road signs direct traffic in all directions.",
    emotions: ["Stress", "Rush", "Impatience", "Urban energy", "Alertness"],
    jobs: ["Traffic Police", "Taxi Driver", "Bus Driver", "Urban Planner", "Traffic Engineer"],
    movements: ["Cars moving", "Pedestrians crossing", "Traffic light changing", "Motorcycles weaving", "Bus stopping"]
  },
  {
    id: "obs11", title: "Science Lab",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800",
    items: ["beaker", "flask", "test tube", "microscope", "goggles", "gloves", "stool", "shelf", "label", "liquid", "burner", "pipette", "notebook"],
    difficulty: "Hard", xpReward: 30,
    description: "A well-equipped science laboratory with glass beakers and flasks filled with colorful liquids. A microscope sits on the bench alongside safety goggles. Bunsen burners glow, and labeled containers line the shelves. Notebooks record experimental observations.",
    emotions: ["Curiosity", "Discovery", "Precision", "Excitement", "Caution"],
    jobs: ["Scientist", "Lab Technician", "Chemist", "Research Assistant", "Pharmacist"],
    movements: ["Pouring chemicals", "Looking through microscope", "Writing observations", "Heating a test tube", "Mixing solutions"]
  },
  {
    id: "obs12", title: "Forest Trail",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
    items: ["tree", "leaf", "path", "moss", "rock", "fern", "light ray", "branch", "mushroom", "root", "bird", "insect", "bark", "log"],
    difficulty: "Hard", xpReward: 30,
    description: "A mystical forest trail dappled with sunlight filtering through the canopy. Ancient trees with moss-covered trunks line the narrow path. Ferns and mushrooms grow along the forest floor. Birdsong fills the air as rays of light pierce through the leaves.",
    emotions: ["Mystery", "Wonder", "Calm", "Adventure", "Connection with nature"],
    jobs: ["Forest Ranger", "Botanist", "Wildlife Photographer", "Ecologist", "Trekking Guide"],
    movements: ["Hiking along the trail", "Birds chirping", "Leaves rustling", "Light rays shifting", "Insects buzzing"]
  },
  {
    id: "obs13", title: "Railway Station",
    imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800",
    items: ["train", "platform", "clock", "sign", "bench", "ticket", "bag", "track", "pole", "roof", "person", "light", "pillar", "board"],
    difficulty: "Hard", xpReward: 30,
    description: "A busy railway station with platforms stretching along the tracks. A large clock shows departure times. Passengers wait on benches with luggage. Information boards display train schedules. The station's pillared roof provides shelter from the elements.",
    emotions: ["Anticipation", "Excitement", "Anxiety", "Nostalgia", "Hurry"],
    jobs: ["Train Driver", "Ticket Collector", "Station Master", "Railway Engineer", "Porter"],
    movements: ["Train arriving", "People boarding", "Checking the clock", "Carrying luggage", "Waving goodbye"]
  },
  {
    id: "obs14", title: "Sports Ground",
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800",
    items: ["goal post", "ball", "grass", "line", "net", "flag", "stand", "player", "shoe", "cone", "whistle", "jersey", "scoreboard"],
    difficulty: "Hard", xpReward: 30,
    description: "A professional sports ground under bright floodlights. Players in jerseys compete on the lush green field. Goal posts stand at each end with nets. White lines mark the playing area. A scoreboard displays the current score, and spectators cheer from the stands.",
    emotions: ["Thrill", "Competitiveness", "Team spirit", "Adrenaline", "Victory/Defeat"],
    jobs: ["Footballer", "Coach", "Referee", "Sports Commentator", "Physiotherapist"],
    movements: ["Kicking the ball", "Running across the field", "Goalkeeper diving", "Referee blowing whistle", "Crowd cheering"]
  },
  {
    id: "obs15", title: "Hospital Corridor",
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
    items: ["stretcher", "door", "light", "sign", "floor", "wall", "chair", "poster", "hand sanitizer", "clock", "nurse", "window", "cart"],
    difficulty: "Medium", xpReward: 20,
    description: "A clean hospital corridor with bright fluorescent lights. Doors lead to patient rooms on both sides. A nurse walks with a medical cart. Posters about health awareness line the walls. Hand sanitizer dispensers are mounted at regular intervals.",
    emotions: ["Concern", "Hope", "Anxiety", "Care", "Urgency"],
    jobs: ["Doctor", "Nurse", "Hospital Administrator", "Paramedic", "Pharmacist"],
    movements: ["Nurse walking", "Stretcher being pushed", "Doors opening and closing", "Sanitizing hands", "Checking patient charts"]
  },
  {
    id: "obs16", title: "Construction Site",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    items: ["crane", "helmet", "brick", "cement", "worker", "scaffold", "truck", "steel", "sand", "pipe", "rope", "wheel", "barrel"],
    difficulty: "Hard", xpReward: 30,
    description: "An active construction site with towering cranes and scaffolding. Workers in hard hats operate heavy machinery. Trucks deliver loads of bricks, cement, and steel. Pipes and ropes are organized in piles. The skeletal frame of a new building rises from the ground.",
    emotions: ["Hard work", "Progress", "Danger awareness", "Teamwork", "Determination"],
    jobs: ["Civil Engineer", "Architect", "Mason", "Crane Operator", "Safety Inspector"],
    movements: ["Crane lifting steel", "Workers laying bricks", "Truck unloading", "Welding metal", "Climbing scaffolding"]
  },
  {
    id: "obs17", title: "Farm Field",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
    items: ["crop", "tractor", "fence", "barn", "cow", "hay", "tree", "field", "sky", "path", "gate", "water tank"],
    difficulty: "Easy", xpReward: 15,
    description: "A vast farm field stretching to the horizon under a clear blue sky. Golden crops sway in the breeze. A red barn sits in the distance near a water tank. A tractor rests near the fence, and hay bales dot the landscape.",
    emotions: ["Peace", "Simplicity", "Hard work", "Gratitude", "Connection to earth"],
    jobs: ["Farmer", "Agricultural Scientist", "Veterinarian", "Tractor Operator", "Dairy Worker"],
    movements: ["Tractor plowing", "Crops swaying", "Cows grazing", "Farmer walking the field", "Harvesting crops"]
  },
  {
    id: "obs18", title: "Temple Architecture",
    imageUrl: "https://images.unsplash.com/photo-1564804955-f85a55bc3cd7?w=800",
    items: ["pillar", "dome", "statue", "steps", "flower", "lamp", "bell", "carving", "gate", "flag", "stone", "arch", "devotee"],
    difficulty: "Hard", xpReward: 30,
    description: "An ancient temple with intricately carved stone pillars and a towering dome. Devotees climb the steps carrying flower offerings. Oil lamps flicker in the entrance. A large brass bell hangs at the gate. Stone arches frame sacred statues within.",
    emotions: ["Devotion", "Awe", "Spirituality", "Peace", "Reverence"],
    jobs: ["Priest", "Archaeologist", "Stone Carver", "Heritage Conservator", "Tour Guide"],
    movements: ["Devotees praying", "Ringing the bell", "Lighting lamps", "Offering flowers", "Climbing steps"]
  },
  {
    id: "obs19", title: "Bakery Shop",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
    items: ["bread", "cake", "counter", "oven", "tray", "flour", "basket", "sign", "shelf", "donut", "muffin", "bag"],
    difficulty: "Easy", xpReward: 15,
    description: "A charming bakery with shelves of fresh bread, cakes, and pastries. The warm smell of baking fills the air. Golden loaves rest in baskets, and frosted donuts line the display counter. Flour dusts the workspace near the large oven.",
    emotions: ["Warmth", "Happiness", "Craving", "Nostalgia", "Delight"],
    jobs: ["Baker", "Pastry Chef", "Bakery Owner", "Cake Decorator", "Food Inspector"],
    movements: ["Kneading dough", "Taking bread from oven", "Decorating a cake", "Serving customers", "Arranging display"]
  },
  {
    id: "obs20", title: "Space Observatory",
    imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800",
    items: ["telescope", "stars", "galaxy", "nebula", "planet", "moon", "comet", "light", "darkness", "cluster", "dust", "ring"],
    difficulty: "Hard", xpReward: 30,
    description: "A mesmerizing view of deep space captured through a powerful telescope. Swirling galaxies and colorful nebulae fill the frame. Distant stars twinkle in clusters. Planetary rings and cosmic dust create an ethereal landscape of light and darkness.",
    emotions: ["Awe", "Wonder", "Insignificance", "Curiosity", "Fascination"],
    jobs: ["Astronomer", "Astrophysicist", "Space Scientist", "Planetarium Guide", "Telescope Engineer"],
    movements: ["Stars twinkling", "Galaxy rotating", "Comet streaking", "Nebula expanding", "Planets orbiting"]
  },
  {
    id: "obs21", title: "Street Food Stall",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    items: ["stove", "pan", "plate", "sauce", "spice", "customer", "napkin", "cup", "smoke", "chair", "table", "menu"],
    difficulty: "Easy", xpReward: 15,
    description: "A lively street food stall with sizzling pans and aromatic spices. Smoke rises from the cooking area as the vendor prepares dishes for eager customers. Colorful sauces and condiments line the counter. People sit at small tables enjoying their meals.",
    emotions: ["Hunger", "Excitement", "Community", "Satisfaction", "Nostalgia"],
    jobs: ["Street Food Vendor", "Chef", "Food Blogger", "Health Inspector", "Delivery Person"],
    movements: ["Cooking on stove", "Flipping food in pan", "Serving plates", "Customers eating", "Smoke rising"]
  },
  {
    id: "obs22", title: "Art Studio",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
    items: ["canvas", "paintbrush", "palette", "easel", "paint tube", "stool", "sketch", "frame", "water jar", "apron", "light", "pencil"],
    difficulty: "Medium", xpReward: 20,
    description: "A creative art studio bathed in natural light. Canvases in various stages of completion lean against the walls. An easel holds a work-in-progress painting. Paint tubes, brushes, and palettes are scattered on a wooden table. Colorful splashes mark the floor and apron.",
    emotions: ["Creativity", "Inspiration", "Freedom", "Passion", "Contemplation"],
    jobs: ["Painter", "Illustrator", "Art Teacher", "Gallery Curator", "Graphic Designer"],
    movements: ["Painting on canvas", "Mixing colors on palette", "Sketching with pencil", "Stepping back to observe", "Cleaning brushes"]
  },
  {
    id: "obs23", title: "Airport Terminal",
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=800",
    items: ["airplane", "terminal", "luggage", "screen", "gate", "seat", "window", "boarding pass", "trolley", "security", "shop", "clock", "escalator"],
    difficulty: "Hard", xpReward: 30,
    description: "A modern airport terminal buzzing with travelers. Departure screens display flight information. Passengers sit at gates with luggage and boarding passes. Large windows reveal aircraft on the tarmac. Shops and cafes line the concourse. Escalators connect different levels.",
    emotions: ["Excitement", "Anxiety", "Adventure", "Anticipation", "Exhaustion"],
    jobs: ["Pilot", "Air Hostess", "Ground Staff", "Air Traffic Controller", "Security Officer"],
    movements: ["Planes taxiing", "People rushing to gates", "Luggage on conveyor", "Escalators moving", "Boarding announcements"]
  },
  {
    id: "obs24", title: "Rainy Street",
    imageUrl: "https://images.unsplash.com/photo-1428592953211-077101b2021b?w=800",
    items: ["umbrella", "puddle", "rain", "reflection", "car", "streetlight", "pedestrian", "coat", "window", "gutter", "cloud", "pavement"],
    difficulty: "Medium", xpReward: 20,
    description: "A city street on a rainy evening with glistening wet pavement reflecting streetlights. Pedestrians huddle under umbrellas as rain pours down. Cars splash through puddles. Neon signs reflect in the wet road, creating a colorful mosaic of city life.",
    emotions: ["Melancholy", "Romance", "Coziness", "Solitude", "Reflection"],
    jobs: ["Meteorologist", "Urban Photographer", "Taxi Driver", "Street Cleaner", "Umbrella Maker"],
    movements: ["Rain falling", "People walking quickly", "Cars splashing through puddles", "Umbrellas opening", "Reflections shimmering"]
  },
  {
    id: "obs25", title: "Mountain Peak",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    items: ["mountain", "snow", "cloud", "sky", "rock", "peak", "valley", "ice", "ridge", "sun", "shadow", "cliff"],
    difficulty: "Medium", xpReward: 20,
    description: "A majestic snow-capped mountain peak piercing through the clouds. Rugged rocky ridges lead up to the summit. The valley below is shrouded in mist. Sunlight catches the ice and snow, creating brilliant reflections. Deep shadows carve out the mountain's dramatic contours.",
    emotions: ["Awe", "Accomplishment", "Humility", "Adventure", "Solitude"],
    jobs: ["Mountaineer", "Geologist", "Adventure Guide", "Weather Scientist", "Ski Instructor"],
    movements: ["Clouds drifting", "Snow blowing off peak", "Sun casting shadows", "Avalanche risk", "Climbers ascending"]
  },
];
