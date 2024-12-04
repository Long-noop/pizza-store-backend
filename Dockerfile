FROM node:18

# Thiết lập thư mục làm việc bên trong container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

ENV NODE_ENV=${NODE_ENV}

# Expose cổng server
EXPOSE 80

# Khởi động ứng dụng
CMD ["npm", "start"]
