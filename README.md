# Spotify Clone

Đây là ứng dụng clone Spotify sử dụng Next.js và Django.

## Cơ chế xử lý media

### Phát nhạc

- Ứng dụng sử dụng `PlayerProvider` để quản lý trạng thái phát nhạc
- Một trình phát đơn lẻ (`PlayerBar`) được sử dụng cho toàn bộ ứng dụng
- Âm thanh được phát thông qua HTML5 Audio API
- Server Nginx được sử dụng để phục vụ file media

### Xử lý URL

- Hình ảnh và file âm thanh được phục vụ từ backend thông qua server Nginx: `https://spotifybackend.shop/media/`
- Có hai loại URL:
  - URL tương đối (ví dụ: `/media/covers/2025/05/01/Song_Name.jpg`)
  - URL đầy đủ (ví dụ: `https://spotifybackend.shop/media/covers/2025/05/01/Song_Name.jpg`)
- Hàm `getDirectMediaUrl` tự động chuyển đổi URL tương đối thành URL đầy đủ
- Thuộc tính `crossOrigin="anonymous"` được thêm vào audio element để xử lý CORS

### Xử lý font tiếng Việt

- Ứng dụng hỗ trợ hiển thị nội dung tiếng Việt đúng cách
- URL chứa ký tự tiếng Việt được mã hóa đúng cách để tránh lỗi 404
- Nginx cấu hình với `charset UTF-8` để hỗ trợ đường dẫn có dấu tiếng Việt

## Demo và xác thực

- Người dùng không cần đăng nhập vẫn có thể xem và nghe demo
- Khi phát nhạc, người dùng sẽ nhận được thông báo đăng ký/đăng nhập
- Để có đầy đủ chức năng, người dùng cần đăng nhập

## Phát triển

### Cài đặt

```bash
npm install
```

### Chạy môi trường phát triển

```bash
npm run dev
```

### Build cho production

```bash
npm run build
```

### Cấu hình Nginx cho media server

```nginx
server {
    listen 80;
    server_name spotifybackend.shop;

    # Chuyển hướng HTTP sang HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name spotifybackend.shop;

    # Cấu hình SSL
    ssl_certificate /etc/letsencrypt/live/spotifybackend.shop/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/spotifybackend.shop/privkey.pem;

    # Cấu hình UTF-8 cho dấu tiếng Việt
    charset utf-8;

    # Phục vụ file media
    location /media/ {
        alias /path/to/your/media/;
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
        expires 30d;
    }

    # Các cấu hình khác...
}
```
