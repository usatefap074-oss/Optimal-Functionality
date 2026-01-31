async function testAPI() {
  console.log("🔍 Тестирую API...");
  
  const res = await fetch("http://localhost:5000/api/products");
  const data = await res.json();
  
  console.log(`📊 Статус: ${res.status}`);
  console.log(`📊 Количество товаров: ${data.length}`);
  console.log(`📊 Первый товар:`, data[0]);
}

testAPI();
