# News API Examples

## Base URL
```
http://localhost:5173/api/news
```

## GET Requests

### 1. Get All News (Default)
```bash
curl -X GET "http://localhost:5173/api/news" \
  -H "Content-Type: application/json"
```

### 2. Get News with Pagination
```bash
curl -X GET "http://localhost:5173/api/news?page=1&limit=5" \
  -H "Content-Type: application/json"
```

### 3. Search News
```bash
curl -X GET "http://localhost:5173/api/news?search=kompetisi" \
  -H "Content-Type: application/json"
```

### 4. Get Page 2 with 10 Items
```bash
curl -X GET "http://localhost:5173/api/news?page=2&limit=10" \
  -H "Content-Type: application/json"
```

### 5. Search with Pagination
```bash
curl -X GET "http://localhost:5173/api/news?search=robotik&page=1&limit=3" \
  -H "Content-Type: application/json"
```

## POST Requests

### 1. Create Basic News
```bash
curl -X POST "http://localhost:5173/api/news" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Kompetisi Nasional Robotik 2024 Dibuka Pendaftaran",
    "thumbnail": "https://example.com/image.jpg",
    "created_by": "65a1b2c3d4e5f6789012345",
    "short_desc": "Pendaftaran untuk Kompetisi Robotik Nasional 2024 telah dibuka.",
    "description": "Pendaftaran untuk Kompetisi Robotik Nasional 2024 telah dibuka. Kompetisi ini terbuka untuk pelajar SMA dan mahasiswa dari seluruh Indonesia."
  }'
```

### 2. Create News with Hashtags
```bash
curl -X POST "http://localhost:5173/api/news" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tips Menyiapkan Proposal Bisnis untuk Startup Competition",
    "thumbnail": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7",
    "created_by": "65a1b2c3d4e5f6789012346",
    "short_desc": "Pelajari cara membuat proposal bisnis yang menarik.",
    "description": "Pelajari cara membuat proposal bisnis yang menarik dan komprehensif untuk meningkatkan peluang menang dalam startup competition.",
    "hashtags": ["startup", "bisnis", "proposal", "kompetisi"]
  }'
```

### 3. Create News with Multiple Hashtags
```bash
curl -X POST "http://localhost:5173/api/news" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Workshop Persiapan Kompetisi Debat Bahasa Inggris",
    "thumbnail": "https://images.unsplash.com/photo-1515378791036-0648a815a4e6",
    "created_by": "65a1b2c3d4e5f6789012347",
    "short_desc": "Ikuti workshop intensif untuk mempersiapkan diri.",
    "description": "Ikuti workshop intensif untuk mempersiapkan diri menghadapi kompetisi debat bahasa Inggris tingkat nasional.",
    "hashtags": ["workshop", "debat", "bahasa-inggris", "persiapan"]
  }'
```

## Expected Responses

### GET Response Format
```json
{
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789012345",
      "title": "Kompetisi Nasional Robotik 2024 Dibuka Pendaftaran",
      "thumbnail": "https://example.com/image.jpg",
      "created_by": "65a1b2c3d4e5f6789012345",
      "short_desc": "Pendaftaran untuk Kompetisi Robotik Nasional 2024 telah dibuka.",
      "description": "Pendaftaran untuk Kompetisi Robotik Nasional 2024 telah dibuka...",
      "hashtags": ["robotik", "kompetisi", "nasional"],
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z",
      "createdBy": {
        "id": "65a1b2c3d4e5f6789012345",
        "name": "Admin Maujuara",
        "avatar": "https://example.com/avatar.jpg"
      }
    }
  ],
  "status": 200,
  "meta": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 25,
    "limit": 9,
    "hasNextPage": true,
    "hasPrevPage": false,
    "filters": {
      "search": null
    }
  }
}
```

### POST Response Format
```json
{
  "data": {
    "_id": "65a1b2c3d4e5f6789012346",
    "title": "Kompetisi Nasional Robotik 2024 Dibuka Pendaftaran",
    "thumbnail": "https://example.com/image.jpg",
    "created_by": "65a1b2c3d4e5f6789012345",
    "short_desc": "Pendaftaran untuk Kompetisi Robotik Nasional 2024 telah dibuka.",
    "description": "Pendaftaran untuk Kompetisi Robotik Nasional 2024 telah dibuka...",
    "hashtags": ["robotik", "kompetisi", "nasional"],
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "createdBy": {
      "id": "65a1b2c3d4e5f6789012345",
      "name": "Admin Maujuara",
      "avatar": "https://example.com/avatar.jpg"
    }
  },
  "status": 201,
  "message": "News created successfully"
}
```

## Error Responses

### Validation Error (400)
```json
{
  "error": "Missing required fields: title, thumbnail",
  "status": 400
}
```

### Invalid Parameter (400)
```json
{
  "error": "Invalid limit parameter. Must be a number between 1 and 100.",
  "status": 400
}
```

### Server Error (500)
```json
{
  "error": "Failed to fetch news from database",
  "message": "Connection timeout",
  "status": 500
}
```

## Testing Tips

1. **Replace localhost** with your actual server URL when deploying
2. **Use JSON pretty-printing**: Add `| jq` to format JSON responses
   ```bash
   curl -X GET "http://localhost:5173/api/news" | jq
   ```
3. **Check response headers**: Add `-v` for verbose output
4. **Test with different limits**: Try limits from 1-100
5. **Test pagination**: Navigate through pages using `page` parameter
6. **Test search**: Use various search terms to test filtering
