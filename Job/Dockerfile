FROM ubuntu:22.04

# อัปเดต package lists และติดตั้ง dependencies
RUN apt-get update && apt-get install -y -qq \
  curl \
  build-essential \
  sudo \
  bash \
  wget \
  tar \
  python3 \
  python3-pip \
  git

# ติดตั้ง nodejs + npm ผ่าน apt
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# ดาวน์โหลด Sui
RUN curl -fsSL https://github.com/MystenLabs/sui/releases/download/mainnet-v1.47.1/sui-mainnet-v1.47.1-ubuntu-x86_64.tgz -o /tmp/sui.tar.gz
RUN mkdir -p /usr/local/sui && \
    tar -xvzf /tmp/sui.tar.gz -C /usr/local/sui
ENV PATH="/usr/local/sui:$PATH"

# ตั้งค่า sui config
RUN mkdir -p /root/.sui/sui_config
RUN printf '%s\n' \
  'keystore:' \
  '  File: "/root/.sui/sui_config/sui.keystore"' \
  'envs:' \
  '  - alias: testnet' \
  '    rpc: "https://fullnode.testnet.sui.io:443"' \
  '    ws: ~' \
  '    basic_auth: ~' \
  '  - alias: mainnet' \
  '    rpc: "https://fullnode.mainnet.sui.io:443"' \
  '    ws: ~' \
  '    basic_auth: ~' \
  'active_env: mainnet' \
  'active_address: "0x18a4c45a96c15d62b82b341f18738125bf875fee86057d88589a183700601a1c"' \
  > /root/.sui/sui_config/client.yaml

# ดาวน์โหลด walrus
RUN curl -fsSL https://github.com/MystenLabs/walrus/releases/download/mainnet-v1.21.2/walrus-mainnet-v1.21.2-ubuntu-x86_64.tgz -o /tmp/walrus.tar.gz
RUN mkdir -p /usr/local/walrus && \
    tar -xvzf /tmp/walrus.tar.gz -C /usr/local/walrus
ENV PATH="/usr/local/walrus:$PATH"

# ตั้งค่า client_config.yaml สำหรับ walrus
RUN mkdir -p /root/.config/walrus
RUN printf '%s\n' \
'contexts:' \
'  mainnet:' \
'    system_object: "0x2134d52768ea07e8c43570ef975eb3e4c27a39fa6396bef985b5abc58d03ddd2"' \
'    staking_object: "0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904"' \
'    subsidies_object: "0xb606eb177899edc2130c93bf65985af7ec959a2755dc126c953755e59324209e"' \
'    exchange_objects: []' \
'    wallet_config:' \
'      path: ~/.sui/sui_config/client.yaml' \
'      active_env: mainnet' \
'  testnet:' \
'    system_object: "0x6c2547cbbc38025cf3adac45f63cb0a8d12ecf777cdc75a4971612bf97fdf6af"' \
'    staking_object: "0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3"' \
'    subsidies_object: "0xda799d85db0429765c8291c594d334349ef5bc09220e79ad397b30106161a0af"' \
'    exchange_objects:' \
'      - "0xf4d164ea2def5fe07dc573992a029e010dba09b1a8dcbc44c5c2e79567f39073"' \
'      - "0x19825121c52080bb1073662231cfea5c0e4d905fd13e95f21e9a018f2ef41862"' \
'      - "0x83b454e524c71f30803f4d6c302a86fb6a39e96cdfb873c2d1e93bc1c26a3bc5"' \
'      - "0x8d63209cf8589ce7aef8f262437163c67577ed09f3e636a9d8e0813843fb8bf1"' \
'    wallet_config:' \
'      path: ~/.sui/sui_config/client.yaml' \
'      active_env: testnet' \
'default_context: mainnet' \
> ~/.config/walrus/client_config.yaml

# ติดตั้ง Rust
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:$PATH"

# ดาวน์โหลด site-builder
RUN mkdir -p /usr/local/site-builder && \
    curl -fsSL https://storage.googleapis.com/mysten-walrus-binaries/site-builder-mainnet-latest-ubuntu-x86_64 \
    -o /usr/local/site-builder/site-builder && \
    chmod +x /usr/local/site-builder/site-builder
ENV PATH="/usr/local/site-builder:$PATH"
RUN printf '%s\n' \
  'contexts:' \
  '  testnet:' \
  '    package: "0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799"' \
  '  mainnet:' \
  '    package: "0x26eb7ee8688da02c5f671679524e379f0b837a12f1d1d799f255b7eea260ad27"' \
  'default_context: mainnet' \
  > ~/.config/walrus/sites-config.yaml

# ติดตั้ง Python Requirements
COPY requirements.txt .
RUN python3 -m pip install -r requirements.txt

# คัดลอกโค้ดแอป
COPY app /app
WORKDIR /app

# ตั้งค่า Entry Point เป็น Python script ที่จะทำงานจบทีเดียว
ENTRYPOINT ["python3", "main.py"]
