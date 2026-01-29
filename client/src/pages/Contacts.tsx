import { Layout } from "@/components/Layout";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Contacts() {
  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <h1 className="text-4xl font-display font-bold mb-12 text-center">Контакты</h1>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
          <div className="space-y-8">
            <div className="bg-card p-8 rounded-2xl border shadow-lg space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Телефон</h3>
                  <a href="tel:+79181817775" className="text-xl hover:text-primary transition-colors block mb-1">
                    +7 (918) 181-77-75
                  </a>
                  <p className="text-sm text-muted-foreground">Ежедневно с 9:00 до 21:00</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Адрес магазина</h3>
                  <p className="text-lg mb-1">г. Москва, ул. Попугаева, д. 12</p>
                  <p className="text-sm text-muted-foreground">м. Китай-город, вход со двора</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Email</h3>
                  <a href="mailto:info@golden-cockatoo.ru" className="text-lg hover:text-primary transition-colors">
                    info@golden-cockatoo.ru
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white" size="lg">
                <MessageCircle className="mr-2 w-5 h-5" /> Написать в WhatsApp
              </Button>
              <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" size="lg">
                <svg className="mr-2 w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-2.02-1.23-2.94-1.83-.52-.33-.02-.9.32-1.27.77-.83 1.62-1.63 2.13-2.3.09-.11.05-.19-.06-.19-.15 0-1.76 1.1-2.48 1.57-.26.17-.5.25-.92.24-.9-.03-1.95-.3-2.6-.45-.7-.16-.85-.35-.68-.86.3-1.1 2.37-2.3 6.96-3.37z" />
                </svg> 
                Telegram
              </Button>
            </div>
          </div>

          <div className="h-[500px] rounded-2xl overflow-hidden shadow-lg border">
             {/* Map Placeholder - In production use Yandex/Google Maps iframe */}
            <iframe 
              src="https://yandex.ru/map-widget/v1/?ll=37.620393%2C55.753960&z=14" 
              width="100%" 
              height="100%" 
              frameBorder="0"
              allowFullScreen={true}
              title="Map"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
