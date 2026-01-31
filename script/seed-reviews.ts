import { db } from "../server/db";
import { reviews } from "../shared/schema";

const sampleReviews = [
  {
    customerName: "Мария Петрова",
    city: "Москва",
    rating: 5,
    text: "Отличный попугай! Очень красивый и общительный. Доставка была быстрой, попугай прибыл в отличном состоянии. Рекомендую!",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80",
    deliveryMethod: "Доставка по России",
  },
  {
    customerName: "Иван Сидоров",
    city: "Санкт-Петербург",
    rating: 5,
    text: "Профессиональный подход! Консультировали по уходу, дали все необходимые рекомендации. Попугай здоров и весел. Спасибо!",
    image: "https://images.unsplash.com/photo-1444464666175-1642a9f33e12?w=500&q=80",
    deliveryMethod: "Курьер",
  },
  {
    customerName: "Елена Козлова",
    city: "Екатеринбург",
    rating: 5,
    text: "Живет уже месяц, очень довольна! Красивая клетка, все необходимое для содержания. Попугай быстро привык к новому дому.",
    image: "https://images.unsplash.com/photo-1535241749838-299277b6305f?w=500&q=80",
    deliveryMethod: "CDEK",
  },
  {
    customerName: "Алексей Новиков",
    city: "Казань",
    rating: 4,
    text: "Хороший выбор пород. Попугай здоровый и активный. Немного дороговато, но качество стоит того.",
    image: "https://images.unsplash.com/photo-1444464666175-1642a9f33e12?w=500&q=80",
    deliveryMethod: "Доставка по России",
  },
  {
    customerName: "Ольга Смирнова",
    city: "Новосибирск",
    rating: 5,
    text: "Спасибо за помощь в выборе! Попугай идеально подошел нашей семье. Очень рекомендую этот магазин!",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80",
    deliveryMethod: "Курьер",
  },
  {
    customerName: "Дмитрий Волков",
    city: "Воронеж",
    rating: 5,
    text: "Отличное качество! Попугай прибыл в идеальном состоянии. Упаковка была очень аккуратной. Спасибо за внимание к деталям!",
    image: "https://images.unsplash.com/photo-1535241749838-299277b6305f?w=500&q=80",
    deliveryMethod: "CDEK",
  },
];

async function seedReviews() {
  try {
    console.log("Seeding reviews...");
    
    // Check if reviews already exist
    const existingReviews = await db.select().from(reviews);
    if (existingReviews.length > 0) {
      console.log(`Reviews already exist (${existingReviews.length}). Skipping seed.`);
      return;
    }

    for (const review of sampleReviews) {
      await db.insert(reviews).values({
        ...review,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
      });
    }

    console.log(`✓ Seeded ${sampleReviews.length} reviews`);
  } catch (error) {
    console.error("Error seeding reviews:", error);
    process.exit(1);
  }
}

seedReviews().then(() => process.exit(0));
