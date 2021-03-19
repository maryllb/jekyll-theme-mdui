---
layout: post
title: 搭建DVWA靶机
date: '2021-03-08 17:38:20 +0800'
categories: technology
tags: ubuntu apache mysql php phpmyadmin git hack web dvwa
img: https://i.loli.net/2021/03/08/HZRwWLPU3t41GJf.png
themecolor: "#fff"
themetextcolor: "#000"
describe: 基于Linux搭建DVWA
---

## DVWA

[DVWA（Damn Vulnerable Web Application）](https://dvwa.co.uk/)是一个用来进行安全脆弱性鉴定的 PHP/MySQL Web 应用，旨在为安全专业人员测试自己的专业技能和工具提供合法的环境，帮助 web 开发者更好的理解 web 应用安全防范的过程。

DVWA 是 randomstorm 的一个开源项目。如果你想要更多的了解 randomstorm 的服务和产品你可以访问他们[官方网站](www.randomstorm.com)。

## 安装环境

`Linux`或在`Windows`上安装好`Linux`虚拟机或`docker`的计算机。

## 安装步骤

### 1. 下载DVWA源代码

```bash
wget https://github.com/ethicalhack3r/DVWA/archive/master.zip
```

注:如果`Linux`上没有安装`wget`工具,`CentOS`上使用`yum install wget`来安装, Debian系的Linux使用`apt-get install wget`来安装。

下载完成后进行使用`unzip DVWA-master.zip`来解压到文件夹。

### 2. 配置运行环境

本文采用`LAMP`来达到Linux+Apache+MySQL+PHP的环境要求，命令如下：

```bash
wget -c http://soft.vpser.net/lnmp/lnmp1.4.tar.gz && tar zxf lnmp1.4.tar.gz && cd lnmp1.4 && ./install.sh lamp
```
### 3. 安装DVWA

（1）把之前解压的DVWA文件夹移动到`/home/wwwroot/default`,此目录为`LAMP`默认的网站目录。

（2）进入`/home/wwwroot/default/DVWA/config`目录，复制配置文件`cp config.inc.php.dist config.inc.php`。

（3）编辑配置文件`vim config.inc.php`

以下为默认的配置文件：

```php
<?php

# If you are having problems connecting to the MySQL database and all of the variables below are correct
# try changing the 'db_server' variable from localhost to 127.0.0.1. Fixes a problem due to sockets.
#   Thanks to @digininja for the fix.

# Database management system to use
$DBMS = 'MySQL';
#$DBMS = 'PGSQL'; // Currently disabled

# Database variables
#   WARNING: The database specified under db_database WILL BE ENTIRELY DELETED during setup.
#   Please use a database dedicated to DVWA.
#
# If you are using MariaDB then you cannot use root, you must use create a dedicated DVWA user.
#   See README.md for more information on this.
$_DVWA = array();
$_DVWA[ 'db_server' ]   = '127.0.0.1';
$_DVWA[ 'db_database' ] = 'dvwa';
$_DVWA[ 'db_user' ]     = 'root';
$_DVWA[ 'db_password' ] = 'p@ssw0rd';

# Only used with PostgreSQL/PGSQL database selection.
$_DVWA[ 'db_port '] = '5432';

# ReCAPTCHA settings
#   Used for the 'Insecure CAPTCHA' module
#   You'll need to generate your own keys at: https://www.google.com/recaptcha/admin/create
$_DVWA[ 'recaptcha_public_key' ]  = '';
$_DVWA[ 'recaptcha_private_key' ] = '';

# Default security level
#   Default value for the secuirty level with each session.
#   The default is 'impossible'. You may wish to set this to either 'low', 'medium', 'high' or impossible'.
$_DVWA[ 'default_security_level' ] = 'impossible';

# Default PHPIDS status
#   PHPIDS status with each session.
#   The default is 'disabled'. You can set this to be either 'enabled' or 'disabled'.
$_DVWA[ 'default_phpids_level' ] = 'disabled';

# Verbose PHPIDS messages
#   Enabling this will show why the WAF blocked the request on the blocked request.
#   The default is 'disabled'. You can set this to be either 'true' or 'false'.
$_DVWA[ 'default_phpids_verbose' ] = 'false';

?>
```

其中需要将`$_DVWA[ 'db_password' ] = 'p@ssw0rd';`这一行修改成MySQL的默认密码`root`。

同时需要在Google上生成API key，[生成网址](https://www.google.com/recaptcha/admin/create),最后要把生成的公私钥填入到以下两行中。

```php
$_DVWA[ 'recaptcha_public_key' ]  = '';
$_DVWA[ 'recaptcha_private_key' ] = '';
```

(4)修改配置文件`vim /etc/php.ini`

将`allow_url_include = Off`修改成`allow_url_include = On`

将`allow_url_fopen= Off`修改成`allow_url_fopen = On`

## 运行DVWA

首先查看以下Linux系统的ip地址

<img src="/assets/images/posts/dvwa/install/ip.jpg">

然后在浏览器上输入`ip/dvwa`进入登陆页面

<img src="/assets/images/posts/dvwa/install/login.jpg">

DVWA的默认登录账号是`admin`，密码是`password`。

登录成功后，点击`Create/Reset Database`来创建数据库。

<img src="/assets/images/posts/dvwa/install/CreateDatabase.jpg">

最后附一张DVWA成功登录并创建数据库的图片

<img src="/assets/images/posts/dvwa/install/dvwa-success.png">