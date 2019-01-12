---

title: Redis集群安装
date: 2019-01-10 18:39:26
sidebar: auto
categories: [运维]
tags: [Redis]

---
# Redis集群安装
<BlogPostMeta/>

[[toc]]

## 安装ruby环境
```
yum install curl
curl -sSL https://rvm.io/mpapis.asc | gpg --import -
curl -L get.rvm.io | bash -s stable
source /etc/profile.d/rvm.sh
rvm reload
rvm install 2.6.0 --disable-binary
# 安装redis插件
gem install redis
```

## 安装Redis
```
wget http://download.redis.io/releases/redis-4.0.10.tar.gz
tar -zxvf redis-4.0.10.tar.gz
# 进入deps里面make环境
yum -y install gcc
make hiredis jemalloc linenoise lua
# 进入src文件夹里面编译
make MALLOC=libc
# 修改默认配置文件
mv redis.conf redis-default.conf
# 主redis.conf
port 6379
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
appendonly yes
daemonize yes
protected-mode no
# 从redis.conf
port 6380
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
appendonly yes
daemonize yes
protected-mode no
```

## 启动Redis实例
```
# 分别启动三主三从实例
./redis-server ../redis.conf
```

## 开启集群
```
./redis-trib.rb create --replicas 1 192.168.0.195:6379 192.168.0.195:6380 192.168.0.55:6379 192.168.0.55:6380 192.168.0.233:6379 192.168.0.233:6380

```
