---

title: CentOS7.5+MySQL5.7.24+MHA0.58高可用架构
date: 2019-01-07 22:04:00 
sidebar: auto
categories: [运维]
tags: [MySQL]

---
# CentOS7.5+MySQL5.7.24+MHA0.58高可用架构

<BlogPostMeta/>

[[toc]]

## 设置各主机间免密登录
两台服务器都要相互设置
```
ssh-keygen
ssh-copy-id -i /root/.ssh/id_rsa.pub root@192.168.0.45
ssh-copy-id -i /root/.ssh/id_rsa.pub root@192.168.0.5
```

## 软件安装
### 安装MySQL 5.7.24
- 删除系统自带的Mariadb数据库
```
rpm -qa|grep mariadb
rpm -e --nodeps mariadb-libs-5.5.56-2.el7.x86_64
```
- 下载并安装 [MySQL5.7.24][1] 
```
tar -xf mysql-5.7.24-1.el7.x86_64.rpm-bundle.tar
rpm -ivh mysql-community-common-5.7.24-1.el7.x86_64.rpm 
rpm -ivh mysql-community-libs-5.7.24-1.el7.x86_64.rpm
rpm -ivh mysql-community-client-5.7.24-1.el7.x86_64.rpm
rpm -ivh mysql-community-server-5.7.24-1.el7.x86_64.rpm 
rpm -ivh mysql-community-libs-compat-5.7.24-1.el7.x86_64.rpm
```
- MySQL目录
> 数据库目录：/var/lib/mysql/
命令配置：/usr/share/mysql  (mysql.server命令及配置文件)
相关命令：/usr/bin   (mysqladmin mysqldump等命令)
启动脚本：/etc/rc.d/init.d/   (启动脚本文件mysql的目录)
系统配置：/etc/my.conf

- 设置密码
```
cat /var/log/mysqld.log # 获取默认密码
mysql -u root -p
set password = password('你的密码')
grant all privileges on *.* to 'root' @'%' identified by '你的密码';
flush privileges;
```
- 开机自启
```
chkconfig mysqld on
```
### 配置MySQL主从环境
  - MySQL主节点的配置如下:
  ```
  [mysqld]
  log-bin=mysql-bin 
  server-id=1
  character-set-server=utf8
  init_connect='SET AUTOCOMMIT=0;set names utf8'
  ```

  - MySQL从节点的配置如下
  ```
  [mysqld]
  log-bin=mysql-bin 
  server-id=2
  character-set-server=utf8
  init_connect='SET AUTOCOMMIT=0;set names utf8'
  ```
  - 创建需要复制的用户
  ```
  CREATE USER 'repl'@'192.168.0.5' IDENTIFIED BY '密码';
  GRANT REPLICATION SLAVE ON *.* TO 'repl'@'192.168.0.5';
  ```
  - 同步数据
  ```
  mysql> FLUSH TABLES WITH READ LOCK; # 将主库锁定
  mysql> show master status;
  mysqldump --all-databases --master-data -u root -p > school.sql #备份主库
  mysql> unlock tables; #解锁
  scp school.sql root@192.168.0.5:/data/mysql #同步数据
  ```
  - 从库开启主从复制
  ```
  mysql -u root -p </data/mysql/school.sql 
  mysql> change master to master_host = '192.168.0.45',master_port=3306,master_user='repl',master_password='密码',master_log_file='mysql-bin.000002',master_log_pos=154;
  mysql> start slave;
  ```
  - 设置mysql程序及binglog程序的软连接
  ```
  ln -s /usr/local/mysql/bin/mysql /usr/bin/mysql
  ln -s /usr/local/mysql/bin/mysqlbinlog /usr/local/bin/mysqlbinlog
  ```
### 安装MHA 0.58 
```
#先安装依赖
wget http://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
rpm -ivh epel-release-latest-7.noarch.rpm
wget https://www.percona.com/downloads/Percona-XtraDB-Cluster-LATEST/Percona-XtraDB-Cluster-5.7.24-31.33/binary/redhat/7/x86_64/Percona-XtraDB-Cluster-shared-57-5.7.24-31.33.1.el7.x86_64.rpm
rpm -ivh Percona-XtraDB-Cluster-shared-57-5.7.24-31.33.1.el7.x86_64.rpm 
yum install perl-DBD-MySQL perl-Config-Tiny perl-Log-Dispatch perl-Parallel-ForkManager　-y

wget https://github.com/yoshinorim/mha4mysql-node/releases/download/v0.58/mha4mysql-node-0.58-0.el7.centos.noarch.rpm
rpm -ivh mha4mysql-node-0.58-0.el7.centos.noarch.rpm

#仅在manager节点上安装mha管理软件
yum install perl-Parallel-ForkManager  
wget https://github.com/yoshinorim/mha4mysql-manager/releases/download/v0.58/mha4mysql-manager-0.58-0.el7.centos.noarch.rpm
rpm -ivh mha4mysql-manager-0.58-0.el7.centos.noarch.rpm
```

### 配置MHA
- 创建配置文件
```
[server default] 
user=root 
password=数据库密码
ssh_user=root 
manager_workdir=/data/mha/manager
remote_workdir=/tmp
repl_user=repl 
repl_password=数据库密码
[server1] 
hostname=192.168.0.45
port=3306
master_binlog_dir=/var/lib/mysql
 
[server2] 
hostname=192.168.0.5
port=3306 
master_binlog_dir=/var/lib/mysql
```
- MHA主要配置文件说明
> manager_workdir=/var/log/masterha/app1.log：设置manager的工作目录     
  manager_log=/var/log/masterha/app1/manager.log：设置manager的日志文件  
  master_binlog_dir=/data/mysql：设置master 保存binlog的位置，以便MHA可以找到master的日志                      
  master_ip_failover_script= /usr/local/bin/master_ip_failover：设置自动failover时候的切换脚本
  master_ip_online_change_script= /usr/local/bin/master_ip_online_change：设置手动切换时候的切换脚本 
  user=root：设置监控mysql的用户
  password=manager123：设置监控mysql的用户，需要授权能够在manager节点远程登录
  ping_interval=1：设置监控主库，发送ping包的时间间隔，默认是3秒，尝试三次没有回应的时候自动进行railover    
  remote_workdir=/tmp：设置远端mysql在发生切换时binlog的保存位置
  repl_user=repl ：设置mysql中用于复制的用户密码
  repl_password=repl：设置mysql中用于复制的用户        
  report_script=/usr/local/send_report：设置发生切换后发送的报警的脚本 
  shutdown_script=""：设置故障发生后关闭故障主机脚本（该脚本的主要作用是关闭主机放在发生脑裂,这里没有使用）
  ssh_user=root //设置ssh的登录用户名
  candidate_master=1：在节点下设置，设置当前节点为候选的master
  slave check_repl_delay=0 :在节点配置下设置，默认情况下如果一个slave落后master 100M的relay logs的话，MHA将不会选择该slave作为一个新的master；这个选项对于对于设置了candidate_master=1的主机非常有用

- 用masterha_check_ssh检测SSH连接是否配置正常
```
[root@server-0004 manager]# masterha_check_ssh --conf=/data/mha/manager/manager.conf
Wed Jan  9 17:59:08 2019 - [warning] Global configuration file /etc/masterha_default.cnf not found. Skipping.
Wed Jan  9 17:59:08 2019 - [info] Reading application default configuration from /data/mha/manager/manager.conf..
Wed Jan  9 17:59:08 2019 - [info] Reading server configuration from /data/mha/manager/manager.conf..
Wed Jan  9 17:59:08 2019 - [info] Starting SSH connection tests..
Wed Jan  9 17:59:09 2019 - [debug] 
Wed Jan  9 17:59:08 2019 - [debug]  Connecting via SSH from root@192.168.0.45(192.168.0.45:22) to root@192.168.0.5(192.168.0.5:22)..
Wed Jan  9 17:59:09 2019 - [debug]   ok.
Wed Jan  9 17:59:09 2019 - [debug] 
Wed Jan  9 17:59:09 2019 - [debug]  Connecting via SSH from root@192.168.0.5(192.168.0.5:22) to root@192.168.0.45(192.168.0.45:22)..
Wed Jan  9 17:59:09 2019 - [debug]   ok.
Wed Jan  9 17:59:09 2019 - [info] All SSH connection tests passed successfully.
```
- 用masterha_check_repl检测复制配置是否正确
 ```
 masterha_check_repl --conf=/data/mha/manager/manager.conf
 ```
 
 - 启动manager
 ```
 # 启动
 nohup masterha_manager --conf=/data/mha/manager/manager.conf > /var/log/mha_manager.log < /dev/null &
 # 检测运行状态
 masterha_check_status --conf=/data/mha/manager/manager.conf
 # 停止
 masterha_stop --conf=/data/mha/manager/manager.conf
```
 
 
 ## 配置VIP漂移
 ### MHA脚本方式
 ### keepalive方式
 
[1]: https://dev.mysql.com/get/Downloads/MySQL-5.7/mysql-5.7.24-1.el7.x86_64.rpm-bundle.tar
