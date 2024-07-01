# 베이스 이미지 설정
FROM --platform=linux/amd64 node:20.11.1

# 필수 모듈 설치
RUN apt-get update \
  && apt-get -y install --no-install-recommends curl git-core dnsutils build-essential \
  jq rsync pdftk zip dpkg libc-bin debconf libgbm1 libatk1.0-0 \
  locales fonts-nanum fonts-nanum-coding fonts-nanum-extra \
  && apt-get clean \
  && rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/*

# 앱 환경 설정
ENV TZ=Asia/Seoul
RUN echo $TZ > /etc/timezone \
  && apt-get update \
  && apt-get install -y tzdata libvips ca-certificates fonts-liberation \
  libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 \
  libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 \
  libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
  libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
  libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
  libxss1 libxtst6 lsb-release wget xdg-utils \
  && rm /etc/localtime \
  && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
  && dpkg-reconfigure -f noninteractive tzdata \
  && apt-get clean

# 한글 로케일 및 폰트 설정
RUN locale-gen ko_KR.UTF-8
ENV LANG=C.UTF-8
ENV LC_ALL=ko_KR.UTF-8

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치 및 빌드 (캐시 활용을 위해 package.json과 package-lock.json만 먼저 복사)
COPY package*.json ./
RUN npm install --build-from-source bcrypt

# 나머지 소스 파일 복사
COPY . .

# 바이너리 모듈 재설치
RUN npm rebuild bcrypt --build-from-source

# 애플리케이션 빌드
RUN npm run build

# 애플리케이션 포트 노출
EXPOSE 3001

# 컨테이너 실행 명령어
CMD ["npm", "run", "start"]
