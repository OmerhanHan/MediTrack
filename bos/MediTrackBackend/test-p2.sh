#!/bin/bash
echo "--- TEST 1: KULLANICI KAYDI (REGISTER) ---"
REG_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST http://127.0.0.1:4000/api/v1/auth/register -H "Content-Type: application/json" -d '{"email":"omer@meditrack.com","password":"password123","firstName":"Ömer","lastName":"Sezgin"}')
echo "$REG_RES"

echo -e "\n--- TEST 2: GİRİŞ (LOGIN) ---"
LOGIN_RES=$(curl -s -X POST http://127.0.0.1:4000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"omer@meditrack.com","password":"password123"}')
echo "$LOGIN_RES"

# Token çıkarma
TOKEN=$(echo $LOGIN_RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo -e "\n--- TEST 3: ANOMALİ/PROTECTED ROUTE (Kendi Profilini Çekme) ---"
curl -s -X GET http://127.0.0.1:4000/api/v1/auth/me -H "Authorization: Bearer $TOKEN"

echo -e "\n\n--- TEST 4: YENİ RANDEVU ve HASTA OLUŞTURMA ---"
APPT_RES=$(curl -s -X POST http://127.0.0.1:4000/api/v1/appointments -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"patientName":"Ahmet Can","phone":"05301234567","date":"2026-05-20","time":"13:00","notes":"Cilt Kanseri Taraması","type":"Yıllık Kontrol"}')
echo "$APPT_RES"

echo -e "\n\n--- TEST 5: RANDEVULARI ÇEKME ---"
curl -s -X GET http://127.0.0.1:4000/api/v1/appointments -H "Authorization: Bearer $TOKEN"
