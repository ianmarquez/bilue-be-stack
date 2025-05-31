API_URL="https://638k3s9yy8.execute-api.us-east-1.amazonaws.com"

echo "✅ POST: successful"
curl -s -X POST "$API_URL/checkin" -H "Content-Type: application/json" \
  -d '{"eventId": "event-123", "userId": "user-001"}' | jq

echo "❌ POST: duplicate"
curl -s -X POST "$API_URL/checkin" -H "Content-Type: application/json" \
  -d '{"eventId": "event-123", "userId": "user-001"}' | jq

echo "❌ POST: missing field"
curl -s -X POST "$API_URL/checkin" -H "Content-Type: application/json" \
  -d '{"eventId": "event-123"}' | jq

echo "✅ GET:"
curl -s "$API_URL/checkin/event-123" | jq

