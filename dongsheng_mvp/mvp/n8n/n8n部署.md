# 下载docker
本教程,采用docker安装n8n
如未安装docker，参考: https://www.yuque.com/juhao-x9o6x/tkeiwq/szqr4u0ix7ga0eam

# 安装n8n

参考: https://docs.n8n.io/hosting/installation/docker/

1. 创建 数据卷
```bash
$ docker volume create n8n_data
```
2. 启动 n8n
```bash
docker run -it \
 --name n8n \
 -d \
 --network=host \
 -p 5678:5678 \
 -e GENERIC_TIMEZONE="<YOUR_TIMEZONE>" \
 -e TZ="<YOUR_TIMEZONE>" \
 -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
 -e N8N_RUNNERS_ENABLED=true \
 -v n8n_data:/home/node/.n8n \
 docker.n8n.io/n8nio/n8n
```

3. 访问 n8n

访问: http://localhost:5678/
