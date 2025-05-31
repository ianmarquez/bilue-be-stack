# Welcom to my Bilue Backend API assessment

This repository was created as an assessment exercise for the role of Fullstack Software Engineer

## Assumptions

- You have a valid AWS Account for testing
- You have a fully setup aws-cli configuration in your machine

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template

## Testing

Sample CURL requests to test the endpoint.
**Note: Replace the `$API_URL` with your own deployment url**

### Successful Post Request

Creates a checkin

```bash
curl -X POST "$API_URL/checkin" \
  -H "Content-Type: application/json" \
  -d '{"eventId": "event-123", "userId": "user-456"}'

```

Expected Response

```json
{
  "message": "Check-in created",
  "data": {
    "eventId": "event-123",
    "userId": "user-456"
  }
}
```

### Failing POST Request - Missing Fields

```bash
curl -X POST "$API_URL/checkin" \
  -H "Content-Type: application/json" \
  -d '{"eventId": "event-123"}'
```

Expected Response

```json
{
  "error": "Malformed request body"
}
```

### Failing POST Request - Duplicate Check In

```bash
curl -X POST "$API_URL/checkin" \
  -H "Content-Type: application/json" \
  -d '{"eventId": "event-123", "userId": "user-456"}'
```

Expected Response

```json
{
  "error": "User already checked in for this event"
}
```

### Successful GET Request

```bash
curl "$API_URL/checkin/event-123"
```

Expected Response

```json
{
  "eventId": "event-123",
  "users": ["user-456"]
}
```
