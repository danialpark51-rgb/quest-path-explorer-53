export type ObservationImage = {
  id: string;
  title: string;
  imageUrl: string;
  items: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  xpReward: number;
};

export const observationImages: ObservationImage[] = [
  {
    id: "obs1", title: "Living Room Scene",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
    items: ["sofa", "cushion", "lamp", "table", "book", "plant", "rug", "window", "curtain", "remote"],
    difficulty: "Easy", xpReward: 15
  },
  {
    id: "obs2", title: "Kitchen Counter",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    items: ["knife", "cutting board", "fruit", "bowl", "jar", "stove", "pot", "towel", "spoon", "plate"],
    difficulty: "Easy", xpReward: 15
  },
  {
    id: "obs3", title: "Classroom",
    imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800",
    items: ["desk", "chair", "blackboard", "chalk", "book", "bag", "clock", "window", "light", "pen"],
    difficulty: "Easy", xpReward: 15
  },
  {
    id: "obs4", title: "Park Scene",
    imageUrl: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800",
    items: ["tree", "bench", "grass", "path", "dog", "flower", "fence", "sky", "cloud", "lamp post"],
    difficulty: "Easy", xpReward: 15
  },
  {
    id: "obs5", title: "Office Desk",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    items: ["laptop", "mouse", "keyboard", "monitor", "coffee cup", "pen", "notebook", "phone", "cable", "headphone"],
    difficulty: "Medium", xpReward: 20
  },
  {
    id: "obs6", title: "Library",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800",
    items: ["bookshelf", "books", "lamp", "table", "chair", "ladder", "globe", "clock", "window", "magazine", "pen", "card"],
    difficulty: "Medium", xpReward: 20
  },
  {
    id: "obs7", title: "Market Street",
    imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800",
    items: ["shop", "sign", "vegetable", "basket", "umbrella", "person", "bicycle", "bag", "fruit", "cart", "light", "banner"],
    difficulty: "Medium", xpReward: 20
  },
  {
    id: "obs8", title: "Workshop",
    imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800",
    items: ["hammer", "nail", "wood", "saw", "drill", "screw", "ruler", "pencil", "glove", "table", "shelf", "light"],
    difficulty: "Medium", xpReward: 20
  },
  {
    id: "obs9", title: "Beach Sunset",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    items: ["sand", "wave", "sun", "cloud", "rock", "shell", "seaweed", "bird", "boat", "umbrella", "footprint", "horizon"],
    difficulty: "Medium", xpReward: 20
  },
  {
    id: "obs10", title: "City Traffic",
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    items: ["car", "bus", "traffic light", "road", "building", "sign", "pedestrian", "motorcycle", "tree", "lane", "sky", "window", "pole"],
    difficulty: "Hard", xpReward: 30
  },
  {
    id: "obs11", title: "Science Lab",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800",
    items: ["beaker", "flask", "test tube", "microscope", "goggles", "gloves", "stool", "shelf", "label", "liquid", "burner", "pipette", "notebook"],
    difficulty: "Hard", xpReward: 30
  },
  {
    id: "obs12", title: "Forest Trail",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
    items: ["tree", "leaf", "path", "moss", "rock", "fern", "light ray", "branch", "mushroom", "root", "bird", "insect", "bark", "log"],
    difficulty: "Hard", xpReward: 30
  },
  {
    id: "obs13", title: "Railway Station",
    imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800",
    items: ["train", "platform", "clock", "sign", "bench", "ticket", "bag", "track", "pole", "roof", "person", "light", "pillar", "board"],
    difficulty: "Hard", xpReward: 30
  },
  {
    id: "obs14", title: "Sports Ground",
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800",
    items: ["goal post", "ball", "grass", "line", "net", "flag", "stand", "player", "shoe", "cone", "whistle", "jersey", "scoreboard"],
    difficulty: "Hard", xpReward: 30
  },
  {
    id: "obs15", title: "Hospital Corridor",
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
    items: ["stretcher", "door", "light", "sign", "floor", "wall", "chair", "poster", "hand sanitizer", "clock", "nurse", "window", "cart"],
    difficulty: "Medium", xpReward: 20
  },
  {
    id: "obs16", title: "Construction Site",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    items: ["crane", "helmet", "brick", "cement", "worker", "scaffold", "truck", "steel", "sand", "pipe", "rope", "wheel", "barrel"],
    difficulty: "Hard", xpReward: 30
  },
  {
    id: "obs17", title: "Farm Field",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
    items: ["crop", "tractor", "fence", "barn", "cow", "hay", "tree", "field", "sky", "path", "gate", "water tank"],
    difficulty: "Easy", xpReward: 15
  },
  {
    id: "obs18", title: "Temple Architecture",
    imageUrl: "https://images.unsplash.com/photo-1564804955-f85a55bc3cd7?w=800",
    items: ["pillar", "dome", "statue", "steps", "flower", "lamp", "bell", "carving", "gate", "flag", "stone", "arch", "devotee"],
    difficulty: "Hard", xpReward: 30
  },
  {
    id: "obs19", title: "Bakery Shop",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
    items: ["bread", "cake", "counter", "oven", "tray", "flour", "basket", "sign", "shelf", "donut", "muffin", "bag"],
    difficulty: "Easy", xpReward: 15
  },
  {
    id: "obs20", title: "Space Observatory",
    imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800",
    items: ["telescope", "stars", "galaxy", "nebula", "planet", "moon", "comet", "light", "darkness", "cluster", "dust", "ring"],
    difficulty: "Hard", xpReward: 30
  },
];
